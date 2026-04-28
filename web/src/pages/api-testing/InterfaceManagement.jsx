import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Tree,
  Input,
  Select,
  Button,
  Space,
  Tabs,
  Modal,
  Form,
  Table,
  Tag,
  message,
  Empty,
  Spin,
  Dropdown,
  Tooltip,
  Typography,
  Descriptions,
  AutoComplete,
  Radio
} from 'antd';
import {
  PlusOutlined,
  FolderOutlined,
  FileOutlined,
  SearchOutlined,
  SendOutlined,
  SaveOutlined,
  ImportOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  ThunderboltOutlined,
  SwapOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getApiProjects,
  getApiCollections,
  getEnvironments,
  getApiRequests,
  getRequestDetail,
  createRequest,
  updateRequest,
  deleteRequest,
  executeRequest,
  createCollection,
  updateCollection,
  deleteCollection,
  searchCollections
} from '../../services/api-testing';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { DirectoryTree } = Tree;
const { Option } = Select;

const methodColors = {
  GET: '#61affe',
  POST: '#49cc90',
  PUT: '#fca130',
  PATCH: '#50e3c2',
  DELETE: '#f93e3e',
  HEAD: '#9012fe',
  OPTIONS: '#0d5aa7',
  CONNECT: '#00b8f5',
  TRACE: '#挨骂'
};

const KeyValueEditor = ({ value = [], onChange, placeholderKey = 'Key', placeholderValue = 'Value' }) => {
  const [items, setItems] = useState(value.length > 0 ? value : [{ key: '', value: '', enabled: true }]);

  useEffect(() => {
    if (value && value.length > 0) {
      setItems(value);
    }
  }, [value]);

  const handleChange = (index, field, fieldValue) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: fieldValue };
    setItems(newItems);
    if (onChange) {
      onChange(newItems);
    }
  };

  const addItem = () => {
    const newItems = [...items, { key: '', value: '', enabled: true }];
    setItems(newItems);
    if (onChange) {
      onChange(newItems);
    }
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      if (onChange) {
        onChange(newItems);
      }
    }
  };

  return (
    <div>
      {items.map((item, index) => (
        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
          <Input
            placeholder={placeholderKey}
            value={item.key}
            onChange={(e) => handleChange(index, 'key', e.target.value)}
            style={{ flex: 1 }}
            size="small"
          />
          <Input
            placeholder={placeholderValue}
            value={item.value}
            onChange={(e) => handleChange(index, 'value', e.target.value)}
            style={{ flex: 1 }}
            size="small"
          />
          <Button
            type="link"
            danger
            size="small"
            onClick={() => removeItem(index)}
            disabled={items.length <= 1}
          >
            删除
          </Button>
        </div>
      ))}
      <Button type="dashed" onClick={addItem} block size="small">
        + 添加
      </Button>
    </div>
  );
};

