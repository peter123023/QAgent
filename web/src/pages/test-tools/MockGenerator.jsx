import React, { useState } from 'react';
import { Card, Row, Col, Button, Select, Input, InputNumber, Space, message, Typography, Divider, Table, Form, Switch, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, CopyOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const MockGenerator = () => {
  const [form] = Form.useForm();
  const [mocks, setMocks] = useState([]);

  const saveMock = (values) => {
    const mock = {
      ...values,
      id: Date.now(),
      createTime: new Date().toLocaleString(),
      callCount: 0
    };
    setMocks([mock, ...mocks]);
    form.resetFields();
    message.success('Mock 保存成功');
  };

  const deleteMock = (id) => {
    setMocks(mocks.filter(m => m.id !== id));
    message.success('删除成功');
  };

  const copyMockUrl = (mock) => {
    const url = `/mock/${mock.path}`;
    navigator.clipboard.writeText(url).then(() => {
      message.success('复制成功');
    });
  };

  const callCount = (id) => {
    setMocks(mocks.map(m => {
      if (m.id === id) {
        return { ...m, callCount: m.callCount + 1 };
      }
      return m;
    }));
  };

  const columns = [
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      render: (value) => <Tag color="blue">/{value}</Tag>
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      render: (value) => {
        const colors = { GET: 'green', POST: 'blue', PUT: 'orange', DELETE: 'red', PATCH: 'purple' };
        return <Tag color={colors[value] || 'default'}>{value}</Tag>;
      }
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: 100
    },
    {
      title: '响应延迟',
      dataIndex: 'delay',
      key: 'delay',
      render: (value) => `${value}ms`
    },
    {
      title: '调用次数',
      dataIndex: 'callCount',
      key: 'callCount',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => copyMockUrl(record)}>
            复制URL
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => deleteMock(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const loadTemplate = (type) => {
    let response = '';
    switch (type) {
      case 'success':
        response = JSON.stringify({
          code: 0,
          message: 'success',
          data: { id: 1, name: 'test' }
        }, null, 2);
        break;
      case 'list':
        response = JSON.stringify({
          code: 0,
          message: 'success',
          data: { list: [], total: 0, page: 1, pageSize: 10 }
        }, null, 2);
        break;
      case 'error':
        response = JSON.stringify({
          code: -1,
          message: 'error',
          data: null
        }, null, 2);
        break;
      case '404':
        response = JSON.stringify({
          code: 404,
          message: 'Not Found',
          data: null
        }, null, 2);
        break;
      default:
        response = JSON.stringify({});
    }
    form.setFieldsValue({ response });
  };

  return (
    <div style={{ padding: '0 20px' }}>
      <Title level={3}>快速 Mock 生成器</Title>
      <Text type="secondary">快速创建 Mock 接口用于测试</Text>
      <Divider />

      <Form
        form={form}
        onFinish={saveMock}
        initialValues={{ method: 'GET', statusCode: 200, delay: 0, enable: true }}
      >
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card title="基本配置" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item name="path" rules={[{ required: true, message: '请输入路径' }]}>
                  <Input placeholder="路径，如 api/user" prefix="/" />
                </Form.Item>
                <Form.Item name="method">
                  <Select style={{ width: '100%' }}>
                    <Option value="GET">GET</Option>
                    <Option value="POST">POST</Option>
                    <Option value="PUT">PUT</Option>
                    <Option value="DELETE">DELETE</Option>
                    <Option value="PATCH">PATCH</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="statusCode">
                  <Select style={{ width: '100%' }}>
                    <Option value={200}>200 OK</Option>
                    <Option value={201}>201 Created</Option>
                    <Option value={400}>400 Bad Request</Option>
                    <Option value={401}>401 Unauthorized</Option>
                    <Option value={403}>403 Forbidden</Option>
                    <Option value={404}>404 Not Found</Option>
                    <Option value={500}>500 Internal Server Error</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="delay">
                  <InputNumber style={{ width: '100%' }} placeholder="响应延迟 (ms)" addonBefore="延迟" />
                </Form.Item>
                <Form.Item name="enable" valuePropName="checked">
                  <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                </Form.Item>
              </Space>
            </Card>
          </Col>

          <Col span={16}>
            <Card
              title="响应配置"
              extra={
                <Space>
                  <Button type="link" size="small" onClick={() => loadTemplate('success')}>
                    成功模板
                  </Button>
                  <Button type="link" size="small" onClick={() => loadTemplate('list')}>
                    列表模板
                  </Button>
                  <Button type="link" size="small" onClick={() => loadTemplate('error')}>
                    错误模板
                  </Button>
                </Space>
              }
              size="small"
            >
              <Form.Item name="response" rules={[{ required: true, message: '请输入响应内容' }]}>
                <TextArea
                  placeholder="响应内容，支持 JSON"
                  rows={8}
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Item>
              <Form.Item name="description">
                <Input placeholder="描述" />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Button type="primary" size="large" htmlType="submit" block icon={<PlusOutlined />}>
              创建 Mock
            </Button>
          </Col>
        </Row>
      </Form>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card
            title={`Mock 列表 (${mocks.length}个)`}
            extra={
              mocks.length > 0 ? (
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setMocks([]);
                    message.success('清空成功');
                  }}
                >
                  清空
                </Button>
              ) : null
            }
          >
            {mocks.length > 0 ? (
              <Table
                columns={columns}
                dataSource={mocks}
                pagination={false}
                size="small"
                expandable={{
                  expandedRowRender: (record) => (
                    <Card size="small" title="响应内容">
                      <TextArea
                        value={record.response}
                        readOnly
                        rows={6}
                        style={{ fontFamily: 'monospace' }}
                      />
                    </Card>
                  )
                }}
              />
            ) : (
              <Text type="secondary">暂无 Mock 接口</Text>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="常用状态码" size="small">
            <Row gutter={[16, 16]}>
              {[
                { code: 200, desc: 'OK - 成功', color: 'green' },
                { code: 201, desc: 'Created - 已创建', color: 'green' },
                { code: 400, desc: 'Bad Request - 请求错误', color: 'orange' },
                { code: 401, desc: 'Unauthorized - 未授权', color: 'orange' },
                { code: 403, desc: 'Forbidden - 禁止访问', color: 'orange' },
                { code: 404, desc: 'Not Found - 未找到', color: 'orange' },
                { code: 500, desc: 'Internal Server Error - 服务器错误', color: 'red' },
                { code: 502, desc: 'Bad Gateway - 网关错误', color: 'red' }
              ].map((item, index) => (
                <Col span={6} key={index}>
                  <Card size="small" type="inner">
                    <Tag color={item.color}>{item.code}</Tag>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>{item.desc}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MockGenerator;
