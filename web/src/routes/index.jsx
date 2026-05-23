import { createBrowserRouter, Navigate } from 'react-router-dom';
import React from 'react';
import Layout from '../components/Layout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
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
import { Typography, Card, Empty, Space, Button } from 'antd';
import TestDataGenerator from '../pages/test-tools/TestDataGenerator';
import EncoderDecoder from '../pages/test-tools/EncoderDecoder';
import RegexTester from '../pages/test-tools/RegexTester';
import FormatConverter from '../pages/test-tools/FormatConverter';
import TimestampConverter from '../pages/test-tools/TimestampConverter';
import SignatureGenerator from '../pages/test-tools/SignatureGenerator';
import CookieParser from '../pages/test-tools/CookieParser';
import MockGenerator from '../pages/test-tools/MockGenerator';
import DiffCompare from '../pages/test-tools/DiffCompare';
import CronExpression from '../pages/test-tools/CronExpression';
import QRCodeGenerator from '../pages/test-tools/QRCodeGenerator';
import ColorConverter from '../pages/test-tools/ColorConverter';
import HttpStatusCode from '../pages/test-tools/HttpStatusCode';
import StringProcessor from '../pages/test-tools/StringProcessor';
import FileSizeCalculator from '../pages/test-tools/FileSizeCalculator';

import RandomGenerator from '../pages/test-tools/RandomGenerator';
import IPAddressTool from '../pages/test-tools/IPAddressTool';
import JWTTool from '../pages/test-tools/JWTTool';
import AgentChat from '../pages/agent/AgentChat';
import { useSelector } from 'react-redux';

