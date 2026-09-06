import uuid

from django.conf import settings
from django.db import models

from catalog.models import Course


class LiveSession(models.Model):
    class Status(models.TextChoices):
        UPCOMING = 'upcoming', 'Upcoming'
        LIVE = 'live', 'Live'
        ENDED = 'ended', 'Ended'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='live_sessions',
        limit_choices_to={'role': 'teacher'},
    )
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='live_sessions')
    category_name = models.CharField(max_length=100, blank=True, default='')
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UPCOMING)
    viewers_count = models.PositiveIntegerField(default=0)
    thumbnail = models.URLField(blank=True, default='')
    cover_gradient_start = models.CharField(max_length=7, default='#6C5CE7')
    cover_gradient_end = models.CharField(max_length=7, default='#4432B0')

    class Meta:
        ordering = ['scheduled_at']

    def __str__(self):
        return self.title


class LiveChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    live_session = models.ForeignKey(LiveSession, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='live_chat_messages')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.user} @ {self.live_session}: {self.message[:30]}'
