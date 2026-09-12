import django_filters

from .models import Course


class CourseFilter(django_filters.FilterSet):
    category = django_filters.UUIDFilter(field_name='category_id')
    teacher = django_filters.UUIDFilter(field_name='teacher_id')
    level = django_filters.CharFilter(field_name='level')
    gradeTrack = django_filters.CharFilter(method='filter_grade_track')
    minPrice = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    maxPrice = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    featured = django_filters.BooleanFilter(field_name='is_featured')
    bestseller = django_filters.BooleanFilter(field_name='is_bestseller')

    class Meta:
        model = Course
        fields = ['category', 'teacher', 'level', 'gradeTrack', 'minPrice', 'maxPrice', 'featured', 'bestseller']

    def filter_grade_track(self, queryset, name, value):
        return queryset.filter(grade_tracks__contains=[value])