// 认证保护组件
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.user);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

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
    element: <Navigate to="/test-tools/data-generator" replace />
  },
  {
    path: '/home',
    element: <Navigate to="/test-tools/data-generator" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
      path: '/ai-generation',
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <ProtectedRoute><AIGenerationDashboard /></ProtectedRoute> },
        { path: 'requirement-analysis', element: <ProtectedRoute><RequirementAnalysisView /></ProtectedRoute> },
        { path: 'projects', element: <ProtectedRoute><Projects /></ProtectedRoute> },
        { path: 'testcases', element: <ProtectedRoute><TestCaseList /></ProtectedRoute> },
        { path: 'testcases/create', element: <ProtectedRoute><TestCaseForm /></ProtectedRoute> },
        { path: 'testcases/:id', element: <ProtectedRoute><TestCaseForm /></ProtectedRoute> },
        { path: 'testcases/:id/edit', element: <ProtectedRoute><TestCaseForm /></ProtectedRoute> },
        { path: 'versions', element: <ProtectedRoute><Versions /></ProtectedRoute> },
        { path: 'reviews', element: <ProtectedRoute><Reviews /></ProtectedRoute> },
        { path: 'review-templates', element: <ProtectedRoute><ReviewTemplates /></ProtectedRoute> },
        { path: 'executions', element: <ProtectedRoute><Executions /></ProtectedRoute> },
        { path: 'reports', element: <ProtectedRoute><Reports /></ProtectedRoute> },
        { path: 'generated-testcases', element: <ProtectedRoute><GeneratedTestCases /></ProtectedRoute> },
        { path: 'writer-config', element: <ProtectedRoute><WriterConfig /></ProtectedRoute> },
        { path: 'reviewer-config', element: <ProtectedRoute><ReviewerConfig /></ProtectedRoute> }
      ]
    },
  {
    path: '/api-testing',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: 'projects', element: <ProtectedRoute><ProjectManagement /></ProtectedRoute> },
      { path: 'interfaces', element: <ProtectedRoute><InterfaceManagement /></ProtectedRoute> },
      { path: 'automation', element: <ProtectedRoute><AutomationTesting /></ProtectedRoute> },
      { path: 'history', element: <ProtectedRoute><RequestHistory /></ProtectedRoute> },
      { path: 'environments', element: <ProtectedRoute><EnvironmentManagement /></ProtectedRoute> },
      { path: 'reports', element: <ProtectedRoute><ReportView /></ProtectedRoute> },
      { path: 'scheduled-tasks', element: <ProtectedRoute><ScheduledTasks /></ProtectedRoute> },
      { path: 'ai-service-config', element: <ProtectedRoute><AIServiceConfig /></ProtectedRoute> },
      { path: 'notification-logs', element: <ProtectedRoute><SimplePage title="通知日志" description="通知日志记录" /></ProtectedRoute> }
    ]
  },
  {
    path: '/ui-automation',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <ProtectedRoute><SimplePage title="Dashboard" description="UI 自动化概览" /></ProtectedRoute> },
      { path: 'projects', element: <ProtectedRoute><SimplePage title="项目管理" description="UI 测试项目" /></ProtectedRoute> },
      { path: 'elements-enhanced', element: <ProtectedRoute><SimplePage title="元素管理" description="UI 元素管理" /></ProtectedRoute> },
      { path: 'test-cases', element: <ProtectedRoute><SimplePage title="测试用例" description="UI 测试用例" /></ProtectedRoute> },
      { path: 'scripts-enhanced', element: <ProtectedRoute><SimplePage title="脚本生成" description="自动化脚本生成" /></ProtectedRoute> },
      { path: 'scripts', element: <ProtectedRoute><SimplePage title="脚本列表" description="测试脚本管理" /></ProtectedRoute> },
      { path: 'suites', element: <ProtectedRoute><SimplePage title="套件管理" description="测试套件管理" /></ProtectedRoute> },
      { path: 'executions', element: <ProtectedRoute><SimplePage title="执行记录" description="执行历史记录" /></ProtectedRoute> },
      { path: 'reports', element: <ProtectedRoute><SimplePage title="测试报告" description="UI 测试报告" /></ProtectedRoute> },
      { path: 'scheduled-tasks', element: <ProtectedRoute><SimplePage title="定时任务" description="定时任务管理" /></ProtectedRoute> },
      { path: 'notification-logs', element: <ProtectedRoute><SimplePage title="通知日志" description="通知日志记录" /></ProtectedRoute> }
    ]
  },
  {
    path: '/app-automation',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <ProtectedRoute><SimplePage title="Dashboard" description="APP 自动化概览" /></ProtectedRoute> },
      { path: 'projects', element: <ProtectedRoute><SimplePage title="项目管理" description="APP 测试项目" /></ProtectedRoute> },
      { path: 'devices', element: <ProtectedRoute><SimplePage title="设备管理" description="测试设备管理" /></ProtectedRoute> },
      { path: 'packages', element: <ProtectedRoute><SimplePage title="包名管理" description="应用包管理" /></ProtectedRoute> },
      { path: 'elements', element: <ProtectedRoute><SimplePage title="元素管理" description="APP 元素管理" /></ProtectedRoute> },
      { path: 'scene-builder', element: <ProtectedRoute><SimplePage title="用例编排" description="测试场景编排" /></ProtectedRoute> },
      { path: 'test-cases', element: <ProtectedRoute><SimplePage title="测试用例" description="APP 测试用例" /></ProtectedRoute> },
      { path: 'test-suites', element: <ProtectedRoute><SimplePage title="测试套件" description="测试套件管理" /></ProtectedRoute> },
      { path: 'scheduled-tasks', element: <ProtectedRoute><SimplePage title="定时任务" description="定时任务管理" /></ProtectedRoute> },
      { path: 'notification-logs', element: <ProtectedRoute><SimplePage title="通知日志" description="通知日志记录" /></ProtectedRoute> },
      { path: 'executions', element: <ProtectedRoute><SimplePage title="执行记录" description="执行历史记录" /></ProtectedRoute> },
      { path: 'reports', element: <ProtectedRoute><SimplePage title="测试报告" description="APP 测试报告" /></ProtectedRoute> }
    ]
  },
  {
    path: '/ai-intelligent-mode',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="testing" replace /> },
      { path: 'testing', element: <ProtectedRoute><SimplePage title="AI 智能测试" description="AI 智能测试模式" /></ProtectedRoute> },
      { path: 'cases', element: <ProtectedRoute><SimplePage title="AI 用例管理" description="AI 生成用例管理" /></ProtectedRoute> },
      { path: 'execution-records', element: <ProtectedRoute><SimplePage title="AI 执行记录" description="AI 执行历史记录" /></ProtectedRoute> }
    ]
  },
  {
      path: '/agent',
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="chat" replace /> },
        { path: 'chat', element: <ProtectedRoute><AgentChat /></ProtectedRoute> }
      ]
    },
  {
      path: '/configuration',
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="ai-model" replace /> },
        { path: 'ui-env', element: <ProtectedRoute><SimplePage title="UI 环境配置" description="UI 自动化环境" /></ProtectedRoute> },
        { path: 'app-env', element: <ProtectedRoute><SimplePage title="APP 环境配置" description="APP 自动化环境" /></ProtectedRoute> },
        { path: 'ai-model', element: <ProtectedRoute><AIModelConfig /></ProtectedRoute> },
        { path: 'scheduled-task', element: <ProtectedRoute><SimplePage title="定时任务配置" description="定时任务配置" /></ProtectedRoute> },
        { path: 'coze', element: <ProtectedRoute><SimplePage title="Coze 配置" description="Coze 集成配置" /></ProtectedRoute> }
      ]
    },
  {
    path: '/test-tools',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="data-generator" replace /> },
      { path: 'data-generator', element: <TempRoute><TestDataGenerator /></TempRoute> },
      { path: 'encoder-decoder', element: <TempRoute><EncoderDecoder /></TempRoute> },
      { path: 'regex-tester', element: <TempRoute><RegexTester /></TempRoute> },
      { path: 'format-converter', element: <TempRoute><FormatConverter /></TempRoute> },
      { path: 'timestamp-converter', element: <TempRoute><TimestampConverter /></TempRoute> },
      { path: 'signature-generator', element: <TempRoute><SignatureGenerator /></TempRoute> },
      { path: 'cookie-parser', element: <TempRoute><CookieParser /></TempRoute> },
      { path: 'mock-generator', element: <TempRoute><MockGenerator /></TempRoute> },
      { path: 'diff-compare', element: <TempRoute><DiffCompare /></TempRoute> },
      { path: 'cron-expression', element: <TempRoute><CronExpression /></TempRoute> },
      { path: 'qrcode-generator', element: <TempRoute><QRCodeGenerator /></TempRoute> },
      { path: 'color-converter', element: <TempRoute><ColorConverter /></TempRoute> },
      { path: 'http-status-code', element: <TempRoute><HttpStatusCode /></TempRoute> },
      { path: 'string-processor', element: <TempRoute><StringProcessor /></TempRoute> },
      { path: 'file-size-calculator', element: <TempRoute><FileSizeCalculator /></TempRoute> },

      { path: 'random-generator', element: <TempRoute><RandomGenerator /></TempRoute> },
      { path: 'ip-address-tool', element: <TempRoute><IPAddressTool /></TempRoute> },
      { path: 'jwt-tool', element: <TempRoute><JWTTool /></TempRoute> }
    ]
  }
]);

export default router;
