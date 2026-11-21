from rest_framework import serializers

from catalog.serializers import CourseSerializer

from .models import CartItem, Enrollment, Favorite, FavoriteTeacher, LessonView, Payment


class FavoriteSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    courseId = serializers.UUIDField(write_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'course', 'courseId', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['course_id'] = validated_data.pop('courseId')
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)


class CartItemSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    courseId = serializers.UUIDField(write_only=True)
    addedAt = serializers.DateTimeField(source='added_at', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'course', 'courseId', 'addedAt']
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data['course_id'] = validated_data.pop('courseId')
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    courseId = serializers.PrimaryKeyRelatedField(source='course', read_only=True)
    purchasedAt = serializers.DateTimeField(source='purchased_at', read_only=True)
    maxViews = serializers.IntegerField(source='max_views', read_only=True)
    lessonViews = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['id', 'courseId', 'course', 'progress', 'purchasedAt', 'status', 'offer', 'maxViews', 'lessonViews']
        read_only_fields = ['id', 'courseId', 'course', 'purchasedAt', 'status', 'offer']

    def get_lessonViews(self, obj):
        views = LessonView.objects.filter(student_id=obj.student_id, lesson__course_id=obj.course_id)
        return {str(v.lesson_id): v.count for v in views}


class FavoriteTeacherSerializer(serializers.ModelSerializer):
    teacherId = serializers.PrimaryKeyRelatedField(source='teacher', read_only=True)

    class Meta:
        model = FavoriteTeacher
        fields = ['id', 'teacherId', 'created_at']


class PaymentSerializer(serializers.ModelSerializer):
    courseId = serializers.PrimaryKeyRelatedField(source='course', read_only=True)
    courseTitle = serializers.CharField(source='course.title', read_only=True)
    studentId = serializers.PrimaryKeyRelatedField(source='student', read_only=True)
    studentName = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'courseId', 'courseTitle', 'studentId', 'studentName', 'amount', 'date', 'method', 'status', 'reference', 'offer']
        read_only_fields = fields
