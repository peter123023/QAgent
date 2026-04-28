import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  message,
  Popconfirm,
  Typography,
  Descriptions,
  Alert
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
  SettingOutlined
} from '@ant-design/icons';
import {
  getAIServiceConfigs,
  createAIServiceConfig,
  updateAIServiceConfig,
  deleteAIServiceConfig,
  testAIServiceConnection
} from '../../services/api-testing';

const { Text } = Typography;

const providerOptions = [
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'qwen', label: '通义千问' },
  { value: 'siliconflow', label: '硅基流动' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'custom', label: '自定义' }
];

const roleOptions = [
  { value: 'testcase_writer', label: '测试用例编写' },
  { value: 'testcase_reviewer', label: '测试用例评审' },
  { value: 'browser_use_text', label: '浏览器操作(文本)' },
  { value: 'browser_use_vision', label: '浏览器操作(视觉)' }
];

const statusMap = {
  ACTIVE: { color: 'success', text: '正常', icon: <CheckCircleOutlined /> },
  INACTIVE: { color: 'default', text: '停用', icon: <CloseCircleOutlined /> },
  ERROR: { color: 'error', text: '异常', icon: <CloseCircleOutlined /> }
};

const AIServiceConfig = () => {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [viewingConfig, setViewingConfig] = useState(null);
  const [testingConfig, setTestingConfig] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const response = await getAIServiceConfigs();
      setConfigs(response.data?.results || response.data || []);
    } catch (error) {
      message.error('加载AI服务配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue({
      is_enabled: true,
      timeout: 120,
      max_tokens: 2000
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingConfig(record);
    form.setFieldsValue({
      name: record.name,
      provider: record.provider,
      api_url: record.api_url,
      api_key: record.api_key,
      model_name: record.model_name,
      role: record.role,
      is_enabled: record.is_enabled,
      timeout: record.timeout,
      max_tokens: record.max_tokens,
      description: record.description
    });
    setModalVisible(true);
  };

  const handleView = (record) => {
    setViewingConfig(record);
    setViewModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await deleteAIServiceConfig(record.id);
      message.success('删除成功');
      loadConfigs();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleTestConnection = async (record) => {
    setTestingConfig(record.id);
    setTestResult(null);
    try {
      const response = await testAIServiceConnection(record.id);
      if (response.data?.success) {
        setTestResult({ type: 'success', message: '连接测试成功！' });
      } else {
        setTestResult({ type: 'error', message: response.data?.message || '连接测试失败' });
      }
    } catch (error) {
      setTestResult({ type: 'error', message: error.response?.data?.message || '连接测试失败' });
    } finally {
      setTestingConfig(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        name: values.name,
        provider: values.provider,
        api_url: values.api_url,
        api_key: values.api_key,
        model_name: values.model_name,
        role: values.role,
        is_enabled: values.is_enabled,
        timeout: values.timeout,
        max_tokens: values.max_tokens,
        description: values.description
      };

      if (editingConfig) {
        await updateAIServiceConfig(editingConfig.id, data);
        message.success('更新成功');
      } else {
        await createAIServiceConfig(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadConfigs();
    } catch (error) {
      message.error(editingConfig ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '配置名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '提供商',
      dataIndex: 'provider',
      key: 'provider',
      width: 120,
      render: (provider) => {
        const option = providerOptions.find((p) => p.value === provider);
        return option?.label || provider;
      }
    },
    {
      title: '模型',
      dataIndex: 'model_name',
      key: 'model_name',
      width: 150
    },
    {
      title: '用途',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role) => {
        const option = roleOptions.find((r) => r.value === role);
        return option?.label || role;
      }
    },
    {
      title: '状态',
      dataIndex: 'is_enabled',
      key: 'is_enabled',
      width: 100,
      render: (isEnabled, record) => {
        const status = isEnabled
          ? statusMap.ACTIVE
          : record.status === 'ERROR'
          ? statusMap.ERROR
          : statusMap.INACTIVE;
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.text}
          </Tag>
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => (text ? new Date(text).toLocaleString() : '-')
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<ExperimentOutlined />}
            onClick={() => handleTestConnection(record)}
            loading={testingConfig === record.id}
          >
            测试
          </Button>
          <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除配置「${record.name}」吗？`}
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title={<h2 style={{ margin: 0 }}>AI服务配置</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            添加配置
          </Button>
        }
      >
        {testResult && (
          <Alert
            message={testResult.message}
            type={testResult.type}
            showIcon
            icon={testResult.type === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setTestResult(null)}
          />
        )}

        <Table
          dataSource={configs}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingConfig ? '编辑AI服务配置' : '添加AI服务配置'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText={editingConfig ? '更新' : '创建'}
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="配置名称"
            rules={[{ required: true, message: '请输入配置名称' }]}
          >
            <Input placeholder="请输入配置名称" />
          </Form.Item>

          <Form.Item
            name="provider"
            label="AI提供商"
            rules={[{ required: true, message: '请选择AI提供商' }]}
          >
            <Select placeholder="请选择AI提供商">
              {providerOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="api_url"
            label="API地址"
            rules={[{ required: true, message: '请输入API地址' }]}
          >
            <Input placeholder="请输入API地址" />
          </Form.Item>

          <Form.Item
            name="api_key"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="请输入API密钥" />
          </Form.Item>

          <Form.Item
            name="model_name"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="请输入模型名称，如: deepseek-chat" />
          </Form.Item>

          <Form.Item
            name="role"
            label="用途"
            rules={[{ required: true, message: '请选择用途' }]}
          >
            <Select placeholder="请选择用途">
              {roleOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="timeout" label="超时时间(秒)">
            <Input type="number" placeholder="120" />
          </Form.Item>

          <Form.Item name="max_tokens" label="最大Token数">
            <Input type="number" placeholder="2000" />
          </Form.Item>

          <Form.Item name="is_enabled" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="配置详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setViewModalVisible(false)}>关闭</Button>
            <Button
              type="primary"
              onClick={() => {
                setViewModalVisible(false);
                handleEdit(viewingConfig);
              }}
            >
              编辑
            </Button>
          </Space>
        }
      >
        {viewingConfig && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="配置名称">{viewingConfig.name}</Descriptions.Item>
            <Descriptions.Item label="AI提供商">
              {providerOptions.find((p) => p.value === viewingConfig.provider)?.label ||
                viewingConfig.provider}
            </Descriptions.Item>
            <Descriptions.Item label="API地址">{viewingConfig.api_url}</Descriptions.Item>
            <Descriptions.Item label="API密钥">
              <Text copyable={{ text: viewingConfig.api_key }}>
                {'*'.repeat(Math.min(viewingConfig.api_key?.length || 0, 20))}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="模型名称">{viewingConfig.model_name}</Descriptions.Item>
            <Descriptions.Item label="用途">
              {roleOptions.find((r) => r.value === viewingConfig.role)?.label || viewingConfig.role}
            </Descriptions.Item>
            <Descriptions.Item label="超时时间">{viewingConfig.timeout}秒</Descriptions.Item>
            <Descriptions.Item label="最大Token数">{viewingConfig.max_tokens}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={viewingConfig.is_enabled ? 'success' : 'default'}>
                {viewingConfig.is_enabled ? '启用' : '禁用'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="描述">{viewingConfig.description || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {viewingConfig.created_at ? new Date(viewingConfig.created_at).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AIServiceConfig;