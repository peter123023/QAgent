import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  message,
  Space,
  Switch,
  Typography,
  Radio,
} from 'antd';
import {
  createWriterConfig,
  enableWriterConfig,
  getAIModelConfigs,
  getWriterConfigs,
  updateWriterConfig,
} from '../../services/ai-generation';

const { Title } = Typography;
const { TextArea } = Input;

const WriterConfig = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [models, setModels] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    let configData = [];
    try {
      // 先加载模型数据（这个很重要）
      try {
        const modelRes = await getAIModelConfigs();
        // 处理模型数据
        let modelData = [];
        if (modelRes.data) {
          if (Array.isArray(modelRes.data)) {
            modelData = modelRes.data;
          } else if (modelRes.data.results && Array.isArray(modelRes.data.results)) {
            modelData = modelRes.data.results;
          }
        }
        setModels(modelData);
      } catch (modelError) {
        message.error('加载模型失败');
      }

      // 再加载配置数据
      try {
        const configRes = await getWriterConfigs();
        configData = configRes.data?.results || configRes.data || [];
      } catch (configError) {
        // 不显示错误消息，因为配置可能不存在
      }

      const current = configData.find((x) => x.is_active) || configData[0];
      if (current) {
        setActiveId(current.id);
        // 处理models_selected - 可能是数组或者单个值
        let selectedModel = null;
        if (current.models_selected) {
          if (Array.isArray(current.models_selected) && current.models_selected.length > 0) {
            selectedModel = Number(current.models_selected[0]);
          } else if (typeof current.models_selected === 'number') {
            selectedModel = current.models_selected;
          }
        }
        form.setFieldsValue({
          ...current,
          models_selected: selectedModel,
        });
      } else {
        form.setFieldsValue({
          name: '默认编写配置',
          is_active: true,
        });
      }
    } catch (e) {
      message.error('加载编写配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        name: values.name || '编写配置',
        // 确保models_selected是数组格式（后端可能期望数组）
        models_selected: values.models_selected ? [values.models_selected] : [],
      };
      setSaving(true);
      if (activeId) {
        await updateWriterConfig(activeId, payload);
        await enableWriterConfig(activeId);
      } else {
        const res = await createWriterConfig(payload);
        const id = res.data?.id;
        if (id) {
          await enableWriterConfig(id);
          setActiveId(id);
        }
      }
      message.success('编写配置已保存');
      loadData();
    } catch (e) {
      console.error('保存失败:', e);
      const errorMsg = e.response?.data?.detail || e.response?.data?.message || e.message || '保存失败，请检查必填项';
      message.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleImportBestPrompt = () => {
    const defaultPrompt = `你是一个专业的测试用例编写专家。请根据以下需求描述，编写详细、全面的测试用例。

需求：
{{requirement}}

请按照以下格式输出测试用例：
1. 测试用例编号
2. 测试场景
3. 前置条件
4. 测试步骤
5. 预期结果
6. 优先级（高/中/低）

请确保测试用例覆盖正常流程、边界条件和异常场景。`;
    form.setFieldValue('prompt_content', defaultPrompt);
    message.success('已使用默认的Prompt模板');
  };

  return (
    <div style={{ padding: 20 }}>
      <Card loading={loading} title={<Title level={4} style={{ margin: 0 }}>AI用例编写配置</Title>}>
        {models.length === 0 && (
          <Alert
            type="warning"
            showIcon
            message="当前未配置可用模型"
            description="请先到 设置 -&gt; AI模型设置 创建并启用模型，否则无法选择模型。"
            style={{ marginBottom: 16 }}
          />
        )}
        <Form form={form} layout="vertical">
          <Card size="small" title="模型选择">
            <Form.Item name="models_selected" rules={[{ required: true, message: '请选择一个模型' }]}>
              <Radio.Group disabled={models.length === 0}>
                <Space direction="vertical">
                  {models.map((m) => (
                    <Radio key={m.id} value={m.id}>
                      {m.name} ({m.model_name})
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>
          </Card>

          <Card size="small" title="提示词管理" style={{ marginTop: 16 }}>
            <Space style={{ marginBottom: 8 }}>
              <Button onClick={handleImportBestPrompt}>使用默认的Prompt模板</Button>
            </Space>
            <Form.Item name="prompt_content" label="可视化Prompt编辑器" rules={[{ required: true, message: '请输入Prompt' }]}>
              <TextArea rows={8} placeholder="支持变量占位符，如 {{module}} {{priority}}" />
            </Form.Item>
          </Card>

          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" loading={saving} onClick={handleSave}>保存并启用</Button>
          </Form.Item>

          <Form.Item name="is_active" label="启用配置" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default WriterConfig;
