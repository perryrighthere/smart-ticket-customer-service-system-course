import { Layout } from 'antd'
import type { CSSProperties, PropsWithChildren } from 'react'

const { Header, Content, Footer } = Layout

const headerStyle: CSSProperties = {
  color: '#fff',
  fontSize: 18
}

const contentStyle: CSSProperties = {
  padding: 24,
  minHeight: 'calc(100vh - 128px)'
}

const footerStyle: CSSProperties = {
  textAlign: 'center'
}

function AppLayout({ children }: PropsWithChildren) {
  return (
    <Layout>
      <Header style={headerStyle}>AstraTickets Console</Header>
      <Content style={contentStyle}>{children}</Content>
      <Footer style={footerStyle}>Lesson 1 · Project bootstrap</Footer>
    </Layout>
  )
}

export default AppLayout
