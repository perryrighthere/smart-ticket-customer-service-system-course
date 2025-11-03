/**
 * Ticket Detail Page (Lesson 3)
 * Features: view ticket, status update, add/view replies
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Typography,
  message,
  List,
  Form,
  Input,
  Select,
  Modal,
  Row,
  Col
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined
} from '@ant-design/icons'
import { ticketApi } from '../api/tickets'
import { userApi } from '../api/users'
import type { Ticket, Reply, User, TicketStatus, TicketPriority } from '../types'

const { Title, Paragraph } = Typography
const { TextArea } = Input
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

function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [replyForm] = Form.useForm()
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editForm] = Form.useForm()

  useEffect(() => {
    if (id) {
      fetchTicket()
      fetchReplies()
      fetchUsers()
    }
  }, [id])

  const fetchTicket = async () => {
    setLoading(true)
    try {
      const data = await ticketApi.get(Number(id))
      setTicket(data)
      editForm.setFieldsValue(data)
    } catch (error) {
      message.error('Failed to load ticket')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async () => {
    try {
      const data = await ticketApi.listReplies(Number(id))
      setReplies(data)
    } catch (error) {
      console.error('Failed to load replies:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await userApi.list()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const handleAddReply = async (values: { author_id: number; content: string }) => {
    try {
      await ticketApi.addReply(Number(id), values)
      message.success('Reply added')
      replyForm.resetFields()
      fetchReplies()
    } catch (error) {
      message.error('Failed to add reply')
      console.error(error)
    }
  }

  const handleUpdateTicket = async (values: any) => {
    try {
      await ticketApi.update(Number(id), values)
      message.success('Ticket updated')
      setEditModalVisible(false)
      fetchTicket()
    } catch (error) {
      message.error('Failed to update ticket')
      console.error(error)
    }
  }

  const handleDeleteTicket = async () => {
    Modal.confirm({
      title: 'Delete Ticket',
      content: 'Are you sure you want to delete this ticket? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await ticketApi.delete(Number(id))
          message.success('Ticket deleted')
          navigate('/tickets')
        } catch (error) {
          message.error('Failed to delete ticket')
          console.error(error)
        }
      }
    })
  }

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name || user.email : `User #${userId}`
  }

  if (!ticket) {
    return (
      <Card loading={loading}>
        <Paragraph>Loading ticket details...</Paragraph>
      </Card>
    )
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
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                Ticket #{ticket.id}
              </Title>
              <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginTop: 4 }}>
                {ticket.title}
              </div>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => setEditModalVisible(true)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    borderColor: 'white'
                  }}
                >
                  Edit
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={handleDeleteTicket}
                  style={{ background: '#ff4d4f', color: 'white', borderColor: '#ff4d4f' }}
                >
                  Delete
                </Button>
              </Space>
            </Col>
          </Row>
        </Space>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

          <Descriptions bordered column={2}>
            <Descriptions.Item label="Title" span={2}>
              {ticket.title}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColors[ticket.status]}>
                {ticket.status.replace('_', ' ').toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Priority">
              <Tag color={priorityColors[ticket.priority]}>{ticket.priority.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Requester">
              {getUserName(ticket.requester_id)}
            </Descriptions.Item>
            <Descriptions.Item label="Tags">
              {ticket.tags
                ? ticket.tags.split(',').map((tag) => <Tag key={tag}>{tag.trim()}</Tag>)
                : 'None'}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {new Date(ticket.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated">
              {new Date(ticket.updated_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Content" span={2}>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{ticket.content}</Paragraph>
            </Descriptions.Item>
          </Descriptions>

        </Space>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          Replies ({replies.length})
        </Title>
        <List
          dataSource={replies}
          renderItem={(reply) => (
            <List.Item style={{ padding: '16px 0' }}>
              <List.Item.Meta
                title={
                  <Space>
                    <span style={{ fontWeight: 600 }}>{getUserName(reply.author_id)}</span>
                    <span style={{ color: '#8c8c8c', fontSize: 13 }}>
                      {new Date(reply.created_at).toLocaleString()}
                    </span>
                  </Space>
                }
                description={
                  <div style={{ marginTop: 8 }}>
                    <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                      {reply.content}
                    </Paragraph>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: 'No replies yet' }}
        />
      </Card>

      <Card
        title={
          <Space>
            <SendOutlined />
            <span>Add Reply</span>
          </Space>
        }
      >
        <Form form={replyForm} layout="vertical" onFinish={handleAddReply}>
              <Form.Item
                name="author_id"
                label="Author"
                rules={[{ required: true, message: 'Please select author' }]}
              >
                <Select placeholder="Select author">
                  {users.map((user) => (
                    <Option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="content"
                label="Reply Content"
                rules={[{ required: true, message: 'Please enter reply content' }]}
              >
                <TextArea rows={4} placeholder="Enter your reply..." />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                  Send Reply
                </Button>
              </Form.Item>
            </Form>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Edit Ticket"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateTicket}>
          <Form.Item label="Title" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="Content" name="content">
            <TextArea rows={6} />
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
          <Form.Item label="Tags" name="tags">
            <Input placeholder="tag1,tag2,tag3" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TicketDetail
