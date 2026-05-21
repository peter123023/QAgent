# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class AgentSession(models.Model):
    """Agent 会话模型"""
    session_id = models.CharField(max_length=64, unique=True, verbose_name='会话ID')
    title = models.CharField(max_length=200, default='新会话', verbose_name='会话标题')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='agent_sessions', verbose_name='用户')
    status = models.CharField(max_length=20, default='active', verbose_name='状态')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        db_table = 'agent_sessions'
        verbose_name = 'Agent会话'
        verbose_name_plural = 'Agent会话'
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"


class AgentMessage(models.Model):
    """Agent 消息模型"""
    ROLE_CHOICES = [
        ('user', '用户'),
        ('assistant', '助手'),
        ('tool', '工具'),
        ('system', '系统'),
    ]

    TYPE_CHOICES = [
        ('text', '文本'),
        ('tool_call', '工具调用'),
        ('tool_result', '工具结果'),
        ('error', '错误'),
        ('thinking', '思考'),
    ]

    id = models.BigAutoField(primary_key=True)
    session = models.ForeignKey(AgentSession, on_delete=models.CASCADE, related_name='messages', verbose_name='会话')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, verbose_name='角色')
    msg_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='text', verbose_name='消息类型')
    content = models.TextField(blank=True, verbose_name='内容')
    tool_name = models.CharField(max_length=100, blank=True, verbose_name='工具名称')
    tool_params = models.JSONField(default=dict, blank=True, verbose_name='工具参数')
    tool_result = models.JSONField(default=dict, blank=True, verbose_name='工具结果')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        db_table = 'agent_messages'
        verbose_name = 'Agent消息'
        verbose_name_plural = 'Agent消息'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"
