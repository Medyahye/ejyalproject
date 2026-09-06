from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, CoursePdfViewSet, CourseViewSet, LessonViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('courses', CourseViewSet, basename='course')
router.register('lessons', LessonViewSet, basename='lesson')
router.register('pdfs', CoursePdfViewSet, basename='coursepdf')

urlpatterns = router.urls
