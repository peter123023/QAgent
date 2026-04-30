import React, { useState, useMemo } from 'react';
import { Card, Input, Button, Space, Typography, Divider, Tag, message } from 'antd';
import { CopyOutlined, SwapOutlined, FontSizeOutlined, UndoOutlined, ClearOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const StringProcessor = () => {
  const [input, setInput] = useState('');

  const processResults = useMemo(() => {
    if (!input) return {
      original: '',
      length: 0,
      charCount: 0,
      wordCount: 0,
      lineCount: 0,
      uppercase: '',
      lowercase: '',
      capitalize: '',
      camelCase: '',
      pascalCase: '',
      snakeCase: '',
      kebabCase: '',
      removeSpaces: '',
      removeExtraSpaces: '',
      reverse: '',
      trim: ''
    };

    const trimmed = input.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    const lines = input.split('\n').filter(line => line.trim() !== '');

    // 驼峰转换
    const toCamelCase = (str) => {
      return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    };

    // 帕斯卡转换
    const toPascalCase = (str) => {
      const camel = toCamelCase(str);
      return camel.charAt(0).toUpperCase() + camel.slice(1);
    };

    // 下划线转换
    const toSnakeCase = (str) => {
      return str.replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('_');
    };

    // 短横线转换
    const toKebabCase = (str) => {
      return str.replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('-');
    };

    // 首字母大写
    const capitalize = (str) => {
      return str.replace(/\b\w/g, char => char.toUpperCase());
    };

    // 移除多余空格
    const removeExtraSpaces = (str) => {
      return str.replace(/\s+/g, ' ').trim();
    };

    // 反转字符串
    const reverse = (str) => {
      return str.split('').reverse().join('');
    };

    return {
      original: input,
      length: input.length,
      charCount: input.replace(/\s/g, '').length,
      wordCount: words.length,
      lineCount: lines.length,
      uppercase: input.toUpperCase(),
      lowercase: input.toLowerCase(),
      capitalize: capitalize(input),
      camelCase: toCamelCase(input),
      pascalCase: toPascalCase(input),
      snakeCase: toSnakeCase(input),
      kebabCase: toKebabCase(input),
      removeSpaces: input.replace(/\s/g, ''),
      removeExtraSpaces: removeExtraSpaces(input),
      reverse: reverse(input),
      trim: trimmed
    };
  }, [input]);

  const handleClear = () => {
    setInput('');
  };

  const ResultItem = ({ label, value }) => {
  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      message.success('复制成功');
    } catch (err) {
      message.error('复制失败');
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text strong>{label}</Text>
        <Button type="text" size="small" icon={<CopyOutlined />} onClick={handleCopy} disabled={!value}>复制</Button>
      </div>
      <div style={{ 
        background: '#f5f5f5', 
        padding: 12, 
        borderRadius: 6, 
        fontFamily: 'monospace',
        wordBreak: 'break-all',
        minHeight: 40,
        display: 'flex',
        alignItems: 'center'
      }}>
        {value || <Text type="secondary">无内容</Text>}
      </div>
    </div>
  );
};

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Title level={3}>字符串处理工具</Title>
        <TextArea
          rows={6}
          placeholder="请输入要处理的文本内容..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Space style={{ marginBottom: 20 }}>
          <Button icon={<ClearOutlined />} onClick={handleClear}>清空</Button>
          <Tag color="blue">字符数: {processResults.length}</Tag>
          <Tag color="green">非空格字符数: {processResults.charCount}</Tag>
          <Tag color="cyan">单词数: {processResults.wordCount}</Tag>
          <Tag color="orange">行数: {processResults.lineCount}</Tag>
        </Space>

        <Divider>转换结果</Divider>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <ResultItem label="大写转换" value={processResults.uppercase} />
          <ResultItem label="小写转换" value={processResults.lowercase} />
          <ResultItem label="首字母大写" icon={<FontSizeOutlined />} value={processResults.capitalize} />
          <ResultItem label="驼峰命名(camelCase)" value={processResults.camelCase} />
          <ResultItem label="帕斯卡命名(PascalCase)" value={processResults.pascalCase} />
          <ResultItem label="下划线命名(snake_case)" value={processResults.snakeCase} />
          <ResultItem label="短横线命名(kebab-case)" value={processResults.kebabCase} />
          <ResultItem label="移除所有空格" value={processResults.removeSpaces} />
          <ResultItem label="移除多余空格" value={processResults.removeExtraSpaces} />
          <ResultItem label="反转字符串" value={processResults.reverse} />
          <ResultItem label="去除首尾空格" value={processResults.trim} />
        </Space>
      </Card>
    </Space>
  );
};

export default StringProcessor;
