import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import type { CSSProperties, PropsWithChildren } from 'react'
import { HomeOutlined, FileTextOutlined, RocketOutlined } from '@ant-design/icons'

const { Header, Content, Footer } = Layout

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 32,
  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
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

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/tickets',
      icon: <FileTextOutlined />,
      label: 'Tickets'
    }
  ]

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={headerStyle}>
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
      </Header>
      <Content style={contentStyle}>{children}</Content>
      <Footer style={footerStyle}>
        AstraTickets © {new Date().getFullYear()} | Enterprise AI-Powered Customer Service System
      </Footer>
    </Layout>
  )
}

export default AppLayout
