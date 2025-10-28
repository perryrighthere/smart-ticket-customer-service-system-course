import { Layout, Typography, Space, List } from 'antd'
import AppLayout from './components/AppLayout'
import HomePage from './pages/Home'

const { Title, Paragraph } = Typography

const milestones = [
  'FastAPI + SQLite backend skeleton',
  'React + Ant Design console scaffold',
  'Chroma-ready vector store placeholder',
  'Docker Compose for local integration'
]

function App() {
  return (
    <AppLayout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography>
          <Title level={2}>AstraTickets · Lesson 1 Demo</Title>
          <Paragraph>
            This lightweight UI highlights the tech stack and architecture agreed for the course. Subsequent
            lessons will flesh out real ticket workflows and AI integrations.
          </Paragraph>
        </Typography>
        <HomePage />
        <section>
          <Title level={4}>Milestones</Title>
          <List
            dataSource={milestones}
            bordered
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        </section>
      </Space>
    </AppLayout>
  )
}

export default App
