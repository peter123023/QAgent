import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    language: localStorage.getItem('app-lang') || 'zh-cn'
  },
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      // 持久化
      localStorage.setItem('app-lang', action.payload);
      // 设置 HTML 标签 lang 属性，利于 SEO 和浏览器识别
      document.querySelector('html')?.setAttribute('lang', action.payload);
    }
  }
});

export const { setLanguage } = appSlice.actions;
export default appSlice.reducer;