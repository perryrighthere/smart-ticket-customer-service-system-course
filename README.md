# AstraTickets

> 企业级 AI 智能客服工单系统

## 项目简介

AstraTickets 是一个覆盖 **"来单 → 分类 → 检索 → AI 首答 → 人工协同 → 看板"** 全链路的企业级智能客服工单系统。本项目采用前后端分离架构，结合 RAG (检索增强生成) 和大语言模型，实现智能化的客服工单管理。

## 核心功能

### 当前功能

- **用户管理**: 创建、查询、列表
- **工单管理**: 完整的 CRUD 操作、状态跟踪、优先级管理、标签分类
- **工单回复**: 多轮对话支持
- **知识库管理（RAG）**: 文档导入、向量化存储、本地相似度检索
- **AI 智能建议**:
  - 对工单内容进行轻量级自动分类
  - 基于知识库片段生成“AI 初步回复”草稿
  - 将 AI 草稿一键填充到回复表单中
- **数据过滤与分页**: 支持按状态、优先级、提交人筛选
- **前端界面**:
  - 工单列表页（过滤、分页、状态标签）
  - 创建工单页（表单验证、用户选择）
  - 工单详情页（查看、编辑、删除、回复管理）
   - 知识库管理页（KB 导入、检索、删除）
  - 响应式布局和导航系统

### 规划中功能

- **更智能的 AI 能力**: 与对话上下文联动的多轮回复、更加完善的分类路由策略
- **人工协同**: AI 建议与人工审核结合
- **统计看板**: 工单趋势分析、响应时间统计、满意度分析

## 技术架构

### 后端技术栈
- **Web 框架**: FastAPI
- **ORM**: SQLAlchemy (支持同步/异步)
- **数据库**: SQLite (开发环境) / PostgreSQL/MySQL (生产环境)
- **配置管理**: Pydantic Settings
- **测试框架**: Pytest

### 前端技术栈
- **框架**: React 18
- **构建工具**: Vite
- **语言**: TypeScript
- **UI 库**: Ant Design 5
- **路由**: React Router DOM 6
- **HTTP 客户端**: Axios
- **状态管理**: React Hooks (useState, useEffect)
- **代码风格**: ESLint + Prettier

### AI/数据模块
- **向量数据库**: Chroma（本地持久化）
- **嵌入模型**: SentenceTransformers（可选，优先使用；缺失时自动降级为哈希向量器）
- **RAG 管道**: 自研切片 + 向量化 + Chroma 相似度检索（后端 `app/rag/*`）
- **LLM/AI 回复**:
  - 优先支持 OpenAI 兼容接口（OpenAI / DeepSeek / Qwen / 本地代理等，可通过环境变量配置）
  - 未配置外部模型时，使用基于知识库片段的本地模板引擎生成回复草稿

### 基础设施
- **容器化**: Docker, Docker Compose
- **缓存**: Redis (可选)
- **消息队列**: Celery + Redis (可选)

