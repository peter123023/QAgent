# -*- coding: utf-8 -*-
"""
Tool Registry - 将 QAgent 核心测试能力封装为标准 Tools
"""
import json
import logging
from typing import Dict, Any, List, Callable
from django.db.models import Q, Count
from django.utils import timezone
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)


class Tool:
    """Tool 基类"""
    def __init__(self, name: str, description: str, parameters: Dict[str, Any], func: Callable):
        self.name = name
        self.description = description
        self.parameters = parameters
        self.func = func

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters
        }

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        try:
            result = await self.func(**params)
            return {"success": True, "data": result}
        except Exception as e:
            logger.error(f"Tool {self.name} execute error: {e}", exc_info=True)
            return {"success": False, "error": str(e)}


class ToolRegistry:
    """工具注册中心"""
    def __init__(self):
        self._tools: Dict[str, Tool] = {}

    def register(self, name: str, description: str, parameters: Dict[str, Any]):
        """注册工具的装饰器"""
        def decorator(func: Callable):
            self._tools[name] = Tool(name, description, parameters, func)
            return func
        return decorator

    def get_tool(self, name: str) -> Tool:
        return self._tools.get(name)

    def list_tools(self) -> List[Dict[str, Any]]:
        return [tool.to_dict() for tool in self._tools.values()]

    def get_tools_prompt(self) -> str:
        """生成工具描述，供 LLM 使用"""
        lines = ["你可以使用以下工具来辅助完成任务："]
        for tool in self._tools.values():
            lines.append(f"\n### {tool.name}")
            lines.append(f"描述: {tool.description}")
            lines.append(f"参数: {json.dumps(tool.parameters, ensure_ascii=False)}")
        return "\n".join(lines)


# 全局注册中心实例
registry = ToolRegistry()


# ==================== 测试用例工具 ====================

@registry.register(
    name="list_testcases",
    description="查询测试用例列表，支持按项目、优先级、状态、关键词筛选",
    parameters={
        "type": "object",
        "properties": {
            "project_id": {"type": "integer", "description": "项目ID（可选）"},
            "priority": {"type": "string", "description": "优先级：low/medium/high/critical（可选）"},
            "status": {"type": "string", "description": "状态：draft/active/deprecated（可选）"},
            "test_type": {"type": "string", "description": "测试类型：functional/integration/api/ui/performance/security（可选）"},
            "keyword": {"type": "string", "description": "标题/描述关键词（可选）"},
            "limit": {"type": "integer", "description": "返回数量，默认10"}
        }
    }
)
async def list_testcases(project_id=None, priority=None, status=None, test_type=None, keyword=None, limit=10):
    from apps.testcases.models import TestCase
    qs = TestCase.objects.all().select_related('project', 'author')
    if project_id:
        qs = qs.filter(project_id=project_id)
    if priority:
        qs = qs.filter(priority=priority)
    if status:
        qs = qs.filter(status=status)
    if test_type:
        qs = qs.filter(test_type=test_type)
    if keyword:
        qs = qs.filter(Q(title__icontains=keyword) | Q(description__icontains=keyword))
    qs = qs.order_by('-updated_at')[:limit]

    data = []
    for tc in await sync_to_async(list)(qs):
        data.append({
            "id": tc.id,
            "title": tc.title,
            "priority": tc.priority,
            "status": tc.status,
            "test_type": tc.test_type,
            "project": tc.project.name if tc.project else None,
            "author": tc.author.username if tc.author else None,
            "created_at": tc.created_at.strftime('%Y-%m-%d %H:%M') if tc.created_at else None,
        })
    return {"total": len(data), "testcases": data}


