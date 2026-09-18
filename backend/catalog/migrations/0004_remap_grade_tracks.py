from django.db import migrations

TRACK_REMAP = {'bac-a': 'bac-lm', 'bac-o': 'bac-lo'}


def remap_forward(apps, schema_editor):
    Course = apps.get_model('catalog', 'Course')
    for course in Course.objects.all():
        remapped = [TRACK_REMAP.get(t, t) for t in course.grade_tracks]
        if remapped != course.grade_tracks:
            course.grade_tracks = remapped
            course.save(update_fields=['grade_tracks'])


def remap_backward(apps, schema_editor):
    reverse_map = {v: k for k, v in TRACK_REMAP.items()}
    Course = apps.get_model('catalog', 'Course')
    for course in Course.objects.all():
        remapped = [reverse_map.get(t, t) for t in course.grade_tracks]
        if remapped != course.grade_tracks:
            course.grade_tracks = remapped
            course.save(update_fields=['grade_tracks'])


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0003_lesson_pdf_pages_lesson_pdf_size_mb_lesson_pdf_title_and_more'),
    ]

    operations = [
        migrations.RunPython(remap_forward, remap_backward),
    ]
