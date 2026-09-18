import uuid

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from accounts.models import User


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50)
    color = models.CharField(max_length=7)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Course(models.Model):
    class Level(models.TextChoices):
        DEBUTANT = 'Débutant', 'Débutant'
        INTERMEDIAIRE = 'Intermédiaire', 'Intermédiaire'
        AVANCE = 'Avancé', 'Avancé'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True, default='')
    description = models.TextField(blank=True, default='')
    thumbnail = models.URLField(blank=True, default='')
    cover_gradient_start = models.CharField(max_length=7, default='#6C5CE7')
    cover_gradient_end = models.CharField(max_length=7, default='#4432B0')

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses',
        limit_choices_to={'role': 'teacher'},
    )
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='courses')

    price = models.DecimalField(max_digits=8, decimal_places=2)
    original_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    rating_count = models.PositiveIntegerField(default=0)
    students_count = models.PositiveIntegerField(default=0)

    level = models.CharField(max_length=20, choices=Level.choices)
    grade_tracks = ArrayField(
        models.CharField(max_length=10, choices=User.GradeTrack.choices),
        default=list, blank=True,
        help_text='Filières Bac/Brevet/Concours pour lesquelles ce cours est pertinent.',
    )
    language = models.CharField(max_length=50, default='Français')
    duration_hours = models.PositiveIntegerField(default=0)
    last_updated = models.DateField(auto_now=True)

    what_you_will_learn = models.JSONField(default=list, blank=True)
    requirements = models.JSONField(default=list, blank=True)

    is_featured = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)

    class Meta:
        ordering = ['-last_updated']

    def __str__(self):
        return self.title


class Lesson(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    duration_minutes = models.PositiveIntegerField(default=0)
    is_preview = models.BooleanField(default=False)
    video_url = models.URLField(blank=True, default='')
    thumbnail = models.URLField(blank=True, default='')
    order = models.PositiveIntegerField(default=0)

    # Optional PDF support attached to this specific chapter/lesson.
    pdf_title = models.CharField(max_length=255, blank=True, default='')
    pdf_size_mb = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    pdf_pages = models.PositiveIntegerField(default=0)
    pdf_uri = models.URLField(blank=True, default='')

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.course.title} — {self.title}'


class CoursePdf(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='pdfs')
    title = models.CharField(max_length=255)
    size_mb = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    pages = models.PositiveIntegerField(default=0)
    uri = models.URLField(blank=True, default='')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.course.title} — {self.title}'


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews',
        limit_choices_to={'role': 'student'},
    )
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('course', 'student')

    def __str__(self):
        return f'{self.student} → {self.course} ({self.rating}★)'
