import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

const { Title } = Typography;

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            if (isRegister) {
                await authApi.register(values.email, values.password, values.name);
                message.success('Registration successful! Please log in.');
                setIsRegister(false);
                form.resetFields();
            } else {
                const { access_token } = await authApi.login(values.email, values.password);
                localStorage.setItem('token', access_token);
                message.success('Login successful');
                navigate('/');
            }
        } catch (error: any) {
            const msg = error.response?.data?.detail || (isRegister ? 'Registration failed.' : 'Login failed.');
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        form.resetFields();
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#f0f2f5'
        }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3}>AstraTickets</Title>
                    <p>{isRegister ? 'Create a new account' : 'Sign in to your account'}</p>
                </div>
                <Form
                    form={form}
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    {isRegister && (
                        <Form.Item
                            name="name"
                            rules={[{ required: true, message: 'Please input your Name!' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Full Name" />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your Email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            {isRegister ? 'Register' : 'Log in'}
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Button type="link" onClick={toggleMode}>
                            {isRegister ? 'Already have an account? Log in' : 'Register now'}
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
