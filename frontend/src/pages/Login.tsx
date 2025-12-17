import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Row, Col, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, clearError } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../redux/store';

const { Title } = Typography;

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: any) => state.user);
  const [activeTab, setActiveTab] = useState('login');

  // 处理登录表单提交
  const handleLogin = (values: any) => {
    console.log('Login form submitted with values:', values);
    dispatch(login(values));
  };

  // 处理注册表单提交
  const handleRegister = (values: any) => {
    dispatch(register(values));
  };

  // 如果已认证，跳转到首页
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // 显示错误信息
  React.useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // 登录表单
  const loginForm = (
    <Form
      name="login"
      onFinish={handleLogin}
      layout="vertical"
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: '请输入用户名!' }]}
        label="用户名"
      >
        <Input prefix={<UserOutlined />} placeholder="用户名" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码!' }, { min: 6, message: '密码长度必须至少为6个字符' }]}
        label="密码"
      >
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          登录
        </Button>
      </Form.Item>
    </Form>
  );

  // 注册表单
  const registerForm = (
    <Form
      name="register"
      onFinish={handleRegister}
      layout="vertical"
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: '请输入用户名!' }]}
        label="用户名"
      >
        <Input prefix={<UserOutlined />} placeholder="用户名" />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[{ required: true, message: '请输入邮箱!', type: 'email' }]}
        label="邮箱"
      >
        <Input prefix={<MailOutlined />} placeholder="邮箱" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码!' }, { min: 6, message: '密码长度必须至少为6个字符' }]}
        label="密码"
      >
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>

      <Form.Item
        name="name"
        rules={[{ required: true, message: '请输入姓名!' }]}
        label="姓名"
      >
        <Input placeholder="姓名" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="手机号"
      >
        <Input placeholder="手机号" />
      </Form.Item>

      <Form.Item
        name="address"
        label="地址"
      >
        <Input placeholder="地址" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          注册
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="login-page">
      <Row justify="center" align="middle" style={{ minHeight: '70vh' }}>
        <Col xs={24} sm={16} md={12} lg={8}>
          <Card title={<Title level={3} style={{ margin: 0 }}>用户登录</Title>}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'login',
                  label: '登录',
                  children: loginForm,
                },
                {
                  key: 'register',
                  label: '注册',
                  children: registerForm,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;