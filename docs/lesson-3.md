# Lesson 3 · 前端界面与工单管理模块

## 课程概述

本节课程将带领学员完成 AstraTickets 系统的前端界面开发，实现完整的工单管理功能。通过本节课的学习，学员将掌握现代化前端开发的核心技能，包括组件化开发、状态管理、路由配置、API 调用等。

### 课程背景

在 Lesson 1 和 Lesson 2 中，我们已经完成了：
- **Lesson 1**: 项目架构设计、环境搭建、前后端骨架
- **Lesson 2**: 后端 API 开发、数据库模型设计、完整的 CRUD 接口

本节课将基于已有的后端 API，开发用户友好的前端界面，让系统真正可用。

### 技术栈

- **框架**: React 18 + TypeScript
- **UI 库**: Ant Design 5
- **路由**: React Router DOM 6
- **HTTP 客户端**: Axios
- **构建工具**: Vite
- **状态管理**: React Hooks (useState, useEffect)

## 课程目标

通过本节课的学习，学员将能够：

1. **掌握 React Router 路由配置与页面导航**
   - 配置多页面应用路由
   - 实现页面间导航和参数传递
   - 使用编程式导航

2. **使用 Ant Design 构建企业级前端界面**
   - 掌握 Ant Design 常用组件（Table, Form, Modal, Card 等）
   - 理解组件化开发思想
   - 实现响应式布局

3. **实现工单 CRUD 的完整前端交互**
   - 工单列表展示、过滤、分页
   - 创建工单表单与验证
   - 工单详情查看与编辑
   - 回复管理

4. **掌握 React Hooks 的使用**
   - useState 管理组件状态
   - useEffect 处理副作用
   - useNavigate 实现路由跳转
   - useParams 获取路由参数

5. **实践前后端数据联调与错误处理**
   - 封装 API 调用层
   - 统一错误处理
   - Loading 状态管理
   - 用户友好的提示信息

## 预期成果

完成本节课后，学员将拥有一个功能完整、界面美观的工单管理系统前端：

- Dashboard 仪表盘：实时统计数据展示
- 工单列表：支持筛选、分页、排序
- 创建工单：表单验证、数据提交
- 工单详情：查看、编辑、删除、回复管理
- 响应式设计：适配不同屏幕尺寸

## 课堂演示步骤

### 准备工作

**Step 1: 启动后端服务**
```bash
# 在项目根目录
make run-backend
# 或直接在 backend 目录
cd backend && uvicorn app.main:app --reload --port 8000
```

**Step 2: 启动前端开发服务器**
```bash
# 新开一个终端，在项目根目录
make run-frontend
# 或直接在 frontend 目录
cd frontend && npm run dev
```

**Step 3: 访问应用**
打开浏览器访问 `http://localhost:5173`

### 演示流程

#### 1. 首页导览（Home Page）
- 展示项目概览和技术栈卡片
- 点击 "View Tickets" 按钮进入工单列表
- 点击 "Create Ticket" 按钮进入创建工单页面

#### 2. 工单列表页面（Ticket List）
- 显示所有工单的表格视图
- **过滤功能**：
  - 按状态过滤（Open, In Progress, Resolved, Closed）
  - 按优先级过滤（Low, Medium, High, Urgent）
  - 选择过滤条件后自动刷新列表
- **分页功能**：
  - 默认每页显示 10 条
  - 可切换每页条数（10, 20, 50）
  - 显示总数统计
- **列展示**：
  - ID、标题（可点击）、状态标签、优先级标签、标签、创建时间、操作按钮
- 点击标题或 "View" 按钮进入工单详情

#### 3. 创建工单页面（Create Ticket）
- **表单字段**：
  - 标题（必填）：工单简要描述
  - 内容（必填）：详细问题描述
  - 提交人（必填）：从下拉列表选择已有用户
  - 状态：默认 Open，可选其他状态
  - 优先级：默认 Medium，可选其他级别
  - 标签：逗号分隔，如 "login,auth,bug"
