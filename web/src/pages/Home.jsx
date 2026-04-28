import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu, Typography, Card, Dropdown, Avatar, Button } from 'antd';
import { logout } from '../store/userSlice';
import { setLanguage } from '../store/appSlice';
import { useTranslation } from '../locales';
import {
  ApiOutlined,
  RobotOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { language } = useSelector(state => state.app);
  const { t, i18n } = useTranslation();

  const topMenuItems = [
    {
      key: '/api-testing',
      label: '接口自动化测试',
      icon: <ApiOutlined />
    },
    {
      key: '/ai-generation',
      label: 'AI 用例生成',
      icon: <RobotOutlined />
    },
    {
      key: '/configuration',
      label: '设置',
      icon: <SettingOutlined />
    }
  ];

  const sideMenuItems = [
    { key: '/api-testing/dashboard', label: t('menu.dashboard') },
    { key: '/api-testing/projects', label: t('menu.projectManagement') },
    { key: '/api-testing/interfaces', label: t('menu.interfaceManagement') },
    { key: '/api-testing/automation', label: t('menu.automationTesting') },
    { key: '/api-testing/history', label: t('menu.requestHistory') },
    { key: '/api-testing/environments', label: t('menu.environmentManagement') },
    { key: '/api-testing/reports', label: t('menu.testReport') },
    { key: '/api-testing/scheduled-tasks', label: t('menu.scheduledTasks') },
    { key: '/api-testing/notification-logs', label: t('menu.notificationList') }
  ];

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
            selectedKeys={['/api-testing']}
            items={topMenuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              border: 'none',
              lineHeight: '62px',
              minWidth: 400
            }}
            theme="light"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Dropdown menu={langMenu} trigger={['click']}>
            <Button type="text">
              {language === 'zh-cn' ? '🇨🇳 简体中文' : '🇺🇸 English'}
            </Button>
          </Dropdown>
          <Dropdown menu={userMenu} trigger={['click']}>
            <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar size={32} icon={<UserOutlined />} src={user?.avatar} />
              <span style={{ color: '#374151' }}>{user?.username || '用户'}</span>
            </Button>
          </Dropdown>
        </div>
      </Header>

      <Layout>
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
          <div style={{ padding: '24px 16px 12px' }}>
            <Text style={{ fontSize: 16, fontWeight: 600, color: '#6b7280' }}>
              接口自动化测试
            </Text>
          </div>
          <Menu
            mode="inline"
            selectedKeys={['/api-testing/dashboard']}
            items={sideMenuItems}
            onClick={({ key }) => navigate(key)}
            style={{ border: 'none', padding: '0 8px' }}
            theme="light"
          />
        </Sider>

        <Content style={{ padding: '40px 48px' }}>
          <div style={{ marginBottom: '32px' }}>
            <Title level={1} style={{ fontSize: 32, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              测试执行
            </Title>
            <Paragraph style={{ fontSize: 18, color: '#4b5563', margin: 0 }}>
              运行测试用例，查看实时执行结果
            </Paragraph>
          </div>

          <Card
            style={{
              borderRadius: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            styles={{ body: { padding: 80 } }}
          >
            <div style={{ textAlign: 'center' }}>
              <Paragraph style={{ fontSize: 20, color: '#6b7280', fontWeight: 500 }}>
                选择测试用例开始执行
              </Paragraph>
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
