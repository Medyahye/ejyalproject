import uuid

from django.conf import settings
from django.db import models

from catalog.models import Course, Lesson


class Offer(models.TextChoices):
    """The 4 ways a student can buy (notes : bac complet, matières de base, secondaires, un prof)."""

    SINGLE = 'single', "Cours à l'unité"
    FULL = 'full', 'Pack complet de la classe'
    MAIN = 'main', 'Matières principales'
    SECONDARY = 'secondary', 'Matières secondaires'
    TEACHER = 'teacher', "Tous les cours d'un professeur"


class Enrollment(models.Model):
    """A student's access to a purchased course (also drives studentsCount)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente de validation'
        ACTIVE = 'active', 'Actif'

    progress = models.FloatField(default=0)
    purchased_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    offer = models.CharField(max_length=10, choices=Offer.choices, default=Offer.SINGLE)
    max_views = models.PositiveSmallIntegerField(default=4)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-purchased_at']

    def __str__(self):
        return f'{self.student} ⊂ {self.course}'


class Favorite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-created_at']


class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart_items')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='in_carts')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-added_at']


class Payment(models.Model):
    class Method(models.TextChoices):
        BANKILY = 'Bankily', 'Bankily'
        MASRVI = 'Masrvi', 'Masrvi'
        SEDAD = 'Sedad', 'Sedad'
        CLICK = 'Click', 'Click'

    class Status(models.TextChoices):
        SUCCESS = 'Réussi', 'Réussi'
        PENDING = 'En attente', 'En attente'
        FAILED = 'Échoué', 'Échoué'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    method = models.CharField(max_length=20, choices=Method.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUCCESS)
    date = models.DateField(auto_now_add=True)
    reference = models.CharField(max_length=12, blank=True, default='', db_index=True,
                                 help_text='Référence de commande envoyée avec la capture WhatsApp.')
    offer = models.CharField(max_length=10, choices=Offer.choices, default=Offer.SINGLE)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f'{self.student} → {self.course} ({self.amount})'


class LessonView(models.Model):
    """How many times a student opened a lesson — capped by Enrollment.max_views."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_views')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='views')
    count = models.PositiveSmallIntegerField(default=0)
    last_viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'lesson')


class FavoriteTeacher(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorite_teachers')
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorited_by_students')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'teacher')
        ordering = ['-created_at']
