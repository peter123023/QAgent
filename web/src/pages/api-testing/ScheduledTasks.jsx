import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  message,
  Popconfirm,
  Typography,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getScheduledTasks,
  getExecutionLogs,
  getTestSuites,
  getEnvironments,
  createScheduledTask,
  updateScheduledTask,
  deleteScheduledTask,
  runScheduledTask,
  pauseScheduledTask,
  activateScheduledTask
} from '../../services/api-testing';

const { Text } = Typography;

const statusMap = {
  ACTIVE: { color: 'success', text: '运行中', icon: <CheckCircleOutlined /> },
  PAUSED: { color: 'warning', text: '已暂停', icon: <PauseCircleOutlined /> },
  COMPLETED: { color: 'blue', text: '已完成', icon: <CheckCircleOutlined /> },
  FAILED: { color: 'error', text: '执行失败', icon: <CloseCircleOutlined /> },
  ERROR: { color: 'error', text: '错误', icon: <ExclamationCircleOutlined /> }
};

const resultMap = {
  SUCCESS: { color: 'success', text: '成功' },
  FAILED: { color: 'error', text: '失败' },
  ERROR: { color: 'error', text: '错误' }
};

const ScheduledTasks = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [suites, setSuites] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [form] = Form.useForm();

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getScheduledTasks({ ordering: '-created_at' });
      setTasks(response.data?.results || response.data || []);
    } catch {
      message.error('加载定时任务失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSuites = useCallback(async () => {
    try {
      const response = await getTestSuites();
      setSuites(response.data?.results || response.data || []);
    } catch {
      console.error('Failed to load suites');
    }
  }, []);

  const loadEnvironments = useCallback(async () => {
    try {
      const response = await getEnvironments();
      setEnvironments(response.data?.results || response.data || []);
    } catch {
      console.error('Failed to load environments');
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadSuites();
    loadEnvironments();
  }, [loadTasks, loadSuites, loadEnvironments]);

  const handleCreate = () => {
    setEditingTask(null);
    form.resetFields();
    form.setFieldsValue({
      is_enabled: true,
      notify_on_failure: true
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTask(record);
    form.setFieldsValue({
      name: record.name,
      test_suite: record.test_suite,
      environment: record.environment,
      cron_expression: record.cron_expression,
      is_enabled: record.is_enabled,
      notify_on_failure: record.notify_on_failure,
      description: record.description
    });
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await deleteScheduledTask(record.id);
      message.success('删除成功');
      loadTasks();
    } catch {
      message.error('删除失败');
    }
  };

  const handleRunNow = async (record) => {
    try {
      await runScheduledTask(record.id);
      message.success('任务已触发执行');
    } catch {
      message.error('触发执行失败');
    }
  };

  const handlePause = async (record) => {
    try {
      await pauseScheduledTask(record.id);
      message.success('任务已暂停');
      loadTasks();
    } catch {
      message.error('暂停失败');
    }
  };

  const handleActivate = async (record) => {
    try {
      await activateScheduledTask(record.id);
      message.success('任务已启用');
      loadTasks();
    } catch {
      message.error('启用失败');
    }
  };

  const handleViewLogs = async (record) => {
    setSelectedTask(record);
    setLogModalVisible(true);
    setLogLoading(true);
    try {
      const response = await getExecutionLogs(record.id);
      setExecutionLogs(response.data?.results || response.data || []);
    } catch {
      message.error('加载执行日志失败');
    } finally {
      setLogLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        name: values.name,
        test_suite: values.test_suite,
        environment: values.environment,
        cron_expression: values.cron_expression,
        is_enabled: values.is_enabled,
        notify_on_failure: values.notify_on_failure,
        description: values.description
      };

      if (editingTask) {
        await updateScheduledTask(editingTask.id, data);
        message.success('更新成功');
      } else {
        await createScheduledTask(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadTasks();
    } catch {
      message.error(editingTask ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '测试套件',
      dataIndex: 'test_suite_name',
      key: 'test_suite_name',
      width: 150,
      render: (text) => text || '-'
    },
    {
      title: '执行环境',
      dataIndex: 'environment_name',
      key: 'environment_name',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Cron表达式',
      dataIndex: 'cron_expression',
      key: 'cron_expression',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'is_enabled',
      key: 'is_enabled',
      width: 100,
      render: (isEnabled, record) => {
        if (!isEnabled) {
          return <Tag color="default">已禁用</Tag>;
        }
        const status = statusMap[record.status] || { color: 'processing', text: record.status };
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.text}
          </Tag>
        );
      }
    },
    {
      title: '下次执行',
      dataIndex: 'next_run_time',
      key: 'next_run_time',
      width: 180,
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-')
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-')
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRunNow(record)}
          >
            执行
          </Button>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewLogs(record)}>
            日志
          </Button>
          {record.is_enabled ? (
            <Button
              type="link"
              size="small"
              icon={<PauseCircleOutlined />}
              onClick={() => handlePause(record)}
            >
              暂停
            </Button>
          ) : (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleActivate(record)}
            >
              启用
            </Button>
          )}
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除任务「${record.name}」吗？`}
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

  const logColumns = [
    {
      title: '执行时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-')
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
      title: '执行时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (duration) => {
        if (!duration) return '-';
        const seconds = Math.floor(duration / 1000);
        if (seconds < 60) return `${seconds}秒`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}分${seconds % 60}秒`;
      }
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result) => {
        if (!result) return '-';
        const item = resultMap[result] || { color: 'default', text: result };
        return <Tag color={item.color}>{item.text}</Tag>;
      }
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title={<h2 style={{ margin: 0 }}>定时任务</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建任务
          </Button>
        }
      >
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingTask ? '编辑任务' : '创建任务'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText={editingTask ? '更新' : '创建'}
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>

          <Form.Item
            name="test_suite"
            label="测试套件"
            rules={[{ required: true, message: '请选择测试套件' }]}
          >
            <Select placeholder="请选择测试套件">
              {suites.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="environment"
            label="执行环境"
            rules={[{ required: true, message: '请选择执行环境' }]}
          >
            <Select placeholder="请选择执行环境">
              {environments.map((e) => (
                <Select.Option key={e.id} value={e.id}>
                  {e.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="cron_expression"
            label="Cron表达式"
            rules={[{ required: true, message: '请输入Cron表达式' }]}
            extra="格式: 秒 分 时 日 月 周 (例: 0 0 * * * ? 表示每天零点执行)"
          >
            <Input placeholder="0 0 * * * ?" />
          </Form.Item>

          <Form.Item name="is_enabled" label="启用任务" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="notify_on_failure" label="失败时通知" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="description" label="任务描述">
            <Input.TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`执行日志 - ${selectedTask?.name || ''}`}
        open={logModalVisible}
        onCancel={() => setLogModalVisible(false)}
        footer={null}
        width={900}
      >
        {executionLogs.length === 0 && !logLoading ? (
          <Empty description="暂无执行日志" />
        ) : (
          <Table
            dataSource={executionLogs}
            columns={logColumns}
            rowKey="id"
            loading={logLoading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ScheduledTasks;