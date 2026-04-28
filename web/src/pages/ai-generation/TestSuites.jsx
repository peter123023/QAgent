import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Popconfirm,
  Pagination,
  Modal,
  Form,
  Input,
  Select
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const TestSuites = () => {
  const [suites, setSuites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [projects, setProjects] = useState([]);

  // 弹框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // 加载测试套件列表
  const loadSuites = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const response = await api.get('/testsuites/', { params: { page, page_size: pageSize } });
      setSuites(response.data.results || []);
      setPagination({
        current: page,
        pageSize,
        total: response.data.count || 0
      });
    } catch (error) {
      message.error('加载测试套件列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 加载项目列表
  const loadProjects = async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(response.data.results || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadSuites();
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

  // 创建测试套件
  const handleCreate = () => {
    setIsEdit(false);
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑测试套件
  const handleEdit = (suite) => {
    setIsEdit(true);
    setEditingId(suite.id);
    form.setFieldsValue({
      name: suite.name,
      description: suite.description,
      project: suite.project?.id
    });
    setModalVisible(true);
  };

  // 保存测试套件
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEdit) {
        await api.put(`/testsuites/${editingId}/`, values);
        message.success('更新成功');
      } else {
        await api.post('/testsuites/', values);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      loadSuites(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
      console.error(error);
    }
  };

  // 删除测试套件
  const handleDelete = async (suite) => {
    try {
      await api.delete(`/testsuites/${suite.id}/`);
      message.success('删除成功');
      loadSuites(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  const columns = [
    {
      title: '套件名称',
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
      title: '测试用例数',
      dataIndex: 'testcases_count',
      key: 'testcases_count',
      width: 120,
      render: (count) => <Tag color="blue">{count}</Tag>
    },
    {
      title: '项目',
      dataIndex: ['project', 'name'],
      key: 'project',
      width: 150
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
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => message.info('查看详情功能待实现')}
          >
            查看
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个测试套件吗？"
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
          <h2 style={{ margin: 0 }}>测试套件</h2>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={handleCreate}
          >
            新建套件
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={suites}
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
            onChange={(page, pageSize) => loadSuites(page, pageSize)}
          />
        </div>
      </Card>

      {/* 创建/编辑测试套件弹框 */}
      <Modal
        title={isEdit ? '编辑测试套件' : '创建测试套件'}
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
            label="套件名称"
            name="name"
            rules={[
              { required: true, message: '请输入套件名称' },
              { min: 2, max: 200, message: '套件名称长度在 2 到 200 个字符之间' }
            ]}
          >
            <Input placeholder="请输入套件名称" />
          </Form.Item>
          <Form.Item
            label="套件描述"
            name="description"
          >
            <TextArea rows={4} placeholder="请输入套件描述" />
          </Form.Item>
          <Form.Item
            label="所属项目"
            name="project"
            rules={[{ required: true, message: '请选择项目' }]}
          >
            <Select placeholder="请选择项目">
              {projects.map(project => (
                <Option key={project.id} value={project.id}>{project.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TestSuites;
