from rest_framework import serializers
from .models import TestPlan, TestRun, TestRunCase, TestRunCaseHistory
from apps.users.serializers import UserSerializer
from apps.projects.serializers import ProjectSimpleSerializer
from apps.versions.serializers import VersionSimpleSerializer
from apps.testcases.serializers import ProjectSimpleSerializer as TestCaseSimpleProjectSerializer
from apps.testsuites.serializers import TestSuiteSimpleSerializer


class TestPlanSimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class TestRunSimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class TestPlanSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    assignees = UserSerializer(many=True, read_only=True)
    projects = ProjectSimpleSerializer(many=True, read_only=True)
    version = VersionSimpleSerializer(read_only=True)
    
    class Meta:
        model = TestPlan
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'creator']


class TestPlanDetailSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    assignees = UserSerializer(many=True, read_only=True)
    projects = ProjectSimpleSerializer(many=True, read_only=True)
    version = VersionSimpleSerializer(read_only=True)
    test_runs = serializers.SerializerMethodField()
    
    class Meta:
        model = TestPlan
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'creator']
    
    def get_test_runs(self, obj):
        from .serializers import TestRunSimpleSerializer
        return TestRunSimpleSerializer(obj.test_runs.all(), many=True).data


class TestPlanListSerializer(serializers.ModelSerializer):
    creator = serializers.SerializerMethodField()
    projects = serializers.SerializerMethodField()
    testsuite = serializers.SerializerMethodField()
    
    class Meta:
        model = TestPlan
        fields = [
            'id', 'name', 'description', 'projects', 'version',
            'creator', 'is_active', 'created_at', 'updated_at', 'testsuite'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_creator(self, obj):
        return {'id': obj.creator.id, 'username': obj.creator.username} if obj.creator else None
    
    def get_projects(self, obj):
        return [{'id': p.id, 'name': p.name} for p in obj.projects.all()]
    
    def get_testsuite(self, obj):
        # 这里可以添加测试套件关联，如果需要的话
        return None


class TestPlanCreateUpdateSerializer(serializers.ModelSerializer):
    testsuite = serializers.IntegerField(required=False, allow_null=True, help_text="测试套件ID")
    
    class Meta:
        model = TestPlan
        fields = ['name', 'description', 'projects', 'version', 'is_active', 'testsuite']


class TestRunSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    project = ProjectSimpleSerializer(read_only=True)
    version = VersionSimpleSerializer(read_only=True)
    test_plan = TestPlanSimpleSerializer(read_only=True)
    progress_stats = serializers.SerializerMethodField()
    
    class Meta:
        model = TestRun
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'creator']
    
    def get_progress_stats(self, obj):
        return obj.progress_stats


class TestRunDetailSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    project = ProjectSimpleSerializer(read_only=True)
    version = VersionSimpleSerializer(read_only=True)
    test_plan = TestPlanSimpleSerializer(read_only=True)
    progress_stats = serializers.SerializerMethodField()
    run_cases = serializers.SerializerMethodField()
    
    class Meta:
        model = TestRun
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'creator']
    
    def get_progress_stats(self, obj):
        return obj.progress_stats
    
    def get_run_cases(self, obj):
        run_cases = obj.run_cases.all()
        return TestRunCaseDetailSerializer(run_cases, many=True).data


class TestRunListSerializer(serializers.ModelSerializer):
    creator = serializers.SerializerMethodField()
    assignee = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    test_plan = serializers.SerializerMethodField()
    progress_stats = serializers.SerializerMethodField()
    pass_count = serializers.SerializerMethodField()
    fail_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TestRun
        fields = [
            'id', 'name', 'description', 'test_plan', 'project', 'version',
            'assignee', 'creator', 'status', 'started_at', 'completed_at',
            'due_date', 'progress_stats', 'pass_count', 'fail_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_creator(self, obj):
        return {'id': obj.creator.id, 'username': obj.creator.username} if obj.creator else None
    
    def get_assignee(self, obj):
        return {'id': obj.assignee.id, 'username': obj.assignee.username} if obj.assignee else None
    
    def get_project(self, obj):
        return {'id': obj.project.id, 'name': obj.project.name} if obj.project else None
    
    def get_test_plan(self, obj):
        return {'id': obj.test_plan.id, 'name': obj.test_plan.name} if obj.test_plan else None
    
    def get_progress_stats(self, obj):
        return obj.progress_stats
    
    def get_pass_count(self, obj):
        stats = obj.progress_stats
        return stats.get('passed', 0)
    
    def get_fail_count(self, obj):
        stats = obj.progress_stats
        return stats.get('failed', 0)


class TestRunCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestRun
        fields = ['name', 'description', 'test_plan', 'project', 'version', 'assignee', 'status', 'due_date']


class TestRunCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestRunCase
        fields = '__all__'


class TestRunCaseDetailSerializer(serializers.ModelSerializer):
    testcase = serializers.SerializerMethodField()
    executed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = TestRunCase
        fields = '__all__'
    
    def get_testcase(self, obj):
        return {
            'id': obj.testcase.id,
            'title': obj.testcase.title
        }


class TestRunCaseHistorySerializer(serializers.ModelSerializer):
    executed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = TestRunCaseHistory
        fields = '__all__'
