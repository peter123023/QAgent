import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Select,
  Tag,
  message,
  Modal,
  Form,
  Input,
  Popconfirm,
  Pagination
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 弹框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const statusOptions = [
    { label: '全部', value: '' },
    { label: '活跃', value: 'active' },
    { label: '暂停', value: 'paused' },
    { label: '已完成', value: 'completed' },
    { label: '已归档', value: 'archived' }
  ];

  const statusColorMap = {
    active: 'success',
    paused: 'warning',
    completed: 'processing',
    archived: 'default'
  };

  const statusTextMap = {
    active: '活跃',
    paused: '暂停',
    completed: '已完成',
    archived: '已归档'
  };

  // 加载项目列表
  const loadProjects = async (page = 1, pageSize = 20, search = searchText, status = statusFilter) => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await api.get('/projects/', { params });
      setProjects(response.data.results || []);
      setPagination({
        current: page,
        pageSize,
        total: response.data.count || 0
      });
    } catch (error) {
      message.error('加载项目列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 创建项目
  const handleCreate = () => {
    setIsEdit(false);
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑项目
  const handleEdit = (project) => {
    setIsEdit(true);
    setEditingId(project.id);
    form.setFieldsValue({
      name: project.name,
      description: project.description,
      status: project.status
    });
    setModalVisible(true);
  };

  // 保存项目
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEdit) {
        await api.put(`/projects/${editingId}/`, values);
        message.success('更新成功');
      } else {
        await api.post('/projects/', values);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      loadProjects(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
      console.error(error);
    }
  };

  // 删除项目
  const handleDelete = async (project) => {
    try {
      await api.delete(`/projects/${project.id}/`);
      message.success('删除成功');
      loadProjects(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      minWidth: 200
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      minWidth: 300,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={statusColorMap[status] || 'default'}>
          {statusTextMap[status] || status}
        </Tag>
      )
    },
    {
      title: '负责人',
      dataIndex: ['owner', 'username'],
      key: 'owner',
      width: 120
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => formatDate(date)
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个项目吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>项目管理</h2>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={handleCreate}
          >
            新建项目
          </Button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Space size="middle">
            <Input
              style={{ width: 250 }}
              placeholder="搜索项目名称"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                loadProjects(1, pagination.pageSize, e.target.value);
              }}
              allowClear
            />
            <Select
              style={{ width: 150 }}
              placeholder="状态筛选"
              allowClear
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                loadProjects(1, pagination.pageSize, searchText, value);
              }}
              options={statusOptions.filter(opt => opt.value !== '')}
            />
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={projects}
          loading={loading}
          rowKey="id"
          pagination={false}
        />

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
            onChange={(page, pageSize) => loadProjects(page, pageSize)}
          />
        </div>
      </Card>

      {/* 创建/编辑项目弹框 */}
      <Modal
        title={isEdit ? '编辑项目' : '创建项目'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="项目名称"
            name="name"
            rules={[
              { required: true, message: '请输入项目名称' },
              { min: 2, max: 200, message: '项目名称长度在 2 到 200 个字符之间' }
            ]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item
            label="项目描述"
            name="description"
          >
            <TextArea rows={4} placeholder="请输入项目描述" />
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
            initialValue="active"
          >
            <Select placeholder="请选择状态">
              {statusOptions.filter(opt => opt.value !== '').map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Projects;