@registry.register(
    name="get_testcase_detail",
    description="获取单个测试用例的详细信息，包括步骤和附件",
    parameters={
        "type": "object",
        "properties": {
            "testcase_id": {"type": "integer", "description": "测试用例ID"}
        },
        "required": ["testcase_id"]
    }
)
async def get_testcase_detail(testcase_id: int):
    from apps.testcases.models import TestCase
    try:
        tc = await sync_to_async(TestCase.objects.select_related('project', 'author').prefetch_related('step_details').get)(id=testcase_id)
    except TestCase.DoesNotExist:
        return {"error": f"测试用例 {testcase_id} 不存在"}
    steps = []
    for step in await sync_to_async(list)(tc.step_details.all().order_by('step_number')):
        steps.append({"step_number": step.step_number, "action": step.action, "expected": step.expected})
    return {
        "id": tc.id,
        "title": tc.title,
        "description": tc.description,
        "preconditions": tc.preconditions,
        "expected_result": tc.expected_result,
        "priority": tc.priority,
        "status": tc.status,
        "test_type": tc.test_type,
        "project": tc.project.name if tc.project else None,
        "steps": steps,
    }


@registry.register(
    name="create_testcase",
    description="创建新的测试用例",
    parameters={
        "type": "object",
        "properties": {
            "title": {"type": "string", "description": "用例标题"},
            "description": {"type": "string", "description": "用例描述"},
            "preconditions": {"type": "string", "description": "前置条件"},
            "steps": {"type": "string", "description": "操作步骤（支持换行）"},
            "expected_result": {"type": "string", "description": "预期结果"},
            "priority": {"type": "string", "description": "优先级：low/medium/high/critical，默认medium"},
            "test_type": {"type": "string", "description": "测试类型：functional/integration/api/ui/performance/security，默认functional"},
            "project_id": {"type": "integer", "description": "所属项目ID（可选，默认用户第一个可访问项目）"},
        },
        "required": ["title", "expected_result"]
    }
)
async def create_testcase(title, expected_result, description="", preconditions="", steps="",
                          priority="medium", test_type="functional", project_id=None):
    from apps.testcases.models import TestCase, TestCaseStep
    from apps.projects.models import Project
    from django.contrib.auth import get_user_model
    User = get_user_model()

    # Agent 执行时需要一个默认用户，这里使用系统第一个用户或特定 agent 用户
    user = await sync_to_async(User.objects.first)()
    if not user:
        return {"error": "系统中没有可用用户，无法创建用例"}

    project = None
    if project_id:
        try:
            project = await sync_to_async(Project.objects.get)(id=project_id)
        except Project.DoesNotExist:
            pass
    if not project:
        project = await sync_to_async(Project.objects.filter(Q(owner=user) | Q(members=user)).first)()
    if not project:
        project = await sync_to_async(Project.objects.create)(name="默认项目", owner=user, description="系统自动创建")

    tc = await sync_to_async(TestCase.objects.create)(
        title=title,
        description=description,
        preconditions=preconditions,
        steps=steps,
        expected_result=expected_result,
        priority=priority,
        status='draft',
        test_type=test_type,
        project=project,
        author=user,
    )

    # 解析步骤
    if steps:
        step_lines = [s.strip() for s in steps.split('\n') if s.strip()]
        for i, line in enumerate(step_lines, 1):
            await sync_to_async(TestCaseStep.objects.create)(
                testcase=tc, step_number=i, action=line, expected=""
            )

    return {"id": tc.id, "title": tc.title, "message": "测试用例创建成功"}


# ==================== 测试计划/执行工具 ====================

@registry.register(
    name="list_test_plans",
    description="查询测试计划列表",
    parameters={
        "type": "object",
        "properties": {
            "project_id": {"type": "integer", "description": "项目ID（可选）"},
            "limit": {"type": "integer", "description": "返回数量，默认10"}
        }
    }
)
async def list_test_plans(project_id=None, limit=10):
    from apps.executions.models import TestPlan
    qs = TestPlan.objects.all().select_related('version').prefetch_related('projects')
    if project_id:
        qs = qs.filter(projects__id=project_id)
    qs = qs.order_by('-created_at')[:limit]
    data = []
    for plan in await sync_to_async(list)(qs):
        project_names = [p.name for p in await sync_to_async(list)(plan.projects.all())]
        data.append({
            "id": plan.id,
            "name": plan.name,
            "description": plan.description,
            "projects": project_names,
            "version": plan.version.name if plan.version else None,
            "is_active": plan.is_active,
            "created_at": plan.created_at.strftime('%Y-%m-%d %H:%M') if plan.created_at else None,
        })
    return {"total": len(data), "test_plans": data}


