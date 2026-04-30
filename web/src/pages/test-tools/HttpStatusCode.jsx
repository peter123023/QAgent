import React, { useState, useMemo } from 'react';
import { Card, Input, Table, Tag, Space, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const httpStatusCodes = [
  { code: '100', type: 'informational', message: 'Continue', description: '服务器已收到请求头，客户端应继续发送请求主体' },
  { code: '101', type: 'informational', message: 'Switching Protocols', description: '服务器正在切换协议' },
  { code: '102', type: 'informational', message: 'Processing', description: '服务器已接受请求，正在处理，但尚未完成' },
  { code: '200', type: 'success', message: 'OK', description: '请求成功' },
  { code: '201', type: 'success', message: 'Created', description: '请求已成功处理并创建了新的资源' },
  { code: '202', type: 'success', message: 'Accepted', description: '服务器已接受请求，但尚未处理' },
  { code: '203', type: 'success', message: 'Non-Authoritative Information', description: '请求成功，但返回的元信息来自缓存而非原始服务器' },
  { code: '204', type: 'success', message: 'No Content', description: '服务器成功处理了请求，但不需要返回任何内容' },
  { code: '205', type: 'success', message: 'Reset Content', description: '服务器成功处理了请求，要求客户端重置文档视图' },
  { code: '206', type: 'success', message: 'Partial Content', description: '服务器成功处理了部分GET请求' },
  { code: '300', type: 'redirection', message: 'Multiple Choices', description: '请求的资源有多个可供选择的响应' },
  { code: '301', type: 'redirection', message: 'Moved Permanently', description: '请求的资源已被永久移动到新位置' },
  { code: '302', type: 'redirection', message: 'Found', description: '请求的资源临时从不同的URI响应请求' },
  { code: '303', type: 'redirection', message: 'See Other', description: '对应当前请求的响应可以在另一个URI上被找到' },
  { code: '304', type: 'redirection', message: 'Not Modified', description: '资源未修改，可以使用缓存' },
  { code: '305', type: 'redirection', message: 'Use Proxy', description: '被请求的资源必须通过指定的代理才能被访问' },
  { code: '307', type: 'redirection', message: 'Temporary Redirect', description: '请求的资源临时从不同的URI响应请求' },
  { code: '308', type: 'redirection', message: 'Permanent Redirect', description: '请求的资源已被永久移动到新位置' },
  { code: '400', type: 'client_error', message: 'Bad Request', description: '服务器无法理解请求的语法' },
  { code: '401', type: 'client_error', message: 'Unauthorized', description: '请求要求用户的身份认证' },
  { code: '402', type: 'client_error', message: 'Payment Required', description: '预留，将来可能需要支付' },
  { code: '403', type: 'client_error', message: 'Forbidden', description: '服务器理解请求，但拒绝执行' },
  { code: '404', type: 'client_error', message: 'Not Found', description: '服务器找不到请求的资源' },
  { code: '405', type: 'client_error', message: 'Method Not Allowed', description: '请求方法不被允许' },
  { code: '406', type: 'client_error', message: 'Not Acceptable', description: '请求的资源的内容特性无法满足请求头中的条件' },
  { code: '407', type: 'client_error', message: 'Proxy Authentication Required', description: '客户端必须使用代理进行身份验证' },
  { code: '408', type: 'client_error', message: 'Request Timeout', description: '服务器等待请求超时' },
  { code: '409', type: 'client_error', message: 'Conflict', description: '服务器处理请求时发生冲突' },
  { code: '410', type: 'client_error', message: 'Gone', description: '请求的资源在服务器上已经不存在' },
  { code: '411', type: 'client_error', message: 'Length Required', description: '服务器拒绝在没有定义Content-Length头的情况下接受请求' },
  { code: '412', type: 'client_error', message: 'Precondition Failed', description: '服务器在验证请求头中的先决条件时失败' },
  { code: '413', type: 'client_error', message: 'Payload Too Large', description: '请求实体过大，服务器无法处理' },
  { code: '414', type: 'client_error', message: 'URI Too Long', description: '请求的URI长度超过了服务器能够解释的范围' },
  { code: '415', type: 'client_error', message: 'Unsupported Media Type', description: '服务器无法处理请求附带的媒体格式' },
  { code: '416', type: 'client_error', message: 'Range Not Satisfiable', description: '客户端请求的范围无效' },
  { code: '417', type: 'client_error', message: 'Expectation Failed', description: '服务器无法满足Expect请求头的要求' },
  { code: '418', type: 'client_error', message: 'I\'m a teapot', description: '我是一个茶壶，不能煮咖啡' },
  { code: '422', type: 'client_error', message: 'Unprocessable Entity', description: '请求格式正确，但是语义错误' },
  { code: '423', type: 'client_error', message: 'Locked', description: '当前资源被锁定' },
  { code: '424', type: 'client_error', message: 'Failed Dependency', description: '由于之前的请求失败，导致当前请求失败' },
  { code: '425', type: 'client_error', message: 'Too Early', description: '服务器不愿意冒险处理可能被重放的请求' },
  { code: '426', type: 'client_error', message: 'Upgrade Required', description: '客户端应切换到TLS/1.0' },
  { code: '428', type: 'client_error', message: 'Precondition Required', description: '原始服务器要求请求是有条件的' },
  { code: '429', type: 'client_error', message: 'Too Many Requests', description: '用户在给定的时间内发送了太多的请求' },
  { code: '431', type: 'client_error', message: 'Request Header Fields Too Large', description: '请求头字段太大，服务器无法处理' },
  { code: '451', type: 'client_error', message: 'Unavailable For Legal Reasons', description: '因法律原因不可用' },
  { code: '500', type: 'server_error', message: 'Internal Server Error', description: '服务器内部错误' },
  { code: '501', type: 'server_error', message: 'Not Implemented', description: '服务器不支持当前请求的功能' },
  { code: '502', type: 'server_error', message: 'Bad Gateway', description: '网关或代理服务器收到无效的响应' },
  { code: '503', type: 'server_error', message: 'Service Unavailable', description: '服务器暂时不可用' },
  { code: '504', type: 'server_error', message: 'Gateway Timeout', description: '网关或代理服务器超时' },
  { code: '505', type: 'server_error', message: 'HTTP Version Not Supported', description: '服务器不支持请求中使用的HTTP版本' },
  { code: '506', type: 'server_error', message: 'Variant Also Negotiates', description: '服务器内部配置错误' },
  { code: '507', type: 'server_error', message: 'Insufficient Storage', description: '服务器无法存储完成请求所必须的内容' },
  { code: '508', type: 'server_error', message: 'Loop Detected', description: '服务器检测到死循环' },
  { code: '510', type: 'server_error', message: 'Not Extended', description: '获取资源所需要的策略并没有被满足' },
  { code: '511', type: 'server_error', message: 'Network Authentication Required', description: '客户端需要进行身份验证才能获得网络访问权限' }
];

const typeMap = {
  informational: { color: 'blue', label: '信息响应' },
  success: { color: 'green', label: '成功响应' },
  redirection: { color: 'cyan', label: '重定向' },
  client_error: { color: 'orange', label: '客户端错误' },
  server_error: { color: 'red', label: '服务器错误' }
};

const HttpStatusCode = () => {
  const [searchText, setSearchText] = useState('');

  const filteredData = useMemo(() => {
    if (!searchText) return httpStatusCodes;
    const lowerText = searchText.toLowerCase();
    return httpStatusCodes.filter(item => 
      item.code.includes(lowerText) || 
      item.message.toLowerCase().includes(lowerText) ||
      item.description.toLowerCase().includes(lowerText)
    );
  }, [searchText]);

  const columns = [
    {
      title: '状态码',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code) => <Text strong>{code}</Text>
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const { color, label } = typeMap[type];
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '说明',
      dataIndex: 'message',
      key: 'message',
      width: 200
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    }
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Title level={3}>HTTP状态码查询</Title>
        <Input
          placeholder="搜索状态码、说明或描述"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 20, maxWidth: 400 }}
          allowClear
        />
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="code"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条状态码`
          }}
        />
      </Card>
    </Space>
  );
};

export default HttpStatusCode;
