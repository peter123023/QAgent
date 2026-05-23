import React, { useState } from 'react';
import {
  Card, Input, Button, Typography, Space, Tag, message, Divider, Row, Col, Tabs, Select
} from 'antd';
import {
  SafetyCertificateOutlined, CopyOutlined, ClearOutlined, CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const JWTTool = () => {
  // 解析模式
  const [token, setToken] = useState('');
  const [decodeResult, setDecodeResult] = useState(null);
  const [decodeError, setDecodeError] = useState('');

  // 生成模式
  const [headerJson, setHeaderJson] = useState(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
  const [payloadJson, setPayloadJson] = useState(JSON.stringify({ sub: 'user', iat: Math.floor(Date.now() / 1000) }, null, 2));
  const [secret, setSecret] = useState('');
  const [algorithm, setAlgorithm] = useState('HS256');
  const [generatedToken, setGeneratedToken] = useState('');

  const base64UrlEncode = (str) => {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const base64UrlDecode = (str) => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    try {
      return JSON.parse(decodeURIComponent(escape(atob(base64))));
    } catch (e) {
      return null;
    }
  };

  const decodeJWT = () => {
    const trimmed = token.trim();
    if (!trimmed) { message.warning('请输入 JWT Token'); return; }
    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      setDecodeError('JWT 格式不正确，应包含 Header.Payload.Signature 三部分');
      setDecodeResult(null); return;
    }
    const header = base64UrlDecode(parts[0]);
    const payload = base64UrlDecode(parts[1]);
    if (!header || !payload) {
      setDecodeError('JWT 解码失败，内容可能已损坏');
      setDecodeResult(null); return;
    }
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < now;
    const expireTime = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : null;
    setDecodeResult({ header, payload, isExpired, expireTime, signature: parts[2] });
    setDecodeError('');
  };

  const clearDecode = () => { setToken(''); setDecodeResult(null); setDecodeError(''); };

  const copyJSON = (obj) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    message.success('已复制到剪贴板');
  };

  const getHashAlgo = (alg) => {
    const map = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' };
    return map[alg] || 'SHA-256';
  };

  const generateJWT = async () => {
    if (!secret.trim()) { message.warning('请输入 Secret Key'); return; }
    let header, payload;
    try { header = JSON.parse(headerJson); } catch { message.error('Header 不是有效的 JSON'); return; }
    try { payload = JSON.parse(payloadJson); } catch { message.error('Payload 不是有效的 JSON'); return; }

    header.alg = algorithm;
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    try {
      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        'raw', encoder.encode(secret),
        { name: 'HMAC', hash: getHashAlgo(algorithm) },
        false, ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(signingInput));
      const sigArray = Array.from(new Uint8Array(signature));
      const sigBase64 = btoa(String.fromCharCode(...sigArray)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      setGeneratedToken(`${signingInput}.${sigBase64}`);
    } catch (e) {
      message.error('签名失败: ' + e.message);
    }
  };

  const clearGenerate = () => {
    setHeaderJson(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
    setPayloadJson(JSON.stringify({ sub: 'user', iat: Math.floor(Date.now() / 1000) }, null, 2));
    setSecret(''); setGeneratedToken('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}><SafetyCertificateOutlined /> JWT 工具</Title>
        <Text type="secondary">解析已有 JWT Token，或通过 Header + Payload + Secret 生成签名后的 JWT</Text>

        <Tabs defaultActiveKey="decode" style={{ marginTop: 24 }}>
          <TabPane tab="解析 JWT" key="decode">
            <Space direction="vertical" style={{ width: '100%' }}>
              <TextArea
                placeholder="粘贴 JWT Token 到此处..."
                value={token}
                onChange={e => setToken(e.target.value)}
                rows={4}
                style={{ fontFamily: 'monospace', fontSize: 13 }}
              />
              <Space>
                <Button type="primary" onClick={decodeJWT}>解析</Button>
                <Button icon={<ClearOutlined />} onClick={clearDecode}>清空</Button>
              </Space>
            </Space>

            {decodeError && (
              <div style={{ marginTop: 16 }}>
                <Tag icon={<CloseCircleOutlined />} color="error">{decodeError}</Tag>
              </div>
            )}

            {decodeResult && (
              <div style={{ marginTop: 24 }}>
                <Space style={{ marginBottom: 16 }}>
                  {decodeResult.isExpired ? (
                    <Tag icon={<CloseCircleOutlined />} color="error">已过期（{decodeResult.expireTime}）</Tag>
                  ) : decodeResult.expireTime ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">有效期内（{decodeResult.expireTime}）</Tag>
                  ) : (
                    <Tag>无过期时间</Tag>
                  )}
                </Space>
                <Row gutter={16}>
                  <Col span={12}>
                    <Card size="small" title={<Text strong>Header</Text>}
                      extra={<Button size="small" icon={<CopyOutlined />} onClick={() => copyJSON(decodeResult.header)}>复制</Button>}>
                      <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 6, fontSize: 12, maxHeight: 300, overflow: 'auto', margin: 0 }}>
                        {JSON.stringify(decodeResult.header, null, 2)}
                      </pre>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" title={<Text strong>Payload</Text>}
                      extra={<Button size="small" icon={<CopyOutlined />} onClick={() => copyJSON(decodeResult.payload)}>复制</Button>}>
                      <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 6, fontSize: 12, maxHeight: 300, overflow: 'auto', margin: 0 }}>
                        {JSON.stringify(decodeResult.payload, null, 2)}
                      </pre>
                    </Card>
                  </Col>
                </Row>
                <Divider />
                <Card size="small" title={<Text strong>Signature</Text>}>
                  <Text code copyable style={{ fontSize: 12, wordBreak: 'break-all' }}>{decodeResult.signature}</Text>
                </Card>
              </div>
            )}
          </TabPane>

          <TabPane tab="生成 JWT" key="generate">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Header</Text>
                  <TextArea
                    value={headerJson}
                    onChange={e => setHeaderJson(e.target.value)}
                    rows={6}
                    style={{ fontFamily: 'monospace', fontSize: 13, marginTop: 8 }}
                  />
                </Col>
                <Col span={12}>
                  <Text strong>Payload</Text>
                  <TextArea
                    value={payloadJson}
                    onChange={e => setPayloadJson(e.target.value)}
                    rows={6}
                    style={{ fontFamily: 'monospace', fontSize: 13, marginTop: 8 }}
                  />
                </Col>
              </Row>

              <Row gutter={16} align="middle" style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Text strong>Secret Key</Text>
                  <Input.Password
                    placeholder="输入签名密钥..."
                    value={secret}
                    onChange={e => setSecret(e.target.value)}
                    style={{ marginTop: 8 }}
                  />
                </Col>
                <Col span={12}>
                  <Text strong>算法</Text>
                  <Select value={algorithm} onChange={setAlgorithm} style={{ width: '100%', marginTop: 8 }}>
                    <Option value="HS256">HS256</Option>
                    <Option value="HS384">HS384</Option>
                    <Option value="HS512">HS512</Option>
                  </Select>
                </Col>
              </Row>

              <Space style={{ marginTop: 8 }}>
                <Button type="primary" onClick={generateJWT}>生成 JWT</Button>
                <Button icon={<ClearOutlined />} onClick={clearGenerate}>重置</Button>
              </Space>

              {generatedToken && (
                <>
                  <Divider />
                  <Card size="small" title={<Text strong>生成的 JWT Token</Text>}
                    extra={<Button size="small" icon={<CopyOutlined />} onClick={() => { navigator.clipboard.writeText(generatedToken); message.success('已复制'); }}>复制</Button>}>
                    <Text code copyable style={{ fontSize: 12, wordBreak: 'break-all' }}>{generatedToken}</Text>
                  </Card>
                </>
              )}
            </Space>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default JWTTool;
