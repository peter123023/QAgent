from rest_framework import serializers
from .models import TestReport
from apps.users.serializers import UserSerializer
from apps.projects.serializers import ProjectSimpleSerializer


class TestReportSerializer(serializers.ModelSerializer):
    generated_by = UserSerializer(read_only=True)
    project = ProjectSimpleSerializer(read_only=True)

    class Meta:
        model = TestReport
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'generated_by']


class TestReportCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestReport
        fields = ['name', 'report_type', 'project', 'execution']
