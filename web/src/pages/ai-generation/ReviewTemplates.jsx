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

const ReviewTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  // 加载评审模板列表
    const loadTemplates = async (page = 1, pageSize = 20) => {
        setLoading(true);
        try {
            const response = await api.get('/reviews/review-templates/', { params: { page, page_size: pageSize } });
            setTemplates(response.data.results || []);
            setPagination({
                current: page,
                pageSize,
                total: response.data.count || 0
            });
        } catch (error) {
            message.error('加载评审模板列表失败');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

  useEffect(() => {
    loadTemplates();
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

  // 删除模板
    const handleDelete = async (template) => {
        try {
            await api.delete(`/reviews/review-templates/${template.id}/`);
            message.success('删除成功');
            loadTemplates(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('删除失败');
            console.error(error);
        }
    };

  const columns = [
    {
      title: '模板名称',
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
      title: '是否默认',
      dataIndex: 'is_default',
      key: 'is_default',
      width: 100,
      render: (isDefault) => (
        <Tag color={isDefault ? 'success' : 'default'}>
          {isDefault ? '默认' : '否'}
        </Tag>
      )
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
            onClick={() => message.info('编辑功能待实现')}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个模板吗？"
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
          <h2 style={{ margin: 0 }}>评审模板</h2>
        </div>

        <Table
          columns={columns}
          dataSource={templates}
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
            onChange={(page, pageSize) => loadTemplates(page, pageSize)}
          />
        </div>
      </Card>
    </div>
  );
};

export default ReviewTemplates;
