import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, DatePicker, Input, InputNumber, Space, message, Typography, Divider, Table, Tag } from 'antd';
import { SwapOutlined, CopyOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const { Title, Text } = Typography;

const timeZones = [
  { key: 'local', label: '本地时间', offset: 0 },
  { key: 'utc', label: 'UTC', offset: 0 },
  { key: 'beijing', label: '北京时间 (UTC+8)', offset: 8 },
  { key: 'tokyo', label: '东京时间 (UTC+9)', offset: 9 },
  { key: 'newyork', label: '纽约时间 (UTC-5)', offset: -5 },
  { key: 'london', label: '伦敦时间 (UTC+0)', offset: 0 },
  { key: 'sydney', label: '悉尼时间 (UTC+10)', offset: 10 }
];

const TimestampConverter = () => {
  const [timestamp, setTimestamp] = useState(Date.now());
  const [dateTime, setDateTime] = useState(dayjs());
  const [selectedTimeZone, setSelectedTimeZone] = useState('local');
  const [conversionHistory, setConversionHistory] = useState([]);

  const timestampToDate = () => {
    if (!timestamp) {
      message.warning('请输入时间戳');
      return;
    }
    const ts = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
    setDateTime(dayjs(ts));
    addToHistory(ts, 'timestamp-to-date');
    message.success('转换成功');
  };

  const dateToTimestamp = () => {
    if (!dateTime) {
      message.warning('请选择日期时间');
      return;
    }
    const ts = dateTime.valueOf();
    setTimestamp(ts);
    addToHistory(ts, 'date-to-timestamp');
    message.success('转换成功');
  };

  const addToHistory = (ts, type) => {
    const historyItem = {
      key: Date.now(),
      timestamp: ts,
      timestampSeconds: Math.floor(ts / 1000),
      date: dayjs(ts).format('YYYY-MM-DD HH:mm:ss'),
      type: type,
      time: dayjs().format('HH:mm:ss')
    };
    setConversionHistory([historyItem, ...conversionHistory.slice(0, 9)]);
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(String(value)).then(() => {
      message.success('复制成功');
    });
  };

  const getCurrentTimestamp = () => {
    setTimestamp(Date.now());
    setDateTime(dayjs());
    message.success('已更新为当前时间');
  };

  const formatWithTimeZone = (tz) => {
    if (!dateTime) return '-';
    const tzInfo = timeZones.find(t => t.key === tz);
    if (tz === 'utc') {
      return dateTime.utc().format('YYYY-MM-DD HH:mm:ss');
    }
    if (tz === 'local') {
      return dateTime.format('YYYY-MM-DD HH:mm:ss');
    }
    return dateTime.utcOffset(tzInfo.offset * 60).format('YYYY-MM-DD HH:mm:ss');
  };

  const columns = [
    {
      title: '时间戳 (毫秒)',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (value) => (
        <Tag color="blue" onClick={() => copyToClipboard(value)} style={{ cursor: 'pointer' }}>
          {value}
        </Tag>
      )
    },
    {
      title: '时间戳 (秒)',
      dataIndex: 'timestampSeconds',
      key: 'timestampSeconds',
      render: (value) => (
        <Tag color="green" onClick={() => copyToClipboard(value)} style={{ cursor: 'pointer' }}>
          {value}
        </Tag>
      )
    },
    {
      title: '日期时间',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: '操作时间',
      dataIndex: 'time',
      key: 'time'
    }
  ];

  return (
    <div style={{ padding: '0 20px' }}>
      <Title level={3}>时间戳转换工具</Title>
      <Text type="secondary">时间戳与日期时间相互转换，支持多时区</Text>
      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="时间戳" extra={
            <Button type="link" size="small" onClick={getCurrentTimestamp}>
              当前时间
            </Button>
          }>
            <Space direction="vertical" style={{ width: '100%' }}>
              <InputNumber
                value={timestamp}
                onChange={setTimestamp}
                style={{ width: '100%' }}
                placeholder="请输入时间戳（毫秒或秒）"
                onPressEnter={timestampToDate}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                支持毫秒（13位）和秒（10位）时间戳
              </Text>
              <Button type="primary" icon={<SwapOutlined />} onClick={timestampToDate} block>
                转换为日期
              </Button>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="日期时间">
            <Space direction="vertical" style={{ width: '100%' }}>
              <DatePicker
                value={dateTime}
                onChange={setDateTime}
                showTime
                style={{ width: '100%' }}
                format="YYYY-MM-DD HH:mm:ss"
              />
              <Button type="primary" icon={<SwapOutlined />} onClick={dateToTimestamp} block>
                转换为时间戳
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="时区时间" size="small">
            <Row gutter={[16, 16]}>
              {timeZones.map(tz => (
                <Col span={8} key={tz.key}>
                  <Card size="small" type="inner">
                    <Text strong>{tz.label}</Text>
                    <br />
                    <Text code style={{ fontSize: '14px' }}>{formatWithTimeZone(tz.key)}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="常用时间戳">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Card size="small" type="inner" hoverable onClick={() => setTimestamp(dayjs().startOf('day').valueOf())}>
                  <Text strong>今天 00:00</Text>
                  <br />
                  <Text code style={{ fontSize: '12px' }}>{dayjs().startOf('day').valueOf()}</Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" type="inner" hoverable onClick={() => setTimestamp(dayjs().endOf('day').valueOf())}>
                  <Text strong>今天 23:59</Text>
                  <br />
                  <Text code style={{ fontSize: '12px' }}>{dayjs().endOf('day').valueOf()}</Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" type="inner" hoverable onClick={() => setTimestamp(dayjs().startOf('month').valueOf())}>
                  <Text strong>本月第一天</Text>
                  <br />
                  <Text code style={{ fontSize: '12px' }}>{dayjs().startOf('month').valueOf()}</Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" type="inner" hoverable onClick={() => setTimestamp(dayjs().endOf('month').valueOf())}>
                  <Text strong>本月最后一天</Text>
                  <br />
                  <Text code style={{ fontSize: '12px' }}>{dayjs().endOf('month').valueOf()}</Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="转换历史">
            {conversionHistory.length > 0 ? (
              <Table
                columns={columns}
                dataSource={conversionHistory}
                pagination={false}
                size="small"
              />
            ) : (
              <Text type="secondary">暂无转换历史</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TimestampConverter;
