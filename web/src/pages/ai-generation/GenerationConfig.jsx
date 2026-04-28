import React, { useState, useEffect } from 'react';
import {
  Card,
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
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import {
  getGenerationConfigs,
  createGenerationConfig,
  updateGenerationConfig,
  deleteGenerationConfig,
  enableGenerationConfig
} from '../../services/ai-generation';

const { Text } = Typography;

const outputModeOptions = [
  { value: 'stream', label: '实时流式' },
  { value: 'complete', label: '完整输出' }
];

const GenerationConfig = () => {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const response = await getGenerationConfigs();
      const data = response.data?.results || response.data || [];
      setConfigs(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('加载生成配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue({
      name: '默认生成配置',
      default_output_mode: 'stream',
      enable_auto_review: true,
      review_timeout: 1500,
      is_active: true
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingConfig(record);
    form.setFieldsValue({
      name: record.name,
      default_output_mode: record.default_output_mode,
      enable_auto_review: record.enable_auto_review,
      review_timeout: record.review_timeout,
      is_active: record.is_active
    });
    setModalVisible(true);
  };

  const handleEnable = async (record) => {
    try {
      await enableGenerationConfig(record.id);
      message.success('启用成功');
      loadConfigs();
    } catch (error) {
      console.error('Failed to enable config:', error);
      message.error('启用失败');
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteGenerationConfig(record.id);
      message.success('删除成功');
      loadConfigs();
    } catch (error) {
      console.error('Failed to delete config:', error);
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = { ...values };

      if (editingConfig) {
        await updateGenerationConfig(editingConfig.id, data);
        message.success('更新成功');
      } else {
        await createGenerationConfig(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadConfigs();
    } catch (error) {
      console.error('Failed to save config:', error);
      message.error(editingConfig ? '更新失败' : '创建失败');
    }
  };

  const configCards = configs.map((config) => (
    <Card
      key={config.id}
      style={{ marginBottom: 16 }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 600 }}>{config.name}</span>
          <Tag color={config.is_active ? 'success' : 'default'}>
            {config.is_active ? '启用' : '禁用'}
          </Tag>
          <Tag color="blue">
            {outputModeOptions.find((o) => o.value === config.default_output_mode)?.label || config.default_output_mode}
          </Tag>
        </div>
      }
      extra={
        <Space>
          {!config.is_active && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleEnable(config)}
            >
              启用
            </Button>
          )}
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
      <Descriptions title="输出模式" column={1} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="默认输出模式">
          {outputModeOptions.find((o) => o.value === config.default_output_mode)?.label || config.default_output_mode}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions title="自动化流程" column={1} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="AI自动评审">
          <Tag color={config.enable_auto_review ? 'success' : 'default'}>
            {config.enable_auto_review ? '启用' : '禁用'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
      <Descriptions title="超时设置" column={1} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="评审超时时间">
          {config.review_timeout} 秒
        </Descriptions.Item>
      </Descriptions>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="创建时间">
          {config.created_at ? new Date(config.created_at).toLocaleString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间">
          {config.updated_at ? new Date(config.updated_at).toLocaleString() : '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  ));

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title={<h2 style={{ margin: 0 }}>生成配置</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            添加配置
          </Button>
        }
      >
        {configs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>⚙️</div>
            <h3>暂无生成配置</h3>
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

      <Modal
        title={editingConfig ? '编辑生成配置' : '添加生成配置'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText={editingConfig ? '更新' : '创建'}
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
            <Form.Item
              name="name"
              label="配置名称"
              rules={[{ required: true, message: '请输入配置名称' }]}
            >
              <Input placeholder="请输入配置名称" />
            </Form.Item>

            <Form.Item name="is_active" label="启用" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Card>

          <Card title="输出模式设置" size="small" style={{ marginBottom: 16 }}>
            <Form.Item
              name="default_output_mode"
              label="默认输出模式"
              rules={[{ required: true, message: '请选择输出模式' }]}
            >
              <Select placeholder="请选择输出模式">
                {outputModeOptions.map((opt) => (
                  <Select.Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Text type="secondary" style={{ fontSize: '0.85rem' }}>
              实时流式模式会逐字显示AI输出，完整输出模式会等待全部完成后显示
            </Text>
          </Card>

          <Card title="自动化流程" size="small" style={{ marginBottom: 16 }}>
            <Form.Item name="enable_auto_review" label="启用AI自动评审" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Text type="secondary" style={{ fontSize: '0.85rem' }}>
              启用后，AI生成的测试用例会自动进行评审
            </Text>
          </Card>

          <Card title="超时设置" size="small">
            <Form.Item name="review_timeout" label="评审超时时间(秒)">
              <InputNumber min={10} max={3600} placeholder={1500} style={{ width: '100%' }} />
            </Form.Item>
            <Text type="secondary" style={{ fontSize: '0.85rem' }}>
              设置AI评审的超时时间，超过此时间会终止评审
            </Text>
          </Card>
        </Form>
      </Modal>
    </div>
  );
};

export default GenerationConfig;
