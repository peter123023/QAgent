import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Tag,
  message,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Typography,
  Divider,
  Descriptions,
  Empty
} from 'antd';
import {
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getTestExecutions,
  generateAllureReport,
  getTestSuites,
  getApiProjects
} from '../../services/api-testing';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const statusMap = {
  PENDING: { color: 'default', text: '等待中', icon: <SyncOutlined spin /> },
  RUNNING: { color: 'processing', text: '运行中', icon: <SyncOutlined spin /> },
  SUCCESS: { color: 'success', text: '成功', icon: <CheckCircleOutlined /> },
  FAILED: { color: 'error', text: '失败', icon: <CloseCircleOutlined /> },
  ERROR: { color: 'error', text: '错误', icon: <ExclamationCircleOutlined /> }
};

const ReportView = () => {
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [executions, setExecutions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [suites, setSuites] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    project: null,
    suite: null,
    status: null,
    dateRange: null
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  useEffect(() => {
    loadExecutions();
    loadProjects();
    loadSuites();
  }, []);

  const loadExecutions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ordering: '-created_at'
      };

      if (filters.project) params.project = filters.project;
      if (filters.suite) params.test_suite = filters.suite;
      if (filters.status) params.status = filters.status;
      if (filters.dateRange) {
        params.start_date = filters.dateRange[0].format('YYYY-MM-DD');
        params.end_date = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await getTestExecutions(params);
      setExecutions(response.data?.results || response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.count || 0
      }));
    } catch (error) {
      message.error('加载报告列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await getApiProjects();
      setProjects(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadSuites = async () => {
    try {
      const response = await getTestSuites();
      setSuites(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Failed to load suites:', error);
    }
  };

  const handleTableChange = (paginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }));
    loadExecutions();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadExecutions();
  };

  const handleReset = () => {
    setFilters({ project: null, suite: null, status: null, dateRange: null });
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadExecutions();
  };

  const handleViewDetail = (record) => {
    setSelectedExecution(record);
    setDetailModalVisible(true);
  };

  const handleViewReport = async (record) => {
    if (record.allure_report_url) {
      setSelectedExecution(record);
      setReportModalVisible(true);
    } else {
      message.info('正在生成报告，请稍候...');
      setReportLoading(true);
      try {
        await generateAllureReport(record.id);
        message.success('报告生成成功');
        loadExecutions();
      } catch (error) {
        message.error('报告生成失败');
      } finally {
        setReportLoading(false);
      }
    }
  };

  const getSummaryStats = () => {
    const stats = {
      total: executions.length,
      success: 0,
      failed: 0,
      running: 0
    };

    executions.forEach((exec) => {
      if (exec.status === 'SUCCESS') stats.success++;
      else if (exec.status === 'FAILED' || exec.status === 'ERROR') stats.failed++;
      else if (exec.status === 'RUNNING') stats.running++;
    });

    return stats;
  };

  const columns = [
    {
      title: '执行名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '关联项目',
      dataIndex: 'project_name',
      key: 'project_name',
      width: 150
    },
    {
      title: '测试套件',
      dataIndex: 'test_suite_name',
      key: 'test_suite_name',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const item = statusMap[status] || { color: 'default', text: status, icon: null };
        return (
          <Tag color={item.color} icon={item.icon}>
            {item.text}
          </Tag>
        );
      }
    },
    {
      title: '总用例',
      dataIndex: 'total_cases',
      key: 'total_cases',
      width: 80,
      render: (val) => val ?? '-'
    },
    {
      title: '通过',
      dataIndex: 'passed_cases',
      key: 'passed_cases',
      width: 80,
      render: (val) => <Text type="success">{val ?? '-'}</Text>
    },
    {
      title: '失败',
      dataIndex: 'failed_cases',
      key: 'failed_cases',
      width: 80,
      render: (val) => <Text type="danger">{val ?? '-'}</Text>
    },
    {
      title: '通过率',
      dataIndex: 'pass_rate',
      key: 'pass_rate',
      width: 100,
      render: (rate) => {
        if (rate === null || rate === undefined) return '-';
        const color = rate >= 80 ? 'success' : rate >= 60 ? 'warning' : 'danger';
        return <Text type={color}>{rate.toFixed(2)}%</Text>;
      }
    },
    {
      title: '执行时间',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (duration) => {
        if (!duration) return '-';
        const seconds = Math.floor(duration / 1000);
        if (seconds < 60) return `${seconds}秒`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}分${remainingSeconds}秒`;
      }
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
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<LineChartOutlined />}
            onClick={() => handleViewReport(record)}
            loading={reportLoading && selectedExecution?.id === record.id}
          >
            报告
          </Button>
        </Space>
      )
    }
  ];

  const stats = getSummaryStats();

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[20, 20]} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="总执行次数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功次数"
              value={stats.success}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="失败次数"
              value={stats.failed}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats.running}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SyncOutlined spin />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Select
              placeholder="选择项目"
              value={filters.project}
              onChange={(val) => handleFilterChange('project', val)}
              onClear={() => handleFilterChange('project', null)}
              allowClear
              style={{ width: 180 }}
            >
              {projects.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="选择测试套件"
              value={filters.suite}
              onChange={(val) => handleFilterChange('suite', val)}
              onClear={() => handleFilterChange('suite', null)}
              allowClear
              style={{ width: 180 }}
            >
              {suites.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
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
              <Select.Option value="SUCCESS">成功</Select.Option>
              <Select.Option value="FAILED">失败</Select.Option>
              <Select.Option value="RUNNING">运行中</Select.Option>
              <Select.Option value="PENDING">等待中</Select.Option>
            </Select>

            <RangePicker
              value={filters.dateRange}
              onChange={(val) => handleFilterChange('dateRange', val)}
            />

            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </div>

        <Table
          dataSource={executions}
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
        title="执行详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setDetailModalVisible(false)}>关闭</Button>
            <Button
              type="primary"
              icon={<LineChartOutlined />}
              onClick={() => handleViewReport(selectedExecution)}
            >
              查看报告
            </Button>
          </Space>
        }
        width={800}
      >
        {selectedExecution && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="执行名称" span={2}>
              {selectedExecution.name}
            </Descriptions.Item>
            <Descriptions.Item label="关联项目">
              {selectedExecution.project_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="测试套件">
              {selectedExecution.test_suite_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusMap[selectedExecution.status]?.color}>
                {statusMap[selectedExecution.status]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="执行环境">
              {selectedExecution.environment_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="总用例数">{selectedExecution.total_cases ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="通过数">
              <Text type="success">{selectedExecution.passed_cases ?? '-'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="失败数">
              <Text type="danger">{selectedExecution.failed_cases ?? '-'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="跳过数">
              <Text type="warning">{selectedExecution.skipped_cases ?? '-'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="通过率">
              {selectedExecution.pass_rate !== null && selectedExecution.pass_rate !== undefined
                ? `${selectedExecution.pass_rate.toFixed(2)}%`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="执行时长">
              {selectedExecution.duration
                ? `${Math.floor(selectedExecution.duration / 1000)}秒`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="执行时间" span={2}>
              {selectedExecution.created_at
                ? dayjs(selectedExecution.created_at).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            {selectedExecution.error_message && (
              <Descriptions.Item label="错误信息" span={2}>
                <Text type="danger">{selectedExecution.error_message}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="测试报告"
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        footer={null}
        width={1000}
        bodyStyle={{ height: '600px', padding: 0 }}
      >
        {selectedExecution?.allure_report_url ? (
          <iframe
            src={selectedExecution.allure_report_url}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Allure Report"
          />
        ) : (
          <Empty description="暂无报告，请先生成报告" />
        )}
      </Modal>
    </div>
  );
};

export default ReportView;