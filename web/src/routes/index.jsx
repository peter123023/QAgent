import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/auth/Login';
import Home from '../pages/Home';
import RequirementAnalysisView from '../pages/ai-generation/RequirementAnalysisView';
import TestCaseList from '../pages/testcases/TestCaseList';
import TestCaseForm from '../pages/testcases/TestCaseForm';
import Dashboard from '../pages/api-testing/Dashboard';
import AIGenerationDashboard from '../pages/ai-generation/Dashboard';
import AIModelConfig from '../pages/ai-generation/AIModelConfig';
import WriterConfig from '../pages/ai-generation/WriterConfig';
import ReviewerConfig from '../pages/ai-generation/ReviewerConfig';
import ProjectManagement from '../pages/api-testing/ProjectManagement';
import InterfaceManagement from '../pages/api-testing/InterfaceManagement';
import AutomationTesting from '../pages/api-testing/AutomationTesting';
import RequestHistory from '../pages/api-testing/RequestHistory';
import EnvironmentManagement from '../pages/api-testing/EnvironmentManagement';
import ReportView from '../pages/api-testing/ReportView';
import ScheduledTasks from '../pages/api-testing/ScheduledTasks';
import AIServiceConfig from '../pages/api-testing/AIServiceConfig';
import GeneratedTestCases from '../pages/ai-generation/GeneratedTestCases';
import Projects from '../pages/ai-generation/Projects';
import Versions from '../pages/ai-generation/Versions';
import Reviews from '../pages/ai-generation/Reviews';
import ReviewTemplates from '../pages/ai-generation/ReviewTemplates';
import Executions from '../pages/ai-generation/Executions';
import Reports from '../pages/ai-generation/Reports';
import React from 'react';
import { Typography, Card, Empty, Space, Button } from 'antd';

const { Title, Text } = Typography;

const SimplePage = ({ title, description }) => {
  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>{title}</Title>
        {description && <Text type="secondary">{description}</Text>}
        <Empty style={{ marginTop: '40px' }} description="此页面功能正在开发中..." />
      </Card>
    </div>
  );
};

// 临时移除认证保护的包装组件
const TempRoute = ({ children }) => children;

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/api-testing/dashboard" replace />
  },
  {
    path: '/home',
    element: <Navigate to="/api-testing/dashboard" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
      path: '/ai-generation',
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <AIGenerationDashboard /> },
        { path: 'requirement-analysis', element: <RequirementAnalysisView /> },
        { path: 'projects', element: <Projects /> },
        { path: 'testcases', element: <TestCaseList /> },
        { path: 'testcases/create', element: <TestCaseForm /> },
        { path: 'testcases/:id', element: <TestCaseForm /> },
        { path: 'testcases/:id/edit', element: <TestCaseForm /> },
        { path: 'versions', element: <Versions /> },
        { path: 'reviews', element: <Reviews /> },
        { path: 'review-templates', element: <ReviewTemplates /> },
        { path: 'executions', element: <Executions /> },
        { path: 'reports', element: <Reports /> },
        { path: 'generated-testcases', element: <GeneratedTestCases /> },
        { path: 'writer-config', element: <WriterConfig /> },
        { path: 'reviewer-config', element: <ReviewerConfig /> }
      ]
    },
  {
    path: '/api-testing',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'projects', element: <ProjectManagement /> },
      { path: 'interfaces', element: <InterfaceManagement /> },
      { path: 'automation', element: <AutomationTesting /> },
      { path: 'history', element: <RequestHistory /> },
      { path: 'environments', element: <EnvironmentManagement /> },
      { path: 'reports', element: <ReportView /> },
      { path: 'scheduled-tasks', element: <ScheduledTasks /> },
      { path: 'ai-service-config', element: <AIServiceConfig /> },
      { path: 'notification-logs', element: <SimplePage title="通知日志" description="通知日志记录" /> }
    ]
  },
  {
    path: '/ui-automation',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <SimplePage title="Dashboard" description="UI 自动化概览" /> },
      { path: 'projects', element: <SimplePage title="项目管理" description="UI 测试项目" /> },
      { path: 'elements-enhanced', element: <SimplePage title="元素管理" description="UI 元素管理" /> },
      { path: 'test-cases', element: <SimplePage title="测试用例" description="UI 测试用例" /> },
      { path: 'scripts-enhanced', element: <SimplePage title="脚本生成" description="自动化脚本生成" /> },
      { path: 'scripts', element: <SimplePage title="脚本列表" description="测试脚本管理" /> },
      { path: 'suites', element: <SimplePage title="套件管理" description="测试套件管理" /> },
      { path: 'executions', element: <SimplePage title="执行记录" description="执行历史记录" /> },
      { path: 'reports', element: <SimplePage title="测试报告" description="UI 测试报告" /> },
      { path: 'scheduled-tasks', element: <SimplePage title="定时任务" description="定时任务管理" /> },
      { path: 'notification-logs', element: <SimplePage title="通知日志" description="通知日志记录" /> }
    ]
  },
  {
    path: '/app-automation',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <SimplePage title="Dashboard" description="APP 自动化概览" /> },
      { path: 'projects', element: <SimplePage title="项目管理" description="APP 测试项目" /> },
      { path: 'devices', element: <SimplePage title="设备管理" description="测试设备管理" /> },
      { path: 'packages', element: <SimplePage title="包名管理" description="应用包管理" /> },
      { path: 'elements', element: <SimplePage title="元素管理" description="APP 元素管理" /> },
      { path: 'scene-builder', element: <SimplePage title="用例编排" description="测试场景编排" /> },
      { path: 'test-cases', element: <SimplePage title="测试用例" description="APP 测试用例" /> },
      { path: 'test-suites', element: <SimplePage title="测试套件" description="测试套件管理" /> },
      { path: 'scheduled-tasks', element: <SimplePage title="定时任务" description="定时任务管理" /> },
      { path: 'notification-logs', element: <SimplePage title="通知日志" description="通知日志记录" /> },
      { path: 'executions', element: <SimplePage title="执行记录" description="执行历史记录" /> },
      { path: 'reports', element: <SimplePage title="测试报告" description="APP 测试报告" /> }
    ]
  },
  {
    path: '/ai-intelligent-mode',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="testing" replace /> },
      { path: 'testing', element: <SimplePage title="AI 智能测试" description="AI 智能测试模式" /> },
      { path: 'cases', element: <SimplePage title="AI 用例管理" description="AI 生成用例管理" /> },
      { path: 'execution-records', element: <SimplePage title="AI 执行记录" description="AI 执行历史记录" /> }
    ]
  },
  {
      path: '/configuration',
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="ui-env" replace /> },
        { path: 'ui-env', element: <SimplePage title="UI 环境配置" description="UI 自动化环境" /> },
        { path: 'app-env', element: <SimplePage title="APP 环境配置" description="APP 自动化环境" /> },
        { path: 'ai-model', element: <AIModelConfig /> },
        { path: 'scheduled-task', element: <SimplePage title="定时任务配置" description="定时任务配置" /> },
        { path: 'coze', element: <SimplePage title="Coze 配置" description="Coze 集成配置" /> }
      ]
    }
]);

export default router;
