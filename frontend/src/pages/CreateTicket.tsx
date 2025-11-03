/**
 * Create Ticket Page (Lesson 3)
 * Form to create a new ticket with user selection
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Select, Button, Card, message, Space, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { ticketApi } from '../api/tickets'
import { userApi } from '../api/users'
import type { TicketCreate, User } from '../types'

const { TextArea } = Input
const { Option } = Select
const { Title } = Typography

function CreateTicket() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const data = await userApi.list()
      setUsers(data)
    } catch (error) {
      message.error('Failed to load users')
      console.error(error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSubmit = async (values: TicketCreate) => {
    setLoading(true)
    try {
      const ticket = await ticketApi.create(values)
      message.success('Ticket created successfully')
      navigate(`/tickets/${ticket.id}`)
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to create ticket'
      message.error(errorMsg)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Card
        style={{
          marginBottom: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none'
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/tickets')}
            type="text"
            style={{ color: 'white', paddingLeft: 0 }}
          >
            Back to Tickets
          </Button>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            Create New Ticket
          </Title>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Fill in the details to create a new support ticket
          </div>
        </Space>
      </Card>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: 'open',
              priority: 'medium'
            }}
          >
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: 'Please enter ticket title' }]}
            >
              <Input placeholder="Brief description of the issue" />
            </Form.Item>

            <Form.Item
              label="Content"
              name="content"
              rules={[{ required: true, message: 'Please enter ticket content' }]}
            >
              <TextArea rows={6} placeholder="Detailed description of the issue" />
            </Form.Item>

            <Form.Item
              label="Requester"
              name="requester_id"
              rules={[{ required: true, message: 'Please select a requester' }]}
            >
              <Select placeholder="Select the user who submitted this ticket" loading={loadingUsers}>
                {users.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.name || user.email} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Status" name="status">
              <Select>
                <Option value="open">Open</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="resolved">Resolved</Option>
                <Option value="closed">Closed</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Priority" name="priority">
              <Select>
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
                <Option value="urgent">Urgent</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Tags"
              name="tags"
              extra="Comma-separated tags (e.g., login,auth,bug)"
            >
              <Input placeholder="tag1,tag2,tag3" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Create Ticket
                </Button>
                <Button onClick={() => navigate('/tickets')}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  )
}

export default CreateTicket
