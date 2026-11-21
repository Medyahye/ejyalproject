"""Back-office API for admins and the director (grand directeur).

Admins : valider les paiements WhatsApp, fermer/rouvrir les packs d'un professeur, gérer les promos.
Directeur : tout ce que font les admins + créer des comptes, des filières, régler les trimestres,
les pourcentages des professeurs et les paramètres de la plateforme.
"""
from collections import OrderedDict
from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Course, SchoolSettings, SchoolTerm, Track
from catalog.serializers import CourseSerializer, SchoolSettingsSerializer, SchoolTermSerializer, TrackSerializer
from commerce.models import Enrollment, Payment
from commerce.views import activate_enrollment

from .models import User
from .permissions import IsDirector, IsStaffMember
from .serializers import UserSerializer


class OverviewView(APIView):
    permission_classes = [IsStaffMember]

    def get(self, request):
        paid = Payment.objects.filter(status=Payment.Status.SUCCESS)
        pending = Payment.objects.filter(status=Payment.Status.PENDING)
        return Response({
            'students': User.objects.filter(role=User.Role.STUDENT).count(),
            'teachers': User.objects.filter(role=User.Role.TEACHER).count(),
            'closedTeachers': User.objects.filter(role=User.Role.TEACHER, packs_closed=True).count(),
            'courses': Course.objects.count(),
            'closedCourses': Course.objects.filter(is_closed=True).count(),
            'activeEnrollments': Enrollment.objects.filter(status=Enrollment.Status.ACTIVE).count(),
            'revenue': float(paid.aggregate(t=Sum('amount'))['t'] or 0),
            'pendingOrders': pending.values('reference').distinct().count(),
            'pendingAmount': float(pending.aggregate(t=Sum('amount'))['t'] or 0),
        })


def serialize_orders(payments):
    orders = OrderedDict()
    for p in payments:
        key = p.reference or str(p.id)
        order = orders.get(key)
        if not order:
            order = orders[key] = {
                'reference': key, 'studentId': str(p.student_id), 'studentName': p.student.full_name,
                'studentEmail': p.student.email, 'method': p.method, 'status': p.status, 'offer': p.offer,
                'date': p.date.isoformat(), 'amount': 0.0, 'courses': [],
            }
        order['amount'] += float(p.amount)
        order['courses'].append({'id': str(p.course_id), 'title': p.course.title, 'amount': float(p.amount)})
    return list(orders.values())


class OrdersView(APIView):
    """Commandes groupées par référence (une capture WhatsApp = une référence)."""

    permission_classes = [IsStaffMember]

    def get(self, request):
        qs = Payment.objects.select_related('student', 'course').order_by('-date', '-reference')
        wanted = request.query_params.get('status')
        if wanted:
            qs = qs.filter(status=wanted)
        return Response(serialize_orders(qs[:300]))


class OrderDecisionView(APIView):
    permission_classes = [IsStaffMember]

    def post(self, request, reference, decision):
        if decision not in ('validate', 'reject'):
            return Response({'detail': 'Décision inconnue.'}, status=status.HTTP_400_BAD_REQUEST)
        payments = list(Payment.objects.filter(reference=reference, status=Payment.Status.PENDING))
        if not payments:
            return Response({'detail': 'Aucune commande en attente avec cette référence.'}, status=status.HTTP_404_NOT_FOUND)
        with transaction.atomic():
            for p in payments:
                enrollment = Enrollment.objects.filter(student_id=p.student_id, course_id=p.course_id).first()
                if decision == 'validate':
                    p.status = Payment.Status.SUCCESS
                    if not enrollment:
                        enrollment = Enrollment.objects.create(student_id=p.student_id, course_id=p.course_id,
                                                               offer=p.offer, status=Enrollment.Status.PENDING)
                    activate_enrollment(enrollment)
                else:
                    p.status = Payment.Status.FAILED
                    if enrollment and enrollment.status == Enrollment.Status.PENDING:
                        enrollment.delete()
                p.save(update_fields=['status'])
        return Response({'reference': reference, 'status': payments[0].status})


class StaffTeacherSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name', read_only=True)
    revenueShare = serializers.DecimalField(source='revenue_share', max_digits=5, decimal_places=2,
                                            coerce_to_string=False, min_value=Decimal('0'), max_value=Decimal('100'), required=False)
    packsClosed = serializers.BooleanField(source='packs_closed', required=False)
    promoFreeUntil = serializers.DateField(source='promo_free_until', required=False, allow_null=True)
    courseCount = serializers.SerializerMethodField()
    subscribers = serializers.SerializerMethodField()
    revenue = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'fullName', 'email', 'avatar', 'headline', 'revenueShare', 'packsClosed', 'promoFreeUntil',
                  'courseCount', 'subscribers', 'revenue']
        read_only_fields = ['id', 'email', 'avatar', 'headline']

    def get_courseCount(self, obj):
        return obj.courses.count()

    def get_subscribers(self, obj):
        return Enrollment.objects.filter(course__teacher=obj, status=Enrollment.Status.ACTIVE).values('student').distinct().count()

    def get_revenue(self, obj):
        total = Payment.objects.filter(course__teacher=obj, status=Payment.Status.SUCCESS).aggregate(t=Sum('amount'))['t']
        return float(total or 0)


