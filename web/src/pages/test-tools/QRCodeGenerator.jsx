import React, { useState } from 'react';
import { Card, Row, Col, Button, Input, InputNumber, Select, Space, message, Typography, ColorPicker, QRCode } from 'antd';
import { QrcodeOutlined, DownloadOutlined, ClearOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const QRCodeGenerator = () => {
  const [content, setContent] = useState('https://github.com/peter123023/QAgent');
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState('M');
  const [foreground, setForeground] = useState('#000000');
  const [background, setBackground] = useState('#ffffff');

  const downloadQRCode = () => {
    if (!content) {
      message.error('请先输入二维码内容');
      return;
    }
    const canvas = document.querySelector('#qrcode canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('二维码下载成功');
    }
  };

  const clearAll = () => {
    setContent('');
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="二维码生成器" extra={<QrcodeOutlined />}>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>二维码内容</Text>
                <TextArea
                  rows={6}
                  placeholder="请输入需要生成二维码的内容，支持文本、链接等"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>二维码大小</Text>
                <InputNumber
                  min={128}
                  max={1024}
                  step={32}
                  value={size}
                  onChange={setSize}
                  style={{ width: '100%' }}
                  addonAfter="px"
                />
              </div>

              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>纠错级别</Text>
                <Select
                  value={errorLevel}
                  onChange={setErrorLevel}
                  style={{ width: '100%' }}
                >
                  <Option value="L">低 (7%)</Option>
                  <Option value="M">中 (15%)</Option>
                  <Option value="Q">较高 (25%)</Option>
                  <Option value="H">高 (30%)</Option>
                </Select>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>前景色</Text>
                  <ColorPicker
                    value={foreground}
                    onChange={(color) => setForeground(color.toHexString())}
                    showText
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>背景色</Text>
                  <ColorPicker
                    value={background}
                    onChange={(color) => setBackground(color.toHexString())}
                    showText
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <Space>
                <Button onClick={downloadQRCode} icon={<DownloadOutlined />}>下载二维码</Button>
                <Button onClick={clearAll} icon={<ClearOutlined />}>清空</Button>
              </Space>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              padding: '24px',
              background: '#f5f5f5',
              borderRadius: 8
            }}>
              {content ? (
                <>
                  <div id="qrcode">
                    <QRCode
                      value={content}
                      size={size}
                      level={errorLevel}
                      color={foreground}
                      bgColor={background}
                      style={{ 
                        border: '8px solid #fff',
                        borderRadius: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                  </div>
                  <Text type="secondary" style={{ marginTop: 16 }}>扫码查看内容</Text>
                </>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  color: '#999'
                }}>
                  <QrcodeOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                  <Text>输入内容后自动生成二维码</Text>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};

export default QRCodeGenerator;
