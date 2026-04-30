import React, { useState } from 'react';
import { Card, Row, Col, Button, Input, Select, Space, message, Typography, Descriptions, Tag } from 'antd';
import { PlayCircleOutlined, CopyOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const presetExpressions = [
  { name: '每分钟', cron: '* * * * *', desc: '每分钟执行一次' },
  { name: '每小时', cron: '0 * * * *', desc: '每小时的第0分钟执行' },
  { name: '每天凌晨', cron: '0 0 * * *', desc: '每天凌晨0点执行' },
  { name: '每周一', cron: '0 0 * * 1', desc: '每周一凌晨0点执行' },
  { name: '每月1号', cron: '0 0 1 * *', desc: '每月1号凌晨0点执行' },
  { name: '工作日早9点', cron: '0 9 * * 1-5', desc: '周一到周五早上9点执行' }
];

const CronExpression = () => {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [week, setWeek] = useState('*');
  const [cronExpression, setCronExpression] = useState('');
  const [parsedResult, setParsedResult] = useState(null);

  const generateCron = () => {
    const cron = `${minute} ${hour} ${day} ${month} ${week}`;
    setCronExpression(cron);
    parseCron(cron);
    message.success('Cron表达式已生成');
  };

  const parseCron = (cron) => {
    if (!cron) {
      message.warning('请输入Cron表达式');
      return;
    }

    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5) {
      message.error('Cron表达式格式错误，应为5个字段');
      return;
    }

    const [min, hr, d, mon, wk] = parts;
    const result = {
      minute: parseField(min, 'minute'),
      hour: parseField(hr, 'hour'),
      day: parseField(d, 'day'),
      month: parseField(mon, 'month'),
      week: parseField(wk, 'week')
    };

    setParsedResult(result);
    message.success('解析完成');
  };

  const parseField = (field, type) => {
    if (field === '*') return '每' + getFieldName(type);
    if (field.includes('/')) {
      const [start, step] = field.split('/');
      return `从${start === '*' ? '开始' : start}起，每${step}${getFieldUnit(type)}`;
    }
    if (field.includes('-')) {
      const [start, end] = field.split('-');
      return `${start}到${end}${getFieldUnit(type)}`;
    }
    if (field.includes(',')) {
      return `${field.split(',').join('、')}${getFieldUnit(type)}`;
    }
    return field + getFieldUnit(type);
  };

  const getFieldName = (type) => {
    const names = {
      minute: '分钟',
      hour: '小时',
      day: '天',
      month: '月',
      week: '周'
    };
    return names[type];
  };

  const getFieldUnit = (type) => {
    const units = {
      minute: '分',
      hour: '时',
      day: '日',
      month: '月',
      week: ''
    };
    return units[type];
  };

  const copyExpression = () => {
    if (!cronExpression) {
      message.warning('请先生成Cron表达式');
      return;
    }
    navigator.clipboard.writeText(cronExpression);
    message.success('已复制到剪贴板');
  };

  const loadPreset = (cron) => {
    const parts = cron.split(' ');
    setMinute(parts[0]);
    setHour(parts[1]);
    setDay(parts[2]);
    setMonth(parts[3]);
    setWeek(parts[4]);
    setCronExpression(cron);
    parseCron(cron);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>Cron表达式工具</Title>
      <Text type="secondary">生成和解析Cron定时任务表达式</Text>

      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="生成Cron表达式">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>分钟 (0-59)</Text>
                <Input
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="* 或 0-59 或 */5"
                  style={{ marginTop: '8px' }}
                />
              </div>
              <div>
                <Text strong>小时 (0-23)</Text>
                <Input
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  placeholder="* 或 0-23 或 */2"
                  style={{ marginTop: '8px' }}
                />
              </div>
              <div>
                <Text strong>日期 (1-31)</Text>
                <Input
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="* 或 1-31"
                  style={{ marginTop: '8px' }}
                />
              </div>
              <div>
                <Text strong>月份 (1-12)</Text>
                <Input
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="* 或 1-12"
                  style={{ marginTop: '8px' }}
                />
              </div>
              <div>
                <Text strong>星期 (0-7, 0和7都表示周日)</Text>
                <Input
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                  placeholder="* 或 0-7 或 1-5"
                  style={{ marginTop: '8px' }}
                />
              </div>
              <Button type="primary" icon={<PlayCircleOutlined />} onClick={generateCron} block>
                生成表达式
              </Button>
              {cronExpression && (
                <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                  <Space>
                    <Text strong>生成结果:</Text>
                    <Text code copyable>{cronExpression}</Text>
                    <Button size="small" icon={<CopyOutlined />} onClick={copyExpression}>复制</Button>
                  </Space>
                </div>
              )}
            </Space>
          </Card>

          <Card title="预设表达式" style={{ marginTop: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {presetExpressions.map((preset, index) => (
                <Card
                  key={index}
                  size="small"
                  type="inner"
                  hoverable
                  onClick={() => loadPreset(preset.cron)}
                >
                  <Space direction="vertical" size={0}>
                    <Text strong>{preset.name}</Text>
                    <Text code style={{ fontSize: '12px' }}>{preset.cron}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{preset.desc}</Text>
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="解析Cron表达式">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>输入Cron表达式</Text>
                <Input
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  placeholder="例如: 0 9 * * 1-5"
                  style={{ marginTop: '8px' }}
                />
              </div>
              <Button type="primary" icon={<InfoCircleOutlined />} onClick={() => parseCron(cronExpression)} block>
                解析表达式
              </Button>
            </Space>

            {parsedResult && (
              <Card title="解析结果" size="small" style={{ marginTop: '16px' }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="分钟">{parsedResult.minute}</Descriptions.Item>
                  <Descriptions.Item label="小时">{parsedResult.hour}</Descriptions.Item>
                  <Descriptions.Item label="日期">{parsedResult.day}</Descriptions.Item>
                  <Descriptions.Item label="月份">{parsedResult.month}</Descriptions.Item>
                  <Descriptions.Item label="星期">{parsedResult.week}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </Card>

          <Card title="使用说明" style={{ marginTop: '16px' }}>
            <Space direction="vertical" size="small">
              <div><Tag color="blue">*</Tag> 表示任意值</div>
              <div><Tag color="green">,</Tag> 表示多个值，如: 1,3,5</div>
              <div><Tag color="orange">-</Tag> 表示范围，如: 1-5</div>
              <div><Tag color="purple">/</Tag> 表示步长，如: */5 表示每5个单位</div>
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                格式: 分钟 小时 日期 月份 星期
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CronExpression;