## 项目结构
```
.
├── backend/                        # FastAPI 后端应用
│   ├── app/
│   │   ├── main.py                 # FastAPI 应用入口
│   │   ├── core/                   # 核心配置模块
│   │   │   └── config.py           # Pydantic Settings 配置
│   │   ├── ai/                     # AI 能力模块（Lesson 5）
│   │   │   ├── classifier.py       # 轻量级工单分类器（TF-IDF + 线性模型，带关键字降级）
│   │   │   ├── llm.py              # LLM 客户端封装（OpenAI 兼容 + 本地模板回退）
│   │   │   └── service.py          # 工单 AI 建议聚合逻辑
│   │   ├── db/                     # 数据库模块
│   │   │   ├── models.py           # SQLAlchemy 数据模型
│   │   │   └── session.py          # 数据库会话管理
│   │   ├── rag/                    # RAG 工具
│   │   │   ├── chunk.py            # 文本切片
│   │   │   ├── embeddings.py       # 嵌入（ST 优先，哈希降级）
│   │   │   └── store.py            # Chroma 持久化存储
│   │   ├── schemas/                # Pydantic Schemas
│   │   │   ├── ticket.py           # 工单相关 schemas
│   │   │   ├── user.py             # 用户相关 schemas
│   │   │   └── kb.py               # 知识库 schemas
│   │   └── api/                    # API 路由
│   │       ├── router.py           # 主路由聚合
│   │       ├── tickets.py          # 工单 CRUD 接口
│   │       ├── users.py            # 用户 CRUD 接口
│   │       ├── kb.py               # 知识库 API（ingest/search/delete/items）
│   │       └── ai.py               # AI API（工单分类 + AI 初步回复）
│   ├── tests/                      # 测试代码
│   ├── requirements.txt            # Python 依赖
│   └── .env.example                # 环境变量模板
├── frontend/                       # React 前端应用
│   ├── src/
│   │   ├── main.tsx                # 前端入口
│   │   ├── App.tsx                 # 路由配置
│   │   ├── types/                  # TypeScript 类型定义
│   │   │   └── index.ts            # API 类型定义
│   │   ├── api/                    # API 服务层
│   │   │   ├── client.ts           # Axios 实例
│   │   │   ├── tickets.ts          # 工单 API
│   │   │   ├── users.ts            # 用户 API
│   │   │   ├── kb.ts               # 知识库 API
│   │   │   └── ai.ts               # AI 相关 API（工单建议）
│   │   ├── components/             # 公共组件
│   │   │   └── AppLayout.tsx       # 应用布局和导航
│   │   └── pages/                  # 页面组件
│   │       ├── Home.tsx            # 首页
│   │       ├── TicketList.tsx      # 工单列表页
│   │       ├── CreateTicket.tsx    # 创建工单页
│   │       ├── TicketDetail.tsx    # 工单详情页（含 AI 建议 + 回复）
│   │       └── KnowledgeBase.tsx   # 知识库管理页（导入 / 检索 / 删除）
│   ├── package.json                # npm 依赖
│   └── vite.config.ts              # Vite 配置（含代理）
├── infra/                          # 基础设施配置
│   └── docker-compose.yml          # Docker Compose 编排
├── scripts/                        # 工具脚本
│   ├── bootstrap.sh                # 环境初始化脚本
│   └── embed_kb.py                 # 知识库导入脚本
├── docs/                           # 文档（架构、配置、教程等）
├── 项目介绍.md                      # 项目背景与愿景
├── 课程大纲.md                      # 开发路线图
├── AGENTS.md                       # 代码规范与协作流程
├── samples/
│   └── kb/                         # 示例知识库文档
│       ├── faq_password_reset.md
│       ├── troubleshooting_login.md
│       ├── priority_guidelines.md
│       ├── billing_refund_policy.md
│       └── account_lockout.md
└── README.md                       # 本文件
```

## 快速开始

### 前置要求

- Python 3.11+
- Node.js 18+ (推荐使用 pnpm 或 npm)
- Docker & Docker Compose (可选，用于容器化部署)

### 本地开发

1. **安装依赖**
   ```bash
   make bootstrap
   ```
   该命令会自动创建 Python 虚拟环境、安装后端依赖，并安装前端依赖。

2. **配置环境变量**
   ```bash
   cd backend
   cp .env.example .env
   # 根据需要修改 .env 文件中的配置
   ```

3. **启动后端服务**
   ```bash
   make run-backend
   ```
   后端将运行在 `http://localhost:8000`
   - Swagger 文档: `http://localhost:8000/docs`
   - 健康检查: `http://localhost:8000/health`

4. **启动前端服务** (在新终端中)
   ```bash
   make run-frontend
   ```
   前端将运行在 `http://localhost:5173`

   **前端页面导航**:
   - 首页: `http://localhost:5173/`
   - 工单列表: `http://localhost:5173/tickets`
   - 创建工单: `http://localhost:5173/tickets/new`
   - 工单详情: `http://localhost:5173/tickets/{id}`
   - 知识库管理: `http://localhost:5173/kb`

5. **一键启动全栈** (可选，使用 Docker)
   ```bash
   make dev-up
   ```
   > 首次执行会构建镜像并安装依赖，完成后前端/后端/Chroma 将同时启动。
   > 停止服务: `make dev-down`

## 前端功能

### 工单列表页面 (`/tickets`)

- **功能特性**:
  - 表格展示所有工单（ID、标题、状态、优先级、标签、创建时间）
  - 状态过滤器（Open, In Progress, Resolved, Closed）
  - 优先级过滤器（Low, Medium, High, Urgent）
  - 分页器（可调整每页显示条数）
  - 状态和优先级使用彩色标签展示
  - 点击标题或 "View" 按钮跳转到详情页

