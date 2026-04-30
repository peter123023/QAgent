import React, { useState, useMemo } from 'react';
import { Card, Input, Select, Space, Typography, Table, Divider } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
const unitValues = {
  B: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 ** 4,
  PB: 1024 ** 5,
  EB: 1024 ** 6
};

const decimalUnits = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
const decimalUnitValues = {
  B: 1,
  KB: 1000,
  MB: 1000 * 1000,
  GB: 1000 * 1000 * 1000,
  TB: 1000 ** 4,
  PB: 1000 ** 5,
  EB: 1000 ** 6
};

const FileSizeCalculator = () => {
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('MB');

  const conversionResults = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      return {
        binary: {},
        decimal: {},
        bits: 0,
        bytes: 0
      };
    }

    const baseBytes = num * unitValues[fromUnit];
    const decimalBaseBytes = num * decimalUnitValues[fromUnit];

    const binary = {};
    units.forEach(unit => {
      binary[unit] = (baseBytes / unitValues[unit]).toFixed(unit === 'B' ? 0 : 2);
    });

    const decimal = {};
    decimalUnits.forEach(unit => {
      decimal[unit] = (decimalBaseBytes / decimalUnitValues[unit]).toFixed(unit === 'B' ? 0 : 2);
    });

    return {
      binary,
      decimal,
      bits: baseBytes * 8,
      bytes: baseBytes
    };
  }, [value, fromUnit]);

  const columns = [
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 120
    },
    {
      title: '二进制(1024)',
      dataIndex: 'binary',
      key: 'binary',
      render: (val) => <Text code>{val}</Text>
    },
    {
      title: '十进制(1000)',
      dataIndex: 'decimal',
      key: 'decimal',
      render: (val) => <Text code>{val}</Text>
    }
  ];

  const tableData = units.map(unit => ({
    key: unit,
    unit,
    binary: conversionResults.binary[unit] || '0',
    decimal: conversionResults.decimal[unit] || '0'
  }));

  const commonSizes = [
    { name: '1 字节(Byte)', size: '1 B', bits: '8 bit' },
    { name: '1 KB', size: '1024 B', bits: '8192 bit' },
    { name: '1 MB', size: '1024 KB / 1,048,576 B', bits: '8,388,608 bit' },
    { name: '1 GB', size: '1024 MB / 1,073,741,824 B', bits: '8,589,934,592 bit' },
    { name: '1 TB', size: '1024 GB / 1,099,511,627,776 B', bits: '8,796,093,022,208 bit' },
    { name: 'CD(700MB)', size: '700 MB / 734,003,200 B', bits: '~5.87 Gbit' },
    { name: 'DVD(4.7GB)', size: '4.7 GB / ~5,046,586,573 B', bits: '~40.37 Gbit' },
    { name: '蓝光(25GB)', size: '25 GB / ~26,843,545,600 B', bits: '~214.75 Gbit' }
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Title level={3}>文件大小计算器</Title>
        <Space size="middle" style={{ marginBottom: 20 }}>
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{ width: 120 }}
            prefix={<CalculatorOutlined />}
          />
          <Select
            value={fromUnit}
            onChange={setFromUnit}
            style={{ width: 100 }}
            options={units.map(unit => ({ label: unit, value: unit }))}
          />
        </Space>

        <div style={{ marginBottom: 20, padding: '16px', background: '#f5f5f5', borderRadius: 8 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>比特(Bit): </Text>
              <Text code>{conversionResults.bits.toLocaleString()}</Text>
            </div>
            <div>
              <Text strong>字节(Byte): </Text>
              <Text code>{conversionResults.bytes.toLocaleString()}</Text>
            </div>
          </Space>
        </div>

        <Divider>转换结果</Divider>
        <Table
          dataSource={tableData}
          columns={columns}
          pagination={false}
          bordered
        />

        <Divider>常见文件大小参考</Divider>
        <Table
          dataSource={commonSizes}
          columns={[
            { title: '类型', dataIndex: 'name', key: 'name' },
            { title: '大小(字节)', dataIndex: 'size', key: 'size' },
            { title: '比特', dataIndex: 'bits', key: 'bits' }
          ]}
          pagination={false}
          size="small"
        />
      </Card>
    </Space>
  );
};

export default FileSizeCalculator;
