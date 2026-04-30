import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import zhCN from './lang/zh-cn';
import en from './lang/en';

// 简单直接的翻译系统
const translations = {
  'zh-cn': zhCN,
  'en': en
};

// 当前语言状态管理
let currentLang = localStorage.getItem('app-lang') || 'zh-cn';
let listeners = [];

function notifyListeners() {
  listeners.forEach(listener => listener(currentLang));
}

export function t(key) {
  const keys = key.split('.');
  let result = translations[currentLang];
  for (const k of keys) {
    result = result?.[k];
  }
  return result || key;
}

export function useTranslation() {
  const [lang, setLang] = useState(currentLang);

  useEffect(() => {
    const listener = (newLang) => setLang(newLang);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const changeLanguage = useCallback((newLang) => {
    currentLang = newLang;
    notifyListeners();
  }, []);

  return {
    t,
    i18n: {
      language: lang,
      changeLanguage
    }
  };
}

export default { t, useTranslation };
