from rest_framework.routers import DefaultRouter

from django.urls import path

from .views import CartItemViewSet, EnrollmentViewSet, FavoriteTeacherViewSet, FavoriteViewSet, LessonViewView, PaymentViewSet

router = DefaultRouter()
router.register('favorites', FavoriteViewSet, basename='favorite')
router.register('cart', CartItemViewSet, basename='cartitem')
router.register('enrollments', EnrollmentViewSet, basename='enrollment')
router.register('payments', PaymentViewSet, basename='payment')
router.register('favorite-teachers', FavoriteTeacherViewSet, basename='favoriteteacher')

urlpatterns = router.urls + [
    path('lessons/<uuid:pk>/view/', LessonViewView.as_view(), name='lesson-view'),
]
