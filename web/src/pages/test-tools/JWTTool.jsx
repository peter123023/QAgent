import React, { useState } from 'react';
import {
  Card, Input, Button, Typography, Space, Tag, message, Divider, Row, Col
} from 'antd';
import {
  SafetyCertificateOutlined, CopyOutlined, ClearOutlined, CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const JWTTool = () => {
  const [token, setToken] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const base64UrlDecode = (str) => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      base64 += '='.repeat(4 - pad);
    }
    try {
      return JSON.parse(decodeURIComponent(escape(atob(base64))));
    } catch (e) {
      return null;
    }
  };

  const decodeJWT = () => {
    const trimmed = token.trim();
    if (!trimmed) {
      message.warning('请输入 JWT Token');
      return;
    }
    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      setError('JWT 格式不正确，应包含 Header.Payload.Signature 三部分');
      setResult(null);
      return;
    }

    const header = base64UrlDecode(parts[0]);
    const payload = base64UrlDecode(parts[1]);

    if (!header || !payload) {
      setError('JWT 解码失败，内容可能已损坏');
      setResult(null);
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < now;
    const expireTime = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : null;

    setResult({ header, payload, isExpired, expireTime, rawHeader: parts[0], rawPayload: parts[1], signature: parts[2] });
    setError('');
  };

  const copyJSON = (obj) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    message.success('已复制到剪贴板');
  };

  const clearAll = () => {
    setToken('');
    setResult(null);
    setError('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}><SafetyCertificateOutlined /> JWT 解析工具</Title>
        <Text type="secondary">输入 JWT Token，解析 Header 和 Payload，检查过期时间</Text>

        <Space direction="vertical" style={{ width: '100%', marginTop: 24 }}>
          <TextArea
            placeholder="粘贴 JWT Token 到此处..."
            value={token}
            onChange={e => setToken(e.target.value)}
            rows={4}
            style={{ fontFamily: 'monospace', fontSize: 13 }}
          />
          <Space>
            <Button type="primary" onClick={decodeJWT}>解析</Button>
            <Button icon={<ClearOutlined />} onClick={clearAll}>清空</Button>
          </Space>
        </Space>

        {error && (
          <div style={{ marginTop: 16 }}>
            <Tag icon={<CloseCircleOutlined />} color="error">{error}</Tag>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 24 }}>
            <Space style={{ marginBottom: 16 }}>
              {result.isExpired ? (
                <Tag icon={<CloseCircleOutlined />} color="error">已过期（{result.expireTime}）</Tag>
              ) : result.expireTime ? (
                <Tag icon={<CheckCircleOutlined />} color="success">有效期内（{result.expireTime}）</Tag>
              ) : (
                <Tag>无过期时间</Tag>
              )}
            </Space>

            <Row gutter={16}>
              <Col span={12}>
                <Card
                  size="small"
                  title={<Text strong>Header</Text>}
                  extra={<Button size="small" icon={<CopyOutlined />} onClick={() => copyJSON(result.header)}>复制</Button>}
                >
                  <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 6, fontSize: 12, maxHeight: 300, overflow: 'auto', margin: 0 }}>
                    {JSON.stringify(result.header, null, 2)}
                  </pre>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  size="small"
                  title={<Text strong>Payload</Text>}
                  extra={<Button size="small" icon={<CopyOutlined />} onClick={() => copyJSON(result.payload)}>复制</Button>}
                >
                  <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 6, fontSize: 12, maxHeight: 300, overflow: 'auto', margin: 0 }}>
                    {JSON.stringify(result.payload, null, 2)}
                  </pre>
                </Card>
              </Col>
            </Row>

            <Divider />
            <Card size="small" title={<Text strong>Signature</Text>}>
              <Text code copyable style={{ fontSize: 12, wordBreak: 'break-all' }}>
                {result.signature}
              </Text>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
};

export default JWTTool;
