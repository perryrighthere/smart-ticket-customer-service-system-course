# AstraTickets

> 企业级 AI 智能客服工单系统

## 项目简介

AstraTickets 是一个覆盖 **"来单 → 分类 → 检索 → AI 首答 → 人工协同 → 看板"** 全链路的企业级智能客服工单系统。本项目采用前后端分离架构，结合 RAG (检索增强生成) 和大语言模型，实现智能化的客服工单管理。

## 核心功能

- **用户管理**: 创建、查询、列表
- **工单管理**: CRUD、状态跟踪、优先级管理、标签分类
- **工单回复**: 多轮对话支持
- **数据过滤与分页**: 支持按状态、优先级、提交人筛选
- **RAG 知识库检索**: 基于 Chroma + SentenceTransformers (开发中)
- **AI 智能分类**: 自动工单分类 (开发中)
- **AI 智能回复**: LLM 自动生成初步回复 (开发中)
- **人工协同**: AI 建议 + 人工审核修改 (开发中)
- **统计看板**: 工单趋势、响应时间、满意度分析 (开发中)

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
- **UI 库**: Ant Design
- **状态管理**: React Context / Zustand (待接入)

### AI/数据模块
- **向量数据库**: Chroma
- **嵌入模型**: SentenceTransformers
- **LLM**: 可插拔 (OpenAI / DeepSeek / Qwen / 本地模型)
- **RAG 框架**: LangChain / LlamaIndex

### 基础设施
- **容器化**: Docker, Docker Compose
- **缓存**: Redis (可选)
- **消息队列**: Celery + Redis (可选)

## 项目结构
```
.
├── backend/          # FastAPI 应用、配置、健康检查示例 + Lesson 2 CRUD
├── frontend/         # Vite + React + AntD 控制台骨架
├── infra/            # docker-compose，统一拉起前后端 + Chroma
├── scripts/          # 环境初始化脚本
├── docs/             # Lesson 1 架构说明
├── 项目介绍.md / 课程大纲.md
└── AGENTS.md         # 仓库协作规范
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

5. **一键启动全栈** (可选，使用 Docker)
   ```bash
   make dev-up
   ```
   > 首次执行会构建镜像并安装依赖，完成后前端/后端/Chroma 将同时启动。
   > 停止服务: `make dev-down`

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
```

测试覆盖:
- 用户 CRUD
- 工单 CRUD (包含过滤、分页)
- 工单回复
- 级联删除 (删除工单时自动删除相关回复)

完整测试用例: `backend/tests/test_tickets_crud.py`

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
```

### 环境变量配置

复制 `backend/.env.example` 到 `backend/.env` 并根据需要修改配置：

```bash
# 数据库配置
DATABASE_URL=sqlite+aiosqlite:///./astratickets.db

# 向量数据库配置
VECTOR_STORE_PATH=./vector_store

# LLM 配置 (可选)
# OPENAI_API_KEY=sk-...
# LLM_PROVIDER=openai
```

## 部署

### Docker Compose (推荐)

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 手动部署

参考 `docs/deployment.md` (待补充)
