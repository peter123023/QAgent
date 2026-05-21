# -*- coding: utf-8 -*-
"""
Agent API Views
"""
import json
import uuid
import logging
from typing import List, Dict, Any

from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync

from .models import AgentSession, AgentMessage
from .engine import ReActEngine
from .serializers import AgentSessionSerializer, AgentMessageSerializer, ChatRequestSerializer

logger = logging.getLogger(__name__)


class SessionListCreateView(generics.ListCreateAPIView):
    """会话列表 / 创建"""
    serializer_class = AgentSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AgentSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        session_id = f"sess_{uuid.uuid4().hex[:12]}"
        serializer.save(user=self.request.user, session_id=session_id)


class SessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """会话详情 / 更新 / 删除"""
    serializer_class = AgentSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'session_id'

    def get_queryset(self):
        return AgentSession.objects.filter(user=self.request.user)


class MessageListView(generics.ListAPIView):
    """获取会话消息历史"""
    serializer_class = AgentMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        session_id = self.kwargs.get('session_id')
        return AgentMessage.objects.filter(session__session_id=session_id, session__user=self.request.user)


class ChatView(APIView):
    """Agent 聊天接口（核心）"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        session_id = serializer.validated_data.get('session_id')
        message = serializer.validated_data['message']

        # 获取或创建会话
        if session_id:
            session = get_object_or_404(AgentSession, session_id=session_id, user=request.user)
        else:
            session_id = f"sess_{uuid.uuid4().hex[:12]}"
            session = AgentSession.objects.create(
                session_id=session_id, user=request.user,
                title=message[:30] + '...' if len(message) > 30 else message
            )

        # 保存用户消息
        AgentMessage.objects.create(
            session=session, role='user', msg_type='text', content=message
        )

        # 构建历史消息（最近 10 条，用于上下文）
        recent_messages = AgentMessage.objects.filter(
            session=session, role__in=['user', 'assistant'], msg_type='text'
        ).order_by('-created_at')[:10]
        history = []
        for msg in reversed(list(recent_messages)):
            history.append({"role": msg.role, "content": msg.content})

        # 执行 ReAct 引擎（使用 async_to_sync 在同步视图中调用异步代码）
        engine = ReActEngine()
        try:
            result = async_to_sync(engine.run)(message, history)
        except Exception as e:
            logger.error(f"Agent engine error: {e}", exc_info=True)
            # 保存错误消息
            AgentMessage.objects.create(
                session=session, role='assistant', msg_type='error',
                content=f"执行出错: {str(e)}"
            )
            return Response({
                "session_id": session.session_id,
                "reply": f"执行出错: {str(e)}",
                "steps": []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        final_answer = result.get('final_answer', '')
        steps = result.get('steps', [])

        # 保存助手回复
        AgentMessage.objects.create(
            session=session, role='assistant', msg_type='text', content=final_answer
        )

        # 保存工具调用记录
        for step in steps:
            if step.get('role') == 'tool':
                try:
                    tool_result = json.loads(step.get('result', '{}')) if isinstance(step.get('result'), str) else step.get('result', {})
                except json.JSONDecodeError:
                    tool_result = {"raw": step.get('result', '')}
                AgentMessage.objects.create(
                    session=session, role='tool', msg_type='tool_result',
                    tool_name=step.get('tool_name', ''),
                    tool_params=step.get('params', {}),
                    tool_result=tool_result,
                    content=str(step.get('result', ''))[:1000]
                )

        # 更新会话标题（如果是第一条消息）
        if session.title in [None, '', '新会话']:
            session.title = message[:30] + '...' if len(message) > 30 else message
            session.save()

        return Response({
            "session_id": session.session_id,
            "reply": final_answer,
            "steps": steps
        })
