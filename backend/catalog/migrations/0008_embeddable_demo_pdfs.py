from django.db import migrations

BLOCKED = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
OK = 'https://pdfobject.com/pdf/sample.pdf'


def swap(apps, schema_editor):
    """The w3.org sample refuses to be embedded; use a sample that can be shown in the app."""
    apps.get_model('catalog', 'Lesson').objects.filter(pdf_uri=BLOCKED).update(pdf_uri=OK)
    apps.get_model('catalog', 'CoursePdf').objects.filter(uri=BLOCKED).update(uri=OK)


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0007_demo_media_urls'),
    ]

    operations = [
        migrations.RunPython(swap, migrations.RunPython.noop),
    ]
