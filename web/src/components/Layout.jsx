import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Dropdown, Avatar, Button } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from '../locales';
import { setLanguage } from '../store/appSlice';
import { logout } from '../store/userSlice';
import {
  ApiOutlined,
  RobotOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  FolderOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  BellOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  FileProtectOutlined,
  SafetyOutlined,
  BranchesOutlined,
  ScheduleOutlined,
  AppstoreOutlined,
  GlobalOutlined,
  CodeOutlined,
  ApiFilled,
  ThunderboltFilled,
  ToolOutlined,
  SwapOutlined,
  CalculatorOutlined,
  BarcodeOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  GithubOutlined,
  QrcodeOutlined,
  BgColorsOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const LayoutComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { user } = useSelector(state => state.user);
  const { language } = useSelector(state => state.app);
  const [currentModule, setCurrentModule] = useState('');

  const topMenuItems = [
    { key: '/api-testing', label: '接口自动化测试', icon: <ApiOutlined /> },
    { key: '/ai-generation', label: 'AI 用例生成', icon: <RobotOutlined /> },
    { key: '/agent', label: 'Agent', icon: <ThunderboltOutlined /> },
    { key: '/test-tools', label: '测试工具', icon: <ToolOutlined /> },
    { key: '/configuration', label: '设置', icon: <SettingOutlined /> }
  ];

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/api-testing')) setCurrentModule('api-testing');
    else if (path.startsWith('/ai-generation')) setCurrentModule('ai-generation');
    else if (path.startsWith('/agent')) setCurrentModule('agent');
    else if (path.startsWith('/ui-automation')) setCurrentModule('ui-automation');
    else if (path.startsWith('/app-automation')) setCurrentModule('app-automation');
    else if (path.startsWith('/ai-intelligent-mode')) setCurrentModule('ai-intelligent-mode');
    else if (path.startsWith('/configuration')) setCurrentModule('configuration');
    else if (path.startsWith('/test-tools')) setCurrentModule('test-tools');
    else setCurrentModule('');
  }, [location.pathname]);

  const handleLanguageChange = (lang) => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenu = {
    items: [
      { key: 'profile', label: t('nav.profile'), icon: <UserOutlined /> },
      { key: 'logout', label: t('nav.logout'), icon: <LogoutOutlined /> }
    ],
    onClick: ({ key }) => {
      if (key === 'logout') handleLogout();
    }
  };

  const langMenu = {
    items: [
      { key: 'zh-cn', label: '🇨🇳 简体中文', disabled: language === 'zh-cn' },
      { key: 'en', label: '🇺🇸 English', disabled: language === 'en' }
    ],
    onClick: ({ key }) => handleLanguageChange(key)
  };

  const getModuleName = () => {
    const map = {
      'ai-generation': t('modules.aiGeneration'),
      'api-testing': '接口自动化测试',
      'agent': '',
      'ui-automation': t('modules.uiAutomation'),
      'app-automation': 'APP自动化测试',
      'ai-intelligent-mode': t('modules.aiIntelligentMode'),
      'configuration': '设置',
      'test-tools': t('modules.testTools')
    };
    return map[currentModule] || '';
  };

  const getSideMenuItems = () => {
    if (currentModule === 'ai-generation') {
      return [
        { key: '/ai-generation/dashboard', label: t('menu.dashboard'), icon: <DashboardOutlined /> },
        {
          key: 'requirement',
          label: t('menu.intelligentCaseGeneration'),
          icon: <ThunderboltOutlined />,
          children: [
            { key: '/ai-generation/requirement-analysis', label: t('menu.aiCaseGeneration'), icon: <FileSearchOutlined /> },
            { key: '/ai-generation/generated-testcases', label: t('menu.aiGeneratedTestcases'), icon: <FileTextOutlined /> }
          ]
        },
        { key: '/ai-generation/projects', label: t('menu.projectManagement'), icon: <FolderOutlined /> },
        { key: '/ai-generation/testcases', label: t('menu.testCases'), icon: <FileProtectOutlined /> },
        { key: '/ai-generation/versions', label: t('menu.versionManagement'), icon: <BranchesOutlined /> },
        {
          key: 'reviews',
          label: t('menu.reviewManagement'),
          icon: <SafetyOutlined />,
          children: [
            { key: '/ai-generation/reviews', label: t('menu.reviewList'), icon: <FileTextOutlined /> },
            { key: '/ai-generation/review-templates', label: t('menu.reviewTemplates'), icon: <AppstoreOutlined /> }
          ]
        },
        { key: '/ai-generation/executions', label: t('menu.testPlan'), icon: <PlayCircleOutlined /> },
        { key: '/ai-generation/reports', label: t('menu.testReport'), icon: <BarChartOutlined /> },
        {
          key: 'config',
          label: t('menu.aiCaseGenerationConfig'),
          icon: <SettingOutlined />,
          children: [
            { key: '/ai-generation/writer-config', label: 'AI用例编写配置', icon: <FileTextOutlined /> },
            { key: '/ai-generation/reviewer-config', label: 'AI用例评审配置', icon: <SafetyOutlined /> }
          ]
        }
      ];
    }
    if (currentModule === 'api-testing') {
      return [
        { key: '/api-testing/dashboard', label: t('menu.dashboard'), icon: <DashboardOutlined /> },
        { key: '/api-testing/projects', label: t('menu.projectManagement'), icon: <FolderOutlined /> },
        { key: '/api-testing/interfaces', label: t('menu.interfaceManagement'), icon: <LinkOutlined /> },
        { key: '/api-testing/automation', label: t('menu.automationTesting'), icon: <PlayCircleOutlined /> },
        { key: '/api-testing/history', label: t('menu.requestHistory'), icon: <HistoryOutlined /> },
        { key: '/api-testing/environments', label: t('menu.environmentManagement'), icon: <SettingOutlined /> },
        { key: '/api-testing/reports', label: t('menu.testReport'), icon: <BarChartOutlined /> },
        { key: '/api-testing/scheduled-tasks', label: t('menu.scheduledTasks'), icon: <ClockCircleOutlined /> },
        { key: '/api-testing/notification-logs', label: t('menu.notificationList'), icon: <BellOutlined /> }
      ];
    }
    if (currentModule === 'ui-automation') {
      return [
        { key: '/ui-automation/dashboard', label: t('menu.dashboard'), icon: <DashboardOutlined /> },
        { key: '/ui-automation/projects', label: t('menu.projectManagement'), icon: <FolderOutlined /> },
        { key: '/ui-automation/elements-enhanced', label: t('menu.elementManagement'), icon: <AppstoreOutlined /> },
        { key: '/ui-automation/test-cases', label: t('menu.caseManagement'), icon: <FileProtectOutlined /> },
        { key: '/ui-automation/scripts-enhanced', label: t('menu.scriptGeneration'), icon: <CodeOutlined /> },
        { key: '/ui-automation/scripts', label: t('menu.scriptList'), icon: <FileTextOutlined /> },
        { key: '/ui-automation/suites', label: t('menu.suiteManagement'), icon: <AppstoreOutlined /> },
        { key: '/ui-automation/executions', label: t('menu.executionRecords'), icon: <PlayCircleOutlined /> },
        { key: '/ui-automation/reports', label: t('menu.testReport'), icon: <BarChartOutlined /> },
        { key: '/ui-automation/scheduled-tasks', label: t('menu.scheduledTasks'), icon: <ClockCircleOutlined /> },
        { key: '/ui-automation/notification-logs', label: t('menu.notificationList'), icon: <BellOutlined /> }
      ];
    }
    if (currentModule === 'app-automation') {
      return [
        { key: '/app-automation/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
        { key: '/app-automation/projects', label: '项目管理', icon: <FolderOutlined /> },
        { key: '/app-automation/devices', label: '设备管理', icon: <GlobalOutlined /> },
        { key: '/app-automation/packages', label: '包名管理', icon: <AppstoreOutlined /> },
        { key: '/app-automation/elements', label: '元素管理', icon: <ApiOutlined /> },
        { key: '/app-automation/scene-builder', label: '用例编排', icon: <BranchesOutlined /> },
        { key: '/app-automation/test-cases', label: '测试用例', icon: <FileProtectOutlined /> },
        { key: '/app-automation/test-suites', label: '测试套件', icon: <AppstoreOutlined /> },
        { key: '/app-automation/scheduled-tasks', label: '定时任务', icon: <ClockCircleOutlined /> },
        { key: '/app-automation/notification-logs', label: '通知列表', icon: <BellOutlined /> },
        { key: '/app-automation/executions', label: '执行记录', icon: <PlayCircleOutlined /> },
        { key: '/app-automation/reports', label: '测试报告', icon: <BarChartOutlined /> }
      ];
    }
    if (currentModule === 'ai-intelligent-mode') {
      return [
        { key: '/ai-intelligent-mode/testing', label: t('menu.aiIntelligentTesting'), icon: <ThunderboltOutlined /> },
        { key: '/ai-intelligent-mode/cases', label: t('menu.aiCaseManagement'), icon: <FileProtectOutlined /> },
        { key: '/ai-intelligent-mode/execution-records', label: t('menu.aiExecutionRecords'), icon: <HistoryOutlined /> }
      ];
    }
    if (currentModule === 'agent') {
      return [];
    }
    if (currentModule === 'configuration') {
      return [
        { key: '/configuration/ai-model', label: t('menu.aiModelConfig'), icon: <RobotOutlined /> },
        { key: '/configuration/ui-env', label: t('menu.uiEnvConfig'), icon: <GlobalOutlined /> },
        { key: '/configuration/app-env', label: 'APP环境配置', icon: <AppstoreOutlined /> },
        { key: '/configuration/scheduled-task', label: t('menu.scheduledTaskConfig'), icon: <ScheduleOutlined /> },
        { key: '/configuration/coze', label: t('menu.cozeConfig'), icon: <ApiOutlined /> }
      ];
    }
    if (currentModule === 'test-tools') {
      return [
        {
          key: 'general-tools',
          label: t('menu.generalTools'),
          icon: <ToolOutlined />,
          children: [
            { key: '/test-tools/data-generator', label: t('menu.testDataGenerator'), icon: <DatabaseOutlined /> },
            { key: '/test-tools/encoder-decoder', label: t('menu.encoderDecoder'), icon: <SwapOutlined /> },
            { key: '/test-tools/regex-tester', label: t('menu.regexTester'), icon: <CodeOutlined /> },
            { key: '/test-tools/format-converter', label: t('menu.formatConverter'), icon: <BarcodeOutlined /> },
            { key: '/test-tools/timestamp-converter', label: t('menu.timestampConverter'), icon: <ClockCircleOutlined /> },
            { key: '/test-tools/string-processor', label: '字符串处理工具', icon: <CodeOutlined /> },
            { key: '/test-tools/random-generator', label: '随机数生成器', icon: <ThunderboltOutlined /> },
            { key: '/test-tools/file-size-calculator', label: '文件大小计算器', icon: <CalculatorOutlined /> },
            { key: '/test-tools/diff-compare', label: '文本/JSON对比工具', icon: <SwapOutlined /> }
          ]
        },
        {
          key: 'api-tools',
          label: t('menu.apiTools'),
          icon: <ApiOutlined />,
          children: [
            { key: '/test-tools/signature-generator', label: t('menu.signatureGenerator'), icon: <SafetyCertificateOutlined /> },
            { key: '/test-tools/cookie-parser', label: t('menu.cookieParser'), icon: <FileTextOutlined /> },
            { key: '/test-tools/mock-generator', label: t('menu.mockGenerator'), icon: <ThunderboltOutlined /> },
            { key: '/test-tools/http-status-code', label: 'HTTP状态码查询', icon: <SafetyOutlined /> },
            { key: '/test-tools/cron-expression', label: 'Cron表达式生成', icon: <ScheduleOutlined /> },
            { key: '/test-tools/ip-address-tool', label: 'IP地址工具', icon: <GlobalOutlined /> },
            { key: '/test-tools/jwt-tool', label: 'JWT 解析工具', icon: <SafetyCertificateOutlined /> }
          ]
        },
        {
          key: 'design-tools',
          label: '设计工具',
          icon: <AppstoreOutlined />,
          children: [
            { key: '/test-tools/qrcode-generator', label: '二维码生成器', icon: <QrcodeOutlined /> },
            { key: '/test-tools/color-converter', label: '颜色转换工具', icon: <BgColorsOutlined /> }
          ]
        }
      ];
    }
    return [];
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Header style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            onClick={() => navigate('/home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: '48px',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              background: '#1677ff',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              marginRight: 12
            }}>
              测
            </div>
            <span style={{ fontSize: 20, fontWeight: 600, color: '#1f2937' }}>
              自动化测试平台
            </span>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[`/${currentModule}`]}
            items={topMenuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              border: 'none',
              lineHeight: '62px',
              minWidth: 600
            }}
            theme="light"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Dropdown menu={userMenu} trigger={['click']}>
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar size={32} icon={<UserOutlined />} src={user?.avatar} />
              <span style={{ color: '#374151' }}>{user?.username}</span>
            </Button>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        {currentModule !== 'agent' && (
          <Sider
            width={260}
            style={{
              background: '#fff',
              borderRight: '1px solid #e5e7eb',
              height: 'calc(100vh - 64px)',
              position: 'sticky',
              top: 64,
              overflowY: 'auto'
            }}
          >
            {getModuleName() && (
              <div style={{ padding: '24px 16px 12px' }}>
                <Text style={{ fontSize: 16, fontWeight: 600, color: '#6b7280' }}>
                  {getModuleName()}
                </Text>
              </div>
            )}
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={getSideMenuItems()}
              onClick={({ key }) => {
                if (key.startsWith('/')) navigate(key);
              }}
              style={{ border: 'none', padding: '0 8px' }}
              theme="light"
            />
            <div style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              width: 'calc(100% - 40px)',
            }}>
              <a
                href="https://github.com/peter123023/QAgent"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#6b7280',
                  fontSize: 14,
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: 6,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.color = '#1677ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <GithubOutlined />
                <span>GitHub</span>
              </a>
            </div>
          </Sider>
        )}
        <Content style={{ padding: currentModule === 'agent' ? 0 : '16px 48px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;
