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
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const statusColorMap = {
    pending: 'warning',
    reviewing: 'processing',
    approved: 'success',
    rejected: 'error',
    need_revision: 'default'
  };

  const statusTextMap = {
    pending: '待评审',
    reviewing: '评审中',
    approved: '已通过',
    rejected: '已拒绝',
    need_revision: '需修订'
  };

  // 加载评审列表
    const loadReviews = async (page = 1, pageSize = 20) => {
        setLoading(true);
        try {
            const response = await api.get('/reviews/reviews/', { params: { page, page_size: pageSize } });
            const reviewsList = response.data.results || [];
            setReviews(reviewsList.map(review => ({
                ...review,
                testcase: null, // 测试用例可能在其他地方
                reviewer: review.creator
            })));
            setPagination({
                current: page,
                pageSize,
                total: response.data.count || 0
            });
        } catch (error) {
            message.error('加载评审列表失败');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

  useEffect(() => {
    loadReviews();
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

  // 删除评审
    const handleDelete = async (review) => {
        try {
            await api.delete(`/reviews/reviews/${review.id}/`);
            message.success('删除成功');
            loadReviews(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('删除失败');
            console.error(error);
        }
    };

  const columns = [
    {
      title: '评审标题',
      dataIndex: 'title',
      key: 'title',
      minWidth: 200
    },
    {
      title: '测试用例',
      dataIndex: 'testcase',
      key: 'testcase',
      minWidth: 200,
      render: (testcase) => testcase?.title || '-'
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
      title: '评审人',
      dataIndex: ['reviewer', 'username'],
      key: 'reviewer',
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
            onClick={() => message.info('编辑功能待实现')}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个评审吗？"
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
          <h2 style={{ margin: 0 }}>评审列表</h2>
        </div>

        <Table
          columns={columns}
          dataSource={reviews}
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
            onChange={(page, pageSize) => loadReviews(page, pageSize)}
          />
        </div>
      </Card>
    </div>
  );
};

export default Reviews;
