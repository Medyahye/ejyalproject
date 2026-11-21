from rest_framework.routers import DefaultRouter

from django.urls import path

from .views import CategoryViewSet, CoursePdfViewSet, CourseViewSet, LessonViewSet, PublicSettingsView, SchoolTermViewSet, TeacherViewSet, TrackViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('courses', CourseViewSet, basename='course')
router.register('lessons', LessonViewSet, basename='lesson')
router.register('pdfs', CoursePdfViewSet, basename='coursepdf')
router.register('tracks', TrackViewSet, basename='track')
router.register('terms', SchoolTermViewSet, basename='term')
router.register('teachers', TeacherViewSet, basename='teacher')

urlpatterns = router.urls + [
    path('settings/', PublicSettingsView.as_view(), name='public-settings'),
]
