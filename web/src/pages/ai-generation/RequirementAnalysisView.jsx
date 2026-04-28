import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import { message } from 'antd';
// import * as XLSX from 'xlsx';

const RequirementAnalysisView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);

  // Refs
  const fileInputRef = useRef(null);
  const eventSourceRef = useRef(null);

  // 全局输出模式设置
  const [globalOutputMode, setGlobalOutputMode] = useState('stream');

  // 手动输入需求
  const [manualInput, setManualInput] = useState({
    title: '',
    description: '',
    selectedProject: ''
  });

  // 文件上传
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [progressText, setProgressText] = useState('准备中');
  const [currentStep, setCurrentStep] = useState(0);
  const [streamedContent, setStreamedContent] = useState('');
  const [streamedReviewContent, setStreamedReviewContent] = useState('');
  const [finalTestCases, setFinalTestCases] = useState('');
  const [showReviewStep, setShowReviewStep] = useState(true);

  // 生成结果
  const [showResults, setShowResults] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);

  // AI配置状态
  const [configStatus, setConfigStatus] = useState({
    overall_status: 'unknown',
    message: '',
    writer_model: {
      configured: false,
      enabled: false,
      name: null,
      provider: null,
      id: null,
      required: true
    },
    writer_prompt: {
      configured: false,
      enabled: false,
      name: null,
      id: null,
      required: true
    },
    reviewer_model: {
      configured: false,
      enabled: false,
      name: null,
      id: null,
      required: true
    },
    reviewer_prompt: {
      configured: false,
      enabled: false,
      name: null,
      id: null,
      required: true
    },
    generation_config: {
      configured: false,
      enabled: false,
      name: null,
      id: null,
      required: true,
      default_output_mode: null
    }
  });
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [modalKey, setModalKey] = useState(0);

  // 计算属性
  const canGenerateManual = manualInput.title.trim() &&
                            manualInput.description.trim() &&
                            manualInput.description.length <= 2000;

  // 加载项目
  const loadProjects = async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(response.data.results || response.data);
    } catch (error) {
      // 加载项目失败
    }
  };

  // 检查配置状态
  const checkConfigStatus = async () => {
    try {
      setCheckingConfig(true);
      const response = await api.get('/requirement-analysis/config/check/');
      setConfigStatus(response.data);

      // 判断逻辑
      const writerModelReady = response.data.writer_model &&
                            response.data.writer_model.configured &&
                            response.data.writer_model.enabled;

      const reviewerModelReady = response.data.reviewer_model &&
                              response.data.reviewer_model.configured &&
                              response.data.reviewer_model.enabled;

      const writerPromptReady = response.data.writer_prompt &&
                             response.data.writer_prompt.configured &&
                             response.data.writer_prompt.enabled;

      const reviewerPromptReady = response.data.reviewer_prompt &&
                               response.data.reviewer_prompt.configured &&
                               response.data.reviewer_prompt.enabled;

      const generationConfigReady = response.data.generation_config &&
                                  response.data.generation_config.configured;

      // 始终不显示配置向导
      setShowConfigGuide(false);

      if (writerModelReady && reviewerModelReady && writerPromptReady && reviewerPromptReady && generationConfigReady) {
        if (response.data.generation_config && response.data.generation_config.default_output_mode) {
          setGlobalOutputMode(response.data.generation_config.default_output_mode);
        }

        if (response.data.generation_config && response.data.generation_config.enable_auto_review !== null) {
          setShowReviewStep(response.data.generation_config.enable_auto_review);
        } else {
          setShowReviewStep(true);
        }
      }
    } catch (error) {
      setShowConfigGuide(false);
    } finally {
      setCheckingConfig(false);
    }
  };

  // 组件挂载
  useEffect(() => {
    loadProjects();
    checkConfigStatus();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // 跳转到配置页面
  const goToConfig = () => {
    if (!configStatus.generation_config || !configStatus.generation_config.configured) {
      navigate('/configuration/generation-config');
      return;
    }

    if (!configStatus.writer_prompt.configured || !configStatus.writer_prompt.enabled) {
      navigate('/configuration/prompt-config');
      return;
    }

    if (!configStatus.writer_model.configured || !configStatus.writer_model.enabled) {
      navigate('/configuration/ai-model');
      return;
    }

    if (!configStatus.reviewer_prompt.configured || !configStatus.reviewer_prompt.enabled) {
      navigate('/configuration/prompt-config');
      return;
    }

    if (!configStatus.reviewer_model.configured || !configStatus.reviewer_model.enabled) {
      navigate('/configuration/ai-model');
      return;
    }

    navigate('/configuration/generation-config');
  };

  // 获取配置项样式类
  const getConfigItemClass = (configKey) => {
    const config = configStatus[configKey];
    if (config.enabled) {
      return 'status-enabled';
    } else if (config.configured) {
      return 'status-disabled';
    } else {
      return 'status-unconfigured';
    }
  };

  // 获取状态符号
  const getStatusSymbol = (configKey) => {
    const config = configStatus[configKey];
    if (config.enabled) {
      return <span style={{ color: '#27ae60', fontSize: '18px' }}>✓</span>;
    } else if (config.configured) {
      return <span style={{ color: '#95a5a6', fontSize: '18px' }}>○</span>;
    } else {
      return <span style={{ color: '#e74c3c', fontSize: '18px' }}>✗</span>;
    }
  };

  // 拖拽事件处理
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect({ target: { files } });
    }
  };

  // 文件选择处理
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown'
      ];

      if (allowedTypes.includes(file.type) ||
          file.name.match(/\.(pdf|doc|docx|txt|md)$/i)) {
        setSelectedFile(file);
        setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
      } else {
        message.error('文件格式不支持');
      }
    }
  };

  // 移除文件
  const removeFile = () => {
    setSelectedFile(null);
    setDocumentTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 手动输入生成
  const generateFromManualInput = async () => {
    if (!canGenerateManual) {
      return;
    }

    const requirementText = `需求标题: ${manualInput.title}\n\n需求描述:\n${manualInput.description}`;

    await startGeneration(
      manualInput.title,
      requirementText,
      manualInput.selectedProject,
      globalOutputMode
    );
  };

  // 文档生成
  const generateFromDocument = async () => {
    if (!selectedFile || !documentTitle) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', documentTitle);
      formData.append('file', selectedFile);
      if (selectedProject) {
        formData.append('project', selectedProject);
      }

      message.info('正在提取文档内容...');
      const uploadResponse = await api.post('/requirement-analysis/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const extractResponse = await api.get(`/requirement-analysis/documents/${uploadResponse.data.id}/extract_text/`);
      const extractedText = extractResponse.data.extracted_text;

      if (!extractedText || extractedText.trim().length === 0) {
        message.error('无法提取文档内容');
        return;
      }

      const requirementText = `文档标题: ${documentTitle}\n\n文档内容:\n${extractedText}`;

      await startGeneration(
        documentTitle,
        requirementText,
        selectedProject,
        globalOutputMode
      );
    } catch (error) {
      message.error('文档处理失败: ' + (error.response?.data?.error || error.message));
    }
  };

  // 开始生成
  const startGeneration = async (title, requirementText, projectId, outputMode = 'stream') => {
    setIsGenerating(true);
    setCurrentStep(1);
    setProgressText('正在创建任务');
    setStreamedContent('');
    setFinalTestCases('');
    setStreamedReviewContent('');
    setShowResults(false);

    try {
      const requestData = {
        title: title,
        requirement_text: requirementText,
        use_writer_model: true,
        use_reviewer_model: true,
        output_mode: outputMode
      };

      if (projectId) {
        requestData.project = projectId;
      }

      const response = await api.post('/requirement-analysis/testcase-generation/generate/', requestData);

      setCurrentTaskId(response.data.task_id);
      setProgressText('任务已创建');

      message.success('生成任务已创建');

      if (outputMode === 'stream') {
        startStreamingProgress(response.data.task_id);
      } else {
        startPolling(response.data.task_id);
      }
    } catch (error) {
      message.error('创建任务失败: ' + (error.response?.data?.error || error.message));
      setIsGenerating(false);
    }
  };

  // 流式进度获取
  const startStreamingProgress = (taskId) => {
    const currentOrigin = window.location.origin;
    const apiUrl = `${currentOrigin}/api/requirement-analysis/testcase-generation/${taskId}/stream_progress/`;

    const es = new EventSource(apiUrl, { withCredentials: true });
    eventSourceRef.current = es;

    es.onopen = () => {
      // SSE连接已打开
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'progress') {
          if (data.status === 'generating') {
            setCurrentStep(2);
            setProgressText('正在生成用例 ' + (data.progress || '') + '%');
          } else if (data.status === 'reviewing') {
            setCurrentStep(3);
            setProgressText('正在评审 ' + (data.progress || '') + '%');
          } else if (data.status === 'revising') {
            setCurrentStep(3);
            setProgressText('正在修正 ' + (data.progress || '') + '%');
          }
        } else if (data.type === 'content') {
          setStreamedContent(prev => prev + data.content);
          setCurrentStep(2);
          setProgressText('正在生成用例');
        } else if (data.type === 'review_content') {
          setStreamedReviewContent(prev => prev + data.content);
          setCurrentStep(3);
          setProgressText('正在评审');
        } else if (data.type === 'final_content') {
          setFinalTestCases(prev => prev + data.content);
          setCurrentStep(3);
          setProgressText('正在修正');
        } else if (data.type === 'status') {
          if (data.status === 'completed') {
            setProgressText('完成');
            fetchFinalResult();
          } else if (data.status === 'failed') {
            setProgressText('失败');
            handleGenerationError();
          }
        } else if (data.type === 'done') {
          if (es) {
            es.close();
            eventSourceRef.current = null;
          }
          fetchFinalResult();
        }
      } catch (e) {
        // 解析SSE数据失败
      }
    };

    es.onerror = () => {
      if (!eventSourceRef.current) {
        return;
      }

      if (showResults || !isGenerating) {
        if (es) {
          es.close();
          eventSourceRef.current = null;
        }
        return;
      }

      if (es.readyState === 2) {
        es.close();
        eventSourceRef.current = null;
        message.warning('流式连接中断');
        startPolling(taskId);
      } else if (es.readyState === 0) {
        setTimeout(() => {
          if (eventSourceRef.current && eventSourceRef.current.readyState === 0) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            message.warning('流式连接中断');
            startPolling(taskId);
          }
        }, 5000);
      }
    };
  };

  // 获取最终结果
  const fetchFinalResult = async () => {
    try {
      const response = await api.get(`/requirement-analysis/testcase-generation/${currentTaskId}/progress/`);
      const task = response.data;

      setGenerationResult(task);
      setShowResults(true);
      setIsGenerating(false);

      setCurrentStep(4);

      if (task.final_test_cases) {
        setFinalTestCases(task.final_test_cases);
      }

      if (!streamedReviewContent && task.review_feedback) {
        setStreamedReviewContent(task.review_feedback);
      }

      if (!streamedContent && task.generated_test_cases) {
        setStreamedContent(task.generated_test_cases);
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      message.success('生成完成');
    } catch (error) {
      message.error('获取最终结果失败');
      setIsGenerating(false);
    }
  };

  // 处理生成错误
  const handleGenerationError = () => {
    setIsGenerating(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  // 轮询获取进度
  const startPolling = (taskId) => {
    const pollingInterval = setInterval(async () => {
      try {
        const response = await api.get(`/requirement-analysis/testcase-generation/${taskId}/progress/`);
        const task = response.data;

        if (task.status === 'generating') {
          setCurrentStep(2);
          setProgressText('正在生成用例');
        } else if (task.status === 'reviewing') {
          setCurrentStep(3);
          setProgressText('正在评审');
        } else if (task.status === 'completed') {
          setCurrentStep(4);
          setProgressText('完成');

          setGenerationResult(task);
          setShowResults(true);
          setIsGenerating(false);

          if (task.generated_test_cases) {
            setStreamedContent(task.generated_test_cases);
          }
          if (task.review_feedback) {
            setStreamedReviewContent(task.review_feedback);
          }
          if (task.final_test_cases) {
            setFinalTestCases(task.final_test_cases);
          }

          clearInterval(pollingInterval);

          message.success('生成完成');
          return;
        } else if (task.status === 'failed') {
          setProgressText('失败');
          setIsGenerating(false);

          clearInterval(pollingInterval);
          message.error('生成失败: ' + (task.error_message || '未知错误'));
          return;
        }
      } catch (error) {
        // 检查进度失败
      }
    }, 3000);
  };

  // 取消生成
  const cancelGeneration = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsGenerating(false);
    setCurrentTaskId(null);
    message.info('已取消生成');
  };

  // 下载测试用例为xlsx文件
  const downloadTestCases = async () => {
    message.info('下载功能暂未启用');
  };

  // 保存到测试用例记录
  const saveToTestCaseRecords = async () => {
    try {
      const response = await api.post(`/requirement-analysis/testcase-generation/${generationResult.task_id}/save_to_records/`);

      if (response.data.already_saved) {
        message.info('已保存过');
      } else {
        const importedCount = response.data.imported_count || 0;
        message.success(`测试用例已保存！已导入 ${importedCount} 条测试用例到测试用例管理系统`);
      }
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 重新生成
  const resetGeneration = () => {
    setIsGenerating(false);
    setCurrentTaskId(null);
    setProgressText('准备中');
    setCurrentStep(0);
    setShowResults(false);
    setGenerationResult(null);
    setStreamedContent('');
    setStreamedReviewContent('');
    setFinalTestCases('');

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    window.location.reload();
  };

  // 格式化Markdown为HTML
  const formatMarkdown = (content) => {
    if (!content) return '';

    let html = content.replace(/\*\*新增\*\*-/g, '').replace(/新增-/g, '');
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    html = html.replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>');

    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    html = html.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    html = html.replace(/\n/g, '<br>');

    return html;
  };

  // 将HTML的<br>标签转换为换行符
  const convertBrToNewline = (text) => {
    if (!text) return '';
    return text.replace(/<br\s*\/?>/gi, '\n');
  };

  // 过滤掉总结和建议部分
  const filterTestCasesOnly = (content) => {
    if (!content) return '';

    const lines = content.split('\n');
    const filteredLines = [];
    let inTestCaseSection = true;

    for (let line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.includes('总结') ||
          trimmedLine.includes('建议') ||
          trimmedLine.includes('Summary') ||
          trimmedLine.includes('Recommendation') ||
          trimmedLine.includes('最后') ||
          trimmedLine.includes('补充说明')) {
        inTestCaseSection = false;
        break;
      }
      if (inTestCaseSection) {
        filteredLines.push(line);
      }
    }

    return filteredLines.join('\n');
  };

  // 解析表格格式的测试用例
  const parseTableFormat = (content) => {
    if (!content) return [];

    const lines = content.split('\n').filter(line => line.trim());
    const worksheetData = [];

    for (let line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.includes('|') && !trimmedLine.includes('--------')) {
        const cells = trimmedLine.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (cells.length > 1) {
          worksheetData.push(cells);
        }
      }
    }

    return worksheetData;
  };

  // 解析结构化格式的测试用例
  const parseStructuredFormat = (content) => {
    if (!content) return [];

    const lines = content.split('\n').filter(line => line.trim());
    const worksheetData = [];

    worksheetData.push(['测试用例编号', '测试场景', '前置条件', '操作步骤', '预期结果', '优先级']);

    let currentTestCase = {};
    let testCaseNumber = 1;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      if (line.includes('测试用例') || line.includes('Test Case') || line.match(/^(\d+\.|\*|\-|\d+、)/)) {
        if (Object.keys(currentTestCase).length > 0) {
          worksheetData.push([
            currentTestCase.number || `TC${testCaseNumber}`,
            currentTestCase.scenario || '',
            currentTestCase.precondition || '',
            currentTestCase.steps || '',
            currentTestCase.expected || '',
            currentTestCase.priority || '中'
          ]);
          testCaseNumber++;
        }

        currentTestCase = {
          number: `TC${testCaseNumber}`,
          scenario: line.replace(/^(\d+\.|\*|\-|\d+、)\s*/, '').replace(/测试用例\d*[:：]?\s*/, ''),
          precondition: '',
          steps: '',
          expected: '',
          priority: '中'
        };
        i++;
      } else if (line.includes('前置条件') || line.includes('前提') || line.includes('Precondition')) {
        let precondition = line.replace(/.*?[:：]\s*/, '');
        i++;
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (nextLine.includes('测试步骤') || nextLine.includes('操作步骤') ||
              nextLine.includes('Test Steps') || nextLine.includes('步骤') ||
              nextLine.includes('预期结果') || nextLine.includes('Expected') ||
              nextLine.includes('优先级') || nextLine.includes('Priority') ||
              nextLine.includes('测试用例') || nextLine.includes('Test Case') ||
              nextLine.match(/^(\d+\.|\*|\-|\d+、)/)) {
            break;
          }
          if (nextLine) {
            precondition += '\n' + nextLine;
          }
          i++;
        }
        currentTestCase.precondition = precondition;
      } else if (line.includes('测试步骤') || line.includes('操作步骤') ||
                 line.includes('Test Steps') || line.includes('步骤')) {
        let steps = line.replace(/.*?[:：]\s*/, '');
        i++;
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (nextLine.includes('预期结果') || nextLine.includes('Expected') ||
              nextLine.includes('优先级') || nextLine.includes('Priority') ||
              nextLine.includes('测试用例') || nextLine.includes('Test Case') ||
              nextLine.match(/^(\d+\.|\*|\-|\d+、)/)) {
            break;
          }
          if (nextLine) {
            steps += '\n' + nextLine;
          }
          i++;
        }
        currentTestCase.steps = steps;
      } else if (line.includes('预期结果') || line.includes('Expected') || line.includes('期望')) {
        let expected = line.replace(/.*?[:：]\s*/, '');
        i++;
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (nextLine.includes('优先级') || nextLine.includes('Priority') ||
              nextLine.includes('测试用例') || nextLine.includes('Test Case') ||
              nextLine.match(/^(\d+\.|\*|\-|\d+、)/)) {
            break;
          }
          if (nextLine) {
            expected += '\n' + nextLine;
          }
          i++;
        }
        currentTestCase.expected = expected;
      } else if (line.includes('优先级') || line.includes('Priority')) {
        currentTestCase.priority = line.replace(/.*?[:：]\s*/, '');
        i++;
      } else {
        i++;
      }
    }

    if (Object.keys(currentTestCase).length > 0) {
      worksheetData.push([
        currentTestCase.number || `TC${testCaseNumber}`,
        currentTestCase.scenario || '',
        currentTestCase.precondition || '',
        currentTestCase.steps || '',
        currentTestCase.expected || '',
        currentTestCase.priority || '中'
      ]);
    }

    if (worksheetData.length <= 1) {
      worksheetData.length = 0;
      worksheetData.push(['测试用例内容']);
      content.split('\n').forEach((line, index) => {
        if (line.trim()) {
          worksheetData.push([line.trim()]);
        }
      });
    }

    return worksheetData;
  };

  return (
    <div className="requirement-analysis" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 配置引导弹窗 */}
      {showConfigGuide && !checkingConfig && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }} key={modalKey} onClick={() => setShowConfigGuide(false)}>
          <div className="guide-config-modal" style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: '24px', padding: '36px', maxWidth: '850px',
            width: '100%', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
              <svg className="guide-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" style={{ width: '56px', height: '56px' }}>
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="#f59e0b"/>
                <path d="M464 336a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm72 112h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z" fill="#f59e0b"/>
              </svg>
              <div>
                <h2 style={{ fontSize: '1.6rem', color: '#1a202c', margin: '0 0 6px 0', fontWeight: '700' }}>AI 配置向导</h2>
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>请先配置必要的 AI 模型和提示词</p>
              </div>
            </div>

            <div className="config-groups">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI 模型配置
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div className={`config-item-inline ${getConfigItemClass('writer_model')}`} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px',
                    borderRadius: '12px', border: '2px solid transparent',
                    background: configStatus.writer_model.enabled ? 'linear-gradient(135deg, rgba(236, 253, 245, 0.9) 0%, rgba(220, 252, 231, 0.6) 100%)' :
                              configStatus.writer_model.configured ? 'linear-gradient(135deg, rgba(254, 249, 195, 0.9) 0%, rgba(254, 240, 138, 0.6) 100%)' :
                              'linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.6) 100%)',
                    borderColor: configStatus.writer_model.enabled ? 'rgba(34, 197, 94, 0.2)' :
                                configStatus.writer_model.configured ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                  }}>
                    {getStatusSymbol('writer_model')}
                    <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>用例编写模型</span>
                    {configStatus.writer_model.name && <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '4px', fontWeight: '500' }}>{configStatus.writer_model.name}</span>}
                    {!configStatus.writer_model.configured && <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: '#ef4444', color: 'white' }}>未配置</span>}
                    {configStatus.writer_model.configured && !configStatus.writer_model.enabled && <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: '#eab308', color: 'white' }}>已禁用</span>}
                  </div>

                  <div className={`config-item-inline ${getConfigItemClass('reviewer_model')}`} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px',
                    borderRadius: '12px', border: '2px solid transparent',
                    background: configStatus.reviewer_model.enabled ? 'linear-gradient(135deg, rgba(236, 253, 245, 0.9) 0%, rgba(220, 252, 231, 0.6) 100%)' :
                              configStatus.reviewer_model.configured ? 'linear-gradient(135deg, rgba(254, 249, 195, 0.9) 0%, rgba(254, 240, 138, 0.6) 100%)' :
                              'linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.6) 100%)',
                    borderColor: configStatus.reviewer_model.enabled ? 'rgba(34, 197, 94, 0.2)' :
                                configStatus.reviewer_model.configured ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                  }}>
                    {getStatusSymbol('reviewer_model')}
                    <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>用例评审模型</span>
                    {configStatus.reviewer_model.name && <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '4px', fontWeight: '500' }}>{configStatus.reviewer_model.name}</span>}
                    {!configStatus.reviewer_model.configured && <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: '#ef4444', color: 'white' }}>未配置</span>}
                    {configStatus.reviewer_model.configured && !configStatus.reviewer_model.enabled && <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: '#eab308', color: 'white' }}>已禁用</span>}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  提示词配置
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div className={`config-item-inline ${getConfigItemClass('writer_prompt')}`} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px',
                    borderRadius: '12px', border: '2px solid transparent',
                    background: configStatus.writer_prompt.enabled ? 'linear-gradient(135deg, rgba(236, 253, 245, 0.9) 0%, rgba(220, 252, 231, 0.6) 100%)' :
                              configStatus.writer_prompt.configured ? 'linear-gradient(135deg, rgba(254, 249, 195, 0.9) 0%, rgba(254, 240, 138, 0.6) 100%)' :
                              'linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.6) 100%)',
                    borderColor: configStatus.writer_prompt.enabled ? 'rgba(34, 197, 94, 0.2)' :
                                configStatus.writer_prompt.configured ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                  }}>
                    {getStatusSymbol('writer_prompt')}
                    <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>用例编写提示词</span>
                    {configStatus.writer_prompt.name && <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '4px', fontWeight: '500' }}>{configStatus.writer_prompt.name}</span>}
                    {!configStatus.writer_prompt.configured && <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: '#ef4444', color: 'white' }}>未配置</span>}
                    {configStatus.writer_prompt.configured && !configStatus.writer_prompt.enabled && <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: '#eab308', color: 'white' }}>已禁用</span>}
                  </div>

                  <div className={`config-item-inline ${getConfigItemClass('reviewer_prompt')}`} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px',
                    borderRadius: '12px', border: '2px solid transparent',
                    background: configStatus.reviewer_prompt.enabled ? 'linear-gradient(135deg, rgba(236, 253, 245, 0.9) 0%, rgba(220, 252, 231, 0.6) 100%)' :
                              configStatus.reviewer_prompt.configured ? 'linear-gradient(135deg, rgba(254, 249, 195, 0.9) 0%, rgba(254, 240, 138, 0.6) 100%)' :
                              'linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.6) 100%)',
                    borderColor: configStatus.reviewer_prompt.enabled ? 'rgba(34, 197, 94, 0.2)' :
                                configStatus.reviewer_prompt.configured ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                  }}>
                    {getStatusSymbol('reviewer_prompt')}
                    <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>用例评审提示词</span>
                    {configStatus.reviewer_prompt.name && <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '4px', fontWeight: '500' }}>{configStatus.reviewer_prompt.name}</span>}
                    {!configStatus.reviewer_prompt.configured && <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: '#ef4444', color: 'white' }}>未配置</span>}
                    {configStatus.reviewer_prompt.configured && !configStatus.reviewer_prompt.enabled && <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: '#eab308', color: 'white' }}>已禁用</span>}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  生成行为配置
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div className={`config-item-inline ${getConfigItemClass('generation_config')}`} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px',
                    borderRadius: '12px', border: '2px solid transparent',
                    background: configStatus.generation_config?.configured ? 'linear-gradient(135deg, rgba(236, 253, 245, 0.9) 0%, rgba(220, 252, 231, 0.6) 100%)' : 'linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.6) 100%)',
                    borderColor: configStatus.generation_config?.configured ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                  }}>
                    {configStatus.generation_config?.configured ? <span style={{ color: '#27ae60', fontSize: '18px' }}>✓</span> : <span style={{ color: '#e74c3c', fontSize: '18px' }}>✗</span>}
                    <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>生成配置</span>
                    {configStatus.generation_config?.name && <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '4px', fontWeight: '500' }}>{configStatus.generation_config.name}</span>}
                    {!configStatus.generation_config?.configured && <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: '#ef4444', color: 'white' }}>未配置</span>}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '30px' }}>
              <button style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', border: '2px solid transparent',
                boxShadow: '0 2px 10px rgba(102, 126, 234, 0.3)',
                padding: '0 24px', width: '240px', height: '50px', borderRadius: '12px',
                fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer'
              }} onClick={goToConfig}>
                前往配置
              </button>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', cursor: 'pointer', padding: '4px 8px' }} onClick={() => setShowConfigGuide(false)}>
                稍后配置
              </div>
            </div>
          </div>
        </div>
      )}



      <div className="main-content">
        {/* 手动输入需求描述 */}
        {!isGenerating && !showResults && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '30px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #e1e8ed'
            }}>
              <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '1.5rem' }}>手动输入需求</h2>
              <div className="input-form">
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>需求标题 <span style={{ color: '#e74c3c' }}>*</span></label>
                  <input
                    value={manualInput.title}
                    onChange={(e) => setManualInput({ ...manualInput, title: e.target.value })}
                    type="text"
                    style={{
                      width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px',
                      fontSize: '1rem', transition: 'border-color 0.3s ease'
                    }}
                    placeholder="请输入需求标题"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>需求描述 <span style={{ color: '#e74c3c' }}>*</span></label>
                  <textarea
                    value={manualInput.description}
                    onChange={(e) => setManualInput({ ...manualInput, description: e.target.value })}
                    style={{
                      width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px',
                      fontSize: '1rem', minHeight: '120px', resize: 'vertical', fontFamily: 'inherit'
                    }}
                    rows={8}
                    placeholder="请详细描述需求内容"
                  />
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                    {manualInput.description.length}/2000
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>关联项目</label>
                  <select
                    value={manualInput.selectedProject}
                    onChange={(e) => setManualInput({ ...manualInput, selectedProject: e.target.value })}
                    style={{
                      width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px',
                      fontSize: '1rem', transition: 'border-color 0.3s ease'
                    }}
                  >
                    <option value="">请选择项目</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  style={{
                    background: canGenerateManual ? '#27ae60' : '#bdc3c7', color: 'white', border: 'none',
                    padding: '15px 30px', borderRadius: '8px', cursor: canGenerateManual ? 'pointer' : 'not-allowed',
                    fontSize: '1.1rem', width: '100%', marginTop: '10px'
                  }}
                  onClick={generateFromManualInput}
                  disabled={!canGenerateManual}
                >
                  开始生成
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 分隔线 */}
        {!isGenerating && !showResults && (
          <div style={{ textAlign: 'center', margin: '40px 0', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#ddd' }} />
            <span style={{ background: 'white', padding: '0 20px', color: '#666', fontSize: '1rem', position: 'relative', zIndex: 1 }}>
              或者
            </span>
          </div>
        )}

        {/* 文档上传 */}
        {!isGenerating && !showResults && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '30px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #e1e8ed'
            }}>
              <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '1.5rem' }}>上传需求文档</h2>
              <div style={{
                border: isDragOver ? '2px dashed #3498db' : '2px dashed #ddd',
                borderRadius: '8px', padding: '40px', textAlign: 'center',
                background: isDragOver ? '#f8f9fa' : 'white',
                transition: 'border-color 0.3s ease'
              }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!selectedFile ? (
                  <div>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📁</div>
                    <p style={{ color: '#666', marginBottom: '5px' }}>拖拽文件到此处或</p>
                    <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '15px' }}>
                      支持格式: PDF, DOC, DOCX, TXT, MD
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.txt,.md"
                      style={{ display: 'none' }}
                    />
                    <button style={{
                      background: '#3498db', color: 'white', border: 'none',
                      padding: '10px 20px', borderRadius: '6px', cursor: 'pointer'
                    }} onClick={() => fileInputRef.current?.click()}>
                      选择文件
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ fontSize: '2rem' }}>📄</div>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <p style={{ fontWeight: '600', margin: 0 }}>{selectedFile.name}</p>
                        <p style={{ color: '#666', fontSize: '0.9rem', margin: '5px 0 0 0' }}>{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={removeFile}>
                        ❌
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>文档标题</label>
                    <input
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      type="text"
                      style={{
                        width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px',
                        fontSize: '1rem', transition: 'border-color 0.3s ease'
                      }}
                      placeholder="文档标题"
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>关联项目</label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      style={{
                        width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px',
                        fontSize: '1rem', transition: 'border-color 0.3s ease'
                      }}
                    >
                      <option value="">请选择项目</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    style={{
                      background: documentTitle ? '#27ae60' : '#bdc3c7', color: 'white', border: 'none',
                      padding: '15px 30px', borderRadius: '8px', cursor: documentTitle ? 'pointer' : 'not-allowed',
                      fontSize: '1.1rem', width: '100%'
                    }}
                    onClick={generateFromDocument}
                    disabled={!documentTitle}
                  >
                    开始生成
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 生成进度和结果 */}
        {(isGenerating || showResults) && (
          <div style={{ margin: '40px 0' }}>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '30px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #e1e8ed', textAlign: 'center'
            }}>
              <h3 style={{ color: '#2c3e50', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {isGenerating ? 'AI 正在生成...' : '生成完成'}
                {isGenerating && (
                  <span style={{
                    display: 'inline-block', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500'
                  }}>
                    {globalOutputMode === 'stream' ? '实时流式' : '完成后显示'}
                  </span>
                )}
              </h3>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>任务 ID</span>
                  <span style={{ fontWeight: '600', color: '#2c3e50' }}>{currentTaskId || '准备中'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>当前状态</span>
                  <span style={{ fontWeight: '600', color: '#2c3e50' }}>{showResults ? '生成完成' : progressText}</span>
                </div>
              </div>

              {/* 流式内容 */}
              {streamedContent && (
                <div style={{ marginTop: '15px', border: '2px solid #e1e8ed', borderRadius: '8px', overflow: 'hidden', background: '#f8f9fa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#e9ecef', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{ fontWeight: '600', color: '#495057', fontSize: '0.95rem' }}>实时生成内容</span>
                    <span style={{ fontSize: '0.85rem', color: '#6c757d', background: 'white', padding: '4px 10px', borderRadius: '12px', border: '1px solid #dee2e6' }}>
                      {streamedContent.length} 字符
                    </span>
                  </div>
                  <div style={{
                    maxHeight: '300px', overflowY: 'auto', padding: '16px', textAlign: 'left',
                    background: 'white', fontSize: '0.9rem', lineHeight: '1.6', color: '#2c3e50',
                    whiteSpace: 'pre-wrap', wordWrap: 'break-word'
                  }} dangerouslySetInnerHTML={{ __html: formatMarkdown(streamedContent) }} />
                </div>
              )}

              {/* 评审内容 */}
              {streamedReviewContent && (
                <div style={{ marginTop: '15px', border: '2px solid #e1e8ed', borderRadius: '8px', overflow: 'hidden', background: '#f8f9fa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#e9ecef', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{ fontWeight: '600', color: '#495057', fontSize: '0.95rem' }}>AI 评审意见</span>
                    <span style={{ fontSize: '0.85rem', color: '#6c757d', background: 'white', padding: '4px 10px', borderRadius: '12px', border: '1px solid #dee2e6' }}>
                      {streamedReviewContent.length} 字符
                    </span>
                  </div>
                  <div style={{
                    maxHeight: '300px', overflowY: 'auto', padding: '16px', textAlign: 'left',
                    background: 'white', fontSize: '0.9rem', lineHeight: '1.6', color: '#2c3e50',
                    whiteSpace: 'pre-wrap', wordWrap: 'break-word'
                  }} dangerouslySetInnerHTML={{ __html: formatMarkdown(streamedReviewContent) }} />
                </div>
              )}

              {/* 最终用例 */}
              {finalTestCases && (
                <div style={{ marginTop: '15px', border: '2px solid #e1e8ed', borderRadius: '8px', overflow: 'hidden', background: '#f8f9fa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#e9ecef', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{ fontWeight: '600', color: '#495057', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      最终版测试用例
                      {isGenerating && <span style={{ fontSize: '0.85em', color: '#4CAF50', animation: 'pulse 1.5s ease-in-out infinite' }}>生成中...</span>}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#6c757d', background: 'white', padding: '4px 10px', borderRadius: '12px', border: '1px solid #dee2e6' }}>
                      {finalTestCases.length} 字符
                    </span>
                  </div>
                  <div style={{
                    maxHeight: '400px', overflowY: 'auto', padding: '16px', textAlign: 'left',
                    background: '#f0f7ff', fontSize: '0.9rem', lineHeight: '1.6', color: '#2c3e50',
                    whiteSpace: 'pre-wrap', wordWrap: 'break-word', borderLeft: '4px solid #2196F3'
                  }} dangerouslySetInnerHTML={{ __html: formatMarkdown(finalTestCases) }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', marginTop: '30px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', opacity: currentStep >= 1 ? 1 : 0.4 }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '600', color: 'white', background: currentStep >= 1 ? '#3498db' : '#ddd'
                  }}>
                    1
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>需求分析</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', opacity: currentStep >= 2 ? 1 : 0.4 }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '600', color: 'white', background: currentStep >= 2 ? '#3498db' : '#ddd'
                  }}>
                    2
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>用例生成</span>
                </div>
                {showReviewStep && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', opacity: currentStep >= 3 ? 1 : 0.4 }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '600', color: 'white', background: currentStep >= 3 ? '#3498db' : '#ddd'
                    }}>
                      3
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>用例评审</span>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', opacity: currentStep >= (showReviewStep ? 4 : 3) ? 1 : 0.4 }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '600', color: 'white', background: currentStep >= (showReviewStep ? 4 : 3) ? '#3498db' : '#ddd'
                  }}>
                    {showReviewStep ? '4' : '3'}
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>完成</span>
                </div>
              </div>

              {/* 完成后的操作按钮 */}
              {showResults && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button style={{
                    flex: 1, minWidth: '150px', padding: '12px 20px', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontWeight: '500', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#28a745', color: 'white', fontSize: '1rem'
                  }} onClick={downloadTestCases}>
                    <span>📥 下载 Excel</span>
                  </button>
                  <button style={{
                    flex: 1, minWidth: '150px', padding: '12px 20px', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontWeight: '500', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#007bff', color: 'white', fontSize: '1rem'
                  }} onClick={saveToTestCaseRecords}>
                    <span>💾 保存到测试用例</span>
                  </button>
                  <button style={{
                    flex: 1, minWidth: '150px', padding: '12px 20px', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontWeight: '500', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#6c757d', color: 'white', fontSize: '1rem'
                  }} onClick={resetGeneration}>
                    <span>📝 新生成</span>
                  </button>
                </div>
              )}

              {isGenerating && (
                <button style={{
                  background: '#e74c3c', color: 'white', border: 'none',
                  padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '20px'
                }} onClick={cancelGeneration}>
                  取消生成
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default RequirementAnalysisView;
