import secrets
from decimal import Decimal

from django.db import transaction
from django.db.models import F
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsStudent
from catalog.models import Course, Lesson, SchoolSettings, SchoolTerm
from catalog.views import visible_courses_for

from .models import CartItem, Enrollment, Favorite, FavoriteTeacher, LessonView, Offer, Payment
from .serializers import (
    CartItemSerializer, EnrollmentSerializer, FavoriteSerializer, FavoriteTeacherSerializer, PaymentSerializer,
)

# Bundle discounts - mirrored in src/constants/offers.ts on the app side.
OFFER_DISCOUNTS = {
    Offer.SINGLE: Decimal('0'),
    Offer.FULL: Decimal('0.20'),
    Offer.MAIN: Decimal('0.10'),
    Offer.SECONDARY: Decimal('0.10'),
    Offer.TEACHER: Decimal('0.10'),
}


def new_reference():
    alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return 'GF-' + ''.join(secrets.choice(alphabet) for _ in range(6))


def activate_enrollment(enrollment):
    """Pending -> active, and count the student in the course's subscribers."""
    if enrollment.status == Enrollment.Status.ACTIVE:
        return
    enrollment.status = Enrollment.Status.ACTIVE
    enrollment.save(update_fields=['status'])
    Course.objects.filter(pk=enrollment.course_id).update(students_count=F('students_count') + 1)


def place_order(student, courses, method, offer):
    """Free (promo) courses are granted immediately; paid ones wait for the WhatsApp capture
    to be validated by an admin. Returns the order summary."""
    settings_obj = SchoolSettings.load()
    max_views = settings_obj.teacher_offer_max_views if offer == Offer.TEACHER else settings_obj.default_max_views
    discount = OFFER_DISCOUNTS.get(offer, Decimal('0')) if len(courses) > 1 else Decimal('0')
    reference = new_reference()
    total = Decimal('0')
    granted, pending = [], []

    with transaction.atomic():
        for course in courses:
            existing = Enrollment.objects.filter(student=student, course=course).first()
            if existing and existing.status == Enrollment.Status.ACTIVE:
                continue
            if course.is_free():
                enrollment = existing or Enrollment.objects.create(
                    student=student, course=course, offer=offer, max_views=max_views, status=Enrollment.Status.PENDING,
                )
                activate_enrollment(enrollment)
                Payment.objects.create(student=student, course=course, amount=0, method=method,
                                       status=Payment.Status.SUCCESS, reference=reference, offer=offer)
                granted.append(enrollment)
                continue
            amount = (Decimal(course.price) * (1 - discount)).quantize(Decimal('1'))
            total += amount
            if existing:
                existing.offer, existing.max_views = offer, max_views
                existing.save(update_fields=['offer', 'max_views'])
                enrollment = existing
            else:
                enrollment = Enrollment.objects.create(
                    student=student, course=course, offer=offer, max_views=max_views, status=Enrollment.Status.PENDING,
                )
            # A new order replaces any earlier unpaid one for the same course.
            Payment.objects.filter(student=student, course=course, status=Payment.Status.PENDING).update(
                status=Payment.Status.FAILED)
            Payment.objects.create(student=student, course=course, amount=amount, method=method,
                                   status=Payment.Status.PENDING, reference=reference, offer=offer)
            pending.append(enrollment)
        CartItem.objects.filter(student=student, course__in=courses).delete()

    return {
        'reference': reference,
        'offer': offer,
        'method': method,
        'amount': float(total),
        'status': 'pending' if pending else 'active',
        'whatsappNumber': settings_obj.whatsapp_number,
        'grantedCourseIds': [str(e.course_id) for e in granted],
        'pendingCourseIds': [str(e.course_id) for e in pending],
    }


class FavoriteViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsStudent]
    pagination_class = None

    def get_queryset(self):
        return Favorite.objects.filter(student=self.request.user).select_related('course')

    @action(detail=False, methods=['delete'], url_path='by-course/(?P<course_id>[^/.]+)')
    def by_course(self, request, course_id=None):
        deleted, _ = Favorite.objects.filter(student=request.user, course_id=course_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT if deleted else status.HTTP_404_NOT_FOUND)


class CartItemViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsStudent]
    pagination_class = None

    def get_queryset(self):
        return CartItem.objects.filter(student=self.request.user).select_related('course')

    @action(detail=False, methods=['delete'], url_path='by-course/(?P<course_id>[^/.]+)')
    def by_course(self, request, course_id=None):
        deleted, _ = CartItem.objects.filter(student=request.user, course_id=course_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT if deleted else status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """Turns the cart (or an explicit list of courses for a pack offer) into an order.
        Paid courses stay pending until an admin validates the payment capture sent on WhatsApp."""
        method = request.data.get('method', Payment.Method.BANKILY)
        if method not in Payment.Method.values:
            return Response({'detail': 'Mode de paiement inconnu.'}, status=status.HTTP_400_BAD_REQUEST)
        offer = request.data.get('offer', Offer.SINGLE)
        if offer not in Offer.values:
            return Response({'detail': 'Offre inconnue.'}, status=status.HTTP_400_BAD_REQUEST)
        course_ids = request.data.get('courseIds')
        visible = visible_courses_for(request.user, Course.objects.select_related('teacher'))
        if course_ids:
            courses = list(visible.filter(pk__in=course_ids))
        else:
            cart_course_ids = self.get_queryset().values_list('course_id', flat=True)
            courses = list(visible.filter(pk__in=cart_course_ids))
        if not courses:
            return Response({'detail': 'Aucun cours à acheter.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(place_order(request.user, courses, method, offer), status=status.HTTP_201_CREATED)


class EnrollmentViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]
    pagination_class = None

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user).select_related('course', 'course__teacher', 'course__category')

    @action(detail=True, methods=['patch'])
    def progress(self, request, pk=None):
        enrollment = self.get_object()
        value = request.data.get('progress')
        if value is None or not (0 <= float(value) <= 1):
            return Response({'detail': 'progress doit être un nombre entre 0 et 1.'}, status=status.HTTP_400_BAD_REQUEST)
        enrollment.progress = float(value)
        enrollment.save(update_fields=['progress'])
        return Response(EnrollmentSerializer(enrollment).data)


class PaymentViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.is_teacher:
            return Payment.objects.filter(course__teacher=user).select_related('course', 'student')
        return Payment.objects.filter(student=user).select_related('course', 'student')


class LessonViewView(APIView):
    """POST /api/lessons/{id}/view/ - counts one viewing; refuses once the limit is reached
    or while the course's trimester hasn't started yet."""

    permission_classes = [IsStudent]

    def post(self, request, pk):
        lesson = Lesson.objects.select_related('course', 'course__teacher').filter(pk=pk).first()
        if not lesson:
            return Response({'detail': 'Leçon introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        course = lesson.course
        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
        if lesson.is_preview and (not enrollment or enrollment.status != Enrollment.Status.ACTIVE):
            return Response({'viewsUsed': 0, 'maxViews': None, 'remaining': None})
        if not enrollment or enrollment.status != Enrollment.Status.ACTIVE:
            return Response({'detail': "Ce cours n'est pas encore activé sur votre compte.", 'code': 'pending'},
                            status=status.HTTP_403_FORBIDDEN)
        terms = {t.number: t for t in SchoolTerm.objects.all()}
        if course.is_locked(terms):
            unlock = course.unlock_date(terms)
            return Response({'detail': f"Ce cours sera débloqué le {unlock.strftime('%d/%m/%Y')}.", 'code': 'locked'},
                            status=status.HTTP_403_FORBIDDEN)
        with transaction.atomic():
            view, _ = LessonView.objects.select_for_update().get_or_create(student=request.user, lesson=lesson)
            if view.count >= enrollment.max_views:
                return Response({'detail': f'Vous avez atteint la limite de {enrollment.max_views} visionnages pour cette leçon.',
                                 'code': 'limit', 'viewsUsed': view.count, 'maxViews': enrollment.max_views},
                                status=status.HTTP_403_FORBIDDEN)
            view.count += 1
            view.save(update_fields=['count', 'last_viewed_at'])
        return Response({'viewsUsed': view.count, 'maxViews': enrollment.max_views,
                         'remaining': enrollment.max_views - view.count})


class FavoriteTeacherViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = FavoriteTeacherSerializer
    permission_classes = [IsStudent]
    pagination_class = None

    def get_queryset(self):
        return FavoriteTeacher.objects.filter(student=self.request.user)

    def create(self, request):
        teacher = User.objects.filter(pk=request.data.get('teacherId'), role=User.Role.TEACHER).first()
        if not teacher:
            return Response({'detail': 'Professeur introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        fav, _ = FavoriteTeacher.objects.get_or_create(student=request.user, teacher=teacher)
        return Response(FavoriteTeacherSerializer(fav).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['delete'], url_path='by-teacher/(?P<teacher_id>[^/.]+)')
    def by_teacher(self, request, teacher_id=None):
        FavoriteTeacher.objects.filter(student=request.user, teacher_id=teacher_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
