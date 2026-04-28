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
  Checkbox,
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

const Versions = () => {
  const [versions, setVersions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [baselineFilter, setBaselineFilter] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 弹框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // 加载版本列表
  const loadVersions = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      if (searchText) params.search = searchText;
      if (projectFilter) params.projects = projectFilter;
      if (baselineFilter !== '') params.is_baseline = baselineFilter;

      const response = await api.get('/versions/', { params });
      setVersions(response.data.results || []);
      setPagination({
        current: page,
        pageSize,
        total: response.data.count || 0
      });
    } catch (error) {
      message.error('加载版本列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 加载项目列表
  const loadProjects = async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(response.data.results || response.data || []);
    } catch (error) {
      console.error('加载项目列表失败', error);
    }
  };

  useEffect(() => {
    loadVersions();
    loadProjects();
  }, []);

  // 获取项目名称
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : '';
  };

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

  // 创建版本
  const handleCreate = () => {
    setIsEdit(false);
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑版本
  const handleEdit = (version) => {
    setIsEdit(true);
    setEditingId(version.id);
    form.setFieldsValue({
      name: version.name,
      description: version.description,
      project_ids: version.projects ? version.projects.map(p => p.id) : [],
      is_baseline: version.is_baseline
    });
    setModalVisible(true);
  };

  // 保存版本
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEdit) {
        await api.put(`/versions/${editingId}/`, values);
        message.success('更新成功');
      } else {
        await api.post('/versions/', values);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      loadVersions(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
      console.error(error);
    }
  };

  // 删除版本
  const handleDelete = async (version) => {
    try {
      await api.delete(`/versions/${version.id}/`);
      message.success('删除成功');
      loadVersions(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  const columns = [
    {
      title: '版本名称',
      dataIndex: 'name',
      key: 'name',
      minWidth: 150,
      render: (name, record) => (
        <Space>
          <span>{name}</span>
          {record.is_baseline && <Tag color="warning" size="small">基准版本</Tag>}
        </Space>
      )
    },
    {
      title: '关联项目',
      dataIndex: 'projects',
      key: 'projects',
      width: 300,
      render: (projects) => {
        if (!projects || projects.length === 0) return <span style={{ color: '#999' }}>无</span>;
        return (
          <Space wrap>
            {projects.slice(0, 2).map(project => (
              <Tag key={project.id} color="blue" size="small">{project.name}</Tag>
            ))}
            {projects.length > 2 && (
              <Tag color="default" size="small">+{projects.length - 2}</Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      minWidth: 200,
      ellipsis: true
    },
    {
      title: '测试用例数',
      dataIndex: 'testcases_count',
      key: 'testcases_count',
      width: 120,
      render: (count) => <Tag color="blue">{count}</Tag>
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
            title="确定要删除这个版本吗？"
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

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  };

  return (
    <div style={{ padding: 20 }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>版本管理</h2>
          <Space>
            {selectedRowKeys.length > 0 && (
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => {
                  message.warning('批量删除功能待实现');
                }}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={handleCreate}
            >
              新建版本
            </Button>
          </Space>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Space size="middle">
            <Input
              style={{ width: 250 }}
              placeholder="搜索版本名称"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                if (!e.target.value) loadVersions(1, pagination.pageSize);
              }}
              onPressEnter={() => loadVersions(1, pagination.pageSize)}
              allowClear
            />
            <Select
              style={{ width: 180 }}
              placeholder="关联项目"
              allowClear
              value={projectFilter}
              onChange={(value) => {
                setProjectFilter(value);
                loadVersions(1, pagination.pageSize);
              }}
            >
              {projects.map(project => (
                <Option key={project.id} value={project.id}>{project.name}</Option>
              ))}
            </Select>
            <Select
              style={{ width: 150 }}
              placeholder="版本类型"
              allowClear
              value={baselineFilter}
              onChange={(value) => {
                setBaselineFilter(value);
                loadVersions(1, pagination.pageSize);
              }}
            >
              <Option value={true}>基准版本</Option>
              <Option value={false}>普通版本</Option>
            </Select>
          </Space>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={versions}
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
            onChange={(page, pageSize) => loadVersions(page, pageSize)}
          />
        </div>
      </Card>

      {/* 创建/编辑版本弹框 */}
      <Modal
        title={isEdit ? '编辑版本' : '创建版本'}
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
            label="版本名称"
            name="name"
            rules={[{ required: true, message: '请输入版本名称' }]}
          >
            <Input placeholder="请输入版本名称" />
          </Form.Item>
          <Form.Item
            label="关联项目"
            name="project_ids"
            rules={[{ required: true, message: '请选择关联项目' }]}
          >
            <Select
              placeholder="请选择关联项目"
              mode="multiple"
              style={{ width: '100%' }}
            >
              {projects.map(project => (
                <Option key={project.id} value={project.id}>{project.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="版本描述"
            name="description"
          >
            <TextArea rows={3} placeholder="请输入版本描述" />
          </Form.Item>
          <Form.Item
            name="is_baseline"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>设为基准版本</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Versions;
