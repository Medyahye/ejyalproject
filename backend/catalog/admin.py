from django.contrib import admin

from .models import Category, Course, CoursePdf, Lesson, Review


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0


class CoursePdfInline(admin.TabularInline):
    model = CoursePdf
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'color']
    search_fields = ['name']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'teacher', 'category', 'price', 'rating', 'students_count', 'is_featured', 'is_bestseller']
    list_filter = ['category', 'level', 'is_featured', 'is_bestseller']
    search_fields = ['title', 'teacher__full_name']
    inlines = [LessonInline, CoursePdfInline]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['course', 'student', 'rating', 'created_at']
    list_filter = ['rating']
