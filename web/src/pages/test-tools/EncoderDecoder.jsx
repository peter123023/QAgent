import React, { useState } from 'react';
import { Card, Row, Col, Button, Select, Input, Space, message, Typography, Divider } from 'antd';
import { SwapOutlined, CopyOutlined, ClearOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const encoderTypes = [
  { key: 'base64', label: 'Base64 编解码' },
  { key: 'url', label: 'URL 编解码' },
  { key: 'md5', label: 'MD5 加密' },
  { key: 'sha1', label: 'SHA1 加密' },
  { key: 'sha256', label: 'SHA256 加密' },
  { key: 'jwt-decode', label: 'JWT 解码' }
];

const EncoderDecoder = () => {
  const [selectedType, setSelectedType] = useState('base64');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isDecode, setIsDecode] = useState(false);

  const base64Encode = (str) => {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      return '编码失败: ' + e.message;
    }
  };

  const base64Decode = (str) => {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch (e) {
      return '解码失败: ' + e.message;
    }
  };

  const urlEncode = (str) => {
    try {
      return encodeURIComponent(str);
    } catch (e) {
      return '编码失败: ' + e.message;
    }
  };

  const urlDecode = (str) => {
    try {
      return decodeURIComponent(str);
    } catch (e) {
      return '解码失败: ' + e.message;
    }
  };

  const md5 = async (str) => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('MD5', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return '加密失败: ' + e.message;
    }
  };

  const sha1 = async (str) => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return '加密失败: ' + e.message;
    }
  };

  const sha256 = async (str) => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return '加密失败: ' + e.message;
    }
  };

  const jwtDecode = (str) => {
    try {
      const parts = str.split('.');
      if (parts.length !== 3) {
        return '无效的 JWT 格式';
      }
      const header = JSON.parse(decodeURIComponent(escape(atob(parts[0]))));
      const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1]))));
      return JSON.stringify({ header, payload }, null, 2);
    } catch (e) {
      return '解码失败: ' + e.message;
    }
  };

  const convert = async () => {
    if (!input) {
      message.warning('请输入内容');
      return;
    }

    let result = '';

    switch (selectedType) {
      case 'base64':
        result = isDecode ? base64Decode(input) : base64Encode(input);
        break;
      case 'url':
        result = isDecode ? urlDecode(input) : urlEncode(input);
        break;
      case 'md5':
        result = await md5(input);
        break;
      case 'sha1':
        result = await sha1(input);
        break;
      case 'sha256':
        result = await sha256(input);
        break;
      case 'jwt-decode':
        result = jwtDecode(input);
        break;
      default:
        result = '未知类型';
    }

    setOutput(result);
    message.success('转换成功');
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output).then(() => {
        message.success('复制成功');
      });
    }
  };

  const showDecodeSwitch = ['base64', 'url'].includes(selectedType);
  const isHashType = ['md5', 'sha1', 'sha256', 'jwt-decode'].includes(selectedType);

  return (
    <div style={{ padding: '0 20px' }}>
      <Title level={3}>编解码工具</Title>
      <Text type="secondary">支持 Base64、URL、MD5、SHA1、SHA256、JWT 等编解码</Text>
      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card size="small">
            <Space>
              <Select
                value={selectedType}
                onChange={setSelectedType}
                style={{ width: 200 }}
                options={encoderTypes.map(type => ({
                  value: type.key,
                  label: type.label
                }))}
              />
              {showDecodeSwitch && (
                <Select
                  value={isDecode ? 'decode' : 'encode'}
                  onChange={(v) => setIsDecode(v === 'decode')}
                  style={{ width: 120 }}
                  options={[
                    { value: 'encode', label: '编码' },
                    { value: 'decode', label: '解码' }
                  ]}
                />
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card
            title={isHashType ? '原文' : (isDecode ? '密文' : '原文')}
            extra={
              <Button type="link" size="small" icon={<ClearOutlined />} onClick={clearAll}>
                清空
              </Button>
            }
          >
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`请输入${isHashType ? '原文' : (isDecode ? '密文' : '原文')}`}
              rows={12}
              style={{ fontFamily: 'monospace' }}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={isHashType ? '结果' : (isDecode ? '原文' : '密文')}
            extra={
              <Button type="link" size="small" icon={<CopyOutlined />} onClick={copyOutput}>
                复制
              </Button>
            }
          >
            <TextArea
              value={output}
              readOnly
              placeholder="结果将显示在这里"
              rows={12}
              style={{ fontFamily: 'monospace' }}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: '16px' }}>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<SwapOutlined />}
            onClick={convert}
            style={{ width: 200 }}
          >
            转换
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default EncoderDecoder;
