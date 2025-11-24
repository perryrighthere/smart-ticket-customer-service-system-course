import { Layout, Menu, Dropdown, Avatar, Space } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import type { CSSProperties, PropsWithChildren } from 'react'
import { HomeOutlined, FileTextOutlined, RocketOutlined, BookOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { authApi } from '../api/auth'

const { Header, Content, Footer } = Layout

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 32,
  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  justifyContent: 'space-between',
  paddingRight: 24
}

const logoStyle: CSSProperties = {
  color: '#fff',
  fontSize: 20,
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  letterSpacing: '0.5px'
}

const contentStyle: CSSProperties = {
  padding: 24,
  minHeight: 'calc(100vh - 128px)',
  background: '#f0f2f5'
}

const footerStyle: CSSProperties = {
  textAlign: 'center',
  background: '#001529',
  color: 'rgba(255, 255, 255, 0.65)'
}

function AppLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const location = useLocation()
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authApi.getMe()
        setUserEmail(user.email)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home'
    },
    {
      key: '/dashboard',
      icon: <FileTextOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/tickets',
      icon: <FileTextOutlined />,
      label: 'Tickets'
    },
    {
      key: '/kb',
      icon: <BookOutlined />,
      label: 'Knowledge Base'
    }
  ]

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flex: 1 }}>
          <div style={logoStyle}>
            <RocketOutlined style={{ fontSize: 24 }} />
            <span>AstraTickets</span>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              borderBottom: 'none'
            }}
            theme="dark"
          />
        </div>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer', color: '#fff' }}>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
            <span>{userEmail || 'User'}</span>
          </Space>
        </Dropdown>
      </Header>
      <Content style={contentStyle}>{children}</Content>
      <Footer style={footerStyle}>
        AstraTickets © {new Date().getFullYear()} | Enterprise AI-Powered Customer Service System
      </Footer>
    </Layout>
  )
}

export default AppLayout
