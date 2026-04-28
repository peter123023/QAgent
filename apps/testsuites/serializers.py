from rest_framework import serializers
from .models import TestSuite, TestSuiteCase
from apps.users.serializers import UserSerializer
from apps.projects.serializers import ProjectSimpleSerializer
from apps.testcases.serializers import ProjectSimpleSerializer as TestCaseSimpleProjectSerializer


class TestSuiteSimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class TestSuiteSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    project = ProjectSimpleSerializer(read_only=True)
    testcase_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TestSuite
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'author']
    
    def get_testcase_count(self, obj):
        return obj.testcases.count()


class TestSuiteListSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    testcase_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TestSuite
        fields = [
            'id', 'name', 'description', 'project', 'author',
            'testcase_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_author(self, obj):
        return {'id': obj.author.id, 'username': obj.author.username} if obj.author else None
    
    def get_project(self, obj):
        return {'id': obj.project.id, 'name': obj.project.name} if obj.project else None
    
    def get_testcase_count(self, obj):
        return obj.testcases.count()


class TestSuiteCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestSuite
        fields = ['name', 'description', 'project']


class TestSuiteCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestSuiteCase
        fields = '__all__'
