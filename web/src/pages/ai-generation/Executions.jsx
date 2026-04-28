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

const Executions = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [testSuites, setTestSuites] = useState([]);

  // 弹框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const statusColorMap = {
    pending: 'default',
    running: 'processing',
    completed: 'success',
    failed: 'error',
    cancelled: 'warning'
  };

  const statusTextMap = {
    pending: '待执行',
    running: '执行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  };

  // 加载测试执行列表
    const loadExecutions = async (page = 1, pageSize = 20) => {
        setLoading(true);
        try {
            const response = await api.get('/executions/plans/', { params: { page, page_size: pageSize } });
            // 转换数据到我们需要的格式
            const plans = response.data.results || [];
            setExecutions(plans.map(plan => ({
                ...plan,
                status: 'pending', // 设置默认状态
                testsuite: null,
                pass_count: 0,
                fail_count: 0,
                execution_count: 0,
                author: plan.creator
            })));
            setPagination({
                current: page,
                pageSize,
                total: response.data.count || 0
            });
        } catch (error) {
            message.error('加载测试执行列表失败');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

  // 加载测试套件列表
  const loadTestSuites = async () => {
    try {
      const response = await api.get('/testsuites/');
      setTestSuites(response.data.results || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadExecutions();
    loadTestSuites();
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

  // 创建测试执行
  const handleCreate = () => {
    setIsEdit(false);
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑测试执行
  const handleEdit = (execution) => {
    setIsEdit(true);
    setEditingId(execution.id);
    form.setFieldsValue({
      name: execution.name,
      description: execution.description,
      testsuite: execution.testsuite?.id
    });
    setModalVisible(true);
  };

  // 保存测试执行
    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            
            if (isEdit) {
                await api.put(`/executions/plans/${editingId}/`, values);
                message.success('更新成功');
            } else {
                await api.post('/executions/plans/', values);
                message.success('创建成功');
            }
            
            setModalVisible(false);
            loadExecutions(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error(isEdit ? '更新失败' : '创建失败');
            console.error(error);
        }
    };

  // 删除测试执行
    const handleDelete = async (execution) => {
        try {
            await api.delete(`/executions/plans/${execution.id}/`);
            message.success('删除成功');
            loadExecutions(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('删除失败');
            console.error(error);
        }
    };

  const columns = [
    {
      title: '执行名称',
      dataIndex: 'name',
      key: 'name',
      minWidth: 200
    },
    {
      title: '测试套件',
      dataIndex: ['testsuite', 'name'],
      key: 'testsuite',
      minWidth: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={statusColorMap[status] || 'default'}>
          {statusTextMap[status] || status}
        </Tag>
      )
    },
    {
      title: '通过数',
      dataIndex: 'pass_count',
      key: 'pass_count',
      width: 100,
      render: (count) => <Tag color="success">{count}</Tag>
    },
    {
      title: '失败数',
      dataIndex: 'fail_count',
      key: 'fail_count',
      width: 100,
      render: (count) => <Tag color="error">{count}</Tag>
    },
    {
      title: '执行时间',
      dataIndex: 'duration',
      key: 'duration',
      width: 120
    },
    {
      title: '执行时间',
      dataIndex: 'executed_at',
      key: 'executed_at',
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
            title="确定要删除这个测试执行吗？"
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
          <h2 style={{ margin: 0 }}>测试计划</h2>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={handleCreate}
          >
            新建计划
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={executions}
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
            onChange={(page, pageSize) => loadExecutions(page, pageSize)}
          />
        </div>
      </Card>

      {/* 创建/编辑测试执行弹框 */}
      <Modal
        title={isEdit ? '编辑测试计划' : '创建测试计划'}
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
            label="计划名称"
            name="name"
            rules={[
              { required: true, message: '请输入计划名称' },
              { min: 2, max: 200, message: '计划名称长度在 2 到 200 个字符之间' }
            ]}
          >
            <Input placeholder="请输入计划名称" />
          </Form.Item>
          <Form.Item
            label="计划描述"
            name="description"
          >
            <TextArea rows={4} placeholder="请输入计划描述" />
          </Form.Item>
          <Form.Item
            label="测试套件"
            name="testsuite"
            rules={[{ required: true, message: '请选择测试套件' }]}
          >
            <Select placeholder="请选择测试套件">
              {testSuites.map(suite => (
                <Option key={suite.id} value={suite.id}>{suite.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Executions;
