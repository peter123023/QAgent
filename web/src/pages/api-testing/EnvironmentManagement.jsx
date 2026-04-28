import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Radio,
  Select,
  Tag,
  message,
  Tabs,
  Popconfirm,
  Descriptions
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import {
  getEnvironments,
  getApiProjects,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
  activateEnvironment
} from '../../services/api-testing';

const EnvironmentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('GLOBAL');
  const [globalEnvironments, setGlobalEnvironments] = useState([]);
  const [localEnvironments, setLocalEnvironments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState(null);
  const [viewingEnvironment, setViewingEnvironment] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProjects();
    loadEnvironments();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await getApiProjects();
      const data = response.data?.results || response.data || [];
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      message.error('加载项目列表失败');
    }
  };

  const loadEnvironments = async () => {
    setLoading(true);
    try {
      const response = await getEnvironments();
      const data = response.data?.results || response.data || [];
      setGlobalEnvironments(data.filter((env) => env.scope === 'GLOBAL'));
      setLocalEnvironments(data.filter((env) => env.scope === 'LOCAL'));
    } catch (error) {
      message.error('加载环境列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
  };

  const handleCreate = () => {
    setEditingEnvironment(null);
    form.resetFields();
    form.setFieldsValue({
      scope: 'GLOBAL',
      variables: [{ key: '', initialValue: '', currentValue: '' }]
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingEnvironment(record);
    form.setFieldsValue({
      name: record.name,
      scope: record.scope,
      project: record.project,
      variables: Object.keys(record.variables || {}).map((key) => {
        const value = record.variables[key];
        if (typeof value === 'object') {
          return {
            key,
            initialValue: value.initialValue || '',
            currentValue: value.currentValue || ''
          };
        }
        return {
          key,
          initialValue: value || '',
          currentValue: value || ''
        };
      })
    });
    if (!record.variables || Object.keys(record.variables).length === 0) {
      form.setFieldsValue({
        variables: [{ key: '', initialValue: '', currentValue: '' }]
      });
    }
    setModalVisible(true);
  };

  const handleView = (record) => {
    setViewingEnvironment(record);
    setViewModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await deleteEnvironment(record.id);
      message.success('删除成功');
      loadEnvironments();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleActivate = async (record) => {
    try {
      await activateEnvironment(record.id);
      message.success('激活成功');
      loadEnvironments();
    } catch (error) {
      message.error('激活失败');
    }
  };

  const handleDuplicate = async (record) => {
    try {
      await createEnvironment({
        name: `${record.name} - Copy`,
        scope: record.scope,
        project: record.scope === 'LOCAL' ? record.project : null,
        variables: record.variables || {}
      });
      message.success('复制成功');
      loadEnvironments();
    } catch (error) {
      message.error('复制失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const variables = {};
      values.variables?.forEach((v) => {
        if (v.key) {
          variables[v.key] = {
            initialValue: v.initialValue || '',
            currentValue: v.currentValue || v.initialValue || ''
          };
        }
      });

      const data = {
        name: values.name,
        scope: values.scope,
        project: values.scope === 'LOCAL' ? values.project : null,
        variables
      };

      if (editingEnvironment) {
        await updateEnvironment(editingEnvironment.id, data);
        message.success('更新成功');
      } else {
        await createEnvironment(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadEnvironments();
    } catch (error) {
      message.error(editingEnvironment ? '更新失败' : '创建失败');
    }
  };

  const handleScopeChange = () => {
    form.setFieldsValue({ project: null });
  };

  const addVariable = () => {
    const variables = form.getFieldValue('variables') || [];
    form.setFieldsValue({ variables: [...variables, { key: '', initialValue: '', currentValue: '' }] });
  };

  const removeVariable = (index) => {
    const variables = form.getFieldValue('variables') || [];
    if (variables.length > 1) {
      form.setFieldsValue({
        variables: variables.filter((_, i) => i !== index)
      });
    }
  };

  const columns = [
    {
      title: '环境名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '范围',
      dataIndex: 'scope',
      key: 'scope',
      width: 120,
      render: (scope) => (
        <Tag color={scope === 'GLOBAL' ? 'blue' : 'green'}>
          {scope === 'GLOBAL' ? '全局' : '本地'}
        </Tag>
      )
    },
    {
      title: '变量数量',
      key: 'variableCount',
      width: 100,
      render: (_, record) => Object.keys(record.variables || {}).length
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '已激活' : '未激活'}
        </Tag>
      )
    },
    {
      title: '创建者',
      dataIndex: ['created_by', 'username'],
      key: 'created_by',
      width: 120
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
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {!record.is_active && (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleActivate(record)}
            >
              激活
            </Button>
          )}
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => handleDuplicate(record)}>
            复制
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除环境「${record.name}」吗？`}
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

  const localColumns = [
    ...columns.slice(0, 2),
    {
      title: '关联项目',
      dataIndex: 'project_name',
      key: 'project_name',
      width: 150
    },
    ...columns.slice(2)
  ];

  const viewVariables = viewingEnvironment
    ? Object.keys(viewingEnvironment.variables || {}).map((key) => {
        const value = viewingEnvironment.variables[key];
        return {
          key,
          initialValue: typeof value === 'object' ? value.initialValue || '' : value || '',
          currentValue: typeof value === 'object' ? value.currentValue || '' : value || ''
        };
      })
    : [];

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title={<h2 style={{ margin: 0 }}>环境管理</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建环境
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'GLOBAL',
              label: '全局环境',
              children: (
                <Table
                  dataSource={globalEnvironments}
                  columns={columns}
                  rowKey="id"
                  loading={loading}
                />
              )
            },
            {
              key: 'LOCAL',
              label: '本地环境',
              children: (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Select
                      placeholder="选择项目"
                      value={selectedProject}
                      onChange={handleProjectChange}
                      style={{ width: 200 }}
                    >
                      {projects.map((p) => (
                        <Select.Option key={p.id} value={p.id}>
                          {p.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <Table
                    dataSource={localEnvironments.filter(
                      (env) => !selectedProject || env.project === selectedProject
                    )}
                    columns={localColumns}
                    rowKey="id"
                    loading={loading}
                  />
                </>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={editingEnvironment ? '编辑环境' : '创建环境'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
        okText={editingEnvironment ? '更新' : '创建'}
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="环境名称"
            rules={[{ required: true, message: '请输入环境名称' }]}
          >
            <Input placeholder="请输入环境名称" />
          </Form.Item>

          <Form.Item name="scope" label="范围">
            <Radio.Group onChange={handleScopeChange}>
              <Radio value="GLOBAL">全局环境</Radio>
              <Radio value="LOCAL">本地环境</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.scope !== curr.scope}>
            {({ getFieldValue }) =>
              getFieldValue('scope') === 'LOCAL' && (
                <Form.Item
                  name="project"
                  label="关联项目"
                  rules={[{ required: true, message: '请选择关联项目' }]}
                >
                  <Select placeholder="请选择关联项目">
                    {projects.map((p) => (
                      <Select.Option key={p.id} value={p.id}>
                        {p.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item label="环境变量">
            <div>
              <div style={{ display: 'flex', background: '#f5f7fa', padding: '8px', fontWeight: 500, fontSize: 12, color: '#606266' }}>
                <div style={{ flex: 1 }}>变量名</div>
                <div style={{ flex: 1 }}>初始值</div>
                <div style={{ flex: 1 }}>当前值</div>
                <div style={{ width: 60 }}>操作</div>
              </div>
              <Form.List name="variables">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        style={{ display: 'flex', padding: '8px', borderBottom: '1px solid #f5f7fa' }}
                      >
                        <div style={{ flex: 1 }}>
                          <Form.Item {...restField} name={[name, 'key']} noStyle>
                            <Input placeholder="变量名" size="small" />
                          </Form.Item>
                        </div>
                        <div style={{ flex: 1 }}>
                          <Form.Item {...restField} name={[name, 'initialValue']} noStyle>
                            <Input placeholder="初始值" size="small" style={{ marginLeft: 8 }} />
                          </Form.Item>
                        </div>
                        <div style={{ flex: 1 }}>
                          <Form.Item {...restField} name={[name, 'currentValue']} noStyle>
                            <Input placeholder="当前值" size="small" style={{ marginLeft: 8 }} />
                          </Form.Item>
                        </div>
                        <div style={{ width: 60 }}>
                          <Button
                            type="link"
                            danger
                            size="small"
                            onClick={() => remove(name)}
                            disabled={fields.length <= 1}
                          >
                            删除
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()} block style={{ marginTop: 8 }}>
                      + 添加变量
                    </Button>
                  </>
                )}
              </Form.List>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="环境详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setViewModalVisible(false)}>关闭</Button>
            <Button
              type="primary"
              onClick={() => {
                setViewModalVisible(false);
                handleEdit(viewingEnvironment);
              }}
            >
              编辑
            </Button>
          </Space>
        }
      >
        {viewingEnvironment && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="环境名称">{viewingEnvironment.name}</Descriptions.Item>
            <Descriptions.Item label="范围">
              <Tag color={viewingEnvironment.scope === 'GLOBAL' ? 'blue' : 'green'}>
                {viewingEnvironment.scope === 'GLOBAL' ? '全局' : '本地'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={viewingEnvironment.is_active ? 'success' : 'default'}>
                {viewingEnvironment.is_active ? '已激活' : '未激活'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {viewingEnvironment.created_at
                ? new Date(viewingEnvironment.created_at).toLocaleString()
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
        {viewVariables.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4>环境变量</h4>
            <Table
              dataSource={viewVariables}
              rowKey="key"
              size="small"
              pagination={false}
              columns={[
                { title: '变量名', dataIndex: 'key', key: 'key' },
                { title: '初始值', dataIndex: 'initialValue', key: 'initialValue' },
                { title: '当前值', dataIndex: 'currentValue', key: 'currentValue' }
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EnvironmentManagement;