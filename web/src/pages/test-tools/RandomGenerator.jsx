import React, { useState } from 'react';
import { Card, InputNumber, Button, Checkbox, Space, Typography, Divider, Tag, Input, Slider, message } from 'antd';
import { CopyOutlined, SwapOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const generateUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const RandomGenerator = () => {
  const [intMin, setIntMin] = useState(1);
  const [intMax, setIntMax] = useState(100);
  const [intResult, setIntResult] = useState('');

  const [floatMin, setFloatMin] = useState(0);
  const [floatMax, setFloatMax] = useState(1);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [floatResult, setFloatResult] = useState('');

  const [strLength, setStrLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(false);
  const [strResult, setStrResult] = useState('');

  const [uuidResult, setUuidResult] = useState('');
  const [colorResult, setColorResult] = useState('');

  const [listInput, setListInput] = useState('');
  const [selectCount, setSelectCount] = useState(1);
  const [selectResult, setSelectResult] = useState('');

  const [arrayInput, setArrayInput] = useState('');
  const [shuffleResult, setShuffleResult] = useState('');

  const handleCopy = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      message.success('复制成功');
    } catch (err) {
      message.error('复制失败');
    }
  };

  const handleGenerateInt = () => {
    if (intMin >= intMax) {
      setIntResult('最小值必须小于最大值');
      return;
    }
    const result = Math.floor(Math.random() * (intMax - intMin + 1)) + intMin;
    setIntResult(result.toString());
  };

  const handleGenerateFloat = () => {
    if (floatMin >= floatMax) {
      setFloatResult('最小值必须小于最大值');
      return;
    }
    const result = (Math.random() * (floatMax - floatMin) + floatMin).toFixed(decimalPlaces);
    setFloatResult(result);
  };

  const handleGenerateString = () => {
    let chars = '';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) chars += '0123456789';
    if (includeSpecial) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (!chars) {
      setStrResult('请至少选择一种字符类型');
      return;
    }

    let result = '';
    for (let i = 0; i < strLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setStrResult(result);
  };

  const handleGenerateUuid = () => {
    setUuidResult(generateUuid());
  };

  const handleGenerateColor = () => {
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setColorResult(color);
  };

  const handleGenerateSelect = () => {
    const items = listInput.split('\n').map(item => item.trim()).filter(Boolean);
    if (items.length === 0) {
      setSelectResult('请输入待选择的列表');
      return;
    }
    if (selectCount > items.length) {
      setSelectResult('选择数量不能超过列表元素数量');
      return;
    }
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, selectCount);
    setSelectResult(selected.join('\n'));
  };

  const handleGenerateShuffle = () => {
    const items = arrayInput.split('\n').map(item => item.trim()).filter(Boolean);
    if (items.length === 0) {
      setShuffleResult('请输入待打乱的数组');
      return;
    }
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    setShuffleResult(shuffled.join('\n'));
  };

  const ResultItem = ({ label, value, extra }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text strong>{label}</Text>
        {value && (
          <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleCopy(value)}>复制</Button>
        )}
      </div>
      <div style={{ 
        background: '#f5f5f5', 
        padding: 12, 
        borderRadius: 6, 
        fontFamily: 'monospace',
        wordBreak: 'break-all',
        minHeight: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        {value ? <Text>{value}</Text> : <Text type="secondary">点击生成按钮获取结果</Text>}
        {extra}
      </div>
    </div>
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="随机整数生成" size="small">
        <Space size="middle" style={{ marginBottom: 16 }}>
          <InputNumber min={-1000000} max={1000000} value={intMin} onChange={setIntMin} placeholder="最小值" />
          <Text>~</Text>
          <InputNumber min={-1000000} max={1000000} value={intMax} onChange={setIntMax} placeholder="最大值" />
          <Button type="primary" onClick={handleGenerateInt}>生成</Button>
        </Space>
        <ResultItem label="结果" value={intResult} />
      </Card>

      <Card title="随机浮点数生成" size="small">
        <Space size="middle" style={{ marginBottom: 16 }}>
          <InputNumber min={-1000000} max={1000000} step={0.01} value={floatMin} onChange={setFloatMin} placeholder="最小值" />
          <Text>~</Text>
          <InputNumber min={-1000000} max={1000000} step={0.01} value={floatMax} onChange={setFloatMax} placeholder="最大值" />
          <InputNumber min={0} max={10} value={decimalPlaces} onChange={setDecimalPlaces} placeholder="小数位数" />
          <Button type="primary" onClick={handleGenerateFloat}>生成</Button>
        </Space>
        <ResultItem label="结果" value={floatResult} />
      </Card>

      <Card title="随机字符串生成" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
          <div>
            <Text style={{ marginRight: 12 }}>长度: {strLength}</Text>
            <Slider
              min={1}
              max={128}
              value={strLength}
              onChange={setStrLength}
              style={{ width: 300, display: 'inline-block' }}
            />
          </div>
          <Space>
            <Checkbox checked={includeUppercase} onChange={(e) => setIncludeUppercase(e.target.checked)}>大写字母(A-Z)</Checkbox>
            <Checkbox checked={includeLowercase} onChange={(e) => setIncludeLowercase(e.target.checked)}>小写字母(a-z)</Checkbox>
            <Checkbox checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)}>数字(0-9)</Checkbox>
            <Checkbox checked={includeSpecial} onChange={(e) => setIncludeSpecial(e.target.checked)}>特殊字符</Checkbox>
            <Button type="primary" onClick={handleGenerateString}>生成</Button>
          </Space>
        </Space>
        <ResultItem label="结果" value={strResult} />
      </Card>

      <Card title="UUID生成" size="small">
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={handleGenerateUuid} icon={<ThunderboltOutlined />}>生成UUID</Button>
        </Space>
        <ResultItem label="结果" value={uuidResult} />
      </Card>

      <Card title="随机颜色生成" size="small">
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={handleGenerateColor}>生成随机颜色</Button>
        </Space>
        <ResultItem 
          label="结果" 
          value={colorResult}
          extra={colorResult && (
            <div style={{ 
              width: 30, 
              height: 30, 
              background: colorResult, 
              borderRadius: 4, 
              border: '1px solid #d9d9d9' 
            }} />
          )}
        />
      </Card>

      <Card title="随机选择器" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
          <TextArea
            rows={4}
            placeholder="请输入待选择的列表，每行一个元素"
            value={listInput}
            onChange={(e) => setListInput(e.target.value)}
          />
          <Space>
            <InputNumber min={1} max={100} value={selectCount} onChange={setSelectCount} />
            <Text>个</Text>
            <Button type="primary" onClick={handleGenerateSelect}>随机选择</Button>
          </Space>
        </Space>
        <ResultItem label="选择结果" value={selectResult} />
      </Card>

      <Card title="数组乱序工具" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
          <TextArea
            rows={4}
            placeholder="请输入待打乱的数组，每行一个元素"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
          />
          <Button type="primary" onClick={handleGenerateShuffle} icon={<SwapOutlined />}>打乱顺序</Button>
        </Space>
        <ResultItem label="打乱结果" value={shuffleResult} />
      </Card>
    </Space>
  );
};

export default RandomGenerator;
