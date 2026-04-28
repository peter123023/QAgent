import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const GuestRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, accessToken } = useSelector(state => state.user);

  // 检查是否已认证
  const isAuth = isAuthenticated || !!accessToken;

  if (isAuth) {
    // 已登录用户访问登录/注册页，重定向到首页
    const from = location.state?.from?.pathname || '/home';
    return <Navigate to={from} replace />;
  }

  return children;
};

export default GuestRoute;