- **操作**:
  - 点击 "New Ticket" 按钮创建新工单
  - 点击 "Refresh" 按钮刷新列表
  - 使用过滤器筛选工单

### 创建工单页面 (`/tickets/new`)

- **表单字段**:
  - 标题（必填）：工单简要描述
  - 内容（必填）：详细问题描述
  - 提交人（必填）：从下拉列表选择已有用户
  - 状态：默认 Open，可选其他状态
  - 优先级：默认 Medium，可选其他级别
  - 标签：逗号分隔的标签列表

- **功能**:
  - 实时表单验证
  - 提交成功后自动跳转到新工单详情页
  - 显示错误提示（如提交人不存在）

### 工单详情页面 (`/tickets/{id}`)

- **查看功能**:
  - 完整工单信息展示
  - 所有回复列表（按时间顺序）
  - 显示提交人和回复作者信息

- **AI 建议功能**:
  - 点击 “Generate” 调用后端 `/api/ai/tickets/{id}/suggest` 接口
  - 展示自动预测的工单类别、置信度、推荐优先级和标签
  - 展示基于知识库检索的片段列表
  - 一键将 “AI Draft Reply” 填充到下方回复表单中，便于人工微调后发送

- **编辑功能**:
  - 点击 "Edit" 按钮打开编辑模态框
  - 支持部分更新（只更新填写的字段）
  - 更新后自动刷新页面

- **删除功能**:
  - 点击 "Delete" 按钮弹出确认对话框
  - 确认后删除工单并返回列表页
  - 后端自动级联删除所有相关回复

- **回复功能**:
  - 选择回复作者
  - 输入回复内容
  - 提交后自动刷新回复列表

### 知识库页面 (`/kb`)

- **文档导入**:
  - 粘贴文本或上传 `.md/.txt` 文件
  - 可选切片（默认开启），支持配置窗口大小与重叠
  - 导入成功后显示插入的部分 ID
- **检索功能**:
  - 输入查询语句与 TopK 返回
  - 展示命中内容、元数据与距离
  - 支持按结果 ID 删除对应条目

## API 文档

### 路由前缀: `/api`

完整的 API 文档可通过 Swagger UI 访问: `http://localhost:8000/docs`

### 主要接口

#### 用户管理

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/users` | 创建用户 |
| GET | `/api/users` | 获取用户列表 (支持分页) |
| GET | `/api/users/{id}` | 获取单个用户详情 |

**创建用户示例:**
```bash
curl -X POST "http://localhost:8000/api/users" \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "name": "Alice"}'
```

#### 工单管理

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/tickets` | 创建工单 |
| GET | `/api/tickets` | 获取工单列表 (支持过滤、分页) |
| GET | `/api/tickets/{id}` | 获取单个工单详情 |
| PUT | `/api/tickets/{id}` | 更新工单 |
| DELETE | `/api/tickets/{id}` | 删除工单 |
| POST | `/api/tickets/{id}/replies` | 添加工单回复 |
| GET | `/api/tickets/{id}/replies` | 获取工单回复列表 |

**创建工单示例:**
```bash
curl -X POST "http://localhost:8000/api/tickets" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cannot login",
    "content": "I am unable to login with my account",
    "priority": "high",
    "status": "open",
    "tags": "login,auth",
    "requester_id": 1
  }'
```

**工单状态**: `open` | `in_progress` | `resolved` | `closed`
**优先级**: `low` | `medium` | `high` | `urgent`

**过滤与分页示例:**
```bash
GET /api/tickets?page=1&page_size=20&status=open&priority=high&requester_id=1
```

**更新工单示例:**
```bash
curl -X PUT "http://localhost:8000/api/tickets/1" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

#### 知识库与检索

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/kb/ingest` | 导入文档（支持切片）到 Chroma 集合 |
| POST | `/api/kb/search` | 相似度检索 |
| POST | `/api/kb/delete` | 按 ID 删除文档 |

更多演示示例参见 `docs/lesson-4.md`。

## 数据模型

### User (用户)
- `id`: 主键
- `email`: 邮箱 (唯一)
- `name`: 用户名
- `created_at`: 创建时间

### Ticket (工单)
- `id`: 主键
- `title`: 标题
- `content`: 内容详情
- `status`: 状态 (open, in_progress, resolved, closed)
- `priority`: 优先级 (low, medium, high, urgent)
- `tags`: 标签 (逗号分隔)
- `requester_id`: 提交人 ID (外键 → User)
- `created_at`: 创建时间
- `updated_at`: 更新时间

### Reply (回复)
- `id`: 主键
- `ticket_id`: 所属工单 ID (外键 → Ticket)
- `author_id`: 作者 ID (外键 → User)
- `content`: 回复内容
- `created_at`: 创建时间

## 测试

### 运行后端测试
```bash
make test-backend
# 或
cd backend && pytest tests/ -v
```

测试覆盖:
- 用户 CRUD
- 工单 CRUD (包含过滤、分页)
- 工单回复
- 级联删除 (删除工单时自动删除相关回复)
- 外键约束验证
 - 知识库导入与检索

完整测试用例: `backend/tests/test_tickets_crud.py`

### 前端开发测试

```bash
# 开发模式（带热更新）
cd frontend && npm run dev

# 类型检查
cd frontend && npm run build

# 代码检查
cd frontend && npm run lint
```

## 开发指南

### 常用命令

```bash
# 环境初始化
make bootstrap

# 开发模式 (推荐)
make run-backend  # 终端 1: 启动后端
make run-frontend # 终端 2: 启动前端

# Docker 容器化部署
make dev-up       # 启动所有服务
make dev-down     # 停止所有服务
make dev-logs     # 查看日志

# 测试
make test-backend # 运行后端测试

# 代码质量
make lint         # 代码检查
make format       # 代码格式化

# 导入示例知识库（使用脚本）
python scripts/embed_kb.py --path samples/kb --collection kb_main
```

### 环境变量配置

复制 `backend/.env.example` 到 `backend/.env` 并根据需要修改配置：

```bash
# 数据库配置
DATABASE_URL=sqlite+aiosqlite:///./astratickets.db

# 向量数据库配置
VECTOR_STORE_PATH=./vector_store

# SentenceTransformers 模型（可选，若安装了该依赖）
# SENTENCE_TRANSFORMERS_MODEL=sentence-transformers/all-MiniLM-L6-v2

# LLM 配置 (可选)
# OPENAI_API_KEY=sk-...
# LLM_PROVIDER=openai
```

## 技术特性

### 后端特性

- **现代 Python 实践**: 使用 `datetime.now(timezone.utc)` 替代已弃用的 `datetime.utcnow()`
- **类型安全**: SQLAlchemy 2.0+ 的 `Mapped[]` 类型注解
- **依赖注入**: FastAPI 的 `Depends()` 实现数据库会话管理
- **自动时间戳**: 创建和更新时间自动维护
- **级联删除**: 工单删除自动清理相关回复
- **枚举管理**: 使用 Python Enum 和 Literal 类型管理状态
- **RESTful API**: 标准的 HTTP 方法和状态码
- **参数验证**: Pydantic 自动验证请求数据

### 前端特性

- **TypeScript 严格模式**: 完整的类型定义和检查
- **组件化开发**: 可复用的 React 组件
- **路由管理**: React Router 实现单页应用导航
- **状态管理**: React Hooks（useState, useEffect）
- **响应式设计**: Ant Design 组件自适应布局
- **错误处理**: 统一的 API 错误处理和用户提示
- **开发代理**: Vite proxy 避免 CORS 问题
- **热模块替换**: 开发时即时更新

### 架构特性

- **前后端分离**: 独立开发、部署、扩展
- **API 优先**: RESTful API 设计
- **数据库无关**: 通过 SQLAlchemy 支持多种数据库
- **容器化就绪**: Docker 和 Docker Compose 配置
- **环境配置**: 通过 .env 文件管理环境变量

## 部署

### Docker Compose (推荐)

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 生产环境部署

1. **后端部署**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

2. **前端部署**:
   ```bash
   cd frontend
   npm install
   npm run build
   # 将 dist/ 目录部署到静态服务器（Nginx, Caddy, etc.）
   ```

3. **数据库**: 切换到 PostgreSQL 或 MySQL
   ```bash
   # 修改 backend/.env
   DATABASE_URL=postgresql://user:password@localhost:5432/astratickets
   ```
