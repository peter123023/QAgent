import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Tag,
  message,
  Select,
  DatePicker,
  Typography,
  Popconfirm,
  Descriptions,
  Tabs,
  Empty
} from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getRequestHistory,
  deleteRequestHistory,
  batchDeleteRequestHistory,
  retryRequest,
  getApiRequests,
  getEnvironments,
  getTestSuites
} from '../../services/api-testing';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const statusColors = {
  SUCCESS: 'success',
  FAILED: 'error',
  ERROR: 'error',
  PENDING: 'warning'
};

const RequestHistory = () => {
  const [loading, setLoading] = useState(false);
  const [histories, setHistories] = useState([]);
  const [requests, setRequests] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    request: null,
    status: null,
    dateRange: null
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    loadHistories();
    loadRequests();
    loadEnvironments();
  }, []);

  const loadHistories = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ordering: '-created_at'
      };

      if (filters.request) params.request = filters.request;
      if (filters.status) params.status = filters.status;
      if (filters.dateRange) {
        params.start_date = filters.dateRange[0].format('YYYY-MM-DD');
        params.end_date = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await getRequestHistory(params);
      setHistories(response.data?.results || response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.count || 0
      }));
    } catch (error) {
      message.error('加载历史记录失败');
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

  const handleTableChange = (paginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }));
    loadHistories();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadHistories();
  };

  const handleReset = () => {
    setFilters({ request: null, status: null, dateRange: null });
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadHistories();
  };

  const handleViewDetail = (record) => {
    setSelectedHistory(record);
    setDetailModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await deleteRequestHistory(record.id);
      message.success('删除成功');
      loadHistories();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    try {
      await batchDeleteRequestHistory(selectedRowKeys);
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      loadHistories();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleRetry = async (record) => {
    try {
      await retryRequest(record.id, record.environment);
      message.success('重试成功');
      loadHistories();
    } catch (error) {
      message.error('重试失败');
    }
  };

  const formatTime = (time) => {
    if (!time) return '-';
    return `${(time / 1000).toFixed(0)}秒`;
  };

  const columns = [
    {
      title: '请求名称',
      dataIndex: 'request_name',
      key: 'request_name',
      width: 200,
      ellipsis: true
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
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: 200,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={statusColors[status] || 'default'}>
          {status === 'SUCCESS' ? '成功' : status === 'FAILED' ? '失败' : status === 'ERROR' ? '错误' : status}
        </Tag>
      )
    },
    {
      title: '响应状态码',
      dataIndex: 'status_code',
      key: 'status_code',
      width: 120,
      render: (code) => {
        if (!code) return '-';
        const color = code >= 200 && code < 300 ? 'success' : code >= 300 && code < 400 ? 'warning' : 'error';
        return <Tag color={color}>{code}</Tag>;
      }
    },
    {
      title: '响应时间',
      dataIndex: 'response_time',
      key: 'response_time',
      width: 100,
      render: (time) => formatTime(time)
    },
    {
      title: '执行环境',
      dataIndex: 'environment_name',
      key: 'environment_name',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: '执行时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => handleRetry(record)}>
            重试
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这条记录吗？"
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

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Select
              placeholder="选择请求"
              value={filters.request}
              onChange={(val) => handleFilterChange('request', val)}
              onClear={() => handleFilterChange('request', null)}
              allowClear
              style={{ width: 180 }}
            >
              {requests.map((r) => (
                <Option key={r.id} value={r.id}>
                  {r.name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="执行状态"
              value={filters.status}
              onChange={(val) => handleFilterChange('status', val)}
              onClear={() => handleFilterChange('status', null)}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="SUCCESS">成功</Option>
              <Option value="FAILED">失败</Option>
              <Option value="ERROR">错误</Option>
            </Select>

            <RangePicker
              value={filters.dateRange}
              onChange={(val) => handleFilterChange('dateRange', val)}
            />

            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>

            <div style={{ marginLeft: 'auto' }}>
              <Popconfirm
                title="确认批量删除"
                description={`确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`}
                onConfirm={handleBatchDelete}
                disabled={selectedRowKeys.length === 0}
              >
                <Button danger disabled={selectedRowKeys.length === 0} icon={<DeleteOutlined />}>
                  批量删除
                </Button>
              </Popconfirm>
            </div>
          </Space>
        </div>

        <Table
          dataSource={histories}
          columns={columns}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title="历史详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setDetailModalVisible(false)}>关闭</Button>
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => {
              setDetailModalVisible(false);
              handleRetry(selectedHistory);
            }}>
              重试
            </Button>
          </Space>
        }
        width={900}
      >
        {selectedHistory && (
          <Tabs
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="请求名称" span={2}>
                      {selectedHistory.request_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="请求方法">
                      <Tag color={selectedHistory.method === 'GET' ? 'green' : 'blue'}>
                        {selectedHistory.method}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="URL">
                      <Text copyable style={{ wordBreak: 'break-all' }}>
                        {selectedHistory.url}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Tag color={statusColors[selectedHistory.status]}>
                        {selectedHistory.status === 'SUCCESS' ? '成功' : selectedHistory.status === 'FAILED' ? '失败' : selectedHistory.status}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="响应状态码">
                      {selectedHistory.status_code || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="响应时间">
                      {formatTime(selectedHistory.response_time)}
                    </Descriptions.Item>
                    <Descriptions.Item label="执行环境">
                      {selectedHistory.environment_name || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="执行时间">
                      {selectedHistory.created_at ? dayjs(selectedHistory.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </Descriptions.Item>
                  </Descriptions>
                )
              },
              {
                key: 'request',
                label: '请求信息',
                children: (
                  <div>
                    <Text strong>请求头：</Text>
                    <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
                      {JSON.stringify(selectedHistory.request_headers || {}, null, 2)}
                    </pre>
                    <Text strong style={{ marginTop: '12px', display: 'block' }}>请求参数：</Text>
                    <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
                      {JSON.stringify(selectedHistory.request_params || {}, null, 2)}
                    </pre>
                    <Text strong style={{ marginTop: '12px', display: 'block' }}>请求体：</Text>
                    <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
                      {selectedHistory.request_body || '-'}
                    </pre>
                  </div>
                )
              },
              {
                key: 'response',
                label: '响应信息',
                children: (
                  <div>
                    <Text strong>响应头：</Text>
                    <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
                      {JSON.stringify(selectedHistory.response_headers || {}, null, 2)}
                    </pre>
                    <Text strong style={{ marginTop: '12px', display: 'block' }}>响应体：</Text>
                    <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto', maxHeight: '400px' }}>
                      {selectedHistory.response_body || '-'}
                    </pre>
                  </div>
                )
              }
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default RequestHistory;