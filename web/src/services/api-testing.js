import api from './api';

export const getDashboardStats = () => {
  return api.get('/api-testing/dashboard/stats/');
};

export const getScheduledTasks = (params) => {
  return api.get('/api-testing/scheduled-tasks/', { params });
};

export const createScheduledTask = (data) => {
  return api.post('/api-testing/scheduled-tasks/', data);
};

export const updateScheduledTask = (id, data) => {
  return api.patch(`/api-testing/scheduled-tasks/${id}/`, data);
};

export const deleteScheduledTask = (id) => {
  return api.delete(`/api-testing/scheduled-tasks/${id}/`);
};

export const runScheduledTask = (id) => {
  return api.post(`/api-testing/scheduled-tasks/${id}/run_now/`);
};

export const getExecutionLogs = (taskId, params = {}) => {
  return api.get(`/api-testing/scheduled-tasks/${taskId}/execution_logs/`, { params });
};

export const getTestSuites = (params) => {
  return api.get('/api-testing/test-suites/', { params });
};

export const getApiRequests = (params) => {
  return api.get('/api-testing/requests/', { params });
};

export const getEnvironments = (params) => {
  return api.get('/api-testing/environments/', { params });
};

export const getApiProjects = (params) => {
  return api.get('/api-testing/projects/', { params });
};

export const getApiCollections = (params) => {
  return api.get('/api-testing/collections/', { params });
};

export const executeTestSuite = (id, data) => {
  return api.post(`/api-testing/test-suites/${id}/execute/`, data);
};

export const executeApiRequest = (id, data) => {
  return api.post(`/api-testing/api-requests/${id}/execute/`, data);
};

export const getExecutionResult = (id) => {
  return api.get(`/api-testing/executions/${id}/`);
};

export const getRequestHistory = (params) => {
  return api.get('/api-testing/histories/', { params });
};

export const deleteRequestHistory = (id) => {
  return api.delete(`/api-testing/histories/${id}/`);
};

export const batchDeleteRequestHistory = (ids) => {
  return api.post('/api-testing/histories/batch-delete/', { ids });
};

export const getUsers = (params) => {
  return api.get('/api-testing/users/', { params });
};

export const getOperationLogs = (params) => {
  return api.get('/api-testing/operation-logs/', { params });
};

export const getAIServiceConfigs = (params) => {
  return api.get('/api-testing/ai-service-configs/', { params });
};

export const createAIServiceConfig = (data) => {
  return api.post('/api-testing/ai-service-configs/', data);
};

export const updateAIServiceConfig = (id, data) => {
  return api.put(`/api-testing/ai-service-configs/${id}/`, data);
};

export const deleteAIServiceConfig = (id) => {
  return api.delete(`/api-testing/ai-service-configs/${id}/`);
};

export const testAIServiceConnection = (configId) => {
  return api.post('/api-testing/ai-service-configs/test_connection/', { config_id: configId });
};

export const searchCollections = (params) => {
  return api.get('/api-testing/collections/search', { params });
};

export const getTestSuiteDetail = (id) => {
  return api.get(`/api-testing/test-suites/${id}/`);
};

export const addRequestsToTestSuite = (suiteId, requestIds) => {
  return api.post(`/api-testing/test-suites/${suiteId}/add-requests/`, { request_ids: requestIds });
};

export const updateTestSuiteRequest = (id, data) => {
  return api.put(`/api-testing/test-suite-requests/${id}/`, data);
};

export const deleteTestSuiteRequest = (id) => {
  return api.delete(`/api-testing/test-suite-requests/${id}/`);
};

export const pauseScheduledTask = (id) => {
  return api.post(`/api-testing/scheduled-tasks/${id}/pause/`);
};

export const activateScheduledTask = (id) => {
  return api.post(`/api-testing/scheduled-tasks/${id}/activate/`);
};

export const activateEnvironment = (id) => {
  return api.post(`/api-testing/environments/${id}/activate/`);
};

export const generateAllureReport = (executionId) => {
  return api.post(`/api-testing/test-executions/${executionId}/generate-allure-report/`);
};

export const getTestExecutions = (params) => {
  return api.get('/api-testing/test-executions/', { params });
};

export const getRequestDetail = (id) => {
  return api.get(`/api-testing/requests/${id}/`);
};

export const createRequest = (data) => {
  return api.post('/api-testing/requests/', data);
};

export const updateRequest = (id, data) => {
  return api.put(`/api-testing/requests/${id}/`, data);
};

export const deleteRequest = (id) => {
  return api.delete(`/api-testing/requests/${id}/`);
};

export const executeRequest = (id, data) => {
  return api.post(`/api-testing/requests/${id}/execute/`, data);
};

export const createCollection = (data) => {
  return api.post('/api-testing/collections/', data);
};

export const updateCollection = (id, data) => {
  return api.put(`/api-testing/collections/${id}/`, data);
};

export const deleteCollection = (id) => {
  return api.delete(`/api-testing/collections/${id}/`);
};

export const createProject = (data) => {
  return api.post('/api-testing/projects/', data);
};

export const updateProject = (id, data) => {
  return api.put(`/api-testing/projects/${id}/`, data);
};

export const deleteProject = (id) => {
  return api.delete(`/api-testing/projects/${id}/`);
};

export const createEnvironment = (data) => {
  return api.post('/api-testing/environments/', data);
};

export const updateEnvironment = (id, data) => {
  return api.put(`/api-testing/environments/${id}/`, data);
};

export const deleteEnvironment = (id) => {
  return api.delete(`/api-testing/environments/${id}/`);
};

export const createTestSuite = (data) => {
  return api.post('/api-testing/test-suites/', data);
};

export const updateTestSuite = (id, data) => {
  return api.put(`/api-testing/test-suites/${id}/`, data);
};

export const deleteTestSuite = (id) => {
  return api.delete(`/api-testing/test-suites/${id}/`);
};

export const duplicateTestSuite = (id, data) => {
  return api.post('/api-testing/test-suites/', data);
};

export const retryRequest = (historyId, environmentId) => {
  return api.post(`/api-testing/histories/${historyId}/retry/`, { environment_id: environmentId });
};