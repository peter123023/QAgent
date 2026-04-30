import React, { useState } from 'react';
import { Card, Row, Col, Button, Select, Input, InputNumber, Space, message, Typography, Divider, Table, Form } from 'antd';
import { PlusOutlined, MinusCircleOutlined, SwapOutlined, CopyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const signatureAlgorithms = [
  { key: 'md5', label: 'MD5' },
  { key: 'sha1', label: 'SHA1' },
  { key: 'sha256', label: 'SHA256' },
  { key: 'hmac-md5', label: 'HMAC-MD5' },
  { key: 'hmac-sha1', label: 'HMAC-SHA1' },
  { key: 'hmac-sha256', label: 'HMAC-SHA256' }
];

const SignatureGenerator = () => {
  const [algorithm, setAlgorithm] = useState('md5');
  const [appKey, setAppKey] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());
  const [nonce, setNonce] = useState('');
  const [signature, setSignature] = useState('');
  const [signHistory, setSignHistory] = useState([]);
  const [form] = Form.useForm();

  const generateNonce = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNonce(result);
  };

  const generateSignature = async (values) => {
    try {
      const params = values.params || [];
      
      let paramString = params
        .filter(p => p.key && p.value)
        .sort((a, b) => a.key.localeCompare(b.key))
        .map(p => `${p.key}=${p.value}`)
        .join('&');

      if (appKey) {
        paramString = `app_key=${appKey}&${paramString}`;
      }
      if (timestamp) {
        paramString = `${paramString}&timestamp=${timestamp}`;
      }
      if (nonce) {
        paramString = `${paramString}&nonce=${nonce}`;
      }
      if (appSecret) {
        paramString = `${paramString}&app_secret=${appSecret}`;
      }

      let result = '';
      
      switch (algorithm) {
        case 'md5':
          result = await md5(paramString);
          break;
        case 'sha1':
          result = await sha1(paramString);
          break;
        case 'sha256':
          result = await sha256(paramString);
          break;
        case 'hmac-md5':
          result = await hmacMd5(paramString, appSecret);
          break;
        case 'hmac-sha1':
          result = await hmacSha1(paramString, appSecret);
          break;
        case 'hmac-sha256':
          result = await hmacSha256(paramString, appSecret);
          break;
        default:
          result = await md5(paramString);
      }

      setSignature(result);

      const historyItem = {
        key: Date.now(),
        algorithm: algorithm,
        appKey: appKey,
        timestamp: timestamp,
        nonce: nonce,
        signature: result,
        time: new Date().toLocaleTimeString()
      };
      setSignHistory([historyItem, ...signHistory.slice(0, 9)]);

      message.success('签名生成成功');
    } catch (e) {
      message.error('签名生成失败: ' + e.message);
    }
  };

  const md5 = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const sha1 = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const sha256 = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const hmacMd5 = async (str, secret) => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'MD5' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', keyMaterial, encoder.encode(str));
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const hmacSha1 = async (str, secret) => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', keyMaterial, encoder.encode(str));
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const hmacSha256 = async (str, secret) => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', keyMaterial, encoder.encode(str));
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value).then(() => {
      message.success('复制成功');
    });
  };

  const columns = [
    {
      title: '算法',
      dataIndex: 'algorithm',
      key: 'algorithm',
      render: (value) => value.toUpperCase()
    },
    {
      title: 'AppKey',
      dataIndex: 'appKey',
      key: 'appKey',
      ellipsis: true
    },
    {
      title: '时间戳',
      dataIndex: 'timestamp',
      key: 'timestamp'
    },
    {
      title: '签名',
      dataIndex: 'signature',
      key: 'signature',
      ellipsis: true,
      render: (value) => (
        <Text code copyable={{ text: value }} style={{ fontSize: '12px' }}>
          {value}
        </Text>
      )
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time'
    }
  ];

  return (
    <div style={{ padding: '0 20px' }}>
      <Title level={3}>接口签名生成器</Title>
      <Text type="secondary">生成 API 接口请求签名，支持多种算法</Text>
      <Divider />

      <Form
        form={form}
        onFinish={generateSignature}
        initialValues={{ params: [{ key: '', value: '' }] }}
      >
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card title="基本配置" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Select
                  value={algorithm}
                  onChange={setAlgorithm}
                  style={{ width: '100%' }}
                  options={signatureAlgorithms}
                />
                <Input
                  value={appKey}
                  onChange={(e) => setAppKey(e.target.value)}
                  placeholder="App Key"
                />
                <Input.Password
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value)}
                  placeholder="App Secret"
                />
                <InputNumber
                  value={timestamp}
                  onChange={setTimestamp}
                  style={{ width: '100%' }}
                  addonBefore="时间戳"
                />
                <Input
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  placeholder="随机字符串"
                  addonAfter={
                    <Button type="link" size="small" onClick={generateNonce}>
                      生成
                    </Button>
                  }
                />
              </Space>
            </Card>
          </Col>

          <Col span={16}>
            <Card
              title="请求参数"
              extra={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  参数将按键名排序后拼接
                </Text>
              }
              size="small"
            >
              <Form.List name="params">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'key']}
                          style={{ marginBottom: 0, width: 150 }}
                        >
                          <Input placeholder="参数名" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'value']}
                          style={{ marginBottom: 0, flex: 1 }}
                        >
                          <Input placeholder="参数值" />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        添加参数
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Button type="primary" size="large" htmlType="submit" block icon={<SwapOutlined />}>
              生成签名
            </Button>
          </Col>
        </Row>
      </Form>

      {signature && (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Card title="签名结果">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>签名算法: {algorithm.toUpperCase()}</Text>
                <TextArea
                  value={signature}
                  readOnly
                  rows={2}
                  style={{ fontFamily: 'monospace' }}
                />
                <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(signature)}>
                  复制签名
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="签名历史">
            {signHistory.length > 0 ? (
              <Table
                columns={columns}
                dataSource={signHistory}
                pagination={false}
                size="small"
              />
            ) : (
              <Text type="secondary">暂无签名历史</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SignatureGenerator;
