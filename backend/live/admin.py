from django.contrib import admin

from .models import LiveChatMessage, LiveSession


class LiveChatMessageInline(admin.TabularInline):
    model = LiveChatMessage
    extra = 0


@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'teacher', 'status', 'scheduled_at', 'viewers_count']
    list_filter = ['status']
    inlines = [LiveChatMessageInline]