const InterfaceManagement = () => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [collections, setCollections] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [response, setResponse] = useState(null);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('params');
  const [responseActiveTab, setResponseActiveTab] = useState('body');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [showEditCollectionModal, setShowEditCollectionModal] = useState(false);
  const [showCurlImportModal, setShowCurlImportModal] = useState(false);
  const [showCodeGenerateModal, setShowCodeGenerateModal] = useState(false);
  const [curlCommand, setCurlCommand] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [generatedCode, setGeneratedCode] = useState('');

  const [requestForm] = Form.useForm();
  const [collectionForm] = Form.useForm();

  const [bodyType, setBodyType] = useState('none');
  const [rawType, setRawType] = useState('json');
  const [rawBody, setRawBody] = useState('');

  const availableMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  useEffect(() => {
    loadProjects();
    return () => {};
  }, []);

  const loadProjects = async () => {
    try {
      const response = await getApiProjects();
      const data = response.data?.results || response.data || [];
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      message.error('加载项目列表失败');
    }
  };

  useEffect(() => {
    if (selectedProject) {
      loadCollections(selectedProject);
      loadEnvironments(selectedProject);
    }
  }, [selectedProject]);

  const loadCollections = async (projectId) => {
    setLoading(true);
    try {
      const [collectionsRes, unassignedRes] = await Promise.all([
        getApiCollections({ project: projectId }),
        getApiRequests({ collection__isnull: true, project: projectId })
      ]);
      
      const data = collectionsRes.data?.results || collectionsRes.data || [];
      setCollections(data);
      
      const unassigned = unassignedRes.data?.results || unassignedRes.data || [];
      console.log('Collections:', data);
      console.log('Unassigned requests:', unassigned);
      const treeDataResult = buildTreeData(data, unassigned);
      console.log('Tree data result:', treeDataResult);
      setTreeData(treeDataResult);
    } catch (error) {
      console.error('loadCollections error:', error);
      message.error('加载集合失败');
    } finally {
      setLoading(false);
    }
  };

  const loadEnvironments = async (projectId) => {
    try {
      const response = await getEnvironments({ project: projectId });
      const data = response.data?.results || response.data || [];
      setEnvironments(data);
    } catch (error) {
      console.error('加载环境失败:', error);
    }
  };

  const buildTreeData = (items, unassignedRequests = []) => {
    const treeNodes = items.map((item) => {
      const children = [];

      // 添加子集合
      if (item.children && item.children.length > 0) {
        children.push(...buildTreeData(item.children));
      }

      // 添加当前集合下的接口
      if (item.requests && item.requests.length > 0) {
        children.push(...item.requests.map((req) => ({
          key: `request-${req.id}`,
          title: req.name,
          isLeaf: true,
          method: req.method,
          requestType: req.request_type,
          requestId: req.id
        })));
      }

      return {
        key: `collection-${item.id}`,
        title: item.name,
        isLeaf: false,
        children: children.length > 0 ? children : undefined
      };
    });

    // 添加未分类接口节点
    if (unassignedRequests.length > 0) {
      treeNodes.push({
        key: 'uncategorized',
        title: '未分类接口',
        isLeaf: false,
        children: unassignedRequests.map((req) => ({
          key: `request-${req.id}`,
          title: req.name,
          isLeaf: true,
          method: req.method,
          requestType: req.request_type,
          requestId: req.id
        }))
      });
    }

    return treeNodes;
  };

  const handleSearch = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await searchCollections({
        project: selectedProject,
        keyword: value
      });
      setSearchResults(response.data?.results || response.data || []);
    } catch (error) {
      message.error('搜索失败');
    }
  };

  const handleTreeSelect = async (selectedKeys) => {
    if (selectedKeys.length === 0) return;
    const key = selectedKeys[0];

    // 点击集合节点，不加载
    if (key.startsWith('collection-') || key === 'uncategorized') {
      return;
    }

    // 解析请求 ID (格式: request-123)
    let requestId = key;
    if (key.startsWith('request-')) {
      requestId = key.replace('request-', '');
    }

    try {
      const response = await getRequestDetail(requestId);
      setSelectedRequest(response.data);
      setResponse(null);

      if (response.data.body) {
        if (response.data.body.type === 'raw' || response.data.body.type === 'json') {
          setBodyType('raw');
          setRawType(response.data.body.type === 'json' ? 'json' : 'text');
          setRawBody(typeof response.data.body.data === 'string'
            ? response.data.body.data
            : JSON.stringify(response.data.body.data, null, 2));
        } else {
          setBodyType(response.data.body.type || 'none');
        }
      } else {
        setBodyType('none');
      }
    } catch (error) {
      message.error('加载请求详情失败');
    }
  };

  const handleSendRequest = async () => {
    if (!selectedRequest) return;

    setSending(true);
    try {
      const requestData = {
        ...selectedRequest,
        environment_id: selectedEnvironment
      };

      if (bodyType === 'raw') {
        requestData.body = {
          type: rawType,
          data: rawBody
        };
      }

      const response = await executeRequest(selectedRequest.id, requestData);
      setResponse(response.data);
    } catch (error) {
      message.error('发送请求失败');
    } finally {
      setSending(false);
    }
  };

  const handleSaveRequest = async () => {
    if (!selectedRequest) return;

    setSaving(true);
    try {
      const requestData = {
        ...selectedRequest,
        project: selectedProject
      };

      if (bodyType === 'raw') {
        requestData.body = {
          type: rawType,
          data: rawBody
        };
      }

      if (selectedRequest.id) {
        await updateRequest(selectedRequest.id, requestData);
        message.success('保存成功');
      } else {
        const response = await createRequest(requestData);
        setSelectedRequest({ ...selectedRequest, id: response.data.id });
        message.success('创建成功');
      }
      loadCollections(selectedProject);
    } catch (error) {
      const errMsg = error.response?.data?.detail || error.response?.data?.url?.[0] || error.response?.data?.non_field_errors?.[0] || JSON.stringify(error.response?.data) || error.message || '未知错误';
      message.error(`保存失败: ${errMsg}`);
      console.error('保存接口失败:', error.response?.data || error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEmptyRequest = () => {
    setSelectedRequest({
      name: '未命名接口',
      url: '',
      method: 'GET',
      params: [],
      headers: [],
      body: { type: 'none', data: '' },
      assertions: [],
      request_type: 'HTTP'
    });
    setResponse(null);
    setBodyType('none');
  };

  const handleCreateCollection = async () => {
    try {
      const values = await collectionForm.validateFields();
      await createCollection({
        ...values,
        project: selectedProject
      });
      message.success('创建成功');
      setShowCreateCollectionModal(false);
      collectionForm.resetFields();
      loadCollections(selectedProject);
    } catch (error) {
      message.error('创建失败');
    }
  };

  const handleDeleteNode = async (node) => {
    try {
      if (node.isLeaf) {
        await deleteRequest(node.key);
        if (selectedRequest?.id === node.key) {
          setSelectedRequest(null);
          setResponse(null);
        }
        message.success('删除成功');
      } else {
        await deleteCollection(node.key);
        message.success('删除成功');
      }
      loadCollections(selectedProject);
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleImportCurl = () => {
    setShowCurlImportModal(true);
  };

  const handleParseCurl = () => {
    message.info('CURL解析功能');
    setShowCurlImportModal(false);
  };

  const handleGenerateCode = () => {
    if (!selectedRequest) return;
    const codeTemplates = {
      javascript: `const axios = require('axios');

const response = await axios({
  method: '${selectedRequest.method}',
  url: '${selectedRequest.url}',
  params: ${JSON.stringify(selectedRequest.params || {})},
  headers: ${JSON.stringify(selectedRequest.headers || {})},
  data: ${bodyType === 'raw' ? rawBody : '{}'}
});`,
      python: `import requests

response = requests.${selectedRequest.method.toLowerCase()}(
    '${selectedRequest.url}',
    params=${JSON.stringify(selectedRequest.params || {})},
    headers=${JSON.stringify(selectedRequest.headers || {})},
    json=${bodyType === 'raw' ? rawBody : '{}'}
)

print(response.json())`,
      curl: `curl -X ${selectedRequest.method} '${selectedRequest.url}' \\
  -H 'Content-Type: application/json' \\
  ${bodyType === 'raw' ? `-d '${rawBody}'` : ''}`
    };
    setGeneratedCode(codeTemplates[codeLanguage] || codeTemplates.javascript);
    setShowCodeGenerateModal(true);
  };

  const formatResponseBody = (body) => {
    if (!body) return '';
    if (typeof body === 'string') {
      try {
        return JSON.stringify(JSON.parse(body), null, 2);
      } catch {
        return body;
      }
    }
    return JSON.stringify(body, null, 2);
  };

  const getStatusColor = (code) => {
    if (code >= 200 && code < 300) return 'success';
    if (code >= 300 && code < 400) return 'warning';
    return 'error';
  };

  const expandedKeys = [
    ...collections.map((c) => `collection-${c.id}`),
    'uncategorized'
  ];

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex' }}>
      <div style={{ width: '280px', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px' }}>
          <Select
            placeholder="选择项目"
            value={selectedProject}
            onChange={setSelectedProject}
            style={{ width: '100%', marginBottom: '12px' }}
          >
            {projects.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name}
              </Option>
            ))}
          </Select>
          <Input
            placeholder="搜索接口..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            allowClear
          />
          <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
            <Button
              type="primary"
              size="small"
              icon={<FolderOutlined />}
              onClick={() => setShowCreateCollectionModal(true)}
              style={{ flex: 1 }}
            >
              新建集合
            </Button>
            <Button
              type="success"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleCreateEmptyRequest}
              style={{ flex: 1 }}
            >
              新建接口
            </Button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
            </div>
          ) : (
            <>
              <DirectoryTree
                treeData={treeData}
                expandedKeys={expandedKeys}
                onSelect={handleTreeSelect}
                onRightClick={({ node, event }) => {
                  event.preventDefault();
                }}
              />

              {searchResults.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <Text type="secondary" style={{ marginBottom: '8px', display: 'block' }}>
                    搜索结果 ({searchResults.length})
                  </Text>
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleTreeSelect([result.id])}
                      style={{
                        padding: '8px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag color={methodColors[result.method] || '#999'}>
                          {result.method || 'GET'}
                        </Tag>
                        <Text ellipsis style={{ flex: 1 }}>
                          {result.name}
                        </Text>
                      </div>
                      <Text type="secondary" ellipsis style={{ fontSize: '12px' }}>
                        {result.url}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selectedRequest ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="请选择一个接口或创建新接口">
              <Button type="primary" onClick={handleCreateEmptyRequest}>
                创建新接口
              </Button>
            </Empty>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <Select
                  value={selectedRequest.method}
                  onChange={(method) => setSelectedRequest({ ...selectedRequest, method })}
                  style={{ width: '100px' }}
                >
                  {availableMethods.map((m) => (
                    <Option key={m} value={m}>
                      <Tag color={methodColors[m]} style={{ marginRight: 0 }}>
                        {m}
                      </Tag>
                    </Option>
                  ))}
                </Select>
                <Input
                  placeholder="输入请求URL"
                  value={selectedRequest.url}
                  onChange={(e) => setSelectedRequest({ ...selectedRequest, url: e.target.value })}
                  style={{ flex: 1 }}
                />
                <Select
                  placeholder="选择环境"
                  value={selectedEnvironment}
                  onChange={setSelectedEnvironment}
                  allowClear
                  style={{ width: '150px' }}
                >
                  {environments.map((env) => (
                    <Option key={env.id} value={env.id}>
                      {env.name}
                    </Option>
                  ))}
                </Select>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendRequest}
                  loading={sending}
                >
                  发送
                </Button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Input
                  placeholder="接口名称"
                  value={selectedRequest.name}
                  onChange={(e) => setSelectedRequest({ ...selectedRequest, name: e.target.value })}
                  style={{ width: '300px' }}
                  size="small"
                />
                <Space>
                  <Button size="small" icon={<SaveOutlined />} onClick={handleSaveRequest} loading={saving}>
                    保存
                  </Button>
                  <Dropdown
                    menu={{
                      items: [
                        { key: 'import', label: '导入CURL', onClick: handleImportCurl },
                        { key: 'export', label: '导出CURL' }
                      ]
                    }}
                  >
                    <Button size="small" icon={<ImportOutlined />}>
                      导入
                    </Button>
                  </Dropdown>
                  <Button size="small" icon={<CodeOutlined />} onClick={handleGenerateCode}>
                    生成代码
                  </Button>
                </Space>
              </div>
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              style={{ flex: 1 }}
              tabBarStyle={{ marginBottom: 0, paddingLeft: '12px' }}
              items={[
                {
                  key: 'params',
                  label: 'Params',
                  children: (
                    <div style={{ padding: '12px' }}>
                      <KeyValueEditor
                        value={selectedRequest.params || []}
                        onChange={(params) => setSelectedRequest({ ...selectedRequest, params })}
                        placeholderKey="参数名"
                        placeholderValue="参数值"
                      />
                    </div>
                  )
                },
                {
                  key: 'headers',
                  label: 'Headers',
                  children: (
                    <div style={{ padding: '12px' }}>
                      <KeyValueEditor
                        value={selectedRequest.headers || []}
                        onChange={(headers) => setSelectedRequest({ ...selectedRequest, headers })}
                        placeholderKey="头部名"
                        placeholderValue="头部值"
                      />
                    </div>
                  )
                },
                {
                  key: 'body',
                  label: 'Body',
                  children: (
                    <div style={{ padding: '12px' }}>
                      <Space style={{ marginBottom: '12px' }}>
                        <Radio.Group value={bodyType} onChange={(e) => setBodyType(e.target.value)}>
                          <Radio.Button value="none">none</Radio.Button>
                          <Radio.Button value="form-data">form-data</Radio.Button>
                          <Radio.Button value="x-www-form-urlencoded">x-www-form-urlencoded</Radio.Button>
                          <Radio.Button value="raw">raw</Radio.Button>
                        </Radio.Group>
                      </Space>

                      {bodyType === 'raw' && (
                        <div>
                          <Select value={rawType} onChange={setRawType} style={{ width: 150, marginBottom: 8 }}>
                            <Option value="text">Text</Option>
                            <Option value="json">JSON</Option>
                            <Option value="xml">XML</Option>
                            <Option value="html">HTML</Option>
                          </Select>
                          <TextArea
                            rows={10}
                            value={rawBody}
                            onChange={(e) => setRawBody(e.target.value)}
                            placeholder="输入请求体..."
                          />
                        </div>
                      )}

                      {bodyType === 'form-data' && (
                        <KeyValueEditor
                          value={selectedRequest.formData || []}
                          onChange={(formData) => setSelectedRequest({ ...selectedRequest, formData })}
                          placeholderKey="Key"
                          placeholderValue="Value"
                        />
                      )}
                    </div>
                  )
                },
                {
                  key: 'assertions',
                  label: '断言',
                  children: (
                    <div style={{ padding: '12px' }}>
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                        const assertions = selectedRequest.assertions || [];
                        setSelectedRequest({
                          ...selectedRequest,
                          assertions: [...assertions, { name: '', type: 'status_code', expected: '' }]
                        });
                      }} style={{ marginBottom: '12px' }}>
                        添加断言
                      </Button>
                      {selectedRequest.assertions?.map((assertion, index) => (
                        <Card key={index} size="small" style={{ marginBottom: '8px' }}>
                          <Space>
                            <Input
                              placeholder="断言名称"
                              value={assertion.name}
                              onChange={(e) => {
                                const assertions = [...selectedRequest.assertions];
                                assertions[index] = { ...assertions[index], name: e.target.value };
                                setSelectedRequest({ ...selectedRequest, assertions });
                              }}
                              style={{ width: 150 }}
                              size="small"
                            />
                            <Select
                              value={assertion.type}
                              onChange={(type) => {
                                const assertions = [...selectedRequest.assertions];
                                assertions[index] = { ...assertions[index], type };
                                setSelectedRequest({ ...selectedRequest, assertions });
                              }}
                              style={{ width: 150 }}
                              size="small"
                            >
                              <Option value="status_code">状态码</Option>
                              <Option value="contains">包含</Option>
                              <Option value="json_path">JSON路径</Option>
                              <Option value="equals">完全匹配</Option>
                            </Select>
                            <Input
                              placeholder="期望值"
                              value={assertion.expected}
                              onChange={(e) => {
                                const assertions = [...selectedRequest.assertions];
                                assertions[index] = { ...assertions[index], expected: e.target.value };
                                setSelectedRequest({ ...selectedRequest, assertions });
                              }}
                              style={{ width: 200 }}
                              size="small"
                            />
                            <Button
                              type="link"
                              danger
                              onClick={() => {
                                const assertions = selectedRequest.assertions.filter((_, i) => i !== index);
                                setSelectedRequest({ ...selectedRequest, assertions });
                              }}
                            >
                              删除
                            </Button>
                          </Space>
                        </Card>
                      ))}
                    </div>
                  )
                }
              ]}
            />

            {response && (
              <div style={{ borderTop: '1px solid #f0f0f0', height: '250px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Title level={5} style={{ margin: 0 }}>响应</Title>
                  <Tag color={getStatusColor(response.status_code)}>{response.status_code}</Tag>
                  <Text type="secondary">{response.response_time?.toFixed(0) || 0}ms</Text>
                </div>
                <Tabs
                  activeKey={responseActiveTab}
                  onChange={setResponseActiveTab}
                  style={{ flex: 1 }}
                  items={[
                    {
                      key: 'body',
                      label: 'Body',
                      children: (
                        <pre style={{ padding: '12px', margin: 0, overflow: 'auto', height: '100%', fontSize: '12px' }}>
                          {formatResponseBody(response.response_data?.body)}
                        </pre>
                      )
                    },
                    {
                      key: 'headers',
                      label: 'Headers',
                      children: (
                        <div style={{ padding: '12px' }}>
                          {Object.entries(response.response_data?.headers || {}).map(([key, value]) => (
                            <div key={key} style={{ marginBottom: '4px' }}>
                              <Text strong>{key}:</Text> <Text>{value}</Text>
                            </div>
                          ))}
                        </div>
                      )
                    },
                    {
                      key: 'assertions',
                      label: '断言结果',
                      children: (
                        <div style={{ padding: '12px' }}>
                          {response.assertions_results?.length > 0 ? (
                            response.assertions_results.map((result, index) => (
                              <Tag
                                key={index}
                                color={result.passed ? 'success' : 'error'}
                                style={{ marginRight: '8px', marginBottom: '8px' }}
                              >
                                {result.name}: {result.passed ? '通过' : '失败'}
                              </Tag>
                            ))
                          ) : (
                            <Text type="secondary">暂无断言结果</Text>
                          )}
                        </div>
                      )
                    }
                  ]}
                />
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        title="创建集合"
        open={showCreateCollectionModal}
        onOk={handleCreateCollection}
        onCancel={() => {
          setShowCreateCollectionModal(false);
          collectionForm.resetFields();
        }}
      >
        <Form form={collectionForm} layout="vertical">
          <Form.Item name="name" label="集合名称" rules={[{ required: true, message: '请输入集合名称' }]}>
            <Input placeholder="请输入集合名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="parent" label="父集合">
            <Select placeholder="选择父集合（可选）" allowClear>
              {collections.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="导入CURL"
        open={showCurlImportModal}
        onOk={handleParseCurl}
        onCancel={() => setShowCurlImportModal(false)}
      >
        <TextArea
          rows={10}
          value={curlCommand}
          onChange={(e) => setCurlCommand(e.target.value)}
          placeholder="粘贴CURL命令..."
        />
      </Modal>

      <Modal
        title="生成代码"
        open={showCodeGenerateModal}
        onCancel={() => setShowCodeGenerateModal(false)}
        footer={null}
        width={800}
      >
        <Space style={{ marginBottom: 12 }}>
          <Select value={codeLanguage} onChange={setCodeLanguage} style={{ width: 150 }}>
            <Option value="javascript">JavaScript</Option>
            <Option value="python">Python</Option>
            <Option value="curl">cURL</Option>
          </Select>
        </Space>
        <TextArea rows={15} value={generatedCode} readOnly />
      </Modal>
    </div>
  );
};

export default InterfaceManagement;