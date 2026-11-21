from django.db import migrations

from catalog.demo_media import demo_pdf, demo_video

FAKE_VIDEO = 'https://example.com/mock-video.mp4'
FAKE_PDF = 'https://example.com/mock-support.pdf'


def use_real_demo_media(apps, schema_editor):
    """Replace the placeholder example.com links with playable sample videos and PDFs."""
    Lesson = apps.get_model('catalog', 'Lesson')
    CoursePdf = apps.get_model('catalog', 'CoursePdf')
    for i, lesson in enumerate(Lesson.objects.filter(video_url__in=['', FAKE_VIDEO]).order_by('course_id', 'order')):
        lesson.video_url = demo_video(i)
        lesson.save(update_fields=['video_url'])
    for i, lesson in enumerate(Lesson.objects.filter(pdf_uri=FAKE_PDF).order_by('course_id', 'order')):
        lesson.pdf_uri = demo_pdf(i)
        lesson.save(update_fields=['pdf_uri'])
    # Courses sold as "PDF" or "Vidéo + PDF" get a support document on every lesson.
    lessons = Lesson.objects.filter(pdf_uri='', course__content_type__in=['pdf', 'both']).order_by('course_id', 'order')
    for i, lesson in enumerate(lessons):
        lesson.pdf_uri = demo_pdf(i)
        lesson.pdf_title = f'{lesson.title} — Fiche de cours'
        lesson.pdf_pages = 4
        lesson.pdf_size_mb = 0.3
        lesson.save(update_fields=['pdf_uri', 'pdf_title', 'pdf_pages', 'pdf_size_mb'])
    for i, pdf in enumerate(CoursePdf.objects.filter(uri__in=['', FAKE_PDF]).order_by('course_id', 'order')):
        pdf.uri = demo_pdf(i)
        pdf.save(update_fields=['uri'])


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0006_remove_bac_t'),
    ]

    operations = [
        migrations.RunPython(use_real_demo_media, migrations.RunPython.noop),
    ]
