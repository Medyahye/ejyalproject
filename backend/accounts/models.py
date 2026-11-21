import uuid

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('Un email est requis')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.TEACHER)
        extra_fields.setdefault('full_name', email)
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        STUDENT = 'student', 'Étudiant'
        TEACHER = 'teacher', 'Professeur'
        ADMIN = 'admin', 'Administrateur'
        DIRECTOR = 'director', 'Directeur général'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    avatar = models.URLField(blank=True, default='')
    role = models.CharField(max_length=10, choices=Role.choices)
    bio = models.TextField(blank=True, default='')

    # Student-only field — slug of a catalog.Track (filières are managed by the director).
    grade_track = models.CharField(max_length=20, blank=True, default='')

    # Teacher-only fields (unused for students)
    headline = models.CharField(max_length=255, blank=True, default='')
    specialties = models.JSONField(default=list, blank=True)
    teaching_categories = models.ManyToManyField(
        'catalog.Category', blank=True, related_name='teachers',
        help_text='Matières enseignées par ce professeur — personnalise les catégories proposées lors de la création de cours.',
    )

    # Teacher-only business terms, set by the director/admins.
    revenue_share = models.DecimalField(
        max_digits=5, decimal_places=2, default=50,
        help_text="Pourcentage des ventes reversé au professeur (accord avec le directeur).",
    )
    packs_closed = models.BooleanField(
        default=False, help_text='Fermé par un administrateur (désaccord) : ses packs ne sont plus visibles ni achetables.',
    )
    promo_free_until = models.DateField(
        null=True, blank=True, help_text="Tous les cours de ce professeur sont gratuits jusqu'à cette date.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'role']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name} <{self.email}>'

    @property
    def is_teacher(self):
        return self.role == self.Role.TEACHER

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_director(self):
        return self.role == self.Role.DIRECTOR

    @property
    def is_staff_member(self):
        """Admins and the director can see and manage everything."""
        return self.role in (self.Role.ADMIN, self.Role.DIRECTOR)
