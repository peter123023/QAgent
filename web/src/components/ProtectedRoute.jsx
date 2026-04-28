import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, accessToken } = useSelector(state => state.user);

  // 检查是否已认证
  const isAuth = isAuthenticated || !!accessToken;

  if (!isAuth) {
    // 重定向到登录页，保存当前路径以便登录后跳转回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
