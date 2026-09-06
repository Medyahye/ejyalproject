from django.db import transaction
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsStudent, IsTeacher
from catalog.models import Course

from .models import CartItem, Enrollment, Favorite, Payment
from .serializers import CartItemSerializer, EnrollmentSerializer, FavoriteSerializer, PaymentSerializer


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
        """Turns every item currently in the student's cart into a Payment + Enrollment,
        then empties the cart — mirrors StudentDataContext.purchaseCart() on the frontend."""
        method = request.data.get('method', Payment.Method.BANKILY)
        cart_items = list(self.get_queryset())
        if not cart_items:
            return Response({'detail': 'Le panier est vide.'}, status=status.HTTP_400_BAD_REQUEST)

        created_enrollments = []
        with transaction.atomic():
            for item in cart_items:
                enrollment, created = Enrollment.objects.get_or_create(student=request.user, course=item.course)
                if created:
                    created_enrollments.append(enrollment)
                    Course.objects.filter(pk=item.course_id).update(students_count=item.course.students_count + 1)
                Payment.objects.create(
                    student=request.user, course=item.course, amount=item.course.price,
                    method=method, status=Payment.Status.SUCCESS,
                )
            CartItem.objects.filter(student=request.user).delete()

        return Response(EnrollmentSerializer(created_enrollments, many=True).data, status=status.HTTP_201_CREATED)


class EnrollmentViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]
    pagination_class = None

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user).select_related('course')

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
