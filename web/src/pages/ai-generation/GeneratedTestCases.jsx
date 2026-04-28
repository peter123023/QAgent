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
  InputNumber,
  Popconfirm,
  Pagination,
  Statistic,
  Row,
  Col,
  Checkbox
} from 'antd';
import {
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import {
  getTestCaseGenerationTasks,
  deleteTestCaseGenerationTask,
  batchAdoptTestCases,
  batchDiscardTestCases,
  getProjects,
  getVersions,
  getProjectVersions,
  createTestCase
} from '../../services/ai-generation';
import { Link } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const GeneratedTestCases = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [stats, setStats] = useState({ total: 0, completed: 0, running: 0, failed: 0 });
  const [projects, setProjects] = useState([]);
  const [versions, setVersions] = useState([]);
  const [projectVersions, setProjectVersions] = useState([]);

  // 弹框状态
  const [adoptModalVisible, setAdoptModalVisible] = useState(false);
  const [currentAdoptTask, setCurrentAdoptTask] = useState(null);
  const [adoptForm] = Form.useForm();

  const statusOptions = [
    { label: '全部', value: '' },
    { label: '待处理', value: 'pending' },
    { label: '生成中', value: 'generating' },
    { label: '评审中', value: 'reviewing' },
    { label: '已完成', value: 'completed' },
    { label: '失败', value: 'failed' }
  ];

  const statusColorMap = {
    pending: 'default',
    generating: 'processing',
    reviewing: 'warning',
    completed: 'success',
    failed: 'error'
  };

  const statusTextMap = {
    pending: '待处理',
    generating: '生成中',
    reviewing: '评审中',
    completed: '已完成',
    failed: '失败'
  };

  // 加载任务列表
  const loadTasks = async (page = 1, pageSize = 10, status = selectedStatus) => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      if (status) params.status = status;

      const response = await getTestCaseGenerationTasks(params);
      const data = response.data.results || response.data || [];
      setTasks(data);
      setPagination({
        current: page,
        pageSize,
        total: response.data.count || data.length
      });
      
      // 同时加载统计数据
      await loadStats(status);
    } catch (error) {
      message.error('加载任务列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const loadStats = async (status = '') => {
    try {
      const params = { page: 1, page_size: 10000 };
      if (status) params.status = status;
      
      const response = await getTestCaseGenerationTasks(params);
      const allTasks = response.data.results || response.data || [];
      
      setStats({
        total: allTasks.length,
        completed: allTasks.filter(t => t.status === 'completed').length,
        running: allTasks.filter(t => ['pending', 'generating', 'reviewing'].includes(t.status)).length,
        failed: allTasks.filter(t => t.status === 'failed').length
      });
    } catch (error) {
      console.error('加载统计数据失败', error);
    }
  };

  // 加载项目和版本
  const loadProjectsAndVersions = async () => {
    try {
      const [projectsRes, versionsRes] = await Promise.all([
        getProjects(),
        getVersions()
      ]);
      setProjects(projectsRes.data.results || projectsRes.data || []);
      setVersions(versionsRes.data.results || versionsRes.data || []);
    } catch (error) {
      console.error('加载项目和版本失败', error);
    }
  };

  useEffect(() => {
    loadTasks();
    loadProjectsAndVersions();
  }, []);

  // 获取测试用例条数
  const getTestCaseCount = (task) => {
    if (!task.final_test_cases) return 0;
    
    const content = task.final_test_cases;
    const lines = content.split('\n').filter(line => line.trim());
    
    let tableRows = 0;
    let isFirstRow = true;
    let isTableFormat = false;
    
    for (let line of lines) {
      if (line.includes('|') && !line.includes('--------')) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (cells.length > 1) {
          if (isFirstRow) {
            isFirstRow = false;
            if (line.includes('测试用例编号') || line.includes('ID') || line.includes('用例ID') ||
                line.includes('场景') || line.includes('步骤')) {
              isTableFormat = true;
              continue;
            }
          }
          tableRows++;
          if (tableRows >= 1) {
            isTableFormat = true;
          }
        }
      }
    }
    
    if (isTableFormat && tableRows > 0) {
      return tableRows;
    }
    
    let caseCount = 0;
    for (const line of lines) {
      if (line.includes('测试用例') || line.includes('Test Case') || line.match(/^(\d+\.|测试场景)/)) {
        caseCount++;
      }
    }
    
    return caseCount || 0;
  };

  // 格式化日期
  const formatDateTime = (dateString) => {
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

  // 处理项目选择变化
  const handleProjectChange = async (projectId) => {
    if (projectId) {
      try {
        const response = await getProjectVersions(projectId);
        setProjectVersions(response.data || []);
      } catch (error) {
        console.error('加载项目版本失败', error);
        setProjectVersions([]);
      }
    } else {
      setProjectVersions([]);
    }
  };

  // 处理采纳
  const handleAdopt = async () => {
    try {
      const values = await adoptForm.validateFields();
      const submitData = {
        ...values,
        version_ids: values.version_id ? [values.version_id] : []
      };
      
      await createTestCase(submitData);
      message.success('采纳成功');
      setAdoptModalVisible(false);
      adoptForm.resetFields();
      loadTasks();
    } catch (error) {
      message.error('采纳失败');
      console.error(error);
    }
  };

  // 批量采纳
  const handleBatchAdopt = async (task) => {
    if (!window.confirm(`确定要采纳任务"${task.title}"的所有测试用例吗？`)) {
      return;
    }
    
    try {
      await batchAdoptTestCases(task.task_id);
      message.success('批量采纳成功');
      loadTasks();
    } catch (error) {
      message.error('批量采纳失败');
      console.error(error);
    }
  };

  // 批量丢弃
  const handleBatchDiscard = async (task) => {
    if (!window.confirm(`确定要丢弃任务"${task.title}"的所有测试用例吗？`)) {
      return;
    }
    
    try {
      await batchDiscardTestCases(task.task_id);
      message.success('批量丢弃成功');
      loadTasks();
    } catch (error) {
      message.error('批量丢弃失败');
      console.error(error);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的任务');
      return;
    }
    
    if (!window.confirm(`确定要删除选中的 ${selectedRowKeys.length} 个任务吗？`)) {
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    try {
      for (const taskId of selectedRowKeys) {
        try {
          await deleteTestCaseGenerationTask(taskId);
          successCount++;
        } catch (error) {
          console.error(`删除任务 ${taskId} 失败`, error);
          failCount++;
        }
      }
      
      if (successCount > 0) {
        message.success(`删除成功 ${successCount} 个任务，失败 ${failCount} 个`);
      } else {
        message.error('删除失败');
      }
      
      setSelectedRowKeys([]);
      loadTasks();
    } catch (error) {
      message.error('批量删除失败');
      console.error(error);
    }
  };

  // 查看详情
  const handleViewDetail = (task) => {
    if (['pending', 'generating', 'reviewing'].includes(task.status)) {
      message.info('任务尚未完成，请等待');
      return;
    }
    
    // 在新标签页打开任务详情
    window.open(`/ai-generation/task-detail/${task.task_id}`, '_blank');
  };

  const columns = [
    {
      title: '任务ID',
      dataIndex: 'task_id',
      key: 'task_id',
      width: 150
    },
    {
      title: '需求名称',
      dataIndex: 'title',
      key: 'title',
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
      title: '用例条数',
      key: 'case_count',
      width: 100,
      render: (_, record) => (
        <Tag color="blue">{getTestCaseCount(record)}</Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => formatDateTime(date)
    },
    {
      title: '操作',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
          {record.status === 'completed' && (
            <>
              <Button
                icon={<CheckCircleOutlined />}
                type="primary"
                size="small"
                onClick={() => handleBatchAdopt(record)}
              >
                批量采纳
              </Button>
              <Button
                icon={<CloseCircleOutlined />}
                danger
                size="small"
                onClick={() => handleBatchDiscard(record)}
              >
                批量丢弃
              </Button>
            </>
          )}
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
          <h2 style={{ margin: 0 }}>AI 生成用例</h2>
          <Space>
            <Select
              style={{ width: 150 }}
              value={selectedStatus}
              onChange={(value) => {
                setSelectedStatus(value);
                loadTasks(1, pagination.pageSize, value);
              }}
              options={statusOptions}
              placeholder="状态筛选"
            />
            {selectedRowKeys.length > 0 && (
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={handleBatchDelete}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadTasks(pagination.current, pagination.pageSize)}
            >
              刷新
            </Button>
          </Space>
        </div>

        {/* 统计信息 */}
        {stats.total > 0 && (
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Card>
                <Statistic title="总任务数" value={stats.total} prefix={<FileTextOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#3f8600' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="进行中" value={stats.running} valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="失败" value={stats.failed} valueStyle={{ color: '#cf1322' }} />
              </Card>
            </Col>
          </Row>
        )}

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={tasks}
          loading={loading}
          rowKey="task_id"
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
            onChange={(page, pageSize) => loadTasks(page, pageSize)}
          />
        </div>
      </Card>

      {/* 采纳弹框 */}
      <Modal
        title="采纳测试用例"
        open={adoptModalVisible}
        onOk={handleAdopt}
        onCancel={() => {
          setAdoptModalVisible(false);
          adoptForm.resetFields();
        }}
        width={600}
      >
        <Form form={adoptForm} layout="vertical">
          <Form.Item
            label="用例标题"
            name="title"
            rules={[{ required: true, message: '请输入用例标题' }]}
          >
            <Input placeholder="请输入用例标题" />
          </Form.Item>
          <Form.Item label="用例描述" name="description">
            <TextArea rows={3} placeholder="请输入用例描述" />
          </Form.Item>
          <Form.Item
            label="所属项目"
            name="project_id"
            rules={[{ required: true, message: '请选择项目' }]}
          >
            <Select placeholder="请选择项目" onChange={handleProjectChange}>
              {projects.map(project => (
                <Option key={project.id} value={project.id}>{project.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="关联版本"
            name="version_id"
            rules={[{ required: true, message: '请选择版本' }]}
          >
            <Select placeholder="请选择版本">
              {(projectVersions.length > 0 ? projectVersions : versions).map(version => (
                <Option key={version.id} value={version.id}>
                  {version.name}{version.is_baseline ? ' (基准)' : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="优先级" name="priority" initialValue="low">
            <Select>
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="critical">关键</Option>
            </Select>
          </Form.Item>
          <Form.Item label="测试类型" name="test_type" initialValue="functional">
            <Select>
              <Option value="functional">功能测试</Option>
              <Option value="integration">集成测试</Option>
              <Option value="api">API测试</Option>
              <Option value="ui">UI测试</Option>
              <Option value="performance">性能测试</Option>
              <Option value="security">安全测试</Option>
            </Select>
          </Form.Item>
          <Form.Item label="状态" name="status" initialValue="draft">
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="active">活跃</Option>
            </Select>
          </Form.Item>
          <Form.Item label="前置条件" name="preconditions">
            <TextArea rows={3} placeholder="请输入前置条件" />
          </Form.Item>
          <Form.Item label="操作步骤" name="steps">
            <TextArea rows={6} placeholder="请输入操作步骤" />
          </Form.Item>
          <Form.Item
            label="预期结果"
            name="expected_result"
            rules={[{ required: true, message: '请输入预期结果' }]}
          >
            <TextArea rows={3} placeholder="请输入预期结果" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GeneratedTestCases;