@registry.register(
    name="create_test_plan",
    description="创建测试计划",
    parameters={
        "type": "object",
        "properties": {
            "name": {"type": "string", "description": "计划名称"},
            "description": {"type": "string", "description": "计划描述"},
            "project_ids": {"type": "array", "items": {"type": "integer"}, "description": "关联项目ID列表"},
            "testcase_ids": {"type": "array", "items": {"type": "integer"}, "description": "包含的用例ID列表（可选）"},
        },
        "required": ["name", "project_ids"]
    }
)
async def create_test_plan(name, project_ids, description="", testcase_ids=None):
    from apps.executions.models import TestPlan, TestRun, TestRunCase
    from apps.projects.models import Project
    from apps.testcases.models import TestCase
    from django.contrib.auth import get_user_model
    User = get_user_model()

    user = await sync_to_async(User.objects.first)()
    if not user:
        return {"error": "系统中没有可用用户"}

    plan = await sync_to_async(TestPlan.objects.create)(name=name, description=description, creator=user)
    projects = await sync_to_async(list)(Project.objects.filter(id__in=project_ids))
    await sync_to_async(plan.projects.set)(projects)

    # 为每个项目创建 TestRun
    for project in projects:
        test_run = await sync_to_async(TestRun.objects.create)(
            name=f"{plan.name} - {project.name} Execution",
            test_plan=plan, project=project, creator=user, assignee=user
        )
        if testcase_ids:
            tcs = await sync_to_async(list)(TestCase.objects.filter(id__in=testcase_ids))
            await sync_to_async(test_run.testcases.set)(tcs)
            for tc in tcs:
                await sync_to_async(TestRunCase.objects.get_or_create)(test_run=test_run, testcase=tc)

    return {"id": plan.id, "name": plan.name, "message": "测试计划及执行创建成功"}


@registry.register(
    name="list_test_runs",
    description="查询测试执行列表",
    parameters={
        "type": "object",
        "properties": {
            "project_id": {"type": "integer", "description": "项目ID（可选）"},
            "status": {"type": "string", "description": "状态：untested/in_progress/completed/blocked（可选）"},
            "limit": {"type": "integer", "description": "返回数量，默认10"}
        }
    }
)
async def list_test_runs(project_id=None, status=None, limit=10):
    from apps.executions.models import TestRun
    qs = TestRun.objects.all().select_related('project', 'test_plan')
    if project_id:
        qs = qs.filter(project_id=project_id)
    if status:
        qs = qs.filter(status=status)
    qs = qs.order_by('-created_at')[:limit]
    data = []
    for run in await sync_to_async(list)(qs):
        stats = run.progress_stats
        data.append({
            "id": run.id,
            "name": run.name,
            "status": run.status,
            "project": run.project.name if run.project else None,
            "test_plan": run.test_plan.name if run.test_plan else None,
            "progress": stats.get('progress', 0),
            "total": stats.get('total', 0),
            "passed": stats.get('passed', 0),
            "failed": stats.get('failed', 0),
            "created_at": run.created_at.strftime('%Y-%m-%d %H:%M') if run.created_at else None,
        })
    return {"total": len(data), "test_runs": data}


@registry.register(
    name="update_testrun_case_status",
    description="更新测试执行中单个用例的状态（模拟执行）",
    parameters={
        "type": "object",
        "properties": {
            "run_case_id": {"type": "integer", "description": "测试执行用例ID"},
            "status": {"type": "string", "description": "新状态：passed/failed/blocked/retest/untested"},
            "actual_result": {"type": "string", "description": "实际结果"},
            "comments": {"type": "string", "description": "备注"}
        },
        "required": ["run_case_id", "status"]
    }
)
async def update_testrun_case_status(run_case_id, status, actual_result="", comments=""):
    from apps.executions.models import TestRunCase, TestRunCaseHistory
    from django.contrib.auth import get_user_model
    User = get_user_model()

    user = await sync_to_async(User.objects.first)()
    try:
        run_case = await sync_to_async(TestRunCase.objects.select_related('test_run').get)(id=run_case_id)
    except TestRunCase.DoesNotExist:
        return {"error": f"执行用例 {run_case_id} 不存在"}

    await sync_to_async(TestRunCaseHistory.objects.create)(
        run_case=run_case, status=status, actual_result=actual_result,
        comments=comments, executed_by=user, executed_at=timezone.now()
    )
    run_case.status = status
    run_case.actual_result = actual_result
    run_case.comments = comments
    run_case.executed_by = user
    run_case.executed_at = timezone.now()
    await sync_to_async(run_case.save)()
    return {"message": f"用例状态已更新为 {status}", "run_case_id": run_case_id}


# ==================== 测试报告工具 ====================

@registry.register(
    name="list_reports",
    description="查询测试报告列表",
    parameters={
        "type": "object",
        "properties": {
            "project_id": {"type": "integer", "description": "项目ID（可选）"},
            "limit": {"type": "integer", "description": "返回数量，默认10"}
        }
    }
)
async def list_reports(project_id=None, limit=10):
    from apps.reports.models import TestReport
    qs = TestReport.objects.all().select_related('project', 'execution')
    if project_id:
        qs = qs.filter(project_id=project_id)
    qs = qs.order_by('-created_at')[:limit]
    data = []
    for r in await sync_to_async(list)(qs):
        data.append({
            "id": r.id,
            "name": r.name,
            "report_type": r.report_type,
            "project": r.project.name if r.project else None,
            "execution": r.execution.name if r.execution else None,
            "summary": r.summary,
            "created_at": r.created_at.strftime('%Y-%m-%d %H:%M') if r.created_at else None,
        })
    return {"total": len(data), "reports": data}


@registry.register(
    name="get_report_dashboard",
    description="获取测试报告仪表盘统计数据（概览）",
    parameters={
        "type": "object",
        "properties": {
            "project_id": {"type": "integer", "description": "项目ID（可选）"}
        }
    }
)
async def get_report_dashboard(project_id=None):
    from apps.executions.models import TestPlan, TestRun, TestRunCase
    from apps.testcases.models import TestCase

    plans_qs = TestPlan.objects.filter(is_active=True)
    cases_qs = TestCase.objects.all()
    if project_id:
        plans_qs = plans_qs.filter(projects__id=project_id)
        cases_qs = cases_qs.filter(project_id=project_id)

    total_plans = await sync_to_async(plans_qs.count)()
    total_cases = await sync_to_async(cases_qs.count)()

    recent_runs = await sync_to_async(list)(TestRun.objects.filter(test_plan__in=plans_qs).order_by('-created_at')[:10])
    total_executed = 0
    total_passed = 0
    for run in recent_runs:
        stats = run.progress_stats
        total_executed += stats.get('tested', 0)
        total_passed += stats.get('passed', 0)
    pass_rate = round((total_passed / total_executed * 100), 1) if total_executed > 0 else 0

    # 状态分布
    all_runs = await sync_to_async(list)(TestRun.objects.filter(test_plan__in=plans_qs))
    run_ids = [r.id for r in all_runs]
    status_counts = {}
    if run_ids:
        distribution = await sync_to_async(list)(
            TestRunCase.objects.filter(test_run_id__in=run_ids).values('status').annotate(count=Count('id'))
        )
        for item in distribution:
            status_counts[item['status']] = item['count']

    return {
        "active_plans": total_plans,
        "total_cases": total_cases,
        "pass_rate": pass_rate,
        "status_distribution": status_counts,
    }


# ==================== 接口测试工具 ====================

@registry.register(
    name="list_api_projects",
    description="查询接口测试项目列表",
    parameters={
        "type": "object",
        "properties": {
            "limit": {"type": "integer", "description": "返回数量，默认10"}
        }
    }
)
async def list_api_projects(limit=10):
    from apps.api_testing.models import ApiProject
    qs = await sync_to_async(list)(ApiProject.objects.all().select_related('owner').order_by('-created_at')[:limit])
    data = []
    for p in qs:
        data.append({
            "id": p.id,
            "name": p.name,
            "project_type": p.project_type,
            "status": p.status,
            "owner": p.owner.username if p.owner else None,
        })
    return {"total": len(data), "api_projects": data}


@registry.register(
    name="create_api_request",
    description="在接口测试项目中创建新的 API 请求",
    parameters={
        "type": "object",
        "properties": {
            "project_id": {"type": "integer", "description": "所属项目ID"},
            "collection_id": {"type": "integer", "description": "所属集合ID（可选）"},
            "name": {"type": "string", "description": "请求名称"},
            "method": {"type": "string", "description": "HTTP方法：GET/POST/PUT/DELETE/PATCH，默认GET"},
            "url": {"type": "string", "description": "请求URL"},
            "headers": {"type": "object", "description": "请求头对象（可选）"},
            "params": {"type": "object", "description": "URL参数对象（可选）"},
            "body": {"type": "object", "description": "请求体对象（可选）"},
        },
        "required": ["project_id", "name", "url"]
    }
)
async def create_api_request(project_id, name, url, method="GET", collection_id=None, headers=None, params=None, body=None):
    from apps.api_testing.models import ApiProject, ApiCollection, ApiRequest
    from django.contrib.auth import get_user_model
    User = get_user_model()

    user = await sync_to_async(User.objects.first)()
    if not user:
        return {"error": "系统中没有可用用户"}

    try:
        project = await sync_to_async(ApiProject.objects.get)(id=project_id)
    except ApiProject.DoesNotExist:
        return {"error": f"项目 {project_id} 不存在"}

    collection = None
    if collection_id:
        try:
            collection = await sync_to_async(ApiCollection.objects.get)(id=collection_id, project=project)
        except ApiCollection.DoesNotExist:
            pass

    req = await sync_to_async(ApiRequest.objects.create)(
        project=project, collection=collection, name=name, method=method, url=url,
        headers=headers or {}, params=params or {}, body=body or {},
        created_by=user
    )
    return {"id": req.id, "name": req.name, "message": "API请求创建成功"}


@registry.register(
    name="list_api_requests",
    description="查询 API 请求列表",
    parameters={
        "type": "object",
        "properties": {
            "project_id": {"type": "integer", "description": "项目ID（可选）"},
            "collection_id": {"type": "integer", "description": "集合ID（可选）"},
            "limit": {"type": "integer", "description": "返回数量，默认10"}
        }
    }
)
async def list_api_requests(project_id=None, collection_id=None, limit=10):
    from apps.api_testing.models import ApiRequest
    qs = ApiRequest.objects.all().select_related('project', 'collection')
    if project_id:
        qs = qs.filter(project_id=project_id)
    if collection_id:
        qs = qs.filter(collection_id=collection_id)
    qs = qs.order_by('-created_at')[:limit]
    data = []
    for req in await sync_to_async(list)(qs):
        data.append({
            "id": req.id,
            "name": req.name,
            "method": req.method,
            "url": req.url,
            "project": req.project.name if req.project else None,
            "collection": req.collection.name if req.collection else None,
        })
    return {"total": len(data), "api_requests": data}
