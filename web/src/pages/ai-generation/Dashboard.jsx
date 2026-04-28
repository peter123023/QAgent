import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spin, Typography } from 'antd';
import {
  FileSearchOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileProtectOutlined,
  BranchesOutlined,
  FolderOutlined,
  FileOutlined
} from '@ant-design/icons';
import { getAIGenerationDashboardStats } from '../../services/ai-generation';

const { Title, Text } = Typography;

// AI用例生成专属统计卡片 - 第一行
const statCards = [
  { key: 'requirementDocs', icon: <FileSearchOutlined />, bgColor: '#597ef7', label: '需求文档', bgLight: '#f0f5ff', iconColor: '#597ef7' },
  { key: 'aiGeneratedCases', icon: <ThunderboltOutlined />, bgColor: '#73d13d', label: 'AI生成用例', bgLight: '#f6ffed', iconColor: '#73d13d' },
  { key: 'pendingReview', icon: <SafetyCertificateOutlined />, bgColor: '#ffc53d', label: '待评审用例', bgLight: '#fffbe6', iconColor: '#ffc53d' },
  { key: 'reviewedCases', icon: <CheckCircleOutlined />, bgColor: '#b37feb', label: '已评审用例', bgLight: '#f9f0ff', iconColor: '#b37feb' }
];

// 资源统计卡片 - 第二行
const resourceStatCards = [
  { key: 'projects', icon: <FolderOutlined />, bgColor: '#ff7875', label: '项目数量', bgLight: '#fff1f0', iconColor: '#ff7875' },
  { key: 'testcases', icon: <FileOutlined />, bgColor: '#ff9c6e', label: '测试用例', bgLight: '#fff7e6', iconColor: '#ff9c6e' },
  { key: 'versions', icon: <BranchesOutlined />, bgColor: '#5cdbd3', label: '版本数量', bgLight: '#e6fffb', iconColor: '#5cdbd3' }
];

// AI用例生成专属快速操作
const quickActions = [
  { key: 'requirement-analysis', icon: <FileSearchOutlined />, label: '需求分析', path: '/ai-generation/requirement-analysis' },
  { key: 'generated-testcases', icon: <ThunderboltOutlined />, label: 'AI生成用例', path: '/ai-generation/generated-testcases' },
  { key: 'testcases', icon: <FileProtectOutlined />, label: '用例管理', path: '/ai-generation/testcases' },
  { key: 'reviews', icon: <AuditOutlined />, label: '评审列表', path: '/ai-generation/reviews' },
  { key: 'review-templates', icon: <FileTextOutlined />, label: '评审模板', path: '/ai-generation/review-templates' },
  { key: 'versions', icon: <BranchesOutlined />, label: '版本管理', path: '/ai-generation/versions' }
];

// AI用例生成核心功能卡片
const coreFeatures = [
  { 
    key: 'ai-generation', 
    icon: <ThunderboltOutlined />, 
    title: 'AI智能生成', 
    desc: '基于需求文档自动生成高质量测试用例',
    color: '#597ef7',
    bgColor: '#f0f5ff',
    path: '/ai-generation/requirement-analysis'
  },
  { 
    key: 'case-review', 
    icon: <AuditOutlined />, 
    title: '用例评审', 
    desc: 'AI辅助评审，提高测试用例的覆盖率和质量',
    color: '#73d13d',
    bgColor: '#f6ffed',
    path: '/ai-generation/reviews'
  },
  { 
    key: 'version-control', 
    icon: <BranchesOutlined />, 
    title: '版本管理', 
    desc: '跟踪测试用例的变更历史，支持版本对比',
    color: '#36cfc9',
    bgColor: '#e6fffb',
    path: '/ai-generation/versions'
  },
  { 
    key: 'template-manage', 
    icon: <FileTextOutlined />, 
    title: '评审模板', 
    desc: '自定义评审标准，提高评审的一致性和效率',
    color: '#b37feb',
    bgColor: '#f9f0ff',
    path: '/ai-generation/review-templates'
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    requirementDocs: 0,
    aiGeneratedCases: 0,
    pendingReview: 0,
    reviewedCases: 0,
    projects: 0,
    testcases: 0,
    versions: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const response = await getAIGenerationDashboardStats();
        const data = response?.data || {};
        setStats({
          requirementDocs: data.requirement_doc_count || data.requirementDocs || 0,
          aiGeneratedCases: data.ai_generated_count || data.aiGeneratedCases || 0,
          pendingReview: data.pending_review_count || data.pendingReview || 0,
          reviewedCases: data.reviewed_count || data.reviewedCases || 0,
          projects: data.project_count || data.projects || 0,
          testcases: data.testcase_count || data.testcases || 0,
          versions: data.version_count || data.versions || 0
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setStats({
          requirementDocs: 0,
          aiGeneratedCases: 0,
          pendingReview: 0,
          reviewedCases: 0,
          projects: 0,
          testcases: 0,
          versions: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

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

      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        {resourceStatCards.map((item) => (
          <Col span={8} key={item.key}>
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

      <Card title="AI用例生成核心能力" hoverable style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Row gutter={[16, 16]}>
          {coreFeatures.map((feature) => (
            <Col span={6} key={feature.key}>
              <Card 
                size="small" 
                hoverable
                style={{ textAlign: 'center', height: '100%', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => navigate(feature.path)}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: feature.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    fontSize: '22px',
                    color: feature.color,
                    boxShadow: `0 2px 8px ${feature.color}15`
                  }}
                >
                  {feature.icon}
                </div>
                <Title level={5} style={{ color: '#262626', marginBottom: '4px', fontSize: '14px' }}>{feature.title}</Title>
                <Text type="secondary" style={{ fontSize: '11px' }}>{feature.desc}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
