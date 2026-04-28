import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spin, Typography } from 'antd';
import {
  FolderOutlined,
  LinkOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  SettingOutlined,
  BarChartOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { getDashboardStats } from '../../services/api-testing';

const { Title, Text } = Typography;

const statCards = [
  { key: 'projectCount', icon: <FolderOutlined />, bgColor: '#597ef7', label: 'API 项目', bgLight: '#f0f5ff', iconColor: '#597ef7' },
  { key: 'interfaceCount', icon: <LinkOutlined />, bgColor: '#73d13d', label: '接口数量', bgLight: '#f6ffed', iconColor: '#73d13d' },
  { key: 'suiteCount', icon: <AppstoreOutlined />, bgColor: '#b37feb', label: '测试套件', bgLight: '#f9f0ff', iconColor: '#b37feb' },
  { key: 'historyCount', icon: <HistoryOutlined />, bgColor: '#ffc53d', label: '执行记录', bgLight: '#fffbe6', iconColor: '#ffc53d' }
];

const quickActions = [
  { key: 'projects', icon: <FolderOutlined />, label: '项目管理', path: '/api-testing/projects' },
  { key: 'interfaces', icon: <LinkOutlined />, label: '接口管理', path: '/api-testing/interfaces' },
  { key: 'automation', icon: <PlayCircleOutlined />, label: '自动化测试', path: '/api-testing/automation' },
  { key: 'history', icon: <HistoryOutlined />, label: '请求历史', path: '/api-testing/history' },
  { key: 'environments', icon: <SettingOutlined />, label: '环境管理', path: '/api-testing/environments' },
  { key: 'reports', icon: <BarChartOutlined />, label: '测试报告', path: '/api-testing/reports' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projectCount: 0,
    interfaceCount: 0,
    suiteCount: 0,
    historyCount: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await getDashboardStats();
      const statsData = statsRes?.data || {};

      setStats({
        projectCount: statsData.project_count || statsData.projectCount || 0,
        interfaceCount: statsData.interface_count || statsData.interfaceCount || 0,
        suiteCount: statsData.suite_count || statsData.suiteCount || 0,
        historyCount: statsData.history_count || statsData.historyCount || 0
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setStats({
        projectCount: 0,
        interfaceCount: 0,
        suiteCount: 0,
        historyCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0px 20px 12px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        {statCards.map((item) => (
          <Col span={6} key={item.key}>
            <Card hoverable style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', height: '80px', backgroundColor: item.bgLight, margin: '-24px', padding: '20px 24px', borderRadius: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: item.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    color: 'white',
                    fontSize: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#262626', marginBottom: '2px', lineHeight: '1' }}>
                    {stats[item.key]}
                  </div>
                  <Text style={{ color: '#595959', fontSize: '13px' }}>{item.label}</Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="快速操作" hoverable style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', padding: '4px 0' }}>
          {quickActions.map((action) => (
            <div
              key={action.key}
              onClick={() => navigate(action.path)}
              style={{
                textAlign: 'center',
                padding: '16px 10px',
                borderRadius: '12px',
                backgroundColor: '#f5f5f5',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fafafa';
                e.currentTarget.style.border = '2px solid #d9d9d9';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.border = '2px solid transparent';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#e8e8e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  color: '#595959',
                  fontSize: '18px'
                }}
              >
                {action.icon}
              </div>
              <Text style={{ color: '#434343', fontSize: '13px', fontWeight: '500' }}>{action.label}</Text>
            </div>
          ))}
        </div>
      </Card>

      <Card title="核心功能" hoverable style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card 
              size="small" 
              hoverable
              style={{ textAlign: 'center', height: '100%', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '8px', cursor: 'pointer' }}
              onClick={() => navigate('/api-testing/interfaces')}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#f0f5ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  fontSize: '22px',
                  color: '#597ef7',
                  boxShadow: '0 2px 8px rgba(89,126,247,0.1)'
                }}
              >
                <LinkOutlined />
              </div>
              <Title level={5} style={{ color: '#262626', marginBottom: '4px', fontSize: '14px' }}>接口管理</Title>
              <Text type="secondary" style={{ fontSize: '11px' }}>支持 HTTP/WebSocket 多种协议，可视化编辑请求参数</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              size="small" 
              hoverable
              style={{ textAlign: 'center', height: '100%', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '8px', cursor: 'pointer' }}
              onClick={() => navigate('/api-testing/automation')}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#e6fffb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  fontSize: '22px',
                  color: '#36cfc9',
                  boxShadow: '0 2px 8px rgba(54,207,201,0.1)'
                }}
              >
                <PlayCircleOutlined />
              </div>
              <Title level={5} style={{ color: '#262626', marginBottom: '4px', fontSize: '14px' }}>自动化测试</Title>
              <Text type="secondary" style={{ fontSize: '11px' }}>批量执行测试用例，自动生成测试报告</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              size="small" 
              hoverable
              style={{ textAlign: 'center', height: '100%', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '8px', cursor: 'pointer' }}
              onClick={() => navigate('/api-testing/scheduled-tasks')}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#fffbe6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  fontSize: '22px',
                  color: '#ffc53d',
                  boxShadow: '0 2px 8px rgba(255,197,61,0.1)'
                }}
              >
                <HistoryOutlined />
              </div>
              <Title level={5} style={{ color: '#262626', marginBottom: '4px', fontSize: '14px' }}>定时任务</Title>
              <Text type="secondary" style={{ fontSize: '11px' }}>支持 Cron 表达式，灵活设置执行计划</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              size="small" 
              hoverable
              style={{ textAlign: 'center', height: '100%', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '8px', cursor: 'pointer' }}
              onClick={() => navigate('/api-testing/reports')}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#f9f0ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  fontSize: '22px',
                  color: '#b37feb',
                  boxShadow: '0 2px 8px rgba(179,127,235,0.1)'
                }}
              >
                <BarChartOutlined />
              </div>
              <Title level={5} style={{ color: '#262626', marginBottom: '4px', fontSize: '14px' }}>多维报告</Title>
              <Text type="secondary" style={{ fontSize: '11px' }}>详细的执行报告和数据分析</Text>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
