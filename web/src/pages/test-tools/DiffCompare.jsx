import React, { useState } from 'react';
import { Card, Row, Col, Button, Input, Radio, Space, message, Typography, Tag } from 'antd';
import { SwapOutlined, ClearOutlined, CopyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const DiffCompare = () => {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [compareMode, setCompareMode] = useState('text');
  const [diffResult, setDiffResult] = useState([]);

  const compareDiff = () => {
    if (!leftText && !rightText) {
      message.warning('请输入要对比的内容');
      return;
    }

    try {
      if (compareMode === 'json') {
        const leftObj = JSON.parse(leftText || '{}');
        const rightObj = JSON.parse(rightText || '{}');
        const diffs = compareObjects(leftObj, rightObj);
        setDiffResult(diffs);
      } else {
        const leftLines = leftText.split('\n');
        const rightLines = rightText.split('\n');
        const diffs = compareLines(leftLines, rightLines);
        setDiffResult(diffs);
      }
      message.success('对比完成');
    } catch (e) {
      message.error('对比失败: ' + e.message);
    }
  };

  const compareLines = (left, right) => {
    const maxLen = Math.max(left.length, right.length);
    const result = [];

    for (let i = 0; i < maxLen; i++) {
      const leftLine = left[i] || '';
      const rightLine = right[i] || '';

      if (leftLine === rightLine) {
        result.push({ type: 'equal', line: i + 1, left: leftLine, right: rightLine });
      } else if (!leftLine) {
        result.push({ type: 'added', line: i + 1, left: '', right: rightLine });
      } else if (!rightLine) {
        result.push({ type: 'removed', line: i + 1, left: leftLine, right: '' });
      } else {
        result.push({ type: 'modified', line: i + 1, left: leftLine, right: rightLine });
      }
    }

    return result;
  };

  const compareObjects = (left, right, path = '') => {
    const result = [];
    const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);

    allKeys.forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      const leftVal = left[key];
      const rightVal = right[key];

      if (!(key in left)) {
        result.push({ type: 'added', path: currentPath, left: undefined, right: JSON.stringify(rightVal) });
      } else if (!(key in right)) {
        result.push({ type: 'removed', path: currentPath, left: JSON.stringify(leftVal), right: undefined });
      } else if (JSON.stringify(leftVal) !== JSON.stringify(rightVal)) {
        result.push({ type: 'modified', path: currentPath, left: JSON.stringify(leftVal), right: JSON.stringify(rightVal) });
      }
    });

    return result;
  };

  const swapTexts = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
    message.success('已交换左右内容');
  };

  const clearAll = () => {
    setLeftText('');
    setRightText('');
    setDiffResult([]);
  };

  const getTypeTag = (type) => {
    const typeMap = {
      equal: <Tag color="default">相同</Tag>,
      added: <Tag color="success">新增</Tag>,
      removed: <Tag color="error">删除</Tag>,
      modified: <Tag color="warning">修改</Tag>
    };
    return typeMap[type];
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>文本/JSON对比工具</Title>
      <Text type="secondary">对比两段文本或JSON数据的差异</Text>

      <Card style={{ marginTop: '16px' }}>
        <Space style={{ marginBottom: '16px' }}>
          <Radio.Group value={compareMode} onChange={(e) => setCompareMode(e.target.value)}>
            <Radio.Button value="text">文本模式</Radio.Button>
            <Radio.Button value="json">JSON模式</Radio.Button>
          </Radio.Group>
          <Button type="primary" onClick={compareDiff}>开始对比</Button>
          <Button icon={<SwapOutlined />} onClick={swapTexts}>交换</Button>
          <Button icon={<ClearOutlined />} onClick={clearAll}>清空</Button>
        </Space>

        <Row gutter={16}>
          <Col span={12}>
            <Text strong>左侧内容</Text>
            <TextArea
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              placeholder={compareMode === 'json' ? '输入JSON数据...' : '输入文本内容...'}
              rows={15}
              style={{ marginTop: '8px' }}
            />
          </Col>
          <Col span={12}>
            <Text strong>右侧内容</Text>
            <TextArea
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
              placeholder={compareMode === 'json' ? '输入JSON数据...' : '输入文本内容...'}
              rows={15}
              style={{ marginTop: '8px' }}
            />
          </Col>
        </Row>
      </Card>

      {diffResult.length > 0 && (
        <Card title="对比结果" style={{ marginTop: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {diffResult.map((diff, index) => (
              <div key={index} style={{ padding: '8px', background: '#fafafa', borderRadius: '4px' }}>
                <Space>
                  {getTypeTag(diff.type)}
                  {compareMode === 'json' ? (
                    <Text code>{diff.path}</Text>
                  ) : (
                    <Text type="secondary">行 {diff.line}</Text>
                  )}
                </Space>
                {diff.type !== 'equal' && (
                  <div style={{ marginTop: '8px' }}>
                    {diff.left !== undefined && (
                      <div><Text type="danger">- {diff.left}</Text></div>
                    )}
                    {diff.right !== undefined && (
                      <div><Text type="success">+ {diff.right}</Text></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default DiffCompare;
