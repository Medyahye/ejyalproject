from django.utils import timezone
from rest_framework import serializers

from .models import Category, Course, CoursePdf, Lesson, Review, SchoolSettings, SchoolTerm, Track


class TrackSerializer(serializers.ModelSerializer):
    id = serializers.SlugField(source='slug')
    shortLabel = serializers.CharField(source='short_label')
    mainCategoryIds = serializers.PrimaryKeyRelatedField(
        source='main_categories', many=True, queryset=Category.objects.all(), required=False,
    )

    class Meta:
        model = Track
        fields = ['id', 'label', 'shortLabel', 'code', 'level', 'order', 'mainCategoryIds']


class SchoolTermSerializer(serializers.ModelSerializer):
    startDate = serializers.DateField(source='start_date')
    endDate = serializers.DateField(source='end_date')
    isCurrent = serializers.SerializerMethodField()
    isStarted = serializers.SerializerMethodField()

    class Meta:
        model = SchoolTerm
        fields = ['number', 'label', 'startDate', 'endDate', 'isCurrent', 'isStarted']
        read_only_fields = ['number']

    def get_isCurrent(self, obj):
        return obj.start_date <= timezone.localdate() <= obj.end_date

    def get_isStarted(self, obj):
        return obj.start_date <= timezone.localdate()


class SchoolSettingsSerializer(serializers.ModelSerializer):
    whatsappNumber = serializers.CharField(source='whatsapp_number')
    merchantNumbers = serializers.JSONField(source='merchant_numbers')
    defaultMaxViews = serializers.IntegerField(source='default_max_views', min_value=1, max_value=50)
    teacherOfferMaxViews = serializers.IntegerField(source='teacher_offer_max_views', min_value=1, max_value=50)

    class Meta:
        model = SchoolSettings
        fields = ['whatsappNumber', 'merchantNumbers', 'defaultMaxViews', 'teacherOfferMaxViews']


class CategorySerializer(serializers.ModelSerializer):
    courseCount = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'color', 'courseCount']

    def get_courseCount(self, obj):
        return obj.courses.count()


class LessonSerializer(serializers.ModelSerializer):
    durationMinutes = serializers.IntegerField(source='duration_minutes')
    isPreview = serializers.BooleanField(source='is_preview', required=False)
    videoUrl = serializers.URLField(source='video_url', required=False, allow_blank=True)
    pdfTitle = serializers.CharField(source='pdf_title', required=False, allow_blank=True)
    pdfSizeMb = serializers.DecimalField(source='pdf_size_mb', max_digits=6, decimal_places=1, required=False)
    pdfPages = serializers.IntegerField(source='pdf_pages', required=False)
    pdfUri = serializers.URLField(source='pdf_uri', required=False, allow_blank=True)

    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'durationMinutes', 'isPreview', 'videoUrl', 'thumbnail', 'order',
            'pdfTitle', 'pdfSizeMb', 'pdfPages', 'pdfUri',
        ]
        read_only_fields = ['id']


class CoursePdfSerializer(serializers.ModelSerializer):
    sizeMb = serializers.DecimalField(source='size_mb', max_digits=6, decimal_places=1)

    class Meta:
        model = CoursePdf
        fields = ['id', 'title', 'sizeMb', 'pages', 'uri', 'order']
        read_only_fields = ['id']


class ReviewSerializer(serializers.ModelSerializer):
    courseId = serializers.PrimaryKeyRelatedField(source='course', queryset=Course.objects.all())
    studentName = serializers.CharField(source='student.full_name', read_only=True)
    studentAvatar = serializers.CharField(source='student.avatar', read_only=True)
    date = serializers.DateTimeField(source='created_at', format='%Y-%m-%d', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'courseId', 'studentName', 'studentAvatar', 'rating', 'comment', 'date']
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)


