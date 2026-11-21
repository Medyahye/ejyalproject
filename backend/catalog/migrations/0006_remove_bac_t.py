from django.db import migrations


def drop_bac_t(apps, schema_editor):
    """La filière 7T (Bac Série T) est supprimée : on la retire des cours et des profils élèves."""
    Course = apps.get_model('catalog', 'Course')
    User = apps.get_model('accounts', 'User')
    for course in Course.objects.filter(grade_tracks__contains=['bac-t']):
        course.grade_tracks = [t for t in course.grade_tracks if t != 'bac-t']
        course.save(update_fields=['grade_tracks'])
    User.objects.filter(grade_track='bac-t').update(grade_track='')


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0005_schoolsettings_schoolterm_course_content_type_and_more'),
        ('accounts', '0005_user_packs_closed_user_promo_free_until_and_more'),
    ]

    operations = [
        migrations.RunPython(drop_bac_t, migrations.RunPython.noop),
    ]
