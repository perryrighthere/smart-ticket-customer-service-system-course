import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  Button,
  Space,
  Spin,
  Form,
  Input,
  Select,
  message,
  Tabs,
  Divider,
  Tag,
  Collapse,
  Slider
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  FileTextOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RobotOutlined
} from '@ant-design/icons'
import { ticketApi } from '../api/tickets'
import { aiApi } from '../api/ai'
import type { AIChatMessage, AIChatResponse } from '../types'

const { Title, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

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
  const [aiConfigForm] = Form.useForm()
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    fetchStats()
    // load AI client config from localStorage for demo purposes
    try {
      const stored = window.localStorage.getItem('astratickets_ai_client_config')
      if (stored) {
        const parsed = JSON.parse(stored) as {
          provider?: string
          baseUrl?: string
          apiKey?: string
          model?: string
          distanceThreshold?: number
        }
        aiConfigForm.setFieldsValue({
          provider: parsed.provider || 'local',
          baseUrl: parsed.baseUrl || 'https://api.openai.com',
          model: parsed.model || 'gpt-3.5-turbo',
          apiKey: parsed.apiKey || '',
          distanceThreshold: parsed.distanceThreshold ?? 1.0
        })
      } else {
        aiConfigForm.setFieldsValue({
          provider: 'local',
          baseUrl: 'https://api.openai.com',
          model: 'gpt-3.5-turbo',
          apiKey: '',
          distanceThreshold: 1.0
        })
      }
    } catch {
      aiConfigForm.setFieldsValue({
        provider: 'local',
        baseUrl: 'https://api.openai.com',
        model: 'gpt-3.5-turbo',
        apiKey: '',
        distanceThreshold: 1.0
      })
    }
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

  const handleSaveAIConfig = (values: {
    provider?: string
    baseUrl?: string
    apiKey?: string
    model?: string
    distanceThreshold?: number
  }) => {
    const toStore = {
      provider: values.provider || 'local',
      baseUrl: values.baseUrl || 'https://api.openai.com',
      model: values.model || 'gpt-3.5-turbo',
      apiKey: values.apiKey || '',
      distanceThreshold: values.distanceThreshold ?? 1.0
    }
    try {
      window.localStorage.setItem('astratickets_ai_client_config', JSON.stringify(toStore))
      message.success('AI client configuration saved locally.')
    } catch (err) {
      console.error('Failed to save AI config:', err)
      message.error('Failed to save AI configuration')
    }
  }

  const handleSendMessage = async () => {
    const trimmed = chatInput.trim()
    if (!trimmed) return

    const newUserMessage: AIChatMessage = { role: 'user', content: trimmed }
    const history = [...chatMessages, newUserMessage]
    setChatMessages(history)
    setChatInput('')
    setChatLoading(true)
    try {
      let providerConfig: {
        provider?: string
        baseUrl?: string
        apiKey?: string
        model?: string
        distanceThreshold?: number
      } = {}
      try {
        const stored = window.localStorage.getItem('astratickets_ai_client_config')
        if (stored) {
          providerConfig = JSON.parse(stored)
        }
      } catch {
        // ignore malformed config; fall back to backend defaults
      }
      const payload = {
        query: trimmed,
        collection: 'kb_main',
        n_results: 4,
        history,
        provider: providerConfig.provider,
        base_url: providerConfig.baseUrl,
        model: providerConfig.model,
        api_key: providerConfig.apiKey,
        distance_threshold: providerConfig.distanceThreshold
      }
      const res: AIChatResponse = await aiApi.chat(payload)
      const newAssistant: AIChatMessage = {
        role: 'assistant',
        content: res.answer,
        kb_sources: res.kb_sources,
        kb_snippets: res.kb_snippets
      }
      setChatMessages([...history, newAssistant])
    } catch (error: any) {
      console.error('Failed to chat with AI:', error)
      const detail = error?.response?.data?.detail as string | undefined
      const messageText = detail || 'Failed to generate AI response'
      message.error(messageText)
      // Also surface the error in the conversation pane for transparency
      setChatMessages([
        ...history,
        {
          role: 'assistant',
          content: `Error: ${messageText}`
        }
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const getCurrentProviderLabel = (): string => {
    const provider: string | undefined = aiConfigForm.getFieldValue('provider')
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
  }

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
        <Row gutter={[24, 24]} style={{ marginBottom: 16 }}>
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

      <Card
        style={{ marginTop: 24 }}
        bodyStyle={{ padding: 0 }}
        bordered={false}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={10}>
            <Card
              title={
                <Space>
                  <RobotOutlined />
                  <span>AI Workspace</span>
                </Space>
              }
              extra={<Tag color="purple">Mode: {getCurrentProviderLabel()}</Tag>}
              bordered
              style={{ height: '100%' }}
              bodyStyle={{ paddingBottom: 0 }}
            >
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                Configure how the assistant talks to your models, then chat with it using knowledge
                from your local Chroma-based knowledge base.
              </Paragraph>
              <Tabs
                defaultActiveKey="chat"
                items={[
                  {
                    key: 'chat',
                    label: 'Assistant',
                    children: (
                      <div>
                        <div
                          style={{
                            maxHeight: 260,
                            minHeight: 180,
                            overflowY: 'auto',
                            padding: '8px 0',
                            marginBottom: 12,
                            border: '1px solid #f0f0f0',
                            borderRadius: 8,
                            background: '#fafafa'
                          }}
                        >
                          {chatMessages.length === 0 ? (
                            <Paragraph
                              type="secondary"
                              style={{ padding: '8px 12px', marginBottom: 0 }}
                            >
                              Start a conversation to ask questions about password resets, account
                              lockouts, billing policies and more. The assistant will use the
                              knowledge base (Chroma + RAG) where available.
                            </Paragraph>
                          ) : (
                            chatMessages.map((m, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '6px 12px',
                                  textAlign: m.role === 'user' ? 'right' : 'left'
                                }}
                              >
                                <div
                                  style={{
                                    display: 'inline-block',
                                    maxWidth: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 16,
                                    background: m.role === 'user' ? '#667eea' : '#fff',
                                    color: m.role === 'user' ? '#fff' : '#000',
                                    boxShadow:
                                      m.role === 'user'
                                        ? '0 1px 4px rgba(102, 126, 234, 0.4)'
                                        : '0 1px 3px rgba(0, 0, 0, 0.06)',
                                    textAlign: 'left'
                                  }}
                                >
                                  {m.role === 'assistant' &&
                                    m.kb_sources &&
                                    m.kb_sources.length > 0 && (
                                      <div style={{ marginBottom: 8 }}>
                                        <Collapse
                                          size="small"
                                          items={[
                                            {
                                              key: '1',
                                              label: `Sources (${m.kb_sources.length})`,
                                              children: (
                                                <Paragraph
                                                  style={{
                                                    fontSize: 12,
                                                    color: '#555',
                                                    marginBottom: 0
                                                  }}
                                                >
                                                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                                                    {m.kb_snippets?.map((s, i) => (
                                                      <li key={i}>{s}</li>
                                                    ))}
                                                  </ul>
                                                </Paragraph>
                                              )
                                            }
                                          ]}
                                        />
                                      </div>
                                    )}
                                  <span style={{ whiteSpace: 'pre-wrap' }}>{m.content}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          <TextArea
                            rows={3}
                            placeholder='Ask a question, e.g. "My password reset link expired, what should I do?"'
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onPressEnter={(e) => {
                              if (!e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                              }
                            }}
                          />
                          <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                            <Button type="primary" onClick={handleSendMessage} loading={chatLoading}>
                              Send
                            </Button>
                          </Space>
                        </Space>
                      </div>
                    )
                  },
                  {
                    key: 'config',
                    label: 'Provider Settings',
                    children: (
                      <div style={{ paddingTop: 8 }}>
                        <Form form={aiConfigForm} layout="vertical" onFinish={handleSaveAIConfig}>
                          <Form.Item label="Provider" name="provider">
                            <Select>
                              <Option value="local">Local (template only)</Option>
                              <Option value="openai">OpenAI compatible</Option>
                              <Option value="deepseek">DeepSeek (OpenAI compatible)</Option>
                              <Option value="qwen">Qwen (OpenAI compatible)</Option>
                            </Select>
                          </Form.Item>
                          <Form.Item
                            label="Base URL"
                            name="baseUrl"
                            extra="OpenAI-compatible /v1/chat/completions endpoint."
                          >
                            <Input placeholder="https://api.openai.com" />
                          </Form.Item>
                          <Form.Item
                            label="Model"
                            name="model"
                            extra="Model name for the provider (e.g. gpt-3.5-turbo)."
                          >
                            <Input placeholder="gpt-3.5-turbo" />
                          </Form.Item>
                          <Form.Item
                            label="API Key"
                            name="apiKey"
                            extra="Stored only in your browser (localStorage) for demos. Do not use production keys."
                          >
                            <Input.Password placeholder="sk-..." />
                          </Form.Item>
                          <Form.Item
                            label="Similarity Threshold"
                            name="distanceThreshold"
                            extra="Lower is more strict. Filters knowledge base results by distance."
                          >
                            <Slider min={0.0} max={2.0} step={0.05} />
                          </Form.Item>
                          <Form.Item style={{ marginBottom: 8 }}>
                            <Space>
                              <Button type="primary" htmlType="submit">
                                Save
                              </Button>
                              <Button onClick={() => aiConfigForm.resetFields()}>Reset</Button>
                            </Space>
                          </Form.Item>
                        </Form>
                        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                          Backend AI behaviour is controlled via environment variables in
                          <code> backend/.env</code>. These settings only customise how the demo
                          frontend remembers your preferred provider.
                        </Paragraph>
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            <Card
              bordered={false}
              style={{ height: '100%' }}
              bodyStyle={{ padding: '16px 24px' }}
            >
              <Title level={5} style={{ marginBottom: 8 }}>
                How the AI Workspace fits in
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 12 }}>
                The assistant combines your AstraTickets knowledge base (Chroma + embeddings) with
                an LLM provider. Use it to prototype customer-facing answers before wiring the same
                logic into ticket workflows.
              </Paragraph>
              <Divider />
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card
                    size="small"
                    bordered={false}
                    style={{ background: '#f9f0ff' }}
                  >
                    <Title level={5} style={{ marginBottom: 4 }}>
                      1. Prepare knowledge
                    </Title>
                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      Import FAQs and runbooks on the Knowledge Base page. The assistant will use
                      these chunks during retrieval.
                    </Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card
                    size="small"
                    bordered={false}
                    style={{ background: '#e6fffb' }}
                  >
                    <Title level={5} style={{ marginBottom: 4 }}>
                      2. Ask real questions
                    </Title>
                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      Use the chat tab to simulate customer issues like login failures or billing
                      disputes, and see how RAG improves answers.
                    </Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card
                    size="small"
                    bordered={false}
                    style={{ background: '#fff7e6' }}
                  >
                    <Title level={5} style={{ marginBottom: 4 }}>
                      3. Tune providers
                    </Title>
                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      Experiment with different OpenAI-compatible backends in the Provider Settings
                      tab without changing backend configuration.
                    </Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card
                    size="small"
                    bordered={false}
                    style={{ background: '#f6ffed' }}
                  >
                    <Title level={5} style={{ marginBottom: 4 }}>
                      4. Apply to tickets
                    </Title>
                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      Once you are satisfied, reuse the same prompts and provider choices in ticket
                      suggestions and automated replies.
                    </Paragraph>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default HomePage