- **验证**：
  - 必填字段验证
  - 提交人必须存在（后端验证）
- **提交后**：
  - 成功：显示成功消息，跳转到新工单详情页
  - 失败：显示错误消息，保持在表单页

**演示示例**：
```
标题：无法重置密码
内容：点击"忘记密码"链接后，未收到重置邮件。已检查垃圾邮件文件夹。
提交人：Alice (alice@example.com)
状态：Open
优先级：High
标签：password,email,auth
```

#### 4. 工单详情页面（Ticket Detail）
- **工单信息**：
  - 完整的工单详情（标题、状态、优先级、提交人、标签、创建/更新时间、内容）
  - 使用 Ant Design Descriptions 组件展示
  - 状态和优先级使用彩色标签
- **编辑功能**：
  - 点击 "Edit" 按钮打开编辑模态框
  - 支持部分更新（只更新填写的字段）
  - 更新后自动刷新工单详情
- **删除功能**：
  - 点击 "Delete" 按钮弹出确认对话框
  - 确认后删除工单并返回列表页
  - 后端级联删除所有相关回复
- **回复列表**：
  - 显示所有回复，包括作者和时间
  - 按时间顺序排列
- **添加回复**：
  - 选择回复作者（下拉列表）
  - 输入回复内容（多行文本框）
  - 提交后自动刷新回复列表

**演示操作**：
1. 查看工单详情
2. 点击 "Edit"，修改状态为 "In Progress"
3. 添加第一条回复：
   ```
   作者：Alice
   内容：我们正在调查邮件服务器的问题
   ```
4. 添加第二条回复：
   ```
   作者：Alice
   内容：问题已修复，请重试重置密码功能
   ```
5. 再次编辑工单，更新状态为 "Resolved"

#### 5. 导航与路由
- **顶部导航栏**：
  - Home：返回首页
  - Tickets：工单列表
  - 高亮显示当前页面
- **面包屑导航**：
  - 工单详情页：显示 "Back to List" 按钮
  - 创建工单页：显示 "Back to List" 按钮

## 课程内容

### 1. 项目结构

#### 新增文件
```
frontend/src/
├── types/
│   └── index.ts                    # TypeScript 类型定义
├── api/
│   ├── client.ts                   # Axios 实例（已有）
│   ├── tickets.ts                  # 工单 API 服务
│   └── users.ts                    # 用户 API 服务
├── pages/
│   ├── Home.tsx                    # 首页（更新）
│   ├── TicketList.tsx              # 工单列表页
│   ├── CreateTicket.tsx            # 创建工单页
│   └── TicketDetail.tsx            # 工单详情页
└── components/
    └── AppLayout.tsx               # 布局组件（更新：添加导航）
```

### 2. TypeScript 类型定义

#### frontend/src/types/index.ts

定义前端使用的类型，镜像后端 Pydantic schemas：

```typescript
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface User {
  id: number
  email: string
  name?: string
  created_at: string
}

export interface Ticket {
  id: number
  title: string
  content: string
  status: TicketStatus
  priority: TicketPriority
  tags?: string
  requester_id: number
  created_at: string
  updated_at: string
}

export interface TicketCreate {
  title: string
  content: string
  status?: TicketStatus
  priority?: TicketPriority
  tags?: string
  requester_id: number
}

export interface TicketUpdate {
  title?: string
  content?: string
  status?: TicketStatus
  priority?: TicketPriority
  tags?: string
}

export interface Reply {
  id: number
  ticket_id: number
  author_id: number
  content: string
  created_at: string
}

export interface ReplyCreate {
  author_id: number
  content: string
}
```

**设计要点**：
- 使用 TypeScript 的 Literal Types 定义状态和优先级枚举
- Create/Update schemas 使用可选字段（`?`）
- 时间字段统一使用 `string` 类型（ISO 8601 格式）

### 3. API 服务层

#### frontend/src/api/tickets.ts

封装所有工单相关的 API 调用：

```typescript
import { apiClient } from './client'
import type { Ticket, TicketCreate, TicketUpdate, Reply, ReplyCreate } from '../types'

export const ticketApi = {
  async create(data: TicketCreate): Promise<Ticket> {
    const response = await apiClient.post<Ticket>('/tickets/', data)
    return response.data
  },

  async list(params?: TicketListParams): Promise<Ticket[]> {
    const response = await apiClient.get<Ticket[]>('/tickets/', { params })
    return response.data
  },

  async get(id: number): Promise<Ticket> {
    const response = await apiClient.get<Ticket>(`/tickets/${id}`)
    return response.data
  },

  async update(id: number, data: TicketUpdate): Promise<Ticket> {
    const response = await apiClient.put<Ticket>(`/tickets/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/tickets/${id}`)
  },

  async addReply(ticketId: number, data: ReplyCreate): Promise<Reply> {
    const response = await apiClient.post<Reply>(`/tickets/${ticketId}/replies`, data)
    return response.data
  },

  async listReplies(ticketId: number): Promise<Reply[]> {
    const response = await apiClient.get<Reply[]>(`/tickets/${ticketId}/replies`)
    return response.data
  }
}
```

**设计模式**：
- 使用对象字面量组织相关 API 方法
- 每个方法都是 async 函数，返回 Promise
- 使用 TypeScript 泛型指定响应类型
- 错误处理交给调用方（组件层）

### 4. React Router 配置

#### frontend/src/main.tsx

