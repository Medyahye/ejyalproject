from rest_framework.routers import DefaultRouter

from .views import CartItemViewSet, EnrollmentViewSet, FavoriteViewSet, PaymentViewSet

router = DefaultRouter()
router.register('favorites', FavoriteViewSet, basename='favorite')
router.register('cart', CartItemViewSet, basename='cartitem')
router.register('enrollments', EnrollmentViewSet, basename='enrollment')
router.register('payments', PaymentViewSet, basename='payment')

urlpatterns = router.urls
