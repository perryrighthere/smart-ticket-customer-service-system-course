/**
 * Ticket List Page (Lesson 3)
 * Features: filtering, pagination, status badges, navigation to detail
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Tag,
  Space,
  Button,
  Select,
  Card,
  Row,
  Col,
  Typography,
  message
} from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { ticketApi } from '../api/tickets'
import type { Ticket, TicketStatus, TicketPriority } from '../types'

const { Title } = Typography
const { Option } = Select

const statusColors: Record<TicketStatus, string> = {
  open: 'blue',
  in_progress: 'orange',
  resolved: 'green',
  closed: 'default'
}

const priorityColors: Record<TicketPriority, string> = {
  low: 'default',
  medium: 'blue',
  high: 'orange',
  urgent: 'red'
}

function TicketList() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>()
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | undefined>()
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 })

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const data = await ticketApi.list({
        status: statusFilter,
        priority: priorityFilter,
        page: pagination.page,
        page_size: pagination.pageSize
      })
      setTickets(data)
    } catch (error) {
      message.error('Failed to fetch tickets')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [statusFilter, priorityFilter, pagination])

  const handleTableChange = (newPagination: any) => {
    setPagination({
      page: newPagination.current,
      pageSize: newPagination.pageSize
    })
  }

  const columns: ColumnsType<Ticket> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Ticket) => (
        <a onClick={() => navigate(`/tickets/${record.id}`)}>{text}</a>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: TicketStatus) => (
        <Tag color={statusColors[status]}>{status.replace('_', ' ').toUpperCase()}</Tag>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: TicketPriority) => (
        <Tag color={priorityColors[priority]}>{priority.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string | null) =>
        tags
          ? tags.split(',').map((tag) => (
              <Tag key={tag} style={{ marginBottom: 4 }}>
                {tag.trim()}
              </Tag>
            ))
          : null
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: Ticket) => (
        <Button type="link" onClick={() => navigate(`/tickets/${record.id}`)}>
          View
        </Button>
      )
    }
  ]

  return (
    <div>
      <Card
        style={{
          marginBottom: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none'
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              Ticket Management
            </Title>
            <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginTop: 4 }}>
              Manage and track all customer support tickets
            </div>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchTickets}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  borderColor: 'white'
                }}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/tickets/new')}
                style={{ background: 'white', color: '#667eea', borderColor: 'white' }}
              >
                New Ticket
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Select
                placeholder="Filter by status"
                style={{ width: '100%' }}
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
                size="large"
              >
                <Option value="open">Open</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="resolved">Resolved</Option>
                <Option value="closed">Closed</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12}>
              <Select
                placeholder="Filter by priority"
                style={{ width: '100%' }}
                allowClear
                value={priorityFilter}
                onChange={setPriorityFilter}
                size="large"
              >
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
                <Option value="urgent">Urgent</Option>
              </Select>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={tickets}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.pageSize,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} tickets`
            }}
            onChange={handleTableChange}
            style={{ borderRadius: 8 }}
          />
        </Space>
      </Card>
    </div>
  )
}

export default TicketList
