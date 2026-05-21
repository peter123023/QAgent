# -*- coding: utf-8 -*-
from rest_framework import serializers
from .models import AgentSession, AgentMessage


class AgentSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentSession
        fields = ['session_id', 'title', 'status', 'created_at', 'updated_at']
        read_only_fields = ['session_id', 'created_at', 'updated_at']


class AgentMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentMessage
        fields = ['id', 'role', 'msg_type', 'content', 'tool_name', 'tool_params', 'tool_result', 'created_at']
        read_only_fields = ['created_at']


class ChatRequestSerializer(serializers.Serializer):
    session_id = serializers.CharField(required=False, allow_blank=True)
    message = serializers.CharField(required=True, min_length=1)
