import React, { useState, useRef, useEffect } from 'react';
import {
  Layout, Input, Button, Card, List, Avatar, Typography,
  Space, Spin, Tag, Divider, Empty, message, Tooltip, Drawer
} from 'antd';
import {
  SendOutlined, RobotOutlined, UserOutlined,
  ToolOutlined, HistoryOutlined, PlusOutlined,
  DeleteOutlined, ReloadOutlined, LoadingOutlined,
  GithubOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import api from '../../services/api';

const { Text, Title } = Typography;
const { TextArea } = Input;

const AgentChat = () => {
  const { user } = useSelector(state => state.user);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // 加载会话列表
  const loadSessions = async () => {
    try {
      setSessionLoading(true);
      const res = await api.get('/agent/sessions/');
      setSessions(res.data.results || res.data || []);
    } catch (err) {
      console.error('加载会话失败', err);
    } finally {
      setSessionLoading(false);
    }
  };

  // 加载消息历史
  const loadMessages = async (sessionId) => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    try {
      const res = await api.get(`/agent/sessions/${sessionId}/messages/`);
      const msgs = (res.data.results || res.data || []).map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        msg_type: m.msg_type,
        tool_name: m.tool_name,
        tool_params: m.tool_params,
        tool_result: m.tool_result,
        created_at: m.created_at,
      }));
      setMessages(msgs);
    } catch (err) {
      console.error('加载消息失败', err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    loadMessages(currentSessionId);
  }, [currentSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewSession = async () => {
    try {
      const res = await api.post('/agent/sessions/', { title: '新会话' });
      const sess = res.data;
      setSessions(prev => [sess, ...prev]);
      setCurrentSessionId(sess.session_id);
      setMessages([]);
      setDrawerOpen(false);
    } catch (err) {
      message.error('创建会话失败');
    }
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/agent/sessions/${sessionId}/`);
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      message.error('删除会话失败');
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue('');

    // 乐观添加用户消息
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      msg_type: 'text',
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const payload = { message: text };
      if (currentSessionId) {
        payload.session_id = currentSessionId;
      }
      const res = await api.post('/agent/chat/', payload);
      const { session_id, reply, steps } = res.data;

      // 更新会话ID（如果是新会话）
      if (!currentSessionId) {
        setCurrentSessionId(session_id);
        // 刷新会话列表以显示新会话
        loadSessions();
      }

      // 添加助手回复
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: reply,
        msg_type: 'text',
        steps: steps || [],
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = err.response?.data?.reply || err.response?.data?.detail || '请求失败，请稍后重试';
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorMsg,
        msg_type: 'error',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessageContent = (msg) => {
    if (msg.msg_type === 'tool_result' || msg.role === 'tool') {
      const resultStr = typeof msg.tool_result === 'object'
        ? JSON.stringify(msg.tool_result, null, 2)
        : String(msg.content || msg.tool_result || '');
      return (
        <div>
          <Tag color="blue" icon={<ToolOutlined />}>
            {msg.tool_name || '工具调用'}
          </Tag>
          <pre style={{
            background: '#f6f8fa',
            padding: 8,
            borderRadius: 4,
            fontSize: 12,
            maxHeight: 200,
            overflow: 'auto',
            marginTop: 8,
          }}>
            {resultStr}
          </pre>
        </div>
      );
    }

    // 普通文本支持简单换行
    return (
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {msg.content}
      </div>
    );
  };

  const currentSession = sessions.find(s => s.session_id === currentSessionId);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* 侧边会话列表 */}
      <div style={{
        width: 260,
        borderRight: '1px solid #e5e7eb',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            block
            onClick={createNewSession}
          >
            新建会话
          </Button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          <Spin spinning={sessionLoading}>
            {sessions.length === 0 ? (
              <Empty description="暂无会话" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 40 }} />
            ) : (
              sessions.map(sess => (
                <div
                  key={sess.session_id}
                  onClick={() => setCurrentSessionId(sess.session_id)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderLeft: currentSessionId === sess.session_id ? '3px solid #1677ff' : '3px solid transparent',
                    background: currentSessionId === sess.session_id ? '#e6f4ff' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#1f2937',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      <HistoryOutlined style={{ marginRight: 8, color: '#6b7280' }} />
                      {sess.title || '未命名会话'}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                      {sess.created_at ? new Date(sess.created_at).toLocaleString() : ''}
                    </div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => deleteSession(sess.session_id, e)}
                    style={{ opacity: 0.6 }}
                  />
                </div>
              ))
            )}
          </Spin>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
          <a
            href="https://github.com/peter123023/QAgent"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#6b7280',
              fontSize: 14,
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: 6,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.color = '#1677ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <GithubOutlined />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* 主聊天区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8f9fa' }}>
        {/* 顶部标题 */}
        <div style={{
          padding: '16px 24px',
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar size={36} style={{ background: '#1677ff' }} icon={<RobotOutlined />} />
            <div>
              <Title level={5} style={{ margin: 0, fontSize: 16 }}>Agent</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {currentSession ? currentSession.title : '新建会话开始对话'}
              </Text>
            </div>
          </div>
          <Space>
            <Tooltip title="新建会话">
              <Button icon={<PlusOutlined />} onClick={createNewSession} />
            </Tooltip>
          </Space>
        </div>

        {/* 消息列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 48px' }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: 'center', marginTop: '15vh' }}>
              <Avatar size={64} style={{ background: '#1677ff', marginBottom: 16 }} icon={<RobotOutlined />} />
              <Title level={4}>智能测试 Agent</Title>
              <Text type="secondary">我可以帮你查询用例、执行测试、查看报告、创建接口测试等</Text>
              <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  '查询高优先级的测试用例',
                  '帮我创建一个登录功能的测试用例',
                  '查看最近的测试执行进度',
                  '生成一个测试计划',
                  '查看测试报告仪表盘',
                  '创建一个 GET 接口请求'
                ].map((demo, idx) => (
                  <Button
                    key={idx}
                    type="default"
                    style={{ borderRadius: 16 }}
                    onClick={() => { setInputValue(demo); }}
                  >
                    {demo}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <List
            dataSource={messages}
            renderItem={msg => (
              <div style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 16,
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  maxWidth: '80%',
                  gap: 12,
                }}>
                  <Avatar
                    size={36}
                    style={{
                      background: msg.role === 'user' ? '#52c41a' : '#1677ff',
                      flexShrink: 0,
                    }}
                    icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  />
                  <Card
                    size="small"
                    style={{
                      background: msg.role === 'user' ? '#d9f7e5' : '#fff',
                      borderRadius: 12,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                    bodyStyle={{ padding: '12px 16px' }}
                  >
                    {renderMessageContent(msg)}
                  </Card>
                </div>
              </div>
            )}
          />

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Avatar size={36} style={{ background: '#1677ff' }} icon={<RobotOutlined />} />
              <Card size="small" style={{ borderRadius: 12 }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
                <Text type="secondary" style={{ marginLeft: 8 }}>Agent 思考中...</Text>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div style={{
          padding: '16px 48px 24px',
          background: '#fff',
          borderTop: '1px solid #e5e7eb',
        }}>
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: 16,
            padding: '12px 16px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#1677ff';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(22,119,255,0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}
          >
            <TextArea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入指令，例如：查询高优先级用例 / 帮我创建一个登录测试用例 / 查看最近执行进度..."
              autoSize={{ minRows: 3, maxRows: 10 }}
              bordered={false}
              style={{ resize: 'none', fontSize: 14, lineHeight: 1.6 }}
              disabled={loading}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Enter 发送 · Shift + Enter 换行
              </Text>
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<SendOutlined />}
                onClick={sendMessage}
                loading={loading}
                disabled={!inputValue.trim()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
