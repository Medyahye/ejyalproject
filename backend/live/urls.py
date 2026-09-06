from rest_framework.routers import DefaultRouter

from .views import LiveSessionViewSet

router = DefaultRouter()
router.register('live', LiveSessionViewSet, basename='livesession')

urlpatterns = router.urls
