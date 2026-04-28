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
  DatePicker,
  Tag,
  message,
  Popconfirm,
  Descriptions
} from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getApiProjects,
  getUsers,
  createProject,
  updateProject,
  deleteProject
} from '../../services/api-testing';

const { TextArea } = Input;

const statusMap = {
  NOT_STARTED: { type: 'info', text: '未开始' },
  IN_PROGRESS: { type: 'warning', text: '进行中' },
  COMPLETED: { type: 'success', text: '已完成' }
};

const ProjectManagement = () => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await getApiProjects({
        page: pagination.current,
        page_size: pagination.pageSize
      });
      setProjects(response.data?.results || response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.count || 0
      }));
    } catch (error) {
      message.error('加载项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleTableChange = (paginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }));
    loadProjects();
  };

  const handleCreate = () => {
    setEditingProject(null);
    form.resetFields();
    form.setFieldsValue({
      project_type: 'HTTP',
      status: 'NOT_STARTED'
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingProject(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      project_type: record.project_type,
      status: record.status,
      owner: record.owner?.id,
      member_ids: record.members?.map((m) => m.id) || [],
      start_date: record.start_date ? dayjs(record.start_date) : null,
      end_date: record.end_date ? dayjs(record.end_date) : null
    });
    setModalVisible(true);
  };

  const handleView = (record) => {
    setViewingProject(record);
    setViewModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await deleteProject(record.id);
      message.success('删除成功');
      loadProjects();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        start_date: values.start_date?.format('YYYY-MM-DD'),
        end_date: values.end_date?.format('YYYY-MM-DD')
      };

      if (editingProject) {
        await updateProject(editingProject.id, data);
        message.success('更新成功');
      } else {
        await createProject(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadProjects();
    } catch (error) {
      message.error(editingProject ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '项目类型',
      dataIndex: 'project_type',
      key: 'project_type',
      width: 120,
      render: (type) => (
        <Tag color={type === 'HTTP' ? 'blue' : 'green'}>{type}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const item = statusMap[status] || { type: 'info', text: status };
        return <Tag color={item.type}>{item.text}</Tag>;
      }
    },
    {
      title: '负责人',
      dataIndex: ['owner', 'username'],
      key: 'owner',
      width: 150
    },
    {
      title: '开始日期',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 120
    },
    {
      title: '结束日期',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 120
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除项目「${record.name}」吗？`}
            onConfirm={() => handleDelete(record)}
            okText="确认"
            cancelText="取消"
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
        title={<h2 style={{ margin: 0 }}>项目管理</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建项目
          </Button>
        }
      >
        <Table
          dataSource={projects}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingProject ? '编辑项目' : '创建项目'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText={editingProject ? '更新' : '创建'}
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item name="description" label="项目描述">
            <TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>

          <Form.Item name="project_type" label="项目类型">
            <Select>
              <Select.Option value="HTTP">HTTP</Select.Option>
              <Select.Option value="WEBSOCKET">WebSocket</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="项目状态">
            <Select>
              <Select.Option value="NOT_STARTED">未开始</Select.Option>
              <Select.Option value="IN_PROGRESS">进行中</Select.Option>
              <Select.Option value="COMPLETED">已完成</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="owner"
            label="负责人"
            rules={[{ required: true, message: '请选择负责人' }]}
          >
            <Select placeholder="请选择负责人" showSearch filterOption={(input, option) =>
              option.children.props.children.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }>
              {users.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="member_ids" label="团队成员">
            <Select mode="multiple" placeholder="请选择团队成员">
              {users.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="start_date" label="开始日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="end_date" label="结束日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="项目详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setViewModalVisible(false)}>关闭</Button>
            <Button
              type="primary"
              onClick={() => {
                setViewModalVisible(false);
                handleEdit(viewingProject);
              }}
            >
              编辑
            </Button>
          </Space>
        }
      >
        {viewingProject && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="项目名称">{viewingProject.name}</Descriptions.Item>
            <Descriptions.Item label="项目描述">
              {viewingProject.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="项目类型">
              <Tag color={viewingProject.project_type === 'HTTP' ? 'blue' : 'green'}>
                {viewingProject.project_type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="项目状态">
              <Tag color={statusMap[viewingProject.status]?.type}>
                {statusMap[viewingProject.status]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="负责人">
              {viewingProject.owner?.username}
            </Descriptions.Item>
            <Descriptions.Item label="团队成员">
              {viewingProject.members?.length > 0 ? (
                viewingProject.members.map((m) => (
                  <Tag key={m.id} style={{ marginRight: 5 }}>
                    {m.username}
                  </Tag>
                ))
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="开始日期">
              {viewingProject.start_date || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="结束日期">
              {viewingProject.end_date || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {viewingProject.created_at
                ? dayjs(viewingProject.created_at).format('YYYY-MM-DD HH:mm')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {viewingProject.updated_at
                ? dayjs(viewingProject.updated_at).format('YYYY-MM-DD HH:mm')
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ProjectManagement;