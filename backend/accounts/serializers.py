from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

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

    class Meta:
        model = User
        fields = [
            'id', 'fullName', 'email', 'avatar', 'role', 'bio', 'createdAt',
            'enrolledCourseIds', 'favoriteCourseIds', 'purchasedCourseIds',
            'headline', 'courseIds', 'totalStudents', 'totalRevenue', 'rating', 'specialties',
        ]

    def get_enrolledCourseIds(self, obj):
        if not obj.is_student:
            return None
        return list(obj.enrollments.values_list('course_id', flat=True))

    def get_favoriteCourseIds(self, obj):
        if not obj.is_student:
            return None
        return list(obj.favorites.values_list('course_id', flat=True))

    def get_purchasedCourseIds(self, obj):
        if not obj.is_student:
            return None
        return list(obj.enrollments.values_list('course_id', flat=True))

    def get_courseIds(self, obj):
        if not obj.is_teacher:
            return None
        return list(obj.courses.values_list('id', flat=True))

    def get_totalStudents(self, obj):
        if not obj.is_teacher:
            return None
        from commerce.models import Enrollment
        return Enrollment.objects.filter(course__teacher_id=obj.id).values('student_id').distinct().count()

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
        if instance.is_student:
            for field in ('headline', 'courseIds', 'totalStudents', 'totalRevenue', 'rating', 'specialties'):
                data.pop(field, None)
        else:
            for field in ('enrolledCourseIds', 'favoriteCourseIds', 'purchasedCourseIds'):
                data.pop(field, None)
        return data


class RegisterSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name')
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['fullName', 'email', 'password', 'role']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UpdateProfileSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name', required=False)

    class Meta:
        model = User
        fields = ['fullName', 'avatar', 'bio', 'headline', 'specialties']
