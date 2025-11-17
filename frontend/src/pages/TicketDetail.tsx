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
  SendOutlined,
  RobotOutlined
} from '@ant-design/icons'
import { ticketApi } from '../api/tickets'
import { userApi } from '../api/users'
import { aiApi } from '../api/ai'
import type {
  Ticket,
  Reply,
  User,
  TicketStatus,
  TicketPriority,
  TicketAISuggestionResponse
} from '../types'

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
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<TicketAISuggestionResponse | null>(null)
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

  const handleGenerateAISuggestion = async () => {
    if (!id) return
    setAiLoading(true)
    try {
      let providerConfig: {
        provider?: string
        baseUrl?: string
        model?: string
        apiKey?: string
      } = {}
      try {
        const stored = window.localStorage.getItem('astratickets_ai_client_config')
        if (stored) {
          providerConfig = JSON.parse(stored)
        }
      } catch {
        // ignore malformed config; fall back to backend defaults
      }
      const suggestion = await aiApi.suggestForTicket(Number(id), {
        collection: 'kb_main',
        n_results: 3,
        provider: providerConfig.provider,
        base_url: providerConfig.baseUrl,
        model: providerConfig.model,
        api_key: providerConfig.apiKey
      })
      setAiSuggestion(suggestion)
      message.success('AI suggestion generated')
    } catch (error: any) {
      console.error('Failed to generate AI suggestion', error)
      const detail = error?.response?.data?.detail as string | undefined
      const messageText = detail || 'Failed to generate AI suggestion'
      message.error(messageText)
    } finally {
      setAiLoading(false)
    }
  }

  const handleApplyReplyFromAI = () => {
    if (!aiSuggestion) return
    replyForm.setFieldsValue({
      content: aiSuggestion.ai_reply
    })
    message.success('AI reply applied to the reply form')
  }

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name || user.email : `User #${userId}`
  }

  const getCurrentProviderLabel = (): string => {
    try {
      const stored = window.localStorage.getItem('astratickets_ai_client_config')
      if (!stored) {
        return 'Backend defaults'
      }
      const parsed = JSON.parse(stored) as {
        provider?: string
      }
      const provider = parsed.provider
      if (!provider) {
        return 'Backend defaults'
      }
      if (provider === 'local') {
        return 'Local template'
      }
      if (provider === 'openai') {
        return 'OpenAI compatible'
      }
      if (provider === 'deepseek') {
        return 'DeepSeek (compatible)'
      }
      if (provider === 'qwen') {
        return 'Qwen (compatible)'
      }
      return provider
    } catch {
      return 'Backend defaults'
    }
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

      <Card
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <RobotOutlined />
            <span>AI Suggestion</span>
          </Space>
        }
        extra={
          <Space>
            <Tag color="purple">Mode: {getCurrentProviderLabel()}</Tag>
            <Button
              type="primary"
              onClick={handleGenerateAISuggestion}
              loading={aiLoading}
              icon={<RobotOutlined />}
            >
              Generate
            </Button>
          </Space>
        }
      >
        {aiSuggestion ? (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space size="large">
              <Space>
                <span style={{ fontWeight: 600 }}>Category:</span>
                <Tag>{aiSuggestion.category}</Tag>
              </Space>
              <Space>
                <span style={{ fontWeight: 600 }}>Confidence:</span>
                <span>{(aiSuggestion.confidence * 100).toFixed(1)}%</span>
              </Space>
              <Space>
                <span style={{ fontWeight: 600 }}>Suggested Priority:</span>
                <Tag color={priorityColors[aiSuggestion.suggested_priority]}>
                  {aiSuggestion.suggested_priority.toUpperCase()}
                </Tag>
              </Space>
            </Space>
            <Space wrap>
              <span style={{ fontWeight: 600 }}>Suggested Tags:</span>
              {aiSuggestion.suggested_tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
            <div>
              <Title level={5}>AI Draft Reply</Title>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {aiSuggestion.ai_reply}
              </Paragraph>
              <Button type="link" onClick={handleApplyReplyFromAI}>
                Apply to reply form
              </Button>
            </div>
            {aiSuggestion.kb_snippets.length > 0 && (
              <div>
                <Title level={5}>Knowledge Base Snippets</Title>
                {aiSuggestion.kb_snippets.slice(0, 3).map((snippet, idx) => (
                  <Paragraph
                    key={idx}
                    style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}
                  >
                    {snippet}
                  </Paragraph>
                ))}
              </div>
            )}
          </Space>
        ) : (
          <Paragraph type="secondary">
            Click &quot;Generate&quot; to let the AI classify this ticket and draft an initial reply.
          </Paragraph>
        )}
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
