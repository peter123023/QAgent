import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert, Space, Card, Typography } from 'antd';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from '../../locales';
import { login } from '../../store/userSlice';
import api from '../../services/api';

const { Title, Paragraph } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login/', values);
      dispatch(login(response.data));
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3}>QAgent</Title>
          <Paragraph>{t('auth.login')}</Paragraph>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            style={{ marginBottom: '16px' }}
            showIcon
          />
        )}

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: t('auth.username') }]}
          >
            <Input placeholder={t('auth.username')} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t('auth.password') }]}
          >
            <Input.Password placeholder={t('auth.password')} />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>{t('auth.rememberMe')}</Checkbox>
            </Form.Item>

            <Link to="#" style={{ float: 'right' }}>
              {t('auth.forgotPassword')}
            </Link>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: '100%' }}
              loading={loading}
            >
              {t('auth.login')}
            </Button>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <span>{t('auth.register')}?</span>
              <Link to="/register">{t('auth.register')}</Link>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
