import React, { useState } from 'react';
import { Card, Row, Col, Button, Select, Input, Space, message, Typography, Divider, Alert } from 'antd';
import { SwapOutlined, CopyOutlined, ClearOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const conversionTypes = [
  { key: 'json-format', label: 'JSON 格式化' },
  { key: 'json-minify', label: 'JSON 压缩' },
  { key: 'json-to-yaml', label: 'JSON 转 YAML' },
  { key: 'yaml-to-json', label: 'YAML 转 JSON' },
  { key: 'json-to-xml', label: 'JSON 转 XML' },
  { key: 'xml-to-json', label: 'XML 转 JSON' }
];

const FormatConverter = () => {
  const [selectedType, setSelectedType] = useState('json-format');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const jsonFormat = (str) => {
    try {
      const obj = JSON.parse(str);
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      throw new Error('JSON 解析错误: ' + e.message);
    }
  };

  const jsonMinify = (str) => {
    try {
      const obj = JSON.parse(str);
      return JSON.stringify(obj);
    } catch (e) {
      throw new Error('JSON 解析错误: ' + e.message);
    }
  };

  const jsonToYaml = (str) => {
    try {
      const obj = JSON.parse(str);
      let yaml = '';
      
      const convertObj = (obj, indent = 0) => {
        const spaces = '  '.repeat(indent);
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              yaml += `${spaces}${key}:\n`;
              value.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                  yaml += `${spaces}- \n`;
                  convertObj(item, indent + 2);
                } else {
                  yaml += `${spaces}- ${item}\n`;
                }
              });
            } else {
              yaml += `${spaces}${key}:\n`;
              convertObj(value, indent + 1);
            }
          } else {
            yaml += `${spaces}${key}: ${value}\n`;
          }
        }
      };
      
      convertObj(obj);
      return yaml;
    } catch (e) {
      throw new Error('JSON 解析错误: ' + e.message);
    }
  };

  const yamlToJson = (str) => {
    try {
      const lines = str.trim().split('\n');
      const result = {};
      let current = result;
      const stack = [{ obj: result, indent: -1 }];
      
      for (let line of lines) {
        if (!line.trim() || line.trim().startsWith('#')) continue;
        
        const indent = line.match(/^(\s*)/)[1].length;
        const content = line.trim();
        
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }
        current = stack[stack.length - 1].obj;
        
        if (content.startsWith('- ')) {
          const value = content.slice(2).trim();
          const parentKey = stack[stack.length - 2]?.currentKey;
          if (parentKey && !Array.isArray(current[parentKey])) {
            current[parentKey] = [];
          }
          if (value.includes(':')) {
            const [k, v] = value.split(':').map(s => s.trim());
            const newObj = { [k]: v };
            current[parentKey].push(newObj);
            stack.push({ obj: newObj, indent, currentKey: k });
          } else {
            if (parentKey) {
              current[parentKey].push(value);
            }
          }
        } else if (content.includes(':')) {
          const [key, value] = content.split(':').map(s => s.trim());
          if (value) {
            current[key] = isNaN(value) ? value : Number(value);
          } else {
            current[key] = {};
            stack.push({ obj: current[key], indent, currentKey: key });
          }
        }
      }
      
      return JSON.stringify(result, null, 2);
    } catch (e) {
      throw new Error('YAML 解析错误: ' + e.message);
    }
  };

  const jsonToXml = (str) => {
    try {
      const obj = JSON.parse(str);
      
      const convertObj = (obj, tagName = 'item') => {
        let xml = '';
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              xml += `<${key}>\n`;
              value.forEach(item => {
                xml += convertObj(item, key);
              });
              xml += `</${key}>\n`;
            } else {
              xml += `<${key}>\n`;
              xml += convertObj(value, key);
              xml += `</${key}>\n`;
            }
          } else {
            xml += `<${key}>${value}</${key}>\n`;
          }
        }
        return xml;
      };
      
      return '<?xml version="1.0" encoding="UTF-8"?>\n' + convertObj(obj);
    } catch (e) {
      throw new Error('JSON 解析错误: ' + e.message);
    }
  };

  const xmlToJson = (str) => {
    try {
      const parseXml = (xmlStr) => {
        const result = {};
        const tagRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
        const selfClosingRegex = /<(\w+)([^>]*)\/>/g;
        
        let match;
        let remaining = xmlStr;
        
        const processMatch = (tagName, attrs, content) => {
          const obj = {};
          
          const attrRegex = /(\w+)="([^"]*)"/g;
          let attrMatch;
          while ((attrMatch = attrRegex.exec(attrs)) !== null) {
            obj[`@${attrMatch[1]}`] = attrMatch[2];
          }
          
          const childContent = content.trim();
          if (childContent) {
            const childResult = parseXml(childContent);
            if (Object.keys(childResult).length > 0) {
              Object.assign(obj, childResult);
            } else {
              obj['#text'] = childContent;
            }
          }
          
          if (result[tagName]) {
            if (!Array.isArray(result[tagName])) {
              result[tagName] = [result[tagName]];
            }
            result[tagName].push(obj);
          } else {
            result[tagName] = obj;
          }
        };
        
        while ((match = selfClosingRegex.exec(remaining)) !== null) {
          processMatch(match[1], match[2], '');
          remaining = remaining.replace(match[0], '');
        }
        
        while ((match = tagRegex.exec(remaining)) !== null) {
          processMatch(match[1], match[2], match[3]);
          remaining = remaining.replace(match[0], '');
        }
        
        return result;
      };
      
      const cleanXml = str.replace(/<\?xml[^>]*\?>/, '').trim();
      const result = parseXml(cleanXml);
      
      return JSON.stringify(result, null, 2);
    } catch (e) {
      throw new Error('XML 解析错误: ' + e.message);
    }
  };

  const convert = () => {
    if (!input) {
      message.warning('请输入内容');
      return;
    }

    try {
      setError('');
      let result = '';

      switch (selectedType) {
        case 'json-format':
          result = jsonFormat(input);
          break;
        case 'json-minify':
          result = jsonMinify(input);
          break;
        case 'json-to-yaml':
          result = jsonToYaml(input);
          break;
        case 'yaml-to-json':
          result = yamlToJson(input);
          break;
        case 'json-to-xml':
          result = jsonToXml(input);
          break;
        case 'xml-to-json':
          result = xmlToJson(input);
          break;
        default:
          result = '未知类型';
      }

      setOutput(result);
      message.success('转换成功');
    } catch (e) {
      setError(e.message);
      message.error('转换失败');
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output).then(() => {
        message.success('复制成功');
      });
    }
  };

  return (
    <div style={{ padding: '0 20px' }}>
      <Title level={3}>格式转换工具</Title>
      <Text type="secondary">支持 JSON、YAML、XML 等格式的转换和格式化</Text>
      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card size="small">
            <Select
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: 300 }}
              options={conversionTypes.map(type => ({
                value: type.key,
                label: type.label
              }))}
            />
          </Card>
        </Col>
      </Row>

      {error && (
        <Row style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Alert message="错误" description={error} type="error" showIcon />
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card
            title="输入"
            extra={
              <Button type="link" size="small" icon={<ClearOutlined />} onClick={clearAll}>
                清空
              </Button>
            }
          >
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入内容"
              rows={12}
              style={{ fontFamily: 'monospace' }}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title="输出"
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

export default FormatConverter;
