import React, { useState } from 'react';
import { Card, Row, Col, Button, Input, Space, message, Typography, Divider, Table, Tag } from 'antd';
import { CopyOutlined, ClearOutlined, UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CookieParser = () => {
  const [input, setInput] = useState('');
  const [parsedCookies, setParsedCookies] = useState([]);
  const [parsedHeaders, setParsedHeaders] = useState([]);
  const [mode, setMode] = useState('cookie');

  const parseCookie = () => {
    if (!input) {
      message.warning('请输入内容');
      return;
    }

    try {
      const cookies = [];
      const pairs = input.split(/[;&]/);
      
      pairs.forEach(pair => {
        const trimmed = pair.trim();
        if (!trimmed) return;
        
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex > 0) {
          const key = trimmed.substring(0, eqIndex).trim();
          const value = trimmed.substring(eqIndex + 1).trim();
          
          if (key && !['Path', 'Domain', 'Expires', 'Max-Age', 'Secure', 'HttpOnly', 'SameSite'].includes(key)) {
            cookies.push({
              key: key,
              value: value,
              id: Date.now() + Math.random()
            });
          }
        }
      });

      setParsedCookies(cookies);
      message.success(`解析成功，共 ${cookies.length} 个 Cookie`);
    } catch (e) {
      message.error('解析失败: ' + e.message);
    }
  };

  const parseHeader = () => {
    if (!input) {
      message.warning('请输入内容');
      return;
    }

    try {
      const headers = [];
      const lines = input.split('\n');
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > 0) {
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim();
          
          headers.push({
            key: key,
            value: value,
            id: Date.now() + Math.random()
          });
        }
      });

      setParsedHeaders(headers);
      message.success(`解析成功，共 ${headers.length} 个 Header`);
    } catch (e) {
      message.error('解析失败: ' + e.message);
    }
  };

  const parse = () => {
    if (mode === 'cookie') {
      parseCookie();
    } else {
      parseHeader();
    }
  };

  const clearAll = () => {
    setInput('');
    setParsedCookies([]);
    setParsedHeaders([]);
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value).then(() => {
      message.success('复制成功');
    });
  };

  const copyAll = () => {
    const data = mode === 'cookie' ? parsedCookies : parsedHeaders;
    const str = data.map(item => `${item.key}=${item.value}`).join(mode === 'cookie' ? '; ' : '\n');
    navigator.clipboard.writeText(str).then(() => {
      message.success('复制成功');
    });
  };

  const cookieColumns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: '名称',
      dataIndex: 'key',
      key: 'key',
      render: (value) => <Tag color="blue">{value}</Tag>
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => copyToClipboard(`${record.key}=${record.value}`)}>
            复制
          </Button>
        </Space>
      )
    }
  ];

  const headerColumns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Header 名',
      dataIndex: 'key',
      key: 'key',
      render: (value) => <Tag color="green">{value}</Tag>
    },
    {
      title: 'Header 值',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => copyToClipboard(`${record.key}: ${record.value}`)}>
            复制
          </Button>
        </Space>
      )
    }
  ];

  const data = mode === 'cookie' ? parsedCookies : parsedHeaders;
  const columns = mode === 'cookie' ? cookieColumns : headerColumns;

  const loadSampleCookie = () => {
    setInput('sessionid=abc123; user_token=xyz789; csrftoken=def456; Path=/; Domain=.example.com');
  };

  const loadSampleHeader = () => {
    setInput('Content-Type: application/json\nAuthorization: Bearer token123\nUser-Agent: Mozilla/5.0\nAccept: */*');
  };

  return (
    <div style={{ padding: '0 20px' }}>
      <Title level={3}>Cookie/Header 解析工具</Title>
      <Text type="secondary">解析 Cookie 字符串或 HTTP Headers</Text>
      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card size="small">
            <Space>
              <Button
                type={mode === 'cookie' ? 'primary' : 'default'}
                onClick={() => setMode('cookie')}
              >
                Cookie 模式
              </Button>
              <Button
                type={mode === 'header' ? 'primary' : 'default'}
                onClick={() => setMode('header')}
              >
                Header 模式
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card
            title={mode === 'cookie' ? 'Cookie 字符串' : 'Headers'}
            extra={
              <Space>
                <Button type="link" size="small" onClick={mode === 'cookie' ? loadSampleCookie : loadSampleHeader}>
                  加载示例
                </Button>
                <Button type="link" size="small" icon={<ClearOutlined />} onClick={clearAll}>
                  清空
                </Button>
              </Space>
            }
          >
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'cookie' ? '请输入 Cookie 字符串' : '请输入 Headers'}
              rows={6}
              style={{ fontFamily: 'monospace' }}
            />
            <Row style={{ marginTop: '12px', textAlign: 'center' }}>
              <Button type="primary" size="large" onClick={parse}>
                解析
              </Button>
            </Row>
          </Card>
        </Col>
      </Row>

      {data.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Card
              title={`解析结果 (${data.length}个)`}
              extra={
                <Button type="link" size="small" icon={<CopyOutlined />} onClick={copyAll}>
                  复制全部
                </Button>
              }
            >
              <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                size="small"
                rowKey="id"
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="常用 Header" size="small">
            <Row gutter={[16, 16]}>
              {[
                { name: 'Content-Type', desc: '内容类型' },
                { name: 'Authorization', desc: '认证信息' },
                { name: 'User-Agent', desc: '用户代理' },
                { name: 'Accept', desc: '接受类型' },
                { name: 'Cookie', desc: 'Cookie' },
                { name: 'Referer', desc: '来源地址' },
                { name: 'Origin', desc: '源地址' },
                { name: 'Host', desc: '主机名' }
              ].map((item, index) => (
                <Col span={6} key={index}>
                  <Card
                    size="small"
                    type="inner"
                    hoverable
                    onClick={() => copyToClipboard(item.name + ': ')}
                  >
                    <Text strong>{item.name}</Text>
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

export default CookieParser;
