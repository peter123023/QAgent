import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Popconfirm,
  Pagination,
  Space,
  message,
  Modal
} from 'antd';
import { PlusOutlined, SearchOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Option } = Select;

const TestCaseList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [testcases, setTestcases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedTestCases, setSelectedTestCases] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTestCases = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
        search: searchText,
        project: projectFilter,
        priority: priorityFilter
      };
      const response = await api.get('/testcases/', { params });
      setTestcases(response.data.results || []);
      setTotal(response.data.count || 0);
    } catch (error) {
      message.error('获取测试用例列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(response.data.results || response.data || []);
    } catch (error) {
      message.error('获取项目列表失败');
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTestCases();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTestCases();
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchTestCases();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchTestCases();
  };

  const handleSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
    fetchTestCases();
  };

  const goToTestCase = (id) => {
    navigate(`/ai-generation/testcases/${id}`);
  };

  const editTestCase = (testcase) => {
    navigate(`/ai-generation/testcases/${testcase.id}/edit`);
  };

  const deleteTestCase = async (testcase) => {
    try {
      await api.delete(`/testcases/${testcase.id}/`);
      message.success('删除成功');
      fetchTestCases();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSelectionChange = (selectedRowKeys, selectedRows) => {
    setSelectedTestCases(selectedRows);
  };

  const getSerialNumber = (index) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  const batchDeleteTestCases = async () => {
    if (selectedTestCases.length === 0) {
      message.warning('请先选择要删除的测试用例');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedTestCases.length} 个测试用例吗？`,
      onOk: async () => {
        setIsDeleting(true);
        let successCount = 0;
        let failCount = 0;

        for (const testcase of selectedTestCases) {
          try {
            await api.delete(`/testcases/${testcase.id}/`);
            successCount++;
          } catch (error) {
            console.error(`Delete test case ${testcase.id} failed:`, error);
            failCount++;
          }
        }

        if (successCount > 0) {
          if (failCount > 0) {
            message.success(`部分删除成功：成功 ${successCount} 个，失败 ${failCount} 个`);
          } else {
            message.success(`成功删除 ${successCount} 个测试用例`);
          }
        } else {
          message.error('批量删除失败');
        }

        setSelectedTestCases([]);
        fetchTestCases();
        setIsDeleting(false);
      }
    });
  };

  const getPriorityText = (priority) => {
    const textMap = {
      low: '低',
      medium: '中',
      high: '高',
      critical: '关键'
    };
    return textMap[priority] || priority;
  };

  const getTypeText = (type) => {
    const textMap = {
      functional: '功能测试',
      integration: '集成测试',
      api: 'API测试',
      ui: 'UI测试',
      performance: '性能测试',
      security: '安全测试'
    };
    return textMap[type] || '-';
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm');
  };

  const exportToExcel = async () => {
    try {
      message.loading('正在导出...', 0);

      // 获取所有测试用例数据
      let allTestCases = [];
      let page = 1;
      const pageSize = 100;
      let hasMore = true;

      while (hasMore) {
        const params = {
          page,
          page_size: pageSize,
          search: searchText,
          project: projectFilter,
          priority: priorityFilter
        };
        const response = await api.get('/testcases/', { params });
        const results = response.data.results || [];
        allTestCases = [...allTestCases, ...results];
        hasMore = results.length === pageSize;
        page++;
      }

      // 转换数据格式
      const data = allTestCases.map((testcase, index) => ({
        '序号': index + 1,
        '用例标题': testcase.title,
        '关联项目': testcase.project?.name || '-',
        '关联版本': testcase.versions?.map(v => v.name).join(', ') || '-',
        '优先级': getPriorityText(testcase.priority),
        '测试类型': getTypeText(testcase.test_type),
        '作者': testcase.author?.username || '-',
        '描述': testcase.description || '-',
        '前置条件': testcase.precondition || '-',
        '测试步骤': testcase.steps || '-',
        '预期结果': testcase.expected_result || '-',
        '创建时间': formatDate(testcase.created_at)
      }));

      // 创建工作簿和工作表
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '测试用例');

      // 自动调整列宽
      const columnWidths = Object.keys(data[0] || {}).map((key) => {
        const maxLength = Math.max(
          ...data.map(row => String(row[key] || '').length),
          key.length
        );
        return { wch: Math.min(maxLength + 2, 50) };
      });
      worksheet['!cols'] = columnWidths;

      // 下载文件
      const fileName = `测试用例_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      message.success('导出成功！');
    } catch (error) {
      message.error('导出失败');
      console.error(error);
    } finally {
      message.destroy();
    }
  };

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      render: (_, __, index) => getSerialNumber(index)
    },
    {
      title: '用例标题',
      dataIndex: 'title',
      key: 'title',
      minWidth: 250,
      render: (text, record) => (
        <a onClick={() => goToTestCase(record.id)}>{text}</a>
      )
    },
    {
      title: '关联项目',
      dataIndex: ['project', 'name'],
      key: 'project',
      width: 150,
      render: (text) => text || '-'
    },
    {
      title: '关联版本',
      key: 'versions',
      width: 200,
      render: (_, record) => {
        if (record.versions && record.versions.length > 0) {
          return (
            <Space wrap size="small">
              {record.versions.slice(0, 2).map((version) => (
                <Tag key={version.id} size="small" color={version.is_baseline ? 'warning' : 'blue'}>
                  {version.name}
                </Tag>
              ))}
              {record.versions.length > 2 && (
                <Tag size="small" color="blue">+{record.versions.length - 2}</Tag>
              )}
            </Space>
          );
        }
        return <span style={{ color: '#909399', fontSize: '12px', fontStyle: 'italic' }}>无版本</span>;
      }
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (text) => (
        <Tag className={`priority-tag ${text}`}>{getPriorityText(text)}</Tag>
      )
    },
    {
      title: '测试类型',
      dataIndex: 'test_type',
      key: 'test_type',
      width: 120,
      render: (text) => getTypeText(text)
    },
    {
      title: '作者',
      dataIndex: ['author', 'username'],
      key: 'author',
      width: 120
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => formatDate(text)
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => editTestCase(record)}>编辑</Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个测试用例吗？"
            onConfirm={() => deleteTestCase(record)}
            okText="确认"
            cancelText="取消"
          >
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', padding: '20px', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#303133' }}>测试用例管理</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {selectedTestCases.length > 0 && (
            <Button danger onClick={batchDeleteTestCases} disabled={isDeleting} icon={<DeleteOutlined />}>
              批量删除 ({selectedTestCases.length})
            </Button>
          )}
          <Button onClick={exportToExcel} icon={<DownloadOutlined />}>导出 Excel</Button>
          <Button type="primary" onClick={() => navigate('/ai-generation/testcases/create')} icon={<PlusOutlined />}>
            新建用例
          </Button>
        </div>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', flex: 1,
        overflow: 'hidden', background: '#fff', borderRadius: '4px',
        boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #ebeef5' }}>
          <Space wrap size="middle" style={{ width: '100%' }}>
            <Input
              style={{ width: 200 }}
              placeholder="搜索测试用例"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              allowClear
            />
            <Select
              style={{ width: 160 }}
              placeholder="关联项目"
              value={projectFilter}
              onChange={(value) => { setProjectFilter(value); handleFilter(); }}
              allowClear
            >
              {projects.map((project) => (
                <Option key={project.id} value={project.id}>{project.name}</Option>
              ))}
            </Select>
            <Select
              style={{ width: 120 }}
              placeholder="优先级"
              value={priorityFilter}
              onChange={(value) => { setPriorityFilter(value); handleFilter(); }}
              allowClear
            >
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="critical">关键</Option>
            </Select>
          </Space>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', padding: '0 20px' }}>
          <Table
            dataSource={testcases}
            columns={columns}
            loading={loading}
            rowKey="id"
            scroll={{ y: 'calc(100vh - 380px)' }}
            rowSelection={{
              onChange: handleSelectionChange
            }}
          />
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid #ebeef5', display: 'flex', justifyContent: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            pageSizes={[15, 25, 35, 50, 100]}
            showSizeChanger
            showTotal={(total) => `共 ${total} 条`}
            onChange={handlePageChange}
            onShowSizeChange={handleSizeChange}
          />
        </div>
      </div>

      <style>{`
        .priority-tag.low { color: #67c23a; }
        .priority-tag.medium { color: #e6a23c; }
        .priority-tag.high { color: #f56c6c; }
        .priority-tag.critical { color: #f56c6c; font-weight: bold; }
      `}</style>
    </div>
  );
};

export default TestCaseList;
