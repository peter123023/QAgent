import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Row,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {
  createReviewerConfig,
  enableReviewerConfig,
  getAIModelConfigs,
  getReviewerConfigs,
  loadDefaultPrompts,
  simulateReviewer,
  updateReviewerConfig,
} from '../../services/ai-generation';

const { TextArea } = Input;
const { Title } = Typography;

const builtInDims = [
  { name: '完整性', weight: 25 },
  { name: '正确性', weight: 25 },
  { name: '可维护性', weight: 25 },
  { name: '业务覆盖率', weight: 25 },
];

const ReviewerConfig = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [models, setModels] = useState([]);
  const [simResult, setSimResult] = useState(null);
  const [files, setFiles] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 分别加载，一个失败不影响另一个
      let configData = [];
      let modelData = [];

      try {
        const configRes = await getReviewerConfigs();
        configData = configRes.data?.results || configRes.data || [];
      } catch {
        // 配置加载失败也继续
      }

      try {
        const modelRes = await getAIModelConfigs();
        if (modelRes.data) {
          if (Array.isArray(modelRes.data)) {
            modelData = modelRes.data;
          } else if (modelRes.data.results && Array.isArray(modelRes.data.results)) {
            modelData = modelRes.data.results;
          }
        }
      } catch {
        // 模型加载失败也继续
      }

      setModels(modelData);
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
          review_dimensions_json: JSON.stringify(
            current.review_dimensions?.length ? current.review_dimensions : builtInDims,
            null,
            2
          ),
          review_strategy: {
            multi_reviewer: current.review_strategy?.multi_reviewer ?? false,
            conflict_arbitration: current.review_strategy?.conflict_arbitration ?? true,
            auto_merge_suggestion: current.review_strategy?.auto_merge_suggestion ?? false,
            pass_threshold: current.review_strategy?.pass_threshold ?? 80,
          },
        });
      } else {
        form.setFieldsValue({
          name: '默认评审配置',
          review_dimensions_json: JSON.stringify(builtInDims, null, 2),
          review_strategy: {
            multi_reviewer: false,
            conflict_arbitration: true,
            auto_merge_suggestion: false,
            pass_threshold: 80,
          },
          confidence_threshold: 0.8,
          is_active: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const save = async () => {
    try {
      const values = await form.validateFields();
      const reviewDimensions = values.review_dimensions_json ? JSON.parse(values.review_dimensions_json) : builtInDims;
      const payload = {
        ...values,
        name: values.name || '评审配置',
        review_dimensions: reviewDimensions,
        // 确保models_selected是数组格式
        models_selected: values.models_selected ? [values.models_selected] : [],
      };
      delete payload.review_dimensions_json;
      setSaving(true);
      if (activeId) {
        await updateReviewerConfig(activeId, payload);
        await enableReviewerConfig(activeId);
      } else {
        const res = await createReviewerConfig(payload);
        const id = res.data?.id;
        if (id) {
          await enableReviewerConfig(id);
          setActiveId(id);
        }
      }
      message.success('评审配置已保存');
      loadData();
    } catch (e) {
      console.error('保存失败:', e);
      const errorMsg = e.response?.data?.detail || e.response?.data?.message || e.message || '保存失败，请检查表单';
      message.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const importBestPrompt = async () => {
    try {
      const res = await loadDefaultPrompts();
      form.setFieldValue('prompt_content', res.data?.defaults?.reviewer || '');
      message.success('已引入默认Prompt');
    } catch {
      message.error('引入失败');
    }
  };

  const simulate = async () => {
    if (!activeId) {
      message.warning('请先保存配置');
      return;
    }
    const caseText = form.getFieldValue('simulate_case_text') || '';
    if (!files.length && !caseText) {
      message.warning('请上传至少一个用例文件或填写用例文本');
      return;
    }
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f.originFileObj));
    if (caseText) fd.append('case_text', caseText);

    setSimulating(true);
    try {
      const res = await simulateReviewer(activeId, fd);
      setSimResult(res.data);
      message.success('模拟评审完成');
    } catch (e) {
      message.error(e.response?.data?.error || '模拟评审失败');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Card loading={loading} title={<Title level={4} style={{ margin: 0 }}>AI用例评审配置</Title>}>
        {models.length === 0 && (
          <Alert
            type="warning"
            showIcon
            message="当前未配置可用模型"
            description="请先到 设置 > AI模型设置 创建并启用模型。"
            style={{ marginBottom: 16 }}
          />
        )}
        <Form form={form} layout="vertical">
          <Card size="small" title="模型选择（单选）">
            <Form.Item name="models_selected" rules={[{ required: true, message: '请选择评审模型' }]}>
              <Radio.Group disabled={models.length === 0}>
                <Space direction="vertical">
                  {models.map((m) => (
                    <Radio key={m.id} value={m.id}>
                      {m.name} ({m.model_name}) - 建议置信度阈值: 0.8
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>
          </Card>

          <Card size="small" title="提示词配置" style={{ marginTop: 16 }}>
            <Space style={{ marginBottom: 8 }}>
              <Button onClick={importBestPrompt}>引入默认Prompt</Button>
            </Space>
            <Form.Item name="prompt_content" label="评审Prompt" rules={[{ required: true, message: '请输入评审Prompt' }]}>
              <TextArea rows={6} placeholder="请明确输出JSON结构，包含评分、缺陷和修复建议" />
            </Form.Item>
            <Form.Item name="review_dimensions_json" label="评审维度（可自定义）">
              <TextArea
                rows={5}
                placeholder='示例: [{"name":"完整性","weight":25}]'
              />
            </Form.Item>
            <Form.Item name="confidence_threshold" label="置信度阈值">
              <InputNumber min={0.1} max={1} step={0.05} style={{ width: 200 }} />
            </Form.Item>
          </Card>

          <Card size="small" title="评审策略" style={{ marginTop: 16 }}>
            <Row gutter={12}>
              <Col span={6}>
                <Form.Item name={['review_strategy', 'multi_reviewer']} label="多人评审" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={['review_strategy', 'conflict_arbitration']} label="冲突仲裁" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={['review_strategy', 'auto_merge_suggestion']} label="自动合并建议" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={['review_strategy', 'pass_threshold']} label="自动通过阈值">
                  <InputNumber min={1} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card size="small" title="模拟评审" style={{ marginTop: 16 }}>
            <Upload
              multiple
              beforeUpload={() => false}
              fileList={files}
              onChange={({ fileList }) => setFiles(fileList)}
            >
              <Button icon={<UploadOutlined />}>上传用例文件</Button>
            </Upload>
            <Form.Item name="simulate_case_text" label="或直接粘贴用例文本" style={{ marginTop: 12 }}>
              <TextArea rows={4} />
            </Form.Item>
            <Space>
              <Button type="primary" onClick={save} loading={saving}>保存并启用</Button>
              <Button onClick={simulate} loading={simulating}>模拟评审</Button>
            </Space>

            {simResult?.score_distribution && (
              <div style={{ marginTop: 12 }}>
                {Object.entries(simResult.score_distribution).map(([k, v]) => (
                  <Tag key={k} color="blue">{k}: {v}</Tag>
                ))}
              </div>
            )}
            {simResult?.defects?.length > 0 && (
              <pre style={{ marginTop: 12, background: '#f7f7f7', padding: 12, maxHeight: 200, overflow: 'auto' }}>
                {simResult.defects.join('\n')}
              </pre>
            )}
            {simResult?.diff && (
              <pre style={{ marginTop: 12, background: '#f7f7f7', padding: 12, maxHeight: 200, overflow: 'auto' }}>
                {simResult.diff}
              </pre>
            )}
          </Card>

          <Form.Item name="is_active" label="启用配置" valuePropName="checked" style={{ marginTop: 16 }}>
            <Switch />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ReviewerConfig;
