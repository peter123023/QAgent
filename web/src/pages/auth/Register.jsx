import React, { useState } from 'react';
import { Form, Input, Button, Alert, Space, Card, Typography } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../locales';
import api from '../../services/api';

const { Title, Paragraph } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/register/', values);
      setSuccess(t('auth.registerSuccess'));
      // 注册成功后跳转到登录页
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.registerFailed'));
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
          <Title level={3}>TestHub</Title>
          <Paragraph>{t('auth.register')}</Paragraph>
        </div>
        
        {error && (
          <Alert 
            message={error} 
            type="error" 
            style={{ marginBottom: '16px' }} 
            showIcon 
          />
        )}
        
        {success && (
          <Alert 
            message={success} 
            type="success" 
            style={{ marginBottom: '16px' }} 
            showIcon 
          />
        )}
        
        <Form
          name="register"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: t('auth.username') }]}
          >
            <Input placeholder={t('auth.username')} />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('auth.email') },
              { type: 'email', message: 'Please input valid email!' }
            ]}
          >
            <Input placeholder={t('auth.email')} />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: t('auth.password') }]}
          >
            <Input.Password placeholder={t('auth.password')} />
          </Form.Item>
          
          <Form.Item
            name="password_confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: t('auth.confirmPassword') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder={t('auth.confirmPassword')} />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%' }}
              loading={loading}
            >
              {t('auth.register')}
            </Button>
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <span>{t('auth.login')}?</span>
              <Link to="/login">{t('auth.login')}</Link>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;