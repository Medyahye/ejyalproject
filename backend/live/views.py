from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsCourseOwnerOrReadOnly

from .models import LiveSession
from .serializers import LiveChatMessageSerializer, LiveSessionSerializer


class LiveSessionViewSet(viewsets.ModelViewSet):
    queryset = LiveSession.objects.select_related('teacher', 'course')
    serializer_class = LiveSessionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['status', 'teacher']
    pagination_class = None

    def get_permissions(self):
        if self.action in ('update', 'partial_update', 'destroy'):
            return [IsTeacherOwnerOfLive()]
        return super().get_permissions()

    @action(detail=True, methods=['get', 'post'])
    def chat(self, request, pk=None):
        live_session = self.get_object()
        if request.method == 'POST':
            serializer = LiveChatMessageSerializer(
                data=request.data, context={'request': request, 'live_session_id': live_session.id}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(LiveChatMessageSerializer(live_session.messages.select_related('user'), many=True).data)


class IsTeacherOwnerOfLive(IsCourseOwnerOrReadOnly):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.teacher_id == request.user.id
