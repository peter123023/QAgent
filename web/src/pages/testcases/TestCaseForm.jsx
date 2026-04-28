import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
  Row,
  Col
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const TestCaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [versions, setVersions] = useState([]);
  const isEdit = !!id;

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'critical', label: '关键' }
  ];

  const testTypeOptions = [
    { value: 'functional', label: '功能测试' },
    { value: 'integration', label: '集成测试' },
    { value: 'api', label: 'API测试' },
    { value: 'ui', label: 'UI测试' },
    { value: 'performance', label: '性能测试' },
    { value: 'security', label: '安全测试' }
  ];

  // 加载项目列表
  const loadProjects = async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(response.data.results || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  // 加载版本列表
  const loadVersions = async (projectId) => {
    try {
      if (!projectId) {
        setVersions([]);
        return;
      }
      const response = await api.get(`/projects/${projectId}/versions/`);
      setVersions(response.data.results || []);
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  };

  // 加载测试用例详情（编辑模式）
  const loadTestCase = async (testCaseId) => {
    setInitialLoading(true);
    try {
      const response = await api.get(`/testcases/${testCaseId}/`);
      const testCase = response.data;
      
      // 设置表单值
      form.setFieldsValue({
        title: testCase.title,
        description: testCase.description,
        precondition: testCase.precondition,
        steps: testCase.steps,
        expected_result: testCase.expected_result,
        priority: testCase.priority,
        test_type: testCase.test_type,
        project: testCase.project?.id,
        versions: testCase.versions?.map(v => v.id) || []
      });

      // 加载相关版本
      if (testCase.project?.id) {
        loadVersions(testCase.project.id);
      }
    } catch (error) {
      message.error('加载测试用例失败');
      console.error(error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    if (isEdit) {
      loadTestCase(id);
    }
  }, [id, isEdit]);

  // 项目变化时加载版本
  const handleProjectChange = (projectId) => {
    form.setFieldValue('versions', []);
    loadVersions(projectId);
  };

  // 保存测试用例
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEdit) {
        await api.put(`/testcases/${id}/`, values);
        message.success('更新成功');
      } else {
        await api.post('/testcases/', values);
        message.success('创建成功');
      }

      navigate('/ai-generation/testcases');
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Card>
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/ai-generation/testcases')}
            style={{ marginRight: 16 }}
          >
            返回
          </Button>
          <h2 style={{ margin: 0 }}>{isEdit ? '编辑测试用例' : '新建测试用例'}</h2>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            priority: 'medium',
            test_type: 'functional'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="用例标题"
                name="title"
                rules={[
                  { required: true, message: '请输入用例标题' },
                  { min: 2, max: 200, message: '用例标题长度在 2 到 200 个字符之间' }
                ]}
              >
                <Input placeholder="请输入用例标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="优先级"
                name="priority"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  {priorityOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="所属项目"
                name="project"
                rules={[{ required: true, message: '请选择项目' }]}
              >
                <Select
                  placeholder="请选择项目"
                  onChange={handleProjectChange}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {projects.map(project => (
                    <Option key={project.id} value={project.id}>{project.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="测试类型"
                name="test_type"
                rules={[{ required: true, message: '请选择测试类型' }]}
              >
                <Select placeholder="请选择测试类型">
                  {testTypeOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="关联版本"
            name="versions"
          >
            <Select
              placeholder="请选择版本（可选）"
              mode="multiple"
              disabled={versions.length === 0}
            >
              {versions.map(version => (
                <Option key={version.id} value={version.id}>
                  {version.name}{version.is_baseline ? ' (基线)' : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="用例描述"
            name="description"
          >
            <TextArea rows={3} placeholder="请输入用例描述" />
          </Form.Item>

          <Form.Item
            label="前置条件"
            name="precondition"
          >
            <TextArea rows={3} placeholder="请输入前置条件" />
          </Form.Item>

          <Form.Item
            label="测试步骤"
            name="steps"
            rules={[{ required: true, message: '请输入测试步骤' }]}
          >
            <TextArea rows={6} placeholder="请输入测试步骤" />
          </Form.Item>

          <Form.Item
            label="预期结果"
            name="expected_result"
            rules={[{ required: true, message: '请输入预期结果' }]}
          >
            <TextArea rows={4} placeholder="请输入预期结果" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={loading}
                size="large"
              >
                保存
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/ai-generation/testcases')}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TestCaseForm;
