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
  Tabs
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloudDownloadOutlined
} from '@ant-design/icons';
import {
  getPromptConfigs,
  createPromptConfig,
  updatePromptConfig,
  deletePromptConfig,
  loadDefaultPrompts
} from '../../services/ai-generation';

const { TextArea } = Input;
const { Text } = Typography;

const promptTypeOptions = [
  { value: 'writer', label: '用例编写' },
  { value: 'reviewer', label: '用例评审' }
];

const PromptConfig = () => {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [defaultsModalVisible, setDefaultsModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [previewConfig, setPreviewConfig] = useState(null);
  const [defaultPrompts, setDefaultPrompts] = useState({ writer: '', reviewer: '' });
  const [activeTab, setActiveTab] = useState('writer');
  const [loadingDefaults, setLoadingDefaults] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const response = await getPromptConfigs();
      const data = response.data?.results || response.data || [];
      setConfigs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load configs:', error);
      message.error('加载提示词配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingConfig(record);
    form.setFieldsValue({
      name: record.name,
      prompt_type: record.prompt_type,
      content: record.content,
      is_active: record.is_active
    });
    setModalVisible(true);
  };

  const handlePreview = (record) => {
    setPreviewConfig(record);
    setPreviewVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await deletePromptConfig(record.id);
      message.success('删除成功');
      loadConfigs();
    } catch (error) {
      console.error('Failed to delete config:', error);
      message.error('删除失败');
    }
  };

  const handleLoadDefaults = async () => {
    try {
      const response = await loadDefaultPrompts();
      setDefaultPrompts(response.data?.defaults || { writer: '', reviewer: '' });
      setDefaultsModalVisible(true);
    } catch (error) {
      console.error('Failed to load defaults:', error);
      message.error('加载默认提示词失败');
    }
  };

  const handleConfirmLoadDefaults = async () => {
    setLoadingDefaults(true);
    try {
      if (defaultPrompts.writer) {
        await createPromptConfig({
          name: '默认用例编写提示词',
          prompt_type: 'writer',
          content: defaultPrompts.writer,
          is_active: true
        });
      }
      if (defaultPrompts.reviewer) {
        await createPromptConfig({
          name: '默认用例评审提示词',
          prompt_type: 'reviewer',
          content: defaultPrompts.reviewer,
          is_active: true
        });
      }
      message.success('默认提示词加载成功');
      setDefaultsModalVisible(false);
      loadConfigs();
    } catch (error) {
      console.error('Failed to load defaults:', error);
      message.error('加载默认提示词失败');
    } finally {
      setLoadingDefaults(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = { ...values };

      if (editingConfig) {
        await updatePromptConfig(editingConfig.id, data);
        message.success('更新成功');
      } else {
        await createPromptConfig(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadConfigs();
    } catch (error) {
      console.error('Failed to save config:', error);
      message.error(editingConfig ? '更新失败' : '创建失败');
    }
  };

  const truncateContent = (content, maxLength = 200) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const configCards = configs.map((config) => (
    <Card
      key={config.id}
      style={{ marginBottom: 16 }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 600 }}>{config.name}</span>
          <Tag color={config.prompt_type === 'writer' ? 'green' : 'orange'}>
            {promptTypeOptions.find((o) => o.value === config.prompt_type)?.label || config.prompt_type}
          </Tag>
          <Tag color={config.is_active ? 'success' : 'default'}>
            {config.is_active ? '启用' : '禁用'}
          </Tag>
        </div>
      }
      extra={
        <Space>
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(config)}
          >
            预览
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
      <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8, borderLeft: '4px solid #1890ff' }}>
        <Text strong>内容预览:</Text>
        <p style={{ color: '#666', marginTop: 8, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
          {truncateContent(config.content)}
        </p>
      </div>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="创建时间">
          {config.created_at ? new Date(config.created_at).toLocaleString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间">
          {config.updated_at ? new Date(config.updated_at).toLocaleString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="创建者" span={2}>
          {config.created_by_name || '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  ));

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title={<h2 style={{ margin: 0 }}>提示词配置</h2>}
        extra={
          <Space>
            <Button icon={<CloudDownloadOutlined />} onClick={handleLoadDefaults}>
              加载默认提示词
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              添加配置
            </Button>
          </Space>
        }
      >
        {configs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>📝</div>
            <h3>暂无提示词配置</h3>
            <p style={{ color: '#666', marginBottom: 20 }}>添加自定义提示词或加载默认提示词</p>
            <Space>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                添加第一个配置
              </Button>
              <Button
                size="large"
                icon={<CloudDownloadOutlined />}
                onClick={handleLoadDefaults}
              >
                加载默认提示词
              </Button>
            </Space>
          </div>
        ) : (
          configCards
        )}
      </Card>

      <Modal
        title={editingConfig ? '编辑提示词配置' : '添加提示词配置'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
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
            name="prompt_type"
            label="提示词类型"
            rules={[{ required: true, message: '请选择提示词类型' }]}
          >
            <Select placeholder="请选择提示词类型">
              {promptTypeOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="提示词内容"
            rules={[{ required: true, message: '请输入提示词内容' }]}
          >
            <TextArea
              rows={15}
              placeholder="请输入提示词内容，支持多行文本"
              showCount
            />
          </Form.Item>

          <div style={{
            padding: 16,
            background: '#f5f5f5',
            borderRadius: 8,
            borderLeft: '4px solid #1890ff',
            marginBottom: 16
          }}>
            <Text strong>💡 编写提示:</Text>
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
              <li>明确描述你希望AI执行的任务</li>
              <li>提供输出格式的具体要求</li>
              <li>包含必要的背景信息和约束条件</li>
              <li>可以使用占位符，如 {`{requirement}`}、{`{context}`} 等</li>
            </ul>
          </div>

          <Form.Item name="is_active" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`提示词预览 - ${previewConfig?.name}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={
          <Space>
            <Button onClick={() => setPreviewVisible(false)}>关闭</Button>
            <Button
              type="primary"
              onClick={() => {
                setPreviewVisible(false);
                handleEdit(previewConfig);
              }}
            >
              编辑
            </Button>
          </Space>
        }
      >
        {previewConfig && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <Tag color={previewConfig.prompt_type === 'writer' ? 'green' : 'orange'}>
                {promptTypeOptions.find((o) => o.value === previewConfig.prompt_type)?.label || previewConfig.prompt_type}
              </Tag>
              <Tag color={previewConfig.is_active ? 'success' : 'default'}>
                {previewConfig.is_active ? '启用' : '禁用'}
              </Tag>
            </div>
            <div style={{
              padding: 16,
              background: '#f5f5f5',
              borderRadius: 8,
              borderLeft: '4px solid #1890ff',
              maxHeight: '60vh',
              overflow: 'auto'
            }}>
              <Text strong>提示词内容:</Text>
              <pre style={{
                marginTop: 8,
                marginBottom: 0,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontFamily: 'Monaco, Menlo, Consolas, monospace',
                fontSize: '0.9rem'
              }}>
                {previewConfig.content}
              </pre>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="默认提示词预览"
        open={defaultsModalVisible}
        onCancel={() => setDefaultsModalVisible(false)}
        width={800}
        footer={
          <Space>
            <Button onClick={() => setDefaultsModalVisible(false)}>取消</Button>
            <Button
              type="primary"
              onClick={handleConfirmLoadDefaults}
              loading={loadingDefaults}
            >
              确认加载
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="用例编写" key="writer">
            <div style={{
              padding: 16,
              background: '#f5f5f5',
              borderRadius: 8,
              borderLeft: '4px solid #1890ff',
              maxHeight: '50vh',
              overflow: 'auto'
            }}>
              <pre style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontFamily: 'Monaco, Menlo, Consolas, monospace',
                fontSize: '0.9rem',
                margin: 0
              }}>
                {defaultPrompts.writer || '暂无内容'}
              </pre>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="用例评审" key="reviewer">
            <div style={{
              padding: 16,
              background: '#f5f5f5',
              borderRadius: 8,
              borderLeft: '4px solid #fa8c16',
              maxHeight: '50vh',
              overflow: 'auto'
            }}>
              <pre style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontFamily: 'Monaco, Menlo, Consolas, monospace',
                fontSize: '0.9rem',
                margin: 0
              }}>
                {defaultPrompts.reviewer || '暂无内容'}
              </pre>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default PromptConfig;
