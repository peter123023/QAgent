import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api', // 根据实际情况修改
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Axios 基础配置
api.defaults.xsrfCookieName = 'csrftoken';
api.defaults.xsrfHeaderName = 'X-CSRFToken';
api.defaults.withCredentials = true; // 允许跨域带 Cookie

// 延迟获取 store，避免循环依赖
let store;
export const injectStore = (_store) => {
  store = _store;
};

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    if (store) {
      const { accessToken } = store.getState().user;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 处理401错误（token过期）
    if (error.response?.status === 401 && !originalRequest._retry && store) {
      originalRequest._retry = true;

      try {
        // 尝试刷新token
        const { user } = store.getState();
        if (user.refreshToken) {
          const response = await axios.post('/api/auth/token/refresh/', {
            refresh: user.refreshToken
          });

          const { access, refresh } = response.data;

          // 更新store中的token - 使用字符串引用以避免循环依赖
          store.dispatch({
            type: 'user/login',
            payload: {
              access,
              refresh,
              user: user.user
            }
          });

          // 更新请求头
          originalRequest.headers.Authorization = `Bearer ${access}`;

          return api(originalRequest);
        } else {
          // 没有refresh token，跳转到登录页 - 使用字符串引用以避免循环依赖
          store.dispatch({ type: 'user/logout' });
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // 刷新token失败，跳转到登录页 - 使用字符串引用以避免循环依赖
        store.dispatch({ type: 'user/logout' });
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;