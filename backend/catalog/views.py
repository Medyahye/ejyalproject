from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsCourseOwnerOrReadOnly, IsStudent
from .filters import CourseFilter
from .models import Category, Course, CoursePdf, Lesson, Review, SchoolSettings, SchoolTerm, Track
from .serializers import (
    CategorySerializer, CoursePdfSerializer, CourseSerializer, LessonSerializer, ReviewSerializer,
    SchoolSettingsSerializer, SchoolTermSerializer, TrackSerializer,
)


def visible_courses_for(user, queryset):
    """Closed packs (by an admin) disappear for students; teachers still see their own, staff see all."""
    if user.is_authenticated and user.is_staff_member:
        return queryset
    visible = Q(is_closed=False, teacher__packs_closed=False)
    if user.is_authenticated and user.is_teacher:
        visible |= Q(teacher=user)
    return queryset.filter(visible)


class TrackViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Track.objects.prefetch_related('main_categories')
    serializer_class = TrackSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class SchoolTermViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SchoolTerm.objects.all()
    serializer_class = SchoolTermSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class PublicSettingsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(SchoolSettingsSerializer(SchoolSettings.load()).data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related('teacher', 'category').prefetch_related('lessons', 'pdfs')
    serializer_class = CourseSerializer
    permission_classes = [IsCourseOwnerOrReadOnly]
    filterset_class = CourseFilter
    pagination_class = None
    search_fields = ['title', 'subtitle', 'description', 'teacher__full_name']
    ordering_fields = ['price', 'rating', 'students_count', 'last_updated']

    def get_queryset(self):
        return visible_courses_for(self.request.user, super().get_queryset())

    def get_permissions(self):
        if self.action == 'reviews' and self.request.method == 'POST':
            return [IsStudent()]
        return super().get_permissions()

    @action(detail=True, methods=['get', 'post'])
    def reviews(self, request, pk=None):
        course = self.get_object()
        if request.method == 'POST':
            serializer = ReviewSerializer(data={**request.data, 'courseId': str(course.id)}, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=201)
        reviews = course.reviews.select_related('student').all()
        return Response(ReviewSerializer(reviews, many=True).data)

    @action(detail=True, methods=['get', 'post'])
    def lessons(self, request, pk=None):
        course = self.get_object()
        if request.method == 'POST':
            self.check_object_permissions(request, course)
            serializer = LessonSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(course=course)
            return Response(serializer.data, status=201)
        return Response(LessonSerializer(course.lessons.all(), many=True).data)

    @action(detail=True, methods=['get', 'post'])
    def pdfs(self, request, pk=None):
        course = self.get_object()
        if request.method == 'POST':
            self.check_object_permissions(request, course)
            serializer = CoursePdfSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(course=course)
            return Response(serializer.data, status=201)
        return Response(CoursePdfSerializer(course.pdfs.all(), many=True).data)


class LessonViewSet(viewsets.ModelViewSet):
    """Retrieve/update/delete a single lesson by id. Creation happens via
    POST /api/courses/{course_id}/lessons/ (see CourseViewSet.lessons)."""

    queryset = Lesson.objects.select_related('course')
    serializer_class = LessonSerializer
    permission_classes = [IsCourseOwnerOrReadOnly]
    http_method_names = ['get', 'put', 'patch', 'delete', 'head', 'options']

    def has_object_permission_course(self, obj):
        return obj.course

    def check_object_permissions(self, request, obj):
        # Delegate ownership check to the parent course's teacher.
        class _Proxy:
            teacher_id = obj.course.teacher_id
        super().check_object_permissions(request, _Proxy())


class CoursePdfViewSet(viewsets.ModelViewSet):
    """Retrieve/update/delete a single PDF by id. Creation happens via
    POST /api/courses/{course_id}/pdfs/ (see CourseViewSet.pdfs)."""

    queryset = CoursePdf.objects.select_related('course')
    serializer_class = CoursePdfSerializer
    permission_classes = [IsCourseOwnerOrReadOnly]
    http_method_names = ['get', 'put', 'patch', 'delete', 'head', 'options']

    def check_object_permissions(self, request, obj):
        class _Proxy:
            teacher_id = obj.course.teacher_id
        super().check_object_permissions(request, _Proxy())


class TeacherViewSet(viewsets.ReadOnlyModelViewSet):
    """Fenêtre des professeurs : public profiles with stats, closed teachers hidden from students."""

    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_serializer_class(self):
        from accounts.serializers import PublicTeacherSerializer
        return PublicTeacherSerializer

    def get_queryset(self):
        from django.db.models import Count
        qs = User.objects.filter(role=User.Role.TEACHER, is_active=True).prefetch_related('teaching_categories')
        user = self.request.user
        if not (user.is_authenticated and user.is_staff_member):
            qs = qs.filter(packs_closed=False)
        return qs.annotate(
            courseCount=Count('courses', filter=Q(courses__is_closed=False), distinct=True),
            totalStudents=Count('courses__enrollments__student', filter=Q(courses__enrollments__status='active'), distinct=True),
        ).order_by('-totalStudents', 'full_name')
