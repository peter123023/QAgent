import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Popconfirm,
  Pagination
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  // 加载测试报告列表
    const loadReports = async (page = 1, pageSize = 20) => {
        setLoading(true);
        try {
            const response = await api.get('/reports/reports/', { params: { page, page_size: pageSize } });
            const reportsList = response.data.results || [];
            setReports(reportsList.map(report => ({
                ...report,
                total_count: 0,
                pass_count: 0,
                fail_count: 0,
                skip_count: 0,
                pass_rate: 0
            })));
            setPagination({
                current: page,
                pageSize,
                total: response.data.count || 0
            });
        } catch (error) {
            message.error('加载测试报告列表失败');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

  useEffect(() => {
    loadReports();
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

  // 删除测试报告
    const handleDelete = async (report) => {
        try {
            await api.delete(`/reports/reports/${report.id}/`);
            message.success('删除成功');
            loadReports(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('删除失败');
            console.error(error);
        }
    };

  const columns = [
    {
      title: '报告名称',
      dataIndex: 'name',
      key: 'name',
      minWidth: 200
    },
    {
      title: '执行记录',
      dataIndex: ['execution', 'name'],
      key: 'execution',
      minWidth: 150
    },
    {
      title: '总用例数',
      dataIndex: 'total_count',
      key: 'total_count',
      width: 100
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
      title: '跳过数',
      dataIndex: 'skip_count',
      key: 'skip_count',
      width: 100,
      render: (count) => <Tag color="warning">{count}</Tag>
    },
    {
      title: '通过率',
      dataIndex: 'pass_rate',
      key: 'pass_rate',
      width: 120,
      render: (rate) => <span>{rate}%</span>
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
      width: 200,
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
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => message.info('下载功能待实现')}
          >
            下载
          </Button>
          <Popconfirm
            title="确定要删除这个测试报告吗？"
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
          <h2 style={{ margin: 0 }}>测试报告</h2>
        </div>

        <Table
          columns={columns}
          dataSource={reports}
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
            onChange={(page, pageSize) => loadReports(page, pageSize)}
          />
        </div>
      </Card>
    </div>
  );
};

export default Reports;
