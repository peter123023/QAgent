import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// 异步action
const fetchUser = createAsyncThunk('user/fetchUser', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/users/me/');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const fetchProfile = createAsyncThunk('user/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/profile/');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const refreshAccessToken = createAsyncThunk('user/refreshAccessToken', async (_, { getState, rejectWithValue, dispatch }) => {
  try {
    const { user } = getState();
    const response = await api.post('/auth/token/refresh/', {
      refresh: user.refreshToken
    });
    return response.data;
  } catch (error) {
    // 刷新失败，清除所有认证信息
    dispatch(logout());
    return rejectWithValue(error.response?.data || error.message);
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState: (() => {
    const accessToken = localStorage.getItem('access_token') || '';
    const refreshToken = localStorage.getItem('refresh_token') || '';
    const tokenExpiresAt = parseInt(localStorage.getItem('token_expires_at') || '0');
    const userStr = localStorage.getItem('user');
    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      user = null;
    }

    // 检查token是否过期
    const isTokenValid = accessToken && tokenExpiresAt > Date.now();

    return {
      user,
      accessToken: isTokenValid ? accessToken : '',
      refreshToken: isTokenValid ? refreshToken : '',
      tokenExpiresAt: isTokenValid ? tokenExpiresAt : 0,
      isAuthenticated: isTokenValid,
      refreshTimer: null
    };
  })(),
  reducers: {
    login: (state, action) => {
      const { access, refresh, user } = action.payload;
      state.accessToken = access;
      state.refreshToken = refresh;
      state.user = user;
      
      // 计算过期时间（当前时间 + 30分钟）
      const expiresAt = Date.now() + 30 * 60 * 1000;
      state.tokenExpiresAt = expiresAt;
      
      // 持久化存储
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('token_expires_at', expiresAt.toString());
      localStorage.setItem('user', JSON.stringify(user));
      
      state.isAuthenticated = true;
    },
    logout: (state) => {
      // 清除所有认证信息
      state.accessToken = '';
      state.refreshToken = '';
      state.user = null;
      state.tokenExpiresAt = 0;
      state.isAuthenticated = false;
      
      // 清除localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires_at');
      localStorage.removeItem('user');
      
      // 停止自动刷新定时器
      if (state.refreshTimer) {
        clearInterval(state.refreshTimer);
        state.refreshTimer = null;
      }
    },
    startAutoRefresh: (state) => {
      // 清除现有定时器
      if (state.refreshTimer) {
        clearInterval(state.refreshTimer);
      }
      
      // 每2分钟检查一次token是否需要刷新
      state.refreshTimer = setInterval(async () => {
        if (state.refreshToken && state.accessToken) {
          const now = Date.now();
          const timeLeft = state.tokenExpiresAt - now;
          if (timeLeft < 5 * 60 * 1000) { // 5分钟内过期
            // 这里需要dispatch refreshAccessToken action
            // 但由于在reducer中不能dispatch，我们需要在组件中处理
          }
        }
      }, 2 * 60 * 1000); // 2分钟检查一次
    },
    stopAutoRefresh: (state) => {
      if (state.refreshTimer) {
        clearInterval(state.refreshTimer);
        state.refreshTimer = null;
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (state) => {
        // 获取用户信息失败，清除认证信息
        state.accessToken = '';
        state.refreshToken = '';
        state.user = null;
        state.tokenExpiresAt = 0;
        state.isAuthenticated = false;
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expires_at');
        localStorage.removeItem('user');
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state) => {
        // 获取用户信息失败，清除认证信息
        state.accessToken = '';
        state.refreshToken = '';
        state.user = null;
        state.tokenExpiresAt = 0;
        state.isAuthenticated = false;
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expires_at');
        localStorage.removeItem('user');
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        const { access, refresh } = action.payload;
        state.accessToken = access;
        
        // 计算过期时间（当前时间 + 30分钟）
        const expiresAt = Date.now() + 30 * 60 * 1000;
        state.tokenExpiresAt = expiresAt;
        
        // 如果返回了新的refresh token
        if (refresh) {
          state.refreshToken = refresh;
          localStorage.setItem('refresh_token', refresh);
        }
        
        // 持久化存储
        localStorage.setItem('access_token', access);
        localStorage.setItem('token_expires_at', expiresAt.toString());
      });
  }
});

export const { login, logout, startAutoRefresh, stopAutoRefresh, setUser } = userSlice.actions;
export { fetchUser, fetchProfile, refreshAccessToken };
export default userSlice.reducer;