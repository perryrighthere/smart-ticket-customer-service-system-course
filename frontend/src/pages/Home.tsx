import { Card, Col, Row, Statistic, Typography, Button, Space, Spin } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  FileTextOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  ApiOutlined,
  CloudOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { ticketApi } from '../api/tickets'

const { Title, Paragraph } = Typography

interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
}

function HomePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // 获取所有工单数据
      const tickets = await ticketApi.list({})

      // 计算统计数据
      const newStats: TicketStats = {
        total: tickets.length,
        open: tickets.filter((t) => t.status === 'open').length,
        inProgress: tickets.filter((t) => t.status === 'in_progress').length,
        resolved: tickets.filter((t) => t.status === 'resolved').length
      }

      setStats(newStats)
    } catch (error) {
      console.error('Failed to fetch ticket stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <RocketOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      title: 'High Performance',
      description: 'FastAPI backend with async support for lightning-fast response times'
    },
    {
      icon: <ApiOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      title: 'RESTful API',
      description: 'Well-designed API endpoints with automatic documentation and validation'
    },
    {
      icon: <CloudOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      title: 'Vector Database',
      description: 'Chroma integration ready for AI-powered knowledge base retrieval'
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
      title: 'Real-time Updates',
      description: 'React frontend with instant UI updates and smooth interactions'
    }
  ]

  return (
    <div>
      <Card
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 24,
          border: 'none'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2} style={{ color: 'white', marginBottom: 8 }}>
              AstraTickets
            </Title>
            <Title level={4} style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 'normal' }}>
              Enterprise AI-Powered Customer Service System
            </Title>
          </div>
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16, marginBottom: 24 }}>
            Streamline your customer support workflow with intelligent ticket management,
            AI-assisted responses, and comprehensive analytics.
          </Paragraph>
          <Space size="large">
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              size="large"
              onClick={() => navigate('/tickets')}
              style={{ background: 'white', color: '#667eea', borderColor: 'white', height: 48 }}
            >
              View All Tickets
            </Button>
            <Button
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/tickets/new')}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                borderColor: 'white',
                height: 48
              }}
            >
              Create New Ticket
            </Button>
          </Space>
        </Space>
      </Card>

      <Spin spinning={loading}>
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Tickets"
                value={stats.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Open Tickets"
                value={stats.open}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="In Progress"
                value={stats.inProgress}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Resolved"
                value={stats.resolved}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      <Row gutter={[24, 24]}>
        {features.map((feature) => (
          <Col xs={24} sm={12} lg={6} key={feature.title}>
            <Card
              hoverable
              style={{ height: '100%', textAlign: 'center' }}
              bodyStyle={{ padding: 24 }}
            >
              <div style={{ marginBottom: 16 }}>{feature.icon}</div>
              <Title level={5} style={{ marginBottom: 8 }}>
                {feature.title}
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 13 }}>
                {feature.description}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default HomePage
