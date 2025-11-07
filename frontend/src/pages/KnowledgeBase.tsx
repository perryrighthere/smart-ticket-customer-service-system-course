/**
 * Knowledge Base Management Page (Lesson 4)
 * Features: ingest documents (files or text), chunk options, search, delete results
 */
import { useEffect, useState } from 'react'
import {
  Card,
  Typography,
  Space,
  Row,
  Col,
  Button,
  Form,
  Input,
  InputNumber,
  Switch,
  Upload,
  List,
  Tag,
  Modal,
  message,
  Select,
  Checkbox
} from 'antd'
import {
  UploadOutlined,
  SearchOutlined,
  DatabaseOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { kbApi } from '../api/kb'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

type UploadFileItem = { name: string; content: string }

function KnowledgeBase() {
  const [ingestLoading, setIngestLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [files, setFiles] = useState<UploadFileItem[]>([])
  const [insertedIds, setInsertedIds] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<
    { id?: string; text: string; metadata?: Record<string, any>; distance?: number }[]
  >([])
  const [storedItems, setStoredItems] = useState<
    { id: string; text?: string; metadata?: Record<string, any> }[]
  >([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 })
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [ingestForm] = Form.useForm()
  const [searchForm] = Form.useForm()
  useEffect(() => {
    // initial load of stored chunks
    const col = searchForm.getFieldValue('collection') || 'kb_main'
    fetchStored(col, 1, 10)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const uploadProps: UploadProps = {
    multiple: true,
    accept: '.md,.txt',
    beforeUpload: (file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setFiles((prev) => [...prev, { name: file.name, content: String(reader.result || '') }])
      }
      reader.readAsText(file)
      return false // prevent actual upload
    },
    onRemove: (file) => {
      setFiles((prev) => prev.filter((f) => f.name !== file.name))
    }
  }

  const handleIngest = async (values: any) => {
    const texts: string[] = []
    if (values.text && values.text.trim().length > 0) {
      texts.push(values.text)
    }
    files.forEach((f) => texts.push(f.content))
    if (texts.length === 0) {
      message.warning('Please provide text or select files to ingest.')
      return
    }
    setIngestLoading(true)
    try {
      const documents = texts.map((t) => ({ text: t }))
      const res = await kbApi.ingest({
        collection: values.collection || 'kb_main',
        chunk: values.chunk,
        max_chars: values.max_chars,
        overlap: values.overlap,
        documents
      })
      setInsertedIds(res.inserted_ids)
      message.success(`Ingested ${res.chunks_added} chunk(s) into collection '${res.collection}'.`)
      // Refresh stored list after ingest
      fetchStored(values.collection || 'kb_main', 1, pagination.pageSize)
    } catch (err: any) {
      message.error(err?.response?.data?.detail || 'Ingest failed')
    } finally {
      setIngestLoading(false)
    }
  }

  const handleSearch = async (values: any) => {
    if (!values.query || values.query.trim().length === 0) {
      message.warning('Please enter a query to search.')
      return
    }
    setSearchLoading(true)
    try {
      const res = await kbApi.search({
        collection: values.collection || 'kb_main',
        query: values.query,
        n_results: values.n_results || 5
      })
      setSearchResults(res.matches)
      if (res.matches.length === 0) message.info('No results found.')
    } catch (err: any) {
      message.error(err?.response?.data?.detail || 'Search failed')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleDelete = async (id?: string, collection?: string) => {
    if (!id) return
    Modal.confirm({
      title: 'Delete Document',
      content: 'Are you sure you want to delete this document from the collection?',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const res = await kbApi.delete({ collection: collection || 'kb_main', ids: [id] })
          message.success(`Deleted ${res.deleted} item(s).`)
          // remove from current results
          setSearchResults((prev) => prev.filter((m) => m.id !== id))
          // refresh stored list
          fetchStored(collection || 'kb_main', pagination.page, pagination.pageSize)
        } catch (err: any) {
          message.error(err?.response?.data?.detail || 'Delete failed')
        }
      }
    })
  }

  const fetchStored = async (collection: string, page: number, pageSize: number) => {
    setListLoading(true)
    try {
      const offset = (page - 1) * pageSize
      const res = await kbApi.list({ collection, limit: pageSize, offset })
      setStoredItems(res.items)
      setPagination({ page, pageSize, total: res.total })
    } catch (err) {
      console.error('List stored items failed:', err)
    } finally {
      setListLoading(false)
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
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            Knowledge Base
          </Title>
          <div style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Ingest documents into a local vector store and perform similarity search.
          </div>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={<Space><DatabaseOutlined /><span>Ingest Documents</span></Space>}>
            <Form
              form={ingestForm}
              layout="vertical"
              initialValues={{ collection: 'kb_main', chunk: true, max_chars: 600, overlap: 80, chunk_strategy: 'window', delimiters: '。！？?!' }}
              onFinish={handleIngest}
            >
              <Form.Item label="Collection" name="collection">
                <Input placeholder="Collection name" />
              </Form.Item>

              <Form.Item label="Paste Text" name="text">
                <TextArea rows={6} placeholder="Paste content here or upload .md/.txt files below" />
              </Form.Item>

              <Form.Item label="Upload Files (.md/.txt)">
                <Upload.Dragger {...uploadProps} fileList={[]}> 
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag files to upload</p>
                  <p className="ant-upload-hint">.md / .txt files are supported</p>
                </Upload.Dragger>
                {files.length > 0 ? (
                  <Paragraph type="secondary" style={{ marginTop: 8 }}>
                    Selected files: {files.map((f) => f.name).join(', ')}
                  </Paragraph>
                ) : null}
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Chunk" name="chunk" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Max Chars" name="max_chars">
                    <InputNumber min={100} max={2000} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Overlap" name="overlap">
                    <InputNumber min={0} max={500} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Chunk Strategy" name="chunk_strategy">
                    <Select
                      options={[
                        { label: 'Window (paragraph + window)', value: 'window' },
                        { label: 'Punctuation (e.g. ? ! 。 ！ ？)', value: 'punctuation' }
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Delimiters" name="delimiters" extra="Used when Punctuation strategy is selected">
                    <Input placeholder="e.g. 。！？?!" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={ingestLoading}>
                    Ingest
                  </Button>
                  <Button onClick={() => { setFiles([]); ingestForm.resetFields() }}>Reset</Button>
                </Space>
              </Form.Item>

              {insertedIds.length > 0 && (
                <Paragraph type="secondary">Inserted IDs (sample): {insertedIds.slice(0, 5).join(', ')}{insertedIds.length > 5 ? '...' : ''}</Paragraph>
              )}
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<Space><SearchOutlined /><span>Search</span></Space>}>
            <Form
              form={searchForm}
              layout="vertical"
              initialValues={{ collection: 'kb_main', n_results: 5 }}
              onFinish={handleSearch}
            >
              <Form.Item label="Collection" name="collection">
                <Input placeholder="Collection name" />
              </Form.Item>
              <Form.Item label="Query" name="query" rules={[{ required: true, message: 'Please enter query' }]}>
                <Input placeholder="e.g., password reset link expiry" />
              </Form.Item>
              <Form.Item label="Top K" name="n_results">
                <InputNumber min={1} max={20} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={searchLoading}>
                  Search
                </Button>
              </Form.Item>
            </Form>

            <List
              dataSource={searchResults}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      icon={<DeleteOutlined />}
                      disabled={!item.id}
                      onClick={() => handleDelete(item.id, searchForm.getFieldValue('collection'))}
                      danger
                    >
                      Delete
                    </Button>
                  ]}
                  style={{ paddingLeft: 0, paddingRight: 0 }}
                >
                  <List.Item.Meta
                    title={
                      <Space size="small">
                        <span style={{ fontWeight: 600 }}>
                          {item.metadata?.title || 'Untitled'}
                        </span>
                        <Tag color="default">{item.id || 'N/A'}</Tag>
                        {typeof item.distance === 'number' && (
                          <Tag>{`distance: ${item.distance.toFixed(4)}`}</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>
                          {item.text}
                        </Paragraph>
                        {item.metadata && (
                          <Text type="secondary">{JSON.stringify(item.metadata)}</Text>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No results' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <DatabaseOutlined />
                <span>Stored Chunks</span>
              </Space>
            }
            extra={
              <Space>
                <Button
                  onClick={() => {
                    const pageIds = storedItems.map((it) => it.id)
                    setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])))
                  }}
                >
                  Select Page
                </Button>
                <Button onClick={() => setSelectedIds([])}>Clear</Button>
                <Button
                  danger
                  disabled={selectedIds.length === 0}
                  onClick={async () => {
                    try {
                      const col = searchForm.getFieldValue('collection') || 'kb_main'
                      const res = await kbApi.delete({ collection: col, ids: selectedIds })
                      message.success(`Deleted ${res.deleted} item(s).`)
                      setSelectedIds([])
                      fetchStored(col, pagination.page, pagination.pageSize)
                    } catch (err: any) {
                      message.error(err?.response?.data?.detail || 'Bulk delete failed')
                    }
                  }}
                >
                  Delete Selected
                </Button>
                <Button
                  onClick={() =>
                    fetchStored(searchForm.getFieldValue('collection') || 'kb_main', pagination.page, pagination.pageSize)
                  }
                >
                  Refresh
                </Button>
              </Space>
            }
          >
            <List
              loading={listLoading}
              dataSource={storedItems}
              pagination={{
                current: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (p, ps) => {
                  const col = searchForm.getFieldValue('collection') || 'kb_main'
                  fetchStored(col, p, ps)
                }
              }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Checkbox
                      key="select"
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setSelectedIds((prev) =>
                          checked ? Array.from(new Set([...prev, item.id])) : prev.filter((id) => id !== item.id)
                        )
                      }}
                    />,
                    <Button
                      key="delete"
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(item.id, searchForm.getFieldValue('collection'))}
                      danger
                    >
                      Delete
                    </Button>
                  ]}
                  style={{ paddingLeft: 0, paddingRight: 0 }}
                >
                  <List.Item.Meta
                    title={
                      <Space size="small">
                        <span style={{ fontWeight: 600 }}>
                          {item.metadata?.title || 'Untitled'}
                        </span>
                        <Tag color="default">{item.id}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>
                          {(item.text || '').slice(0, 400)}
                        </Paragraph>
                        {item.metadata && (
                          <Text type="secondary">{JSON.stringify(item.metadata)}</Text>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No stored chunks' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default KnowledgeBase
