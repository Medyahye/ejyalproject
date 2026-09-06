from rest_framework import serializers

from catalog.models import Course

from .models import LiveChatMessage, LiveSession


class LiveSessionSerializer(serializers.ModelSerializer):
    coverGradient = serializers.SerializerMethodField()
    teacherId = serializers.PrimaryKeyRelatedField(source='teacher', read_only=True)
    teacherName = serializers.CharField(source='teacher.full_name', read_only=True)
    teacherAvatar = serializers.CharField(source='teacher.avatar', read_only=True)
    courseId = serializers.PrimaryKeyRelatedField(source='course', queryset=Course.objects.all(), required=False, allow_null=True)
    categoryName = serializers.CharField(source='category_name', required=False, allow_blank=True)
    scheduledAt = serializers.DateTimeField(source='scheduled_at')
    durationMinutes = serializers.IntegerField(source='duration_minutes')
    viewersCount = serializers.IntegerField(source='viewers_count', read_only=True)

    class Meta:
        model = LiveSession
        fields = [
            'id', 'title', 'description', 'teacherId', 'teacherName', 'teacherAvatar',
            'courseId', 'categoryName', 'scheduledAt', 'durationMinutes', 'status',
            'viewersCount', 'thumbnail', 'coverGradient',
        ]
        read_only_fields = ['id']

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


class LiveChatMessageSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user.full_name', read_only=True)
    avatar = serializers.CharField(source='user.avatar', read_only=True)
    isTeacher = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source='created_at', format='%H:%M', read_only=True)

    class Meta:
        model = LiveChatMessage
        fields = ['id', 'userName', 'avatar', 'message', 'isTeacher', 'timestamp']
        read_only_fields = ['id']

    def get_isTeacher(self, obj):
        return obj.user.is_teacher

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['live_session_id'] = self.context['live_session_id']
        return super().create(validated_data)
