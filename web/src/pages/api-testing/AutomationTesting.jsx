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
  Tag,
  message,
  Tabs,
  Tree,
  Typography,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Descriptions,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FolderOutlined,
  FileOutlined,
  ReloadOutlined,
  SyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getTestSuites,
  getTestSuiteDetail,
  createTestSuite,
  updateTestSuite,
  deleteTestSuite,
  executeTestSuite,
  getApiRequests,
  getEnvironments,
  getTestExecutions
} from '../../services/api-testing';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { DirectoryTree } = Tree;

const statusMap = {
  PENDING: { color: 'default', text: '等待中', icon: <SyncOutlined spin /> },
  RUNNING: { color: 'processing', text: '运行中', icon: <SyncOutlined spin /> },
  SUCCESS: { color: 'success', text: '成功', icon: <CheckCircleOutlined /> },
  FAILED: { color: 'error', text: '失败', icon: <CloseCircleOutlined /> },
  ERROR: { color: 'error', text: '错误', icon: <CloseCircleOutlined /> }
};

const AutomationTesting = () => {
  const [loading, setLoading] = useState(false);
  const [suites, setSuites] = useState([]);
  const [requests, setRequests] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [suiteDetail, setSuiteDetail] = useState(null);
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingSuite, setEditingSuite] = useState(null);
  const [executingSuite, setExecutingSuite] = useState(null);
  const [suiteForm] = Form.useForm();
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);

  useEffect(() => {
    loadSuites();
    loadRequests();
    loadEnvironments();
    loadRecentExecutions();
  }, []);

  const loadSuites = async () => {
    setLoading(true);
    try {
      const response = await getTestSuites();
      setSuites(response.data?.results || response.data || []);
    } catch (error) {
      message.error('加载测试套件失败');
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await getApiRequests();
      setRequests(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const loadEnvironments = async () => {
    try {
      const response = await getEnvironments();
      setEnvironments(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Failed to load environments:', error);
    }
  };

  const loadRecentExecutions = async () => {
    try {
      const response = await getTestExecutions({ page_size: 5, ordering: '-created_at' });
      setRecentExecutions(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Failed to load recent executions:', error);
    }
  };

  const loadSuiteDetail = async (suiteId) => {
    try {
      const response = await getTestSuiteDetail(suiteId);
      setSuiteDetail(response.data);
      setSelectedRequests(
        response.data.requests?.map((r) => ({
          id: r.id,
          name: r.name,
          method: r.method
        })) || []
      );
    } catch (error) {
      message.error('加载测试套件详情失败');
    }
  };

  const handleCreate = () => {
    setEditingSuite(null);
    suiteForm.resetFields();
    suiteForm.setFieldsValue({ request_ids: [] });
    setSelectedRequests([]);
    setModalVisible(true);
  };

  const handleEdit = async (record) => {
    setEditingSuite(record);
    await loadSuiteDetail(record.id);
    suiteForm.setFieldsValue({
      name: record.name,
      description: record.description,
      project: record.project,
      request_ids: suiteDetail?.requests?.map((r) => r.id) || []
    });
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await deleteTestSuite(record.id);
      message.success('删除成功');
      loadSuites();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleExecute = async (record) => {
    setExecutingSuite(record.id);
    try {
      await executeTestSuite(record.id, { environment_id: null });
      message.success('测试执行已启动');
      loadRecentExecutions();
    } catch (error) {
      message.error('执行失败');
    } finally {
      setExecutingSuite(null);
    }
  };

  const handleViewDetail = async (record) => {
    setSelectedSuite(record);
    await loadSuiteDetail(record.id);
    setDetailModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await suiteForm.validateFields();
      const data = {
        name: values.name,
        description: values.description,
        project: values.project,
        request_ids: values.request_ids || []
      };

      if (editingSuite) {
        await updateTestSuite(editingSuite.id, data);
        message.success('更新成功');
      } else {
        await createTestSuite(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadSuites();
    } catch (error) {
      message.error(editingSuite ? '更新失败' : '创建失败');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return '#52c41a';
      case 'FAILED':
      case 'ERROR':
        return '#ff4d4f';
      case 'RUNNING':
        return '#1890ff';
      default:
        return '#d9d9d9';
    }
  };

  const columns = [
    {
      title: '套件名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '关联项目',
      dataIndex: 'project_name',
      key: 'project_name',
      width: 150,
      render: (text) => text || '-'
    },
    {
      title: '接口数量',
      dataIndex: 'request_count',
      key: 'request_count',
      width: 100,
      render: (count) => count ?? '-'
    },
    {
      title: '创建者',
      dataIndex: ['created_by', 'username'],
      key: 'created_by',
      width: 120,
      render: (text) => text || '-'
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
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleExecute(record)}
            loading={executingSuite === record.id}
          >
            执行
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<FileOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除测试套件「${record.name}」吗？`}
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

  const requestColumns = [
    {
      title: '接口名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
      width: 100,
      render: (method) => (
        <Tag color={method === 'GET' ? 'green' : method === 'POST' ? 'blue' : 'orange'}>
          {method}
        </Tag>
      )
    }
  ];

  const executionColumns = [
    {
      title: '执行名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const item = statusMap[status] || { color: 'default', text: status };
        return <Tag color={item.color}>{item.text}</Tag>;
      }
    },
    {
      title: '通过率',
      dataIndex: 'pass_rate',
      key: 'pass_rate',
      width: 100,
      render: (rate) => rate !== null && rate !== undefined ? `${rate.toFixed(1)}%` : '-'
    },
    {
      title: '执行时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-')
    }
  ];

  const projects = [...new Set(suites.map((s) => s.project).filter(Boolean))];

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[20, 20]} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="测试套件"
              value={suites.length}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="接口总数"
              value={suites.reduce((sum, s) => sum + (s.request_count || 0), 0)}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日执行"
              value={recentExecutions.filter((e) => dayjs(e.created_at).isSame(dayjs(), 'day')).length}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功率"
              value={
                recentExecutions.length > 0
                  ? (
                      (recentExecutions.filter((e) => e.status === 'SUCCESS').length /
                        recentExecutions.length) *
                      100
                    ).toFixed(1)
                  : 0
              }
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={<h2 style={{ margin: 0 }}>测试套件</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建套件
          </Button>
        }
      >
        <Table
          dataSource={suites}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Card title="最近执行记录" style={{ marginTop: '20px' }}>
        <Table
          dataSource={recentExecutions}
          columns={executionColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      <Modal
        title={editingSuite ? '编辑测试套件' : '创建测试套件'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
        okText={editingSuite ? '更新' : '创建'}
        cancelText="取消"
      >
        <Form form={suiteForm} layout="vertical">
          <Form.Item
            name="name"
            label="套件名称"
            rules={[{ required: true, message: '请输入套件名称' }]}
          >
            <Input placeholder="请输入套件名称" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item
            name="request_ids"
            label="选择接口"
            rules={[{ required: true, message: '请选择至少一个接口' }]}
          >
            <Select mode="multiple" placeholder="请选择接口" style={{ width: '100%' }}>
              {requests.map((r) => (
                <Option key={r.id} value={r.id}>
                  <Tag color={r.method === 'GET' ? 'green' : 'blue'} style={{ marginRight: 8 }}>
                    {r.method}
                  </Tag>
                  {r.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`测试套件详情 - ${selectedSuite?.name || ''}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setDetailModalVisible(false)}>关闭</Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                setDetailModalVisible(false);
                handleExecute(selectedSuite);
              }}
            >
              执行套件
            </Button>
          </Space>
        }
        width={800}
      >
        {suiteDetail && (
          <Tabs
            items={[
              {
                key: 'info',
                label: '基本信息',
                children: (
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="套件名称" span={2}>
                      {suiteDetail.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="描述" span={2}>
                      {suiteDetail.description || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="创建者">
                      {suiteDetail.created_by?.username || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">
                      {suiteDetail.created_at ? dayjs(suiteDetail.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </Descriptions.Item>
                  </Descriptions>
                )
              },
              {
                key: 'requests',
                label: `接口列表 (${selectedRequests.length})`,
                children: (
                  <Table
                    dataSource={selectedRequests}
                    columns={requestColumns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                )
              }
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default AutomationTesting;