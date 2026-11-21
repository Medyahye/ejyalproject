from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from catalog.models import Category
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializes a User as either a Student or a Teacher shape (discriminated by `role`),
    matching the `AppUser` union type on the frontend."""

    fullName = serializers.CharField(source='full_name')
    createdAt = serializers.DateTimeField(source='created_at', format='%Y-%m-%d', read_only=True)

    # Student-only, computed from relations
    enrolledCourseIds = serializers.SerializerMethodField()
    favoriteCourseIds = serializers.SerializerMethodField()
    purchasedCourseIds = serializers.SerializerMethodField()

    # Teacher-only, computed from relations
    courseIds = serializers.SerializerMethodField()
    totalStudents = serializers.SerializerMethodField()
    totalRevenue = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    gradeTrack = serializers.CharField(source='grade_track', required=False, allow_blank=True)
    teachingCategoryIds = serializers.PrimaryKeyRelatedField(source='teaching_categories', many=True, read_only=True)

    # Teacher business terms
    revenueShare = serializers.DecimalField(source='revenue_share', max_digits=5, decimal_places=2, coerce_to_string=False, read_only=True)
    earnings = serializers.SerializerMethodField()
    packsClosed = serializers.BooleanField(source='packs_closed', read_only=True)
    promoFreeUntil = serializers.DateField(source='promo_free_until', read_only=True)
    favoriteTeacherIds = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'fullName', 'email', 'avatar', 'role', 'bio', 'createdAt',
            'enrolledCourseIds', 'favoriteCourseIds', 'purchasedCourseIds', 'gradeTrack', 'favoriteTeacherIds',
            'headline', 'courseIds', 'totalStudents', 'totalRevenue', 'rating', 'specialties', 'teachingCategoryIds',
            'revenueShare', 'earnings', 'packsClosed', 'promoFreeUntil',
        ]

    STUDENT_FIELDS = ('enrolledCourseIds', 'favoriteCourseIds', 'purchasedCourseIds', 'gradeTrack', 'favoriteTeacherIds')
    TEACHER_FIELDS = ('headline', 'courseIds', 'totalStudents', 'totalRevenue', 'rating', 'specialties', 'teachingCategoryIds',
                      'revenueShare', 'earnings', 'packsClosed', 'promoFreeUntil')

    def get_favoriteTeacherIds(self, obj):
        if not obj.is_student:
            return None
        return [str(i) for i in obj.favorite_teachers.values_list('teacher_id', flat=True)]

    def get_earnings(self, obj):
        if not obj.is_teacher:
            return None
        return round(self.get_totalRevenue(obj) * float(obj.revenue_share) / 100, 2)

    def get_enrolledCourseIds(self, obj):
        if not obj.is_student:
            return None
        return list(obj.enrollments.filter(status='active').values_list('course_id', flat=True))

    def get_favoriteCourseIds(self, obj):
        if not obj.is_student:
            return None
        return list(obj.favorites.values_list('course_id', flat=True))

    def get_purchasedCourseIds(self, obj):
        if not obj.is_student:
            return None
        return list(obj.enrollments.filter(status='active').values_list('course_id', flat=True))

    def get_courseIds(self, obj):
        if not obj.is_teacher:
            return None
        return list(obj.courses.values_list('id', flat=True))

    def get_totalStudents(self, obj):
        if not obj.is_teacher:
            return None
        from commerce.models import Enrollment
        return Enrollment.objects.filter(course__teacher_id=obj.id, status='active').values('student_id').distinct().count()

    def get_totalRevenue(self, obj):
        if not obj.is_teacher:
            return None
        from commerce.models import Payment
        from django.db.models import Sum
        total = Payment.objects.filter(course__teacher_id=obj.id, status='Réussi').aggregate(total=Sum('amount'))['total']
        return float(total or 0)

    def get_rating(self, obj):
        if not obj.is_teacher:
            return None
        from django.db.models import Avg
        avg = obj.courses.aggregate(avg=Avg('rating'))['avg']
        return round(float(avg or 0), 1)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        drop = ()
        if instance.is_student:
            drop = self.TEACHER_FIELDS
        elif instance.is_teacher:
            drop = self.STUDENT_FIELDS
        else:
            drop = self.STUDENT_FIELDS + self.TEACHER_FIELDS
        for field in drop:
            data.pop(field, None)
        return data


class PublicTeacherSerializer(serializers.ModelSerializer):
    """What a student sees of a teacher (fenêtre des professeurs)."""

    fullName = serializers.CharField(source='full_name')
    courseCount = serializers.IntegerField(read_only=True)
    totalStudents = serializers.IntegerField(read_only=True)
    rating = serializers.SerializerMethodField()
    teachingCategoryIds = serializers.PrimaryKeyRelatedField(source='teaching_categories', many=True, read_only=True)
    promoFreeUntil = serializers.DateField(source='promo_free_until', read_only=True)
    isPromoActive = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'fullName', 'avatar', 'headline', 'bio', 'specialties', 'courseCount', 'totalStudents',
                  'rating', 'teachingCategoryIds', 'promoFreeUntil', 'isPromoActive']

    def get_rating(self, obj):
        from django.db.models import Avg
        avg = obj.courses.filter(rating_count__gt=0).aggregate(avg=Avg('rating'))['avg']
        return round(float(avg or 0), 1)

    def get_isPromoActive(self, obj):
        from django.utils import timezone
        return bool(obj.promo_free_until and obj.promo_free_until >= timezone.localdate())


class RegisterSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name')
    password = serializers.CharField(write_only=True, validators=[validate_password])
    gradeTrack = serializers.CharField(source='grade_track', required=False, allow_blank=True)
    headline = serializers.CharField(required=False, allow_blank=True)
    teachingCategoryIds = serializers.PrimaryKeyRelatedField(
        source='teaching_categories', many=True, queryset=Category.objects.all(), required=False,
    )

    class Meta:
        model = User
        fields = ['fullName', 'email', 'password', 'role', 'gradeTrack', 'headline', 'teachingCategoryIds']

    def validate_role(self, value):
        # Only students sign up from the app; teacher, admin and director accounts are
        # created by the director (see staff API).
        if value != User.Role.STUDENT:
            raise serializers.ValidationError("Seuls les élèves peuvent créer un compte depuis l'application.")
        return value

    def create(self, validated_data):
        teaching_categories = validated_data.pop('teaching_categories', None)
        user = User.objects.create_user(**validated_data)
        if teaching_categories:
            user.teaching_categories.set(teaching_categories)
        return user


class UpdateProfileSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name', required=False)
    gradeTrack = serializers.CharField(source='grade_track', required=False, allow_blank=True)
    teachingCategoryIds = serializers.PrimaryKeyRelatedField(
        source='teaching_categories', many=True, queryset=Category.objects.all(), required=False,
    )

    class Meta:
        model = User
        fields = ['fullName', 'avatar', 'bio', 'gradeTrack', 'headline', 'specialties', 'teachingCategoryIds']