class StaffTeachersView(APIView):
    permission_classes = [IsStaffMember]

    def get(self, request):
        teachers = User.objects.filter(role=User.Role.TEACHER).order_by('full_name')
        return Response(StaffTeacherSerializer(teachers, many=True).data)


class StaffTeacherDetailView(APIView):
    permission_classes = [IsStaffMember]

    def patch(self, request, pk):
        teacher = User.objects.filter(pk=pk, role=User.Role.TEACHER).first()
        if not teacher:
            return Response({'detail': 'Professeur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if 'revenueShare' in request.data and not request.user.is_director:
            return Response({'detail': "Seul le directeur fixe le pourcentage d'un professeur."}, status=status.HTTP_403_FORBIDDEN)
        serializer = StaffTeacherSerializer(teacher, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class StaffCoursesView(APIView):
    permission_classes = [IsStaffMember]

    def get(self, request):
        courses = Course.objects.select_related('teacher', 'category').prefetch_related('lessons', 'pdfs')
        return Response(CourseSerializer(courses, many=True, context={'request': request}).data)


class StaffCourseDetailView(APIView):
    permission_classes = [IsStaffMember]
    FIELDS = {'isClosed': 'is_closed', 'promoFreeUntil': 'promo_free_until', 'term': 'term'}

    def patch(self, request, pk):
        course = Course.objects.filter(pk=pk).first()
        if not course:
            return Response({'detail': 'Cours introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        updates = []
        for key, field in self.FIELDS.items():
            if key in request.data:
                value = request.data[key]
                if key == 'promoFreeUntil':
                    value = serializers.DateField(allow_null=True).to_internal_value(value) if value else None
                if key == 'term' and value not in (1, 2, 3):
                    return Response({'detail': 'Le trimestre doit être 1, 2 ou 3.'}, status=status.HTTP_400_BAD_REQUEST)
                setattr(course, field, value)
                updates.append(field)
        if updates:
            course.save(update_fields=updates)
        return Response(CourseSerializer(course, context={'request': request}).data)


class CreateAccountSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    role = serializers.ChoiceField(choices=User.Role.choices)
    gradeTrack = serializers.CharField(required=False, allow_blank=True, default='')
    headline = serializers.CharField(required=False, allow_blank=True, default='')
    revenueShare = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=Decimal('0'), max_value=Decimal('100'), required=False)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Un compte existe déjà avec cet email.')
        return value.lower()


class StaffUsersView(APIView):
    """Le directeur crée et liste tous les comptes."""

    permission_classes = [IsDirector]

    def get(self, request):
        qs = User.objects.all().order_by('role', 'full_name')
        role = request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        return Response(UserSerializer(qs, many=True).data)

    def post(self, request):
        s = CreateAccountSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        extra = {'grade_track': d['gradeTrack'], 'headline': d['headline']}
        if d.get('revenueShare') is not None:
            extra['revenue_share'] = d['revenueShare']
        user = User.objects.create_user(email=d['email'], password=d['password'], full_name=d['fullName'], role=d['role'], **extra)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class StaffUserDetailView(APIView):
    permission_classes = [IsDirector]

    def patch(self, request, pk):
        user = User.objects.filter(pk=pk).first()
        if not user:
            return Response({'detail': 'Compte introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        if user.pk == request.user.pk and request.data.get('isActive') is False:
            return Response({'detail': 'Vous ne pouvez pas désactiver votre propre compte.'}, status=status.HTTP_400_BAD_REQUEST)
        if 'isActive' in request.data:
            user.is_active = bool(request.data['isActive'])
            user.save(update_fields=['is_active'])
        return Response(UserSerializer(user).data)


class StaffTracksView(APIView):
    permission_classes = [IsDirector]

    def post(self, request):
        s = TrackSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)


class StaffTrackDetailView(APIView):
    permission_classes = [IsDirector]

    def patch(self, request, slug):
        track = Track.objects.filter(slug=slug).first()
        if not track:
            return Response({'detail': 'Filière introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        data = {k: v for k, v in request.data.items() if k != 'id'}
        s = TrackSerializer(track, data=data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)

    def delete(self, request, slug):
        if Course.objects.filter(grade_tracks__contains=[slug]).exists():
            return Response({'detail': 'Des cours utilisent encore cette filière.'}, status=status.HTTP_400_BAD_REQUEST)
        Track.objects.filter(slug=slug).delete()
        User.objects.filter(grade_track=slug).update(grade_track='')
        return Response(status=status.HTTP_204_NO_CONTENT)


class StaffTermDetailView(APIView):
    permission_classes = [IsDirector]

    def patch(self, request, number):
        term = SchoolTerm.objects.filter(number=number).first()
        if not term:
            return Response({'detail': 'Trimestre introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        s = SchoolTermSerializer(term, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)


class StaffSettingsView(APIView):
    permission_classes = [IsDirector]

    def patch(self, request):
        s = SchoolSettingsSerializer(SchoolSettings.load(), data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)
