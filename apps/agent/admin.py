from django.contrib import admin
from .models import AgentSession, AgentMessage


@admin.register(AgentSession)
class AgentSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'title', 'user', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('session_id', 'title', 'user__username')


@admin.register(AgentMessage)
class AgentMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'role', 'msg_type', 'tool_name', 'created_at')
    list_filter = ('role', 'msg_type', 'created_at')
    search_fields = ('content', 'tool_name')
