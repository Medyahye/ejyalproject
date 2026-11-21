import uuid

from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models



class Track(models.Model):
    """A class/filière (1AF, 3AS, 7C…) grouped by school level. Managed by the director."""

    class Level(models.TextChoices):
        PRIMAIRE = 'primaire', 'Primaire'
        COLLEGE = 'college', 'Collège'
        LYCEE = 'lycee', 'Lycée & Bac'
        CONCOURS = 'concours', 'Concours'

    slug = models.SlugField(primary_key=True, max_length=20)
    label = models.CharField(max_length=80)
    short_label = models.CharField(max_length=40)
    code = models.CharField(max_length=6)
    level = models.CharField(max_length=10, choices=Level.choices)
    order = models.PositiveIntegerField(default=0)
    main_categories = models.ManyToManyField(
        'Category', blank=True, related_name='main_for_tracks',
        help_text='Matières principales (fort coefficient) — les autres sont les matières secondaires.',
    )

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.label


class SchoolTerm(models.Model):
    """Trimestre scolaire : les cours d'un trimestre se débloquent à sa date de début."""

    number = models.PositiveSmallIntegerField(primary_key=True)
    label = models.CharField(max_length=40)
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        ordering = ['number']

    def __str__(self):
        return self.label


class SchoolSettings(models.Model):
    """Singleton (pk=1) of platform-wide settings editable by the director."""

    whatsapp_number = models.CharField(max_length=20, default='22200000000')
    merchant_numbers = models.JSONField(default=dict, blank=True)
    default_max_views = models.PositiveSmallIntegerField(default=4)
    teacher_offer_max_views = models.PositiveSmallIntegerField(default=2)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


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
        models.CharField(max_length=20),
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

    class ContentType(models.TextChoices):
        VIDEO = 'video', 'Vidéo'
        PDF = 'pdf', 'PDF'
        BOTH = 'both', 'Vidéo + PDF'

    term = models.PositiveSmallIntegerField(default=1, help_text='Trimestre (1, 2 ou 3) — débloqué au début du trimestre.')
    content_type = models.CharField(max_length=5, choices=ContentType.choices, default=ContentType.BOTH)
    is_closed = models.BooleanField(default=False, help_text='Fermé par un administrateur.')
    promo_free_until = models.DateField(null=True, blank=True, help_text="Gratuit jusqu'à cette date.")

    class Meta:
        ordering = ['-last_updated']

    def free_until(self):
        dates = [d for d in (self.promo_free_until, self.teacher.promo_free_until) if d]
        return max(dates) if dates else None

    def is_free(self, today=None):
        from django.utils import timezone
        today = today or timezone.localdate()
        until = self.free_until()
        return bool(until and until >= today)

    def unlock_date(self, terms=None):
        terms = terms if terms is not None else {t.number: t for t in SchoolTerm.objects.all()}
        term = terms.get(self.term)
        return term.start_date if term else None

    def is_locked(self, terms=None, today=None):
        from django.utils import timezone
        today = today or timezone.localdate()
        unlock = self.unlock_date(terms)
        return bool(unlock and unlock > today)

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
