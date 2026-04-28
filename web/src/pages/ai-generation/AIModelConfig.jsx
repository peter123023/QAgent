import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Drawer,
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
  Alert,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import {
  getAIModelConfigs,
  createAIModelConfig,
  updateAIModelConfig,
  deleteAIModelConfig,
  testAIModelConnection
} from '../../services/ai-generation';

const { Text } = Typography;

const modelTypeOptions = [
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'qwen', label: '通义千问' },
  { value: 'siliconflow', label: '硅基流动' },
  { value: 'zhipu', label: '智谱AI' },
  { value: 'other', label: '其他' }
];

const roleOptions = [
  { value: 'writer', label: '用例编写' },
  { value: 'reviewer', label: '用例评审' }
];

const modelBaseUrlMap = {
  deepseek: 'https://api.deepseek.com',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  siliconflow: 'https://api.siliconflow.cn/v1',
  zhipu: 'https://open.bigmodel.cn/api/paas/v4',
  other: ''
};

const AIModelConfig = () => {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [testingConfigId, setTestingConfigId] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const response = await getAIModelConfigs();
      const data = response.data?.results || response.data || [];
      setConfigs(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('加载AI模型配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9
    });
    setDrawerVisible(true);
  };

  const handleEdit = (record) => {
    setEditingConfig(record);
    form.setFieldsValue({
      model_type: record.model_type,
      api_key: record.api_key_mask || record.api_key,
      base_url: record.base_url,
      model_name: record.model_name,
      max_tokens: record.max_tokens,
      temperature: record.temperature,
      top_p: record.top_p,
      is_active: record.is_active
    });
    setDrawerVisible(true);
  };

  const handleModelTypeChange = (value) => {
    if (modelBaseUrlMap[value]) {
      form.setFieldValue('base_url', modelBaseUrlMap[value]);
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteAIModelConfig(record.id);
      message.success('删除成功');
      loadConfigs();
    } catch (error) {
      console.error('Failed to delete config:', error);
      message.error('删除失败');
    }
  };

  const handleTestConnection = async (record) => {
    setTestingConfigId(record.id);
    setTestResult(null);
    try {
      const response = await testAIModelConnection(record.id);
      setTestResult(response.data);
      setTestModalVisible(true);
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || error.message,
        response: ''
      });
      setTestModalVisible(true);
    } finally {
      setTestingConfigId(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = { ...values };

      // 为去掉的字段设置默认值
      if (!editingConfig) {
        data.name = data.model_name || '未命名配置';
        data.role = 'writer';
      } else {
        // 编辑时也保留原有的 name 和 role
        data.name = editingConfig.name;
        data.role = editingConfig.role;
      }

      if (editingConfig) {
        if (data.api_key && data.api_key.includes('*')) {
          delete data.api_key;
        }
        await updateAIModelConfig(editingConfig.id, data);
        message.success('更新成功');
      } else {
        await createAIModelConfig(data);
        message.success('创建成功');
      }
      setDrawerVisible(false);
      loadConfigs();
    } catch (error) {
      if (error.response?.data) {
        const errors = error.response.data;
        let errorMessage = editingConfig ? '更新失败' : '创建失败';
        if (errors.non_field_errors) {
          errorMessage = errors.non_field_errors[0];
        } else if (Object.keys(errors).length > 0) {
          errorMessage = Object.entries(errors)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val[0] : val}`)
            .join('; ');
        }
        message.error(errorMessage);
      } else {
        message.error(editingConfig ? '更新失败' : '创建失败');
      }
    }
  };

  const getModelTypeColor = (type) => {
    const colorMap = {
      deepseek: 'blue',
      qwen: 'purple',
      siliconflow: 'cyan',
      zhipu: 'geekblue',
      other: 'default'
    };
    return colorMap[type] || 'default';
  };

  const getRoleColor = (role) => {
    return role === 'writer' ? 'green' : 'orange';
  };

  const configCards = configs.map((config) => (
    <Card
      key={config.id}
      style={{ marginBottom: 16 }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 600 }}>{config.name}</span>
          <Tag color={getModelTypeColor(config.model_type)}>
            {modelTypeOptions.find((o) => o.value === config.model_type)?.label || config.model_type}
          </Tag>
          <Tag color={getRoleColor(config.role)}>
            {roleOptions.find((o) => o.value === config.role)?.label || config.role}
          </Tag>
          <Tag color={config.is_active ? 'success' : 'default'}>
            {config.is_active ? '启用' : '禁用'}
          </Tag>
        </div>
      }
      extra={
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<ExperimentOutlined />}
            onClick={() => handleTestConnection(config)}
            loading={testingConfigId === config.id}
          >
            测试连接
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(config)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除配置「${config.name}」吗？`}
            onConfirm={() => handleDelete(config)}
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="API地址">
          <Text copyable={{ text: config.base_url }}>{config.base_url}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="模型名称">{config.model_name}</Descriptions.Item>
        <Descriptions.Item label="最大Token数">{config.max_tokens}</Descriptions.Item>
        <Descriptions.Item label="温度">{config.temperature}</Descriptions.Item>
        <Descriptions.Item label="Top P">{config.top_p}</Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {config.created_at ? new Date(config.created_at).toLocaleString() : '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  ));

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title={<h2 style={{ margin: 0 }}>AI模型配置</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            添加配置
          </Button>
        }
      >
        {configs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🤖</div>
            <h3>暂无AI模型配置</h3>
            <p style={{ color: '#666' }}>点击下方按钮添加第一个配置</p>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              style={{ marginTop: 20 }}
            >
              添加第一个配置
            </Button>
          </div>
        ) : (
          configCards
        )}
      </Card>

      <Drawer
        title={editingConfig ? '编辑AI模型配置' : '添加AI模型配置'}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={480}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setDrawerVisible(false)}>
                取消
              </Button>
              <Button type="primary" onClick={handleSubmit}>
                {editingConfig ? '更新' : '创建'}
              </Button>
            </Space>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="model_type"
            label="模型类型"
            rules={[{ required: true, message: '请选择模型类型' }]}
          >
            <Select
              placeholder="请选择模型类型"
              onChange={handleModelTypeChange}
            >
              {modelTypeOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="api_key"
            label="API密钥"
            rules={editingConfig ? [] : [{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password
              placeholder={editingConfig ? '如需修改请输入新密钥' : '请输入API密钥'}
            />
          </Form.Item>

          <Form.Item
            name="base_url"
            label="API地址"
            rules={[{ required: true, message: '请输入API地址' }]}
          >
            <Input placeholder="请输入API地址" />
          </Form.Item>

          <Form.Item
            name="model_name"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="请输入模型名称，如: deepseek-chat" />
          </Form.Item>

          <Form.Item name="max_tokens" label="最大Token数">
            <InputNumber min={100} max={32000} placeholder={4096} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="temperature" label="温度">
            <InputNumber min={0} max={2} step={0.1} placeholder={0.7} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="top_p" label="Top P">
            <InputNumber min={0} max={1} step={0.1} placeholder={0.9} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="is_active" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title="连接测试结果"
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        footer={
          <Button onClick={() => setTestModalVisible(false)}>关闭</Button>
        }
      >
        {testResult && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>
              {testResult.success ? '✅' : '❌'}
            </div>
            <Typography.Title level={4} style={{ color: testResult.success ? '#52c41a' : '#ff4d4f' }}>
              {testResult.success ? '连接测试成功' : '连接测试失败'}
            </Typography.Title>
            <p style={{ color: '#666', marginBottom: 16 }}>{testResult.message}</p>
            {testResult.response && (
              <div style={{
                padding: 16,
                background: '#f5f5f5',
                borderRadius: 8,
                textAlign: 'left',
                borderLeft: '4px solid #1890ff'
              }}>
                <Text strong>AI响应:</Text>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: 8, marginBottom: 0 }}>
                  {testResult.response}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AIModelConfig;
