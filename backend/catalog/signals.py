from django.db.models import Avg, Count
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Review


def _recompute_course_rating(course):
    stats = course.reviews.aggregate(avg=Avg('rating'), count=Count('id'))
    course.rating = round(stats['avg'] or 0, 1)
    course.rating_count = stats['count'] or 0
    course.save(update_fields=['rating', 'rating_count'])


@receiver(post_save, sender=Review)
def on_review_saved(sender, instance, **kwargs):
    _recompute_course_rating(instance.course)


@receiver(post_delete, sender=Review)
def on_review_deleted(sender, instance, **kwargs):
    _recompute_course_rating(instance.course)