```typescript
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

#### frontend/src/App.tsx

```typescript
import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import HomePage from './pages/Home'
import TicketList from './pages/TicketList'
import CreateTicket from './pages/CreateTicket'
import TicketDetail from './pages/TicketDetail'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tickets" element={<TicketList />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
      </Routes>
    </AppLayout>
  )
}
```

**路由设计**：
- `/` - 首页
- `/tickets` - 工单列表
- `/tickets/new` - 创建工单
- `/tickets/:id` - 工单详情

### 5. 布局组件更新

#### frontend/src/components/AppLayout.tsx

添加顶部导航菜单：

```typescript
import { Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { HomeOutlined, FileTextOutlined } from '@ant-design/icons'

function AppLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: 'Home' },
    { key: '/tickets', icon: <FileTextOutlined />, label: 'Tickets' }
  ]

  return (
    <Layout>
      <Header>
        <div>AstraTickets Console</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={(e) => navigate(e.key)}
        />
      </Header>
      <Content>{children}</Content>
      <Footer>Lesson 3 · Frontend Ticket Management</Footer>
    </Layout>
  )
}
```

**关键技术**：
- `useLocation()` 获取当前路径，高亮对应菜单项
- `useNavigate()` 编程式导航
- Menu 组件的 `selectedKeys` 属性实现高亮

### 6. 工单列表页面实现

#### 核心功能代码

```typescript
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [statusFilter, priorityFilter, pagination])

  // ... Table 配置和 JSX
}
```

**技术要点**：
1. **状态管理**：
   - `useState` 管理工单数据、加载状态、过滤条件、分页参数

2. **副作用处理**：
   - `useEffect` 监听过滤条件和分页参数变化，自动重新获取数据

3. **错误处理**：
   - `try/catch/finally` 捕获 API 错误
   - 使用 Ant Design `message` 组件显示错误提示

4. **Table 配置**：
   - 自定义列渲染（状态/优先级标签、时间格式化）
   - 行点击导航到详情页
   - 分页器配置

### 7. 创建工单页面实现

#### 表单处理

```typescript
function CreateTicket() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = async (values: TicketCreate) => {
    setLoading(true)
    try {
      const ticket = await ticketApi.create(values)
      message.success('Ticket created successfully')
      navigate(`/tickets/${ticket.id}`)
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to create ticket'
      message.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ status: 'open', priority: 'medium' }}
    >
      {/* 表单字段 */}
    </Form>
  )
}
```

**技术要点**：
1. **Ant Design Form**：
   - `Form.useForm()` 创建表单实例
   - `layout="vertical"` 垂直布局
   - `initialValues` 设置默认值
   - `onFinish` 表单提交回调

2. **用户选择下拉框**：
   - 组件加载时获取用户列表
   - 显示用户名和邮箱

3. **提交流程**：
   - 提交前设置 loading 状态
   - 成功后导航到新工单详情页
   - 失败显示后端返回的错误信息

### 8. 工单详情页面实现

#### 多功能集成

```typescript
function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [editModalVisible, setEditModalVisible] = useState(false)

  useEffect(() => {
    if (id) {
      fetchTicket()
      fetchReplies()
      fetchUsers()
    }
  }, [id])

  const handleUpdateTicket = async (values: any) => {
    try {
      await ticketApi.update(Number(id), values)
      message.success('Ticket updated')
      setEditModalVisible(false)
      fetchTicket()
    } catch (error) {
      message.error('Failed to update ticket')
    }
  }

  const handleDeleteTicket = async () => {
    Modal.confirm({
      title: 'Delete Ticket',
      content: 'Are you sure?',
      okType: 'danger',
      onOk: async () => {
        await ticketApi.delete(Number(id))
        navigate('/tickets')
      }
    })
  }

  const handleAddReply = async (values: ReplyCreate) => {
    await ticketApi.addReply(Number(id), values)
    fetchReplies()
  }

  // ... JSX
}
```

**技术要点**：
1. **路由参数**：
   - `useParams` 获取 URL 中的工单 ID

2. **编辑模态框**：
   - 点击 Edit 按钮显示模态框
   - 模态框内嵌套表单
   - 更新后关闭模态框并刷新数据

3. **删除确认**：
   - `Modal.confirm()` 显示确认对话框
   - 确认后执行删除并导航回列表

4. **回复管理**：
   - 使用 `List` 组件展示回复列表
   - 表单提交后自动刷新回复列表

5. **用户显示**：
   - 根据 `author_id` 和 `requester_id` 查找用户信息
   - 显示用户名或邮箱

### 9. Ant Design 组件使用

#### 常用组件

1. **Table**：数据表格
   ```typescript
   <Table
     columns={columns}
     dataSource={tickets}
     rowKey="id"
     loading={loading}
     pagination={{ ... }}
     onChange={handleTableChange}
   />
   ```

2. **Form**：表单
   ```typescript
   <Form form={form} layout="vertical" onFinish={handleSubmit}>
     <Form.Item name="title" rules={[{ required: true }]}>
       <Input />
     </Form.Item>
   </Form>
   ```

3. **Select**：下拉选择
   ```typescript
   <Select placeholder="Select user" onChange={setSelectedUser}>
     {users.map(user => (
       <Option key={user.id} value={user.id}>
         {user.name}
       </Option>
     ))}
   </Select>
   ```

4. **Tag**：标签
   ```typescript
   <Tag color={statusColors[ticket.status]}>
     {ticket.status.toUpperCase()}
   </Tag>
   ```

5. **Modal**：对话框
   ```typescript
   <Modal
     title="Edit Ticket"
     open={visible}
     onCancel={() => setVisible(false)}
     footer={null}
   >
     <Form>...</Form>
   </Modal>
   ```

6. **Descriptions**：描述列表
   ```typescript
   <Descriptions bordered column={2}>
     <Descriptions.Item label="Title">{ticket.title}</Descriptions.Item>
     <Descriptions.Item label="Status">
       <Tag color="blue">{ticket.status}</Tag>
     </Descriptions.Item>
   </Descriptions>
   ```

7. **Message**：全局提示
   ```typescript
   message.success('Operation successful')
   message.error('Operation failed')
   ```

### 10. 前后端联调技巧

#### Vite 代理配置

`frontend/vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
```

**工作原理**：
- 前端发起 `/api/tickets/` 请求
- Vite 开发服务器代理到 `http://localhost:8000/api/tickets/`
- 避免 CORS 问题

#### 错误处理最佳实践

```typescript
try {
  const data = await ticketApi.list()
  setTickets(data)
} catch (error: any) {
  // 1. 尝试获取后端错误消息
  const errorMsg = error.response?.data?.detail || 'Failed to fetch tickets'

  // 2. 显示用户友好的错误提示
  message.error(errorMsg)

  // 3. 记录到控制台（开发调试）
  console.error('API Error:', error)
} finally {
  // 4. 清理 loading 状态
  setLoading(false)
}
```

## 技术要点总结

### 1. React Hooks 使用

- **useState**：组件状态管理
  - 数据列表：`useState<Ticket[]>([])`
  - 加载状态：`useState(false)`
  - 过滤条件：`useState<TicketStatus | undefined>()`

- **useEffect**：副作用处理
  - 组件挂载时获取数据
  - 依赖项变化时重新获取
  - 清理函数（如需要）

- **useNavigate**：编程式导航
  - 表单提交后跳转：`navigate('/tickets')`
  - 带参数跳转：`navigate(\`/tickets/${id}\`)`

- **useParams**：获取路由参数
  - `const { id } = useParams<{ id: string }>()`

- **useLocation**：获取当前路径
  - 用于高亮当前菜单项

### 2. TypeScript 最佳实践

- **类型定义集中管理**：`src/types/index.ts`
- **API 响应类型标注**：`apiClient.get<Ticket[]>(...)`
- **可选属性使用 `?`**：`name?: string`
- **联合类型定义枚举**：`type Status = 'open' | 'closed'`
- **async 函数返回类型**：`async function(): Promise<Ticket>`

### 3. Ant Design 使用技巧

- **Form 受控组件**：使用 `Form.useForm()` 管理表单
- **Table 自定义渲染**：`render` 函数自定义列显示
- **Modal 嵌套 Form**：编辑场景常用模式
- **Message 全局提示**：统一的成功/失败反馈
- **Tag 语义化颜色**：根据状态/优先级使用不同颜色

### 4. API 调用模式

```typescript
// 1. 设置 loading
setLoading(true)

// 2. 调用 API
const data = await api.method()

// 3. 更新状态
setState(data)

// 4. 用户反馈
message.success('Success')

// 5. 错误处理
catch (error) {
  message.error(error.message)
}

// 6. 清理 loading
finally {
  setLoading(false)
}
```

## 课后作业

### 必做

1. **实现工单统计组件**
   - 在首页添加工单统计卡片
   - 显示：总工单数、各状态工单数、今日新建数
   - 使用 Ant Design Statistic 组件

2. **优化工单列表**
   - 添加标题搜索功能
   - 实现按创建时间排序（升序/降序）
   - 添加批量操作（批量关闭/删除）

3. **改进用户体验**
   - 工单详情页添加 "上一个/下一个工单" 导航按钮
   - 创建工单页添加 "预览" 功能
   - 所有页面添加 Loading 骨架屏

### 选做

1. **实现用户管理页面**
   - 用户列表页：显示所有用户
   - 创建用户表单
   - 用户详情页：显示该用户的所有工单

2. **高级过滤功能**
   - 工单列表添加时间范围过滤
   - 支持多标签过滤（AND/OR 逻辑）
   - 保存过滤条件到 URL 查询参数

3. **性能优化**
   - 实现工单列表的虚拟滚动（react-window）
   - 添加 React.memo 优化列表渲染
   - 实现工单数据的本地缓存（减少 API 调用）

## 常见问题与解决方案

### 1. CORS 错误
**问题**：前端直接请求后端时出现跨域错误

**解决**：
- 开发环境：使用 Vite proxy（已配置）
- 生产环境：后端添加 CORS 中间件

### 2. 路由刷新 404
**问题**：刷新 `/tickets/123` 时出现 404

**解决**：
- 开发环境：Vite 自动处理
- 生产环境：配置服务器将所有路由重定向到 `index.html`

### 3. 表单验证不生效
**问题**：Form.Item 的 rules 不触发

**解决**：
- 确保 Form.Item 有 `name` 属性
- 使用 `form.validateFields()` 手动触发验证

### 4. useEffect 无限循环
**问题**：useEffect 不停触发

**解决**：
- 检查依赖数组中的对象/数组引用
- 使用 useMemo/useCallback 稳定引用

## 下节预告

**Lesson 4: RAG 知识库集成**
- 使用 Chroma 向量数据库
- SentenceTransformers 文本嵌入
- 实现知识文档上传与向量化
- 相似工单检索功能
- 前端集成知识库搜索

## 附录：完整文件清单

### 新增文件
- `frontend/src/types/index.ts` - 类型定义
- `frontend/src/api/tickets.ts` - 工单 API 服务
- `frontend/src/api/users.ts` - 用户 API 服务
- `frontend/src/pages/TicketList.tsx` - 工单列表页
- `frontend/src/pages/CreateTicket.tsx` - 创建工单页
- `frontend/src/pages/TicketDetail.tsx` - 工单详情页

### 修改文件
- `frontend/src/main.tsx` - 添加 BrowserRouter
- `frontend/src/App.tsx` - 配置路由
- `frontend/src/components/AppLayout.tsx` - 添加导航菜单
- `frontend/src/pages/Home.tsx` - 更新首页内容
- `frontend/package.json` - 添加 react-router-dom 依赖

### 依赖安装
```bash
cd frontend
npm install react-router-dom
```

## 展示 Checklist
- [ ] 启动后端和前端服务
- [ ] 演示首页和导航功能
- [ ] 演示工单列表的过滤和分页
- [ ] 演示创建工单的完整流程
- [ ] 演示工单详情、编辑、删除
- [ ] 演示添加回复功能
- [ ] 展示 TypeScript 类型安全
- [ ] 展示错误处理和用户反馈
- [ ] 讲解前后端联调配置
- [ ] 运行 `npm run build` 验证生产构建

## 教学重点总结

### 核心概念

1. **组件化开发思想**
   - 每个页面是一个独立组件
   - 组件间通过 props 传递数据
   - 使用自定义 Hooks 复用逻辑

2. **单页应用路由**
   - 使用 React Router 管理路由
   - 客户端路由 vs 服务端路由
   - 路由参数传递和获取

3. **状态管理策略**
   - 本地状态：useState
   - 副作用处理：useEffect
   - 依赖数组的作用

4. **API 调用模式**
   - 分层架构：API 服务层 + 组件层
   - 统一错误处理
   - Loading 状态管理

5. **TypeScript 类型安全**
   - 接口定义
   - 类型推导
   - 类型检查

### 常见问题与解决方案

#### 问题 1: useEffect 无限循环
**原因**: 依赖数组中的对象/数组引用变化
**解决**:
```typescript
// 错误
useEffect(() => {
  fetchData(filter) // filter 是对象
}, [filter])

// 正确
useEffect(() => {
  fetchData(filter)
}, [filter.status, filter.priority]) // 使用具体的值
```

#### 问题 2: 表单提交后数据未刷新
**原因**: 没有重新获取数据
**解决**: 提交成功后调用 fetch 函数或使用导航跳转

#### 问题 3: CORS 错误
**原因**: 浏览器跨域限制
**解决**:
- 开发环境：使用 Vite proxy
- 生产环境：后端配置 CORS 头

#### 问题 4: 路由刷新 404
**原因**: 服务器找不到对应文件
**解决**:
- 开发环境：Vite 自动处理
- 生产环境：配置服务器重定向到 index.html

### 最佳实践

1. **组件设计**
   - 保持组件职责单一
   - 提取可复用组件
   - 使用 TypeScript 类型约束

2. **状态管理**
   - 状态尽量靠近使用的地方
   - 避免过度状态提升
   - 合理使用 useEffect 依赖

3. **错误处理**
   - 统一的错误提示
   - 详细的错误日志
   - 优雅的降级处理

4. **性能优化**
   - 避免不必要的渲染
   - 使用 React.memo (如需要)
   - 合理的数据分页

5. **代码组织**
   - 按功能模块组织文件
   - API 调用集中管理
   - 类型定义统一存放

## 延伸学习

### 推荐阅读

1. **React 官方文档**
   - [React Hooks](https://react.dev/reference/react)
   - [React Router](https://reactrouter.com/)

2. **TypeScript**
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
   - [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

3. **Ant Design**
   - [组件文档](https://ant.design/components/overview-cn/)
   - [设计规范](https://ant.design/docs/spec/introduce-cn)

### 进阶话题

1. **状态管理库**: Zustand, Redux Toolkit
2. **数据获取库**: React Query, SWR
3. **表单管理**: React Hook Form, Formik
4. **性能优化**: Code Splitting, Lazy Loading
5. **测试**: Jest, React Testing Library

## 课后练习建议

### 基础练习（必做）

1. **实现搜索功能**
   - 在工单列表添加标题搜索框
   - 实现实时搜索
   - 与现有过滤器结合

2. **优化 Dashboard**
   - 添加图表展示（Ant Design Charts）
   - 显示最近工单列表
   - 添加快速操作入口

3. **改进用户体验**
   - 添加 Loading 骨架屏
   - 优化空状态展示
   - 添加操作确认提示

### 进阶练习（选做）

1. **实现用户管理模块**
   - 用户列表页面
   - 创建/编辑用户
   - 用户与工单关联展示

2. **工单批量操作**
   - 表格行选择
   - 批量更新状态
   - 批量删除

3. **实时更新**
   - 使用 WebSocket 或轮询
   - 工单状态变化实时通知
   - 新工单提醒

4. **高级过滤**
   - 时间范围筛选
   - 多条件组合筛选
   - 保存筛选条件

5. **导出功能**
   - 导出工单为 CSV
   - 导出筛选结果
   - 自定义导出字段

## 教学建议

### 课堂组织

1. **理论讲解（30分钟）**
   - React 核心概念回顾
   - 项目架构讲解
   - 代码组织规范

2. **代码演示（60分钟）**
   - 逐步实现各个页面
   - 讲解关键代码段
   - 展示调试技巧

3. **学员实践（60分钟）**
   - 跟随老师编写代码
   - 完成基础功能
   - 解决遇到的问题

4. **总结答疑（30分钟）**
   - 回顾核心知识点
   - 解答学员疑问
   - 布置课后作业

### 教学注意事项

1. **强调类型安全**：TypeScript 的优势
2. **演示调试技巧**：Chrome DevTools, React DevTools
3. **代码风格一致**：遵循 ESLint 规则
4. **错误处理完整**：让学员养成好习惯
5. **性能意识培养**：避免常见性能陷阱

### 学员常见困惑

1. **useState 与 useEffect 的使用时机**
   - 通过实例讲解
   - 对比不同场景

2. **async/await 与 Promise**
   - 讲解异步编程基础
   - 演示错误处理

3. **TypeScript 类型定义**
   - 从简单到复杂
   - 讲解类型推导

4. **Ant Design 组件使用**
   - 参考官方文档
   - 演示常用组件

## 总结

通过 Lesson 3 的学习，我们完成了 AstraTickets 系统的前端开发，实现了完整的工单管理功能。学员不仅掌握了 React、TypeScript、Ant Design 等技术栈的使用，更重要的是理解了现代前端开发的工程化思想和最佳实践。

下一节课（Lesson 4）将引入 RAG 知识库检索功能，让系统具备 AI 能力，敬请期待！
