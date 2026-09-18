from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F

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
        if self.action in ('update', 'partial_update', 'destroy', 'start', 'end'):
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

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        live_session = self.get_object()
        LiveSession.objects.filter(pk=live_session.pk).update(viewers_count=F('viewers_count') + 1)
        live_session.refresh_from_db()
        return Response(LiveSessionSerializer(live_session).data)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        live_session = self.get_object()
        if live_session.viewers_count > 0:
            LiveSession.objects.filter(pk=live_session.pk).update(viewers_count=F('viewers_count') - 1)
            live_session.refresh_from_db()
        return Response(LiveSessionSerializer(live_session).data)

    @action(detail=True, methods=['post'])
    def react(self, request, pk=None):
        live_session = self.get_object()
        LiveSession.objects.filter(pk=live_session.pk).update(reactions_count=F('reactions_count') + 1)
        live_session.refresh_from_db()
        return Response(LiveSessionSerializer(live_session).data)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        live_session = self.get_object()
        live_session.status = LiveSession.Status.LIVE
        live_session.save(update_fields=['status'])
        return Response(LiveSessionSerializer(live_session).data)

    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        live_session = self.get_object()
        live_session.status = LiveSession.Status.ENDED
        live_session.save(update_fields=['status'])
        return Response(LiveSessionSerializer(live_session).data)


class IsTeacherOwnerOfLive(IsCourseOwnerOrReadOnly):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.teacher_id == request.user.id