class CourseSerializer(serializers.ModelSerializer):
    coverGradient = serializers.SerializerMethodField()
    teacherId = serializers.PrimaryKeyRelatedField(source='teacher', read_only=True)
    teacherName = serializers.CharField(source='teacher.full_name', read_only=True)
    teacherAvatar = serializers.CharField(source='teacher.avatar', read_only=True)
    categoryId = serializers.PrimaryKeyRelatedField(source='category', queryset=Category.objects.all())
    categoryName = serializers.CharField(source='category.name', read_only=True)
    originalPrice = serializers.DecimalField(source='original_price', max_digits=8, decimal_places=2, required=False, allow_null=True)
    ratingCount = serializers.IntegerField(source='rating_count', read_only=True)
    studentsCount = serializers.IntegerField(source='students_count', read_only=True)
    durationHours = serializers.IntegerField(source='duration_hours', required=False)
    lastUpdated = serializers.DateField(source='last_updated', read_only=True)
    whatYouWillLearn = serializers.ListField(source='what_you_will_learn', child=serializers.CharField(), required=False)
    isFeatured = serializers.BooleanField(source='is_featured', required=False)
    isBestseller = serializers.BooleanField(source='is_bestseller', required=False)
    gradeTracks = serializers.ListField(source='grade_tracks', child=serializers.CharField(), required=False)
    lessons = LessonSerializer(many=True, read_only=True)
    pdfs = CoursePdfSerializer(many=True, read_only=True)
    teacherHeadline = serializers.CharField(source='teacher.headline', read_only=True)
    contentType = serializers.ChoiceField(source='content_type', choices=Course.ContentType.choices, required=False)
    isClosed = serializers.SerializerMethodField()
    promoFreeUntil = serializers.SerializerMethodField()
    isFree = serializers.SerializerMethodField()
    isLocked = serializers.SerializerMethodField()
    unlockDate = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'subtitle', 'description', 'thumbnail', 'coverGradient',
            'teacherId', 'teacherName', 'teacherAvatar', 'categoryId', 'categoryName',
            'price', 'originalPrice', 'rating', 'ratingCount', 'studentsCount',
            'level', 'gradeTracks', 'language', 'durationHours', 'lastUpdated', 'lessons', 'pdfs',
            'whatYouWillLearn', 'requirements', 'isFeatured', 'isBestseller',
            'teacherHeadline', 'term', 'contentType', 'isClosed', 'promoFreeUntil', 'isFree', 'isLocked', 'unlockDate',
        ]
        read_only_fields = ['id', 'rating']

    def _terms(self):
        cache = self.context.setdefault('_terms', None) if isinstance(self.context, dict) else None
        if cache is None:
            cache = {t.number: t for t in SchoolTerm.objects.all()}
            if isinstance(self.context, dict):
                self.context['_terms'] = cache
        return cache

    def get_isClosed(self, obj):
        return obj.is_closed or obj.teacher.packs_closed

    def get_promoFreeUntil(self, obj):
        until = obj.free_until()
        return until.isoformat() if until else None

    def get_isFree(self, obj):
        return obj.is_free()

    def get_isLocked(self, obj):
        return obj.is_locked(self._terms())

    def get_unlockDate(self, obj):
        unlock = obj.unlock_date(self._terms())
        return unlock.isoformat() if unlock else None

    def validate_term(self, value):
        if value not in (1, 2, 3):
            raise serializers.ValidationError('Le trimestre doit être 1, 2 ou 3.')
        return value

    def get_coverGradient(self, obj):
        return [obj.cover_gradient_start, obj.cover_gradient_end]

    def _apply_cover_gradient(self, validated_data):
        gradient = self.initial_data.get('coverGradient')
        if gradient and len(gradient) == 2:
            validated_data['cover_gradient_start'] = gradient[0]
            validated_data['cover_gradient_end'] = gradient[1]
        return validated_data

    def create(self, validated_data):
        validated_data['teacher'] = self.context['request'].user
        validated_data = self._apply_cover_gradient(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data = self._apply_cover_gradient(validated_data)
        return super().update(instance, validated_data)
