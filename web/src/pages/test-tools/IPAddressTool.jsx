import React, { useState } from 'react';
import { Card, Input, Button, Typography, Space, Tag, message } from 'antd';
import { SearchOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const IPAddressTool = () => {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState(null);

  const validateIP = (value) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
    const ipv6Regex = /^(?:[\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^::1$|^::$/;
    return { ipv4: ipv4Regex.test(value), ipv6: ipv6Regex.test(value) };
  };

  const isPrivateIP = (value) => {
    const parts = value.split('.').map(Number);
    if (parts.length !== 4) return false;
    const [a, b, c] = parts;
    return (
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 127) ||
      (a === 169 && b === 254)
    );
  };

  const handleCheck = () => {
    const trimmed = ip.trim();
    if (!trimmed) {
      message.warning('请输入 IP 地址');
      return;
    }
    const { ipv4, ipv6 } = validateIP(trimmed);
    if (!ipv4 && !ipv6) {
      setResult({ valid: false, message: '无效的 IP 地址格式' });
      return;
    }
    setResult({
      valid: true,
      type: ipv4 ? 'IPv4' : 'IPv6',
      isPrivate: ipv4 ? isPrivateIP(trimmed) : false,
      ip: trimmed,
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}><GlobalOutlined /> IP 地址工具</Title>
        <Text type="secondary">输入 IP 地址进行格式校验和内网/公网判断</Text>

        <Space style={{ marginTop: 24, width: '100%' }}>
          <Input
            placeholder="例如：192.168.1.1 或 2001:0db8:85a3::8a2e:0370:7334"
            value={ip}
            onChange={e => setIp(e.target.value)}
            onPressEnter={handleCheck}
            style={{ width: 400 }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleCheck}>
            校验
          </Button>
        </Space>

        {result && (
          <div style={{ marginTop: 24 }}>
            {result.valid ? (
              <Space direction="vertical">
                <div>
                  <Text strong>IP 地址：</Text>
                  <Text code>{result.ip}</Text>
                </div>
                <div>
                  <Text strong>类型：</Text>
                  <Tag color="blue">{result.type}</Tag>
                </div>
                <div>
                  <Text strong>网络类型：</Text>
                  <Tag color={result.isPrivate ? 'orange' : 'green'}>
                    {result.isPrivate ? '内网地址' : '公网地址'}
                  </Tag>
                </div>
              </Space>
            ) : (
              <Tag color="red">{result.message}</Tag>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default IPAddressTool;
