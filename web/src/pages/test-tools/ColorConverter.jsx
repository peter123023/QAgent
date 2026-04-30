import React, { useState } from 'react';
import { Card, Row, Col, Button, Input, Space, message, Typography, Descriptions, Tag } from 'antd';
import { BgColorsOutlined, CopyOutlined, SwapOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ColorConverter = () => {
  const [hexColor, setHexColor] = useState('#3b82f6');
  const [rgbColor, setRgbColor] = useState({ r: 59, g: 130, b: 246 });
  const [hslColor, setHslColor] = useState({ h: 217, s: 91, l: 60 });

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const updateFromHex = (hex) => {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
      message.error('HEX格式错误，应为 #RRGGBB');
      return;
    }
    setHexColor(hex);
    const rgb = hexToRgb(hex);
    if (rgb) {
      setRgbColor(rgb);
      setHslColor(rgbToHsl(rgb.r, rgb.g, rgb.b));
    }
  };

  const updateFromRgb = (r, g, b) => {
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      message.error('RGB值应在0-255之间');
      return;
    }
    setRgbColor({ r, g, b });
    setHexColor(rgbToHex(r, g, b));
    setHslColor(rgbToHsl(r, g, b));
  };

  const updateFromHsl = (h, s, l) => {
    if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
      message.error('HSL值范围错误');
      return;
    }
    setHslColor({ h, s, l });
    const rgb = hslToRgb(h, s, l);
    setRgbColor(rgb);
    setHexColor(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  const copyColor = (format) => {
    let text = '';
    switch (format) {
      case 'hex':
        text = hexColor;
        break;
      case 'rgb':
        text = `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`;
        break;
      case 'hsl':
        text = `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`;
        break;
    }
    navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  };

  const presetColors = [
    { name: '红色', hex: '#ef4444' },
    { name: '橙色', hex: '#f97316' },
    { name: '黄色', hex: '#eab308' },
    { name: '绿色', hex: '#22c55e' },
    { name: '青色', hex: '#06b6d4' },
    { name: '蓝色', hex: '#3b82f6' },
    { name: '紫色', hex: '#a855f7' },
    { name: '粉色', hex: '#ec4899' }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>颜色转换工具</Title>
      <Text type="secondary">HEX、RGB、HSL颜色格式互转</Text>

      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="颜色输入">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>HEX颜色</Text>
                <Input
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  onBlur={(e) => updateFromHex(e.target.value)}
                  placeholder="#RRGGBB"
                  style={{ marginTop: '8px' }}
                  addonAfter={
                    <input
                      type="color"
                      value={hexColor}
                      onChange={(e) => updateFromHex(e.target.value)}
                      style={{ border: 'none', cursor: 'pointer' }}
                    />
                  }
                  suffix={
                    <Button size="small" icon={<CopyOutlined />} onClick={() => copyColor('hex')} type="text" />
                  }
                />
              </div>

              <div>
                <Text strong>RGB颜色</Text>
                <Space style={{ marginTop: '8px', width: '100%' }}>
                  <Input
                    type="number"
                    value={rgbColor.r}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      updateFromRgb(val, rgbColor.g, rgbColor.b);
                    }}
                    placeholder="R"
                    min={0}
                    max={255}
                    style={{ width: '80px' }}
                  />
                  <Input
                    type="number"
                    value={rgbColor.g}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      updateFromRgb(rgbColor.r, val, rgbColor.b);
                    }}
                    placeholder="G"
                    min={0}
                    max={255}
                    style={{ width: '80px' }}
                  />
                  <Input
                    type="number"
                    value={rgbColor.b}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      updateFromRgb(rgbColor.r, rgbColor.g, val);
                    }}
                    placeholder="B"
                    min={0}
                    max={255}
                    style={{ width: '80px' }}
                  />
                  <Button size="small" icon={<CopyOutlined />} onClick={() => copyColor('rgb')} />
                </Space>
              </div>

              <div>
                <Text strong>HSL颜色</Text>
                <Space style={{ marginTop: '8px', width: '100%' }}>
                  <Input
                    type="number"
                    value={hslColor.h}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      updateFromHsl(val, hslColor.s, hslColor.l);
                    }}
                    placeholder="H"
                    min={0}
                    max={360}
                    style={{ width: '80px' }}
                    addonAfter="°"
                  />
                  <Input
                    type="number"
                    value={hslColor.s}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      updateFromHsl(hslColor.h, val, hslColor.l);
                    }}
                    placeholder="S"
                    min={0}
                    max={100}
                    style={{ width: '80px' }}
                    addonAfter="%"
                  />
                  <Input
                    type="number"
                    value={hslColor.l}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      updateFromHsl(hslColor.h, hslColor.s, val);
                    }}
                    placeholder="L"
                    min={0}
                    max={100}
                    style={{ width: '80px' }}
                    addonAfter="%"
                  />
                  <Button size="small" icon={<CopyOutlined />} onClick={() => copyColor('hsl')} />
                </Space>
              </div>
            </Space>
          </Card>

          <Card title="预设颜色" style={{ marginTop: '16px' }}>
            <Space wrap>
              {presetColors.map((color, index) => (
                <div
                  key={index}
                  onClick={() => updateFromHex(color.hex)}
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: color.hex,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '2px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                  title={color.name}
                >
                  <Text style={{ fontSize: '10px', color: '#fff', textShadow: '0 0 2px #000' }}>
                    {color.name}
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="颜色预览">
            <div
              style={{
                width: '100%',
                height: '200px',
                backgroundColor: hexColor,
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                marginBottom: '16px'
              }}
            />
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="HEX">
                <Text code copyable>{hexColor}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="RGB">
                <Text code copyable>{`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="HSL">
                <Text code copyable>{`hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="CSS RGB">
                <Text code copyable>{`rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 1)`}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="CSS HSL">
                <Text code copyable>{`hsla(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%, 1)`}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ColorConverter;
