import React, { useState } from 'react';
import { Card, Row, Col, Button, Input, Checkbox, Space, message, Typography, Divider, Table, Tag } from 'antd';
import { PlayCircleOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const presetPatterns = [
  { name: '手机号', pattern: '^1[3-9]\\d{9}$', desc: '中国大陆手机号' },
  { name: '邮箱', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', desc: '邮箱地址' },
  { name: '身份证', pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$', desc: '身份证号' },
  { name: 'URL', pattern: '^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$', desc: 'URL地址' },
  { name: 'IP地址', pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', desc: 'IPv4地址' },
  { name: '日期', pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', desc: 'YYYY-MM-DD格式' }
];

const RegexTester = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ global: true, ignoreCase: false, multiline: false });
  const [testText, setTestText] = useState('');
  const [results, setResults] = useState([]);
  const [savedPatterns, setSavedPatterns] = useState([]);

  const testRegex = () => {
    if (!pattern) {
      message.warning('请输入正则表达式');
      return;
    }

    if (!testText) {
      message.warning('请输入测试文本');
      return;
    }

    try {
      const flagStr = (flags.global ? 'g' : '') + (flags.ignoreCase ? 'i' : '') + (flags.multiline ? 'm' : '');
      const regex = new RegExp(pattern, flagStr);
      
      const matches = [];
      let match;
      
      if (flags.global) {
        while ((match = regex.exec(testText)) !== null) {
          matches.push({
            key: matches.length,
            index: match.index,
            value: match[0],
            groups: match.slice(1)
          });
        }
      } else {
        match = regex.exec(testText);
        if (match) {
          matches.push({
            key: 0,
            index: match.index,
            value: match[0],
            groups: match.slice(1)
          });
        }
      }

      setResults(matches);
      message.success(`找到 ${matches.length} 个匹配`);
    } catch (e) {
      message.error('正则表达式错误: ' + e.message);
    }
  };

  const savePattern = () => {
    if (!pattern) {
      message.warning('请输入正则表达式');
      return;
    }
    const newPattern = {
      id: Date.now(),
      name: '自定义规则 ' + (savedPatterns.length + 1),
      pattern: pattern,
      flags: { ...flags }
    };
    setSavedPatterns([...savedPatterns, newPattern]);
    message.success('保存成功');
  };

  const loadPreset = (preset) => {
    setPattern(preset.pattern);
    message.info('已加载预设规则');
  };

  const deleteSaved = (id) => {
    setSavedPatterns(savedPatterns.filter(p => p.id !== id));
    message.success('删除成功');
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'key',
      key: 'key',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: '位置',
      dataIndex: 'index',
      key: 'index',
      width: 80
    },
    {
      title: '匹配内容',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true
    },
    {
      title: '分组',
      dataIndex: 'groups',
      key: 'groups',
      render: (groups) => groups && groups.length > 0 ? (
        <Space size="small">
          {groups.map((g, i) => (
            <Tag key={i} color="blue">{`${i + 1}: ${g}`}</Tag>
          ))}
        </Space>
      ) : '-'
    }
  ];

  return (
    <div style={{ padding: '0 20px' }}>
      <Title level={3}>正则表达式测试器</Title>
      <Text type="secondary">测试和验证正则表达式，支持预设常用规则</Text>
      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="正则表达式" size="small">
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="请输入正则表达式"
              prefix="/"
              suffix="/"
              onPressEnter={testRegex}
            />
            <Space style={{ marginTop: '12px' }}>
              <Checkbox checked={flags.global} onChange={(e) => setFlags({ ...flags, global: e.target.checked })}>
                全局匹配 (g)
              </Checkbox>
              <Checkbox checked={flags.ignoreCase} onChange={(e) => setFlags({ ...flags, ignoreCase: e.target.checked })}>
                忽略大小写 (i)
              </Checkbox>
              <Checkbox checked={flags.multiline} onChange={(e) => setFlags({ ...flags, multiline: e.target.checked })}>
                多行模式 (m)
              </Checkbox>
            </Space>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="操作" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" icon={<PlayCircleOutlined />} onClick={testRegex} block>
                测试
              </Button>
              <Button icon={<SaveOutlined />} onClick={savePattern} block>
                保存规则
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="测试文本">
            <TextArea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="请输入要测试的文本"
              rows={8}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title={`匹配结果 (${results.length}个)`}>
            {results.length > 0 ? (
              <Table
                columns={columns}
                dataSource={results}
                pagination={false}
                size="small"
              />
            ) : (
              <Text type="secondary">暂无匹配结果</Text>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="预设规则" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {presetPatterns.map((preset, index) => (
                <Card
                  key={index}
                  size="small"
                  type="inner"
                  hoverable
                  onClick={() => loadPreset(preset)}
                  extra={<Text type="secondary" style={{ fontSize: '12px' }}>{preset.desc}</Text>}
                >
                  <Text strong>{preset.name}</Text>
                  <br />
                  <Text code style={{ fontSize: '12px' }}>{preset.pattern}</Text>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="已保存规则" size="small">
            {savedPatterns.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {savedPatterns.map((saved) => (
                  <Card
                    key={saved.id}
                    size="small"
                    type="inner"
                    hoverable
                    onClick={() => {
                      setPattern(saved.pattern);
                      setFlags(saved.flags);
                    }}
                    extra={
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSaved(saved.id);
                        }}
                      />
                    }
                  >
                    <Text strong>{saved.name}</Text>
                    <br />
                    <Text code style={{ fontSize: '12px' }}>{saved.pattern}</Text>
                  </Card>
                ))}
              </Space>
            ) : (
              <Text type="secondary">暂无保存的规则</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RegexTester;
