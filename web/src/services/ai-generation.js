import api from './api';

// 获取AI生成仪表盘统计数据
export const getAIGenerationDashboardStats = async () => {
  try {
    const response = await api.get('/requirement-analysis/dashboard-stats/');
    return response;
  } catch (error) {
    console.error('Failed to get AI generation dashboard stats:', error);
    throw error;
  }
};

// 测试用例生成任务相关
export const getTestCaseGenerationTasks = async (params = {}) => {
  try {
    const response = await api.get('/requirement-analysis/testcase-generation/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get test case generation tasks:', error);
    throw error;
  }
};

export const deleteTestCaseGenerationTask = async (taskId) => {
  try {
    const response = await api.delete(`/requirement-analysis/testcase-generation/${taskId}/`);
    return response;
  } catch (error) {
    console.error('Failed to delete test case generation task:', error);
    throw error;
  }
};

export const batchAdoptTestCases = async (taskId) => {
  try {
    const response = await api.post(`/requirement-analysis/testcase-generation/${taskId}/batch_adopt/`);
    return response;
  } catch (error) {
    console.error('Failed to batch adopt test cases:', error);
    throw error;
  }
};

export const batchDiscardTestCases = async (taskId) => {
  try {
    const response = await api.post(`/requirement-analysis/testcase-generation/${taskId}/batch_discard/`);
    return response;
  } catch (error) {
    console.error('Failed to batch discard test cases:', error);
    throw error;
  }
};

export const getProjects = async (params = {}) => {
  try {
    const response = await api.get('/projects/list/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get projects:', error);
    throw error;
  }
};

export const getVersions = async (params = {}) => {
  try {
    const response = await api.get('/versions/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get versions:', error);
    throw error;
  }
};

export const getProjectVersions = async (projectId) => {
  try {
    const response = await api.get(`/versions/projects/${projectId}/versions/`);
    return response;
  } catch (error) {
    console.error('Failed to get project versions:', error);
    throw error;
  }
};

export const createTestCase = async (data) => {
  try {
    const response = await api.post('/testcases/', data);
    return response;
  } catch (error) {
    console.error('Failed to create test case:', error);
    throw error;
  }
};

// 评审相关
export const getTestCaseReviews = async (params = {}) => {
  try {
    const response = await api.get('/reviews/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get test case reviews:', error);
    throw error;
  }
};

// 测试套件相关
export const getTestSuites = async (params = {}) => {
  try {
    const response = await api.get('/testsuites/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get test suites:', error);
    throw error;
  }
};

// 测试执行相关
export const getTestExecutions = async (params = {}) => {
  try {
    const response = await api.get('/executions/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get test executions:', error);
    throw error;
  }
};

// 测试报告相关
export const getTestReports = async (params = {}) => {
  try {
    const response = await api.get('/reports/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get test reports:', error);
    throw error;
  }
};

