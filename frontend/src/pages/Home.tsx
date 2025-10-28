import { Card, Col, Row, Timeline } from 'antd'

const stackItems = [
  { title: 'Backend', description: 'FastAPI + SQLAlchemy + SQLite for Lesson 1 prototypes.' },
  { title: 'Frontend', description: 'React + Vite + Ant Design with TypeScript.' },
  { title: 'Vector Store', description: 'Chroma placeholder; local embeddings arrive in Lesson 4.' },
  { title: 'AI Layer', description: 'LLM providers abstracted via env configs (OpenAI / Qwen / DeepSeek).' }
]

function HomePage() {
  return (
    <Row gutter={[16, 16]}>
      {stackItems.map((item) => (
        <Col xs={24} md={12} key={item.title}>
          <Card title={item.title}>{item.description}</Card>
        </Col>
      ))}
      <Col span={24}>
        <Card title="Lesson Roadmap">
          <Timeline
            items={[
              { color: 'green', children: 'Lesson 1 · Bootstrap & architecture' },
              { color: 'blue', children: 'Lesson 2 · CRUD + ORM' },
              { color: 'blue', children: 'Lesson 3 · React ticket console' }
            ]}
          />
        </Card>
      </Col>
    </Row>
  )
}

export default HomePage
