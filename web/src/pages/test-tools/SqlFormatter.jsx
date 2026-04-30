import React, { useState } from 'react';
import { Card, Row, Col, Button, Input, Space, message, Typography, Divider, Select } from 'antd';
import { FormatOutlined, CopyOutlined, ClearOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SqlFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  const formatSql = () => {
    if (!input) {
      message.warning('请输入 SQL 语句');
      return;
    }

    try {
      let sql = input.trim();
      const indent = ' '.repeat(indentSize);

      // 关键字列表
      const keywords = [
        'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY',
        'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
        'INNER JOIN', 'OUTER JOIN', 'ON', 'AS', 'INSERT INTO', 'VALUES',
        'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE',
        'DROP TABLE', 'UNION', 'UNION ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
      ];

      // 转换为大写关键字
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        sql = sql.replace(regex, keyword);
      });

      // 格式化
      let formatted = sql
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ',\n' + indent)
        .replace(/\bSELECT\b/gi, 'SELECT\n' + indent)
        .replace(/\bFROM\b/gi, '\nFROM\n' + indent)
        .replace(/\bWHERE\b/gi, '\nWHERE\n' + indent)
        .replace(/\bAND\b/gi, '\n' + indent + 'AND')
        .replace(/\bOR\b/gi, '\n' + indent + 'OR')
        .replace(/\bORDER BY\b/gi, '\nORDER BY\n' + indent)
        .replace(/\bGROUP BY\b/gi, '\nGROUP BY\n' + indent)
        .replace(/\bHAVING\b/gi, '\nHAVING\n' + indent)
        .replace(/\bLIMIT\b/gi, '\nLIMIT')
        .replace(/\bOFFSET\b/gi, '\nOFFSET')
        .replace(/\bJOIN\b/gi, '\nJOIN\n' + indent)
        .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN\n' + indent)
        .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN\n' + indent)
        .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN\n' + indent)
        .replace(/\bON\b/gi, '\n' + indent + 'ON')
        .replace(/\bINSERT INTO\b/gi, 'INSERT INTO')
        .replace(/\bVALUES\b/gi, '\nVALUES')
        .replace(/\bUPDATE\b/gi, 'UPDATE')
        .replace(/\bSET\b/gi, '\nSET\n' + indent)
        .replace(/\bDELETE FROM\b/gi, 'DELETE FROM');

      setOutput(formatted.trim());
      message.success('格式化成功');
    } catch (e) {
      message.error('格式化失败: ' + e.message);
    }
  };

  const escapeSql = () => {
    if (!input) {
      message.warning('请输入 SQL 语句');
      return;
    }
    const escaped = input
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    setOutput(escaped);
    message.success('转义成功');
  };

  const unescapeSql = () => {
    if (!input) {
      message.warning('请输入 SQL 语句');
      return;
    }
    const unescaped = input
      .replace(/\\\\/g, '\\')
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t');
    setOutput(unescaped);
    message.success('反转义成功');
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

  return (
    <div style={{ padding: '0 20px' }}>
      <Title level={3}>SQL 格式化工具</Title>
      <Text type="secondary">SQL 语句格式化、转义和反转义</Text>
      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card size="small">
            <Space>
              <Button type="primary" icon={<FormatOutlined />} onClick={formatSql}>
                格式化
              </Button>
              <Button onClick={escapeSql}>转义</Button>
              <Button onClick={unescapeSql}>反转义</Button>
              <Select value={indentSize} onChange={setIndentSize} style={{ width: 120 }}>
                <Option value={2}>缩进 2 空格</Option>
                <Option value={4}>缩进 4 空格</Option>
              </Select>
            </Space>
          </Card>
        </Col>
      </Row>

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
              placeholder="请输入 SQL 语句"
              rows={15}
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
              rows={15}
              style={{ fontFamily: 'monospace' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SqlFormatter;
