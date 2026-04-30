import React, { useState } from 'react';
import { Card, Row, Col, Button, Select, Input, InputNumber, Space, message, Table, Typography, Divider } from 'antd';
import { CopyOutlined, ReloadOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const dataTypes = [
  { key: 'name', label: '姓名', desc: '随机生成中文姓名' },
  { key: 'phone', label: '手机号', desc: '中国大陆手机号码' },
  { key: 'idCard', label: '身份证号', desc: '符合规则的身份证号' },
  { key: 'email', label: '邮箱', desc: '随机邮箱地址' },
  { key: 'address', label: '地址', desc: '随机中文地址' },
  { key: 'bankCard', label: '银行卡号', desc: '符合Luhn算法的银行卡号' },
  { key: 'company', label: '公司名称', desc: '随机公司名称' },
  { key: 'username', label: '用户名', desc: '随机用户名' },
  { key: 'password', label: '密码', desc: '随机密码' },
  { key: 'date', label: '日期', desc: '随机日期' },
  { key: 'number', label: '数字', desc: '指定范围内的数字' },
  { key: 'string', label: '字符串', desc: '指定长度的随机字符串' },
  { key: 'uuid', label: 'UUID', desc: '唯一标识符' },
  { key: 'ip', label: 'IP地址', desc: 'IPv4地址' },
  { key: 'color', label: '颜色', desc: '随机颜色' }
];

const TestDataGenerator = () => {
  const [selectedType, setSelectedType] = useState('name');
  const [count, setCount] = useState(1);
  const [generatedData, setGeneratedData] = useState([]);
  const [customConfig, setCustomConfig] = useState({
    minLength: 6,
    maxLength: 12,
    minNumber: 1,
    maxNumber: 100
  });

  const generateName = () => {
    const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡'];
    const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀英', '华', '平', '刚'];
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const name1 = names[Math.floor(Math.random() * names.length)];
    const name2 = Math.random() > 0.5 ? names[Math.floor(Math.random() * names.length)] : '';
    return surname + name1 + name2;
  };

  const generatePhone = () => {
    const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '170', '176', '177', '178', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    let suffix = '';
    for (let i = 0; i < 8; i++) {
      suffix += Math.floor(Math.random() * 10);
    }
    return prefix + suffix;
  };

  const generateIdCard = () => {
    const prefix = String(Math.floor(Math.random() * 900000) + 100000);
    const year = String(Math.floor(Math.random() * 50) + 1970);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const suffix = String(Math.floor(Math.random() * 900) + 100);
    return prefix + year + month + day + suffix + 'X';
  };

  const generateEmail = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const domains = ['gmail.com', 'qq.com', '163.com', '126.com', 'outlook.com', 'yahoo.com', 'sina.com'];
    let name = '';
    const length = Math.floor(Math.random() * 8) + 5;
    for (let i = 0; i < length; i++) {
      name += chars[Math.floor(Math.random() * chars.length)];
    }
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return name + '@' + domain;
  };

  const generateAddress = () => {
    const provinces = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '山东省', '四川省', '湖北省'];
    const cities = ['海淀区', '朝阳区', '浦东新区', '鼓楼区', '西湖区', '历下区', '武侯区', '武昌区'];
    const streets = ['中关村大街', '建国路', '南京路', '中山路', '解放路', '人民路', '建设路', '和平路'];
    const province = provinces[Math.floor(Math.random() * provinces.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const number = Math.floor(Math.random() * 200) + 1;
    return province + city + street + number + '号';
  };

  const generateBankCard = () => {
    const prefixes = ['622848', '622700', '622202', '621700', '621661', '621226', '620522', '620410'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    let card = prefix;
    for (let i = 0; i < 13; i++) {
      card += Math.floor(Math.random() * 10);
    }
    return card;
  };

  const generateCompany = () => {
    const prefixes = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉'];
    const middles = ['科技', '信息技术', '网络', '电子商务', '贸易', '实业', '文化', '教育'];
    const suffixes = ['有限公司', '股份有限公司', '科技有限公司', '网络科技有限公司'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const middle = middles[Math.floor(Math.random() * middles.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return prefix + middle + suffix;
  };

  const generateUsername = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let username = '';
    const length = Math.floor(Math.random() * 8) + 5;
    for (let i = 0; i < length; i++) {
      username += chars[Math.floor(Math.random() * chars.length)];
    }
    return username;
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const length = Math.floor(Math.random() * 6) + 8;
    for (let i = 0; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password;
  };

  const generateDate = () => {
    const start = new Date('1970-01-01');
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  };

  const generateNumber = () => {
    const min = customConfig.minNumber || 1;
    const max = customConfig.maxNumber || 100;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  };

  const generateString = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const min = customConfig.minLength || 6;
    const max = customConfig.maxLength || 12;
    const length = Math.floor(Math.random() * (max - min + 1)) + min;
    let str = '';
    for (let i = 0; i < length; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generateIP = () => {
    const parts = [];
    for (let i = 0; i < 4; i++) {
      parts.push(Math.floor(Math.random() * 256));
    }
    return parts.join('.');
  };

  const generateColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const generateData = () => {
    const data = [];
    const generators = {
      name: generateName,
      phone: generatePhone,
      idCard: generateIdCard,
      email: generateEmail,
      address: generateAddress,
      bankCard: generateBankCard,
      company: generateCompany,
      username: generateUsername,
      password: generatePassword,
      date: generateDate,
      number: generateNumber,
      string: generateString,
      uuid: generateUUID,
      ip: generateIP,
      color: generateColor
    };

    const generator = generators[selectedType];
    if (generator) {
      for (let i = 0; i < count; i++) {
        data.push({
          key: i + 1,
          index: i + 1,
          value: generator()
        });
      }
      setGeneratedData(data);
      message.success('数据生成成功');
    }
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value).then(() => {
      message.success('复制成功');
    });
  };

  const copyAll = () => {
    const allValues = generatedData.map(item => item.value).join('\n');
    navigator.clipboard.writeText(allValues).then(() => {
      message.success('全部复制成功');
    });
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80
    },
    {
      title: '数据',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(record.value)}>
          复制
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '0 20px' }}>
      <Title level={3}>测试数据生成器</Title>
      <Text type="secondary">快速生成各种常用测试数据</Text>
      <Divider />

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="数据类型" size="small">
            <Select
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: '100%' }}
              options={dataTypes.map(type => ({
                value: type.key,
                label: type.label,
                description: type.desc
              }))}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
              {dataTypes.find(t => t.key === selectedType)?.desc}
            </Text>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="生成配置" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <InputNumber
                min={1}
                max={1000}
                value={count}
                onChange={setCount}
                addonBefore="数量"
                style={{ width: '100%' }}
              />
              {['number', 'string'].includes(selectedType) && (
                <>
                  <InputNumber
                    min={1}
                    max={100}
                    value={customConfig.minLength}
                    onChange={(v) => setCustomConfig({ ...customConfig, minLength: v })}
                    addonBefore="最小长度"
                    style={{ width: '100%' }}
                  />
                  <InputNumber
                    min={1}
                    max={100}
                    value={customConfig.maxLength}
                    onChange={(v) => setCustomConfig({ ...customConfig, maxLength: v })}
                    addonBefore="最大长度"
                    style={{ width: '100%' }}
                  />
                  {selectedType === 'number' && (
                    <>
                      <InputNumber
                        value={customConfig.minNumber}
                        onChange={(v) => setCustomConfig({ ...customConfig, minNumber: v })}
                        addonBefore="最小值"
                        style={{ width: '100%' }}
                      />
                      <InputNumber
                        value={customConfig.maxNumber}
                        onChange={(v) => setCustomConfig({ ...customConfig, maxNumber: v })}
                        addonBefore="最大值"
                        style={{ width: '100%' }}
                      />
                    </>
                  )}
                </>
              )}
            </Space>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="操作" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                icon={<ReloadOutlined />}
                onClick={generateData}
                block
              >
                生成数据
              </Button>
              {generatedData.length > 0 && (
                <Button
                  size="large"
                  icon={<CopyOutlined />}
                  onClick={copyAll}
                  block
                >
                  复制全部
                </Button>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {generatedData.length > 0 && (
        <Card
          title={`生成结果 (${generatedData.length}条)`}
          style={{ marginTop: '16px' }}
          extra={
            <Space>
              <Button
                type="link"
                icon={<CopyOutlined />}
                onClick={copyAll}
              >
                复制全部
              </Button>
              <Button
                type="link"
                icon={<DeleteOutlined />}
                onClick={() => setGeneratedData([])}
              >
                清空
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={generatedData}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`
            }}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};

export default TestDataGenerator;
