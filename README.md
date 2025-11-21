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
- **对话上下文与人工协同**:
  - 独立的工单聊天界面
  - 支持 AI 辅助生成回复并由人工确认发送
- **数据过滤与分页**: 支持按状态、优先级、提交人筛选
- **前端界面**:
  - 工单列表页（过滤、分页、状态标签）
  - 创建工单页（表单验证、用户选择）
  - 工单详情页（查看、编辑、删除、回复管理、实时聊天）
  - 知识库管理页（KB 导入、检索、删除）
  - 响应式布局和导航系统

### 规划中功能

- **统计看板**: 工单趋势分析、响应时间统计、满意度分析
- **用户鉴权**: JWT 登录认证

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

## API 文档

### 路由前缀: `/api`

完整的 API 文档可通过 Swagger UI 访问: `http://localhost:8000/docs`

### 主要接口

#### 工单管理

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/tickets` | 创建工单 |
| GET | `/api/tickets` | 获取工单列表 (支持过滤、分页) |
| GET | `/api/tickets/{id}` | 获取单个工单详情 |
| PUT | `/api/tickets/{id}` | 更新工单 |
| DELETE | `/api/tickets/{id}` | 删除工单 |
| POST | `/api/tickets/{id}/messages` | 发送工单消息 |
| GET | `/api/tickets/{id}/messages` | 获取工单消息列表 |

#### 知识库与检索

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/kb/ingest` | 导入文档（支持切片）到 Chroma 集合 |
| POST | `/api/kb/search` | 相似度检索 |
| POST | `/api/kb/delete` | 按 ID 删除文档 |

#### AI 智能服务

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/ai/tickets/{id}/suggest` | 生成工单分类与回复建议 |
| POST | `/api/ai/chat` | RAG 增强对话 |

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