// 需求文档相关
export const uploadRequirementDocument = async (formData) => {
  try {
    const response = await api.post('/requirement-analysis/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    console.error('Failed to upload requirement document:', error);
    throw error;
  }
};

export const analyzeRequirement = async (data) => {
  try {
    const response = await api.post('/requirement-analysis/analyze/', data);
    return response;
  } catch (error) {
    console.error('Failed to analyze requirement:', error);
    throw error;
  }
};

export const generateTestCases = async (data) => {
  try {
    const response = await api.post('/requirement-analysis/generate/', data);
    return response;
  } catch (error) {
    console.error('Failed to generate test cases:', error);
    throw error;
  }
};

export const getAnalysisHistory = async (params = {}) => {
  try {
    const response = await api.get('/requirement-analysis/history/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get analysis history:', error);
    throw error;
  }
};

export const getAnalysisDetail = async (id) => {
  try {
    const response = await api.get(`/requirement-analysis/history/${id}/`);
    return response;
  } catch (error) {
    console.error('Failed to get analysis detail:', error);
    throw error;
  }
};

// AI生成的测试用例相关
export const getGeneratedTestCases = async (params = {}) => {
  try {
    const response = await api.get('/requirement-analysis/generated-cases/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get generated test cases:', error);
    throw error;
  }
};

// 用例评审相关
export const getReviewCases = async (params = {}) => {
  try {
    const response = await api.get('/requirement-analysis/review-cases/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get review cases:', error);
    throw error;
  }
};

export const submitReview = async (data) => {
  try {
    const response = await api.post('/requirement-analysis/submit-review/', data);
    return response;
  } catch (error) {
    console.error('Failed to submit review:', error);
    throw error;
  }
};

// 评审模板相关
export const getReviewTemplates = async (params = {}) => {
  try {
    const response = await api.get('/requirement-analysis/review-templates/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get review templates:', error);
    throw error;
  }
};

// 版本管理相关
export const getCaseVersions = async (caseId, params = {}) => {
  try {
    const response = await api.get(`/requirement-analysis/case-versions/${caseId}/`, { params });
    return response;
  } catch (error) {
    console.error('Failed to get case versions:', error);
    throw error;
  }
};

// AI模型配置
export const getAIModelConfigs = async (params = {}) => {
  try {
    const response = await api.get('/requirement-analysis/ai-models/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get AI model configs:', error);
    throw error;
  }
};

export const createAIModelConfig = async (data) => {
  try {
    const response = await api.post('/requirement-analysis/ai-models/', data);
    return response;
  } catch (error) {
    console.error('Failed to create AI model config:', error);
    throw error;
  }
};

export const updateAIModelConfig = async (id, data) => {
  try {
    const response = await api.put(`/requirement-analysis/ai-models/${id}/`, data);
    return response;
  } catch (error) {
    console.error('Failed to update AI model config:', error);
    throw error;
  }
};

export const deleteAIModelConfig = async (id) => {
  try {
    const response = await api.delete(`/requirement-analysis/ai-models/${id}/`);
    return response;
  } catch (error) {
    console.error('Failed to delete AI model config:', error);
    throw error;
  }
};

export const testAIModelConnection = async (id) => {
  try {
    const response = await api.post(`/requirement-analysis/ai-models/${id}/test_connection/`);
    return response;
  } catch (error) {
    console.error('Failed to test AI model connection:', error);
    throw error;
  }
};

// 提示词配置
export const getPromptConfigs = async (params = {}) => {
  try {
    const response = await api.get('/requirement-analysis/prompts/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get prompt configs:', error);
    throw error;
  }
};

export const createPromptConfig = async (data) => {
  try {
    const response = await api.post('/requirement-analysis/prompts/', data);
    return response;
  } catch (error) {
    console.error('Failed to create prompt config:', error);
    throw error;
  }
};

export const updatePromptConfig = async (id, data) => {
  try {
    const response = await api.patch(`/requirement-analysis/prompts/${id}/`, data);
    return response;
  } catch (error) {
    console.error('Failed to update prompt config:', error);
    throw error;
  }
};

export const deletePromptConfig = async (id) => {
  try {
    const response = await api.delete(`/requirement-analysis/prompts/${id}/`);
    return response;
  } catch (error) {
    console.error('Failed to delete prompt config:', error);
    throw error;
  }
};

export const loadDefaultPrompts = async () => {
  try {
    const response = await api.get('/requirement-analysis/prompts/load_defaults/');
    return response;
  } catch (error) {
    console.error('Failed to load default prompts:', error);
    throw error;
  }
};

// 生成配置
export const getGenerationConfigs = async (params = {}) => {
  try {
    const response = await api.get('/requirement-analysis/generation-config/', { params });
    return response;
  } catch (error) {
    console.error('Failed to get generation configs:', error);
    throw error;
  }
};

export const createGenerationConfig = async (data) => {
  try {
    const response = await api.post('/requirement-analysis/generation-config/', data);
    return response;
  } catch (error) {
    console.error('Failed to create generation config:', error);
    throw error;
  }
};

export const updateGenerationConfig = async (id, data) => {
  try {
    const response = await api.patch(`/requirement-analysis/generation-config/${id}/`, data);
    return response;
  } catch (error) {
    console.error('Failed to update generation config:', error);
    throw error;
  }
};

export const deleteGenerationConfig = async (id) => {
  try {
    const response = await api.delete(`/requirement-analysis/generation-config/${id}/`);
    return response;
  } catch (error) {
    console.error('Failed to delete generation config:', error);
    throw error;
  }
};

export const enableGenerationConfig = async (id) => {
  try {
    const response = await api.post(`/requirement-analysis/generation-config/${id}/enable/`);
    return response;
  } catch (error) {
    console.error('Failed to enable generation config:', error);
    throw error;
  }
};

// 用例模板（版本）
export const getCaseTemplates = async (params = {}) => {
  const response = await api.get('/requirement-analysis/case-templates/', { params });
  return response;
};

export const createCaseTemplate = async (data) => {
  const response = await api.post('/requirement-analysis/case-templates/', data);
  return response;
};

export const updateCaseTemplate = async (id, data) => {
  const response = await api.patch(`/requirement-analysis/case-templates/${id}/`, data);
  return response;
};

export const getCaseTemplateDiff = async (sourceId, targetId) => {
  const response = await api.get('/requirement-analysis/case-templates/diff/', {
    params: { source_id: sourceId, target_id: targetId }
  });
  return response;
};

// AI用例编写配置
export const getWriterConfigs = async (params = {}) => {
  const response = await api.get('/requirement-analysis/writer-config/', { params });
  return response;
};

export const createWriterConfig = async (data) => {
  const response = await api.post('/requirement-analysis/writer-config/', data);
  return response;
};

export const updateWriterConfig = async (id, data) => {
  const response = await api.patch(`/requirement-analysis/writer-config/${id}/`, data);
  return response;
};

export const enableWriterConfig = async (id) => {
  const response = await api.post(`/requirement-analysis/writer-config/${id}/enable/`);
  return response;
};

export const testWriterGeneration = async (id, data) => {
  const response = await api.post(`/requirement-analysis/writer-config/${id}/test_generation/`, data);
  return response;
};

// AI用例评审配置
export const getReviewerConfigs = async (params = {}) => {
  const response = await api.get('/requirement-analysis/reviewer-config/', { params });
  return response;
};

export const createReviewerConfig = async (data) => {
  const response = await api.post('/requirement-analysis/reviewer-config/', data);
  return response;
};

export const updateReviewerConfig = async (id, data) => {
  const response = await api.patch(`/requirement-analysis/reviewer-config/${id}/`, data);
  return response;
};

export const enableReviewerConfig = async (id) => {
  const response = await api.post(`/requirement-analysis/reviewer-config/${id}/enable/`);
  return response;
};

export const getBestReviewerPrompt = async () => {
  const response = await api.get('/requirement-analysis/reviewer-config/best_prompt/');
  return response;
};

export const simulateReviewer = async (id, formData) => {
  const response = await api.post(
    `/requirement-analysis/reviewer-config/${id}/simulate_review/`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response;
};
