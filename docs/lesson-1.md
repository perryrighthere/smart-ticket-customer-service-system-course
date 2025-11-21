# Lesson 1 · 项目启动与架构设计

## 课程目标
- 了解 AstraTickets 的业务范围：来单 → 分类 → 检索 → AI 首答 → 人工协同 → 统计看板。
- 熟悉技术选型：FastAPI + SQLite、React + Vite + Ant Design、Chroma 向量库、本地/云端 LLM。
- 完成本地开发环境搭建，并展示初步的前后端骨架和 Docker Compose 联调能力。

## 课堂流程
1. **项目演示**
   - 打开 `项目介绍.md` 与 `课程大纲.md`，讲解业务场景、课程节奏，并配合架构图说明端到端流程。
   - 运行 `make run-backend` 并访问 `http://localhost:8000/health`，展示 FastAPI 的健康检查与 `.env` 配置注入。
   - 运行 `make run-frontend`，展示 React 控制台中的技术栈卡片、里程碑时间线，说明 Lesson 1 仅用于讲解架构。

2. **技术选型拆解**
   - 后端：FastAPI + SQLAlchemy + SQLite（后续切换 MySQL/PostgreSQL），异步 ORM + Pydantic Settings（`backend/app/core/config.py`）。
   - 前端：Vite + React + TypeScript + AntD，代理 `/api` 到本地 8000 端口（`frontend/vite.config.ts`）。
   - AI / RAG：Chroma 向量库容器已在 `infra/docker-compose.yml` 中预留，等 Lesson 4 接入；LLM 通过环境变量切换供应商。

3. **环境搭建与脚手架**
   - 使用 `scripts/bootstrap.sh` 创建虚拟环境并安装双端依赖，强调命令幂等性。
   - 讲解 `Makefile` 命令：`make bootstrap`、`make run-backend`、`make run-frontend`、`make dev-up`、`make test-backend`。
   - 展示 `docker compose up --build` 如何同时拉起 backend / frontend / chroma，解释 volume 映射策略。

4. **代码结构导览**
   - 后端目录：`backend/app/main.py`（入口）、`backend/app/core/config.py`（应用配置）、`backend/tests/test_health.py`（示例单测）、`.env.example`（配置模板）。
   - 前端目录：`frontend/src/components/AppLayout.tsx`、`frontend/src/pages/Home.tsx`、`frontend/src/api/client.ts`，强调 AntD 布局与未来扩展位。
   - 协作规范：`AGENTS.md` 说明协作角色与交接流程，强调提交信息与测试约定。

## 代码架构速览
- **后端（backend/）**：`app` 目录按领域拆包，`core` 提供配置、日志、依赖注入工具，`api` 下按功能子目录挂载 FastAPI 路由；`tests` 保持 pytest 模式，健康检查示例指导后续扩展。
- **前端（frontend/）**：基于 Vite + React + TypeScript，`src/pages` 承载路由页面，`src/components` 封装布局与通用 UI，`src/api` 管理与后端的 HTTP 客户端与类型。
- **基础设施（infra/）**：Docker Compose 容器描述、网络与 volume 策略集中于此，统一管理本地与课堂演示环境。
- **脚本（scripts/）**：收敛环境初始化与运维脚本，`bootstrap.sh` 保证学员快速拉起依赖，后续将放置向量同步与测试 smoke 脚本。

## 项目结构树（代码骨架）
```
smart-ticket-customer-service-system/
├─ AGENTS.md                         协作与代码风格规范（对代理生效）
├─ Makefile                          常用开发命令入口
├─ README.md                         项目总览与快速开始
├─ 项目介绍.md                         业务与课程背景
├─ 课程大纲.md                         课程章节与目标
├─ backend/
│  ├─ .env.example                   后端环境变量模板
│  ├─ Dockerfile                     后端镜像构建文件
│  ├─ pyproject.toml                 Ruff/pytest 等工具配置
│  ├─ requirements.txt               依赖清单（课堂环境）
│  ├─ app/
│  │  ├─ __init__.py
│  │  ├─ main.py                     FastAPI 入口（挂载路由/中间件）
│  │  ├─ core/
│  │  │  └─ config.py                应用配置（Pydantic Settings）
│  │  └─ api/
│  │     └─ __init__.py              路由包（按领域新增模块：tickets/analytics/...）
│  └─ tests/
│     └─ test_health.py              健康检查示例测试
├─ frontend/
│  ├─ package.json                   前端依赖与脚本
│  ├─ package-lock.json              npm 锁文件（课堂环境）
│  ├─ pnpm-lock.yaml                 pnpm 锁文件（如切换包管器）
│  ├─ tsconfig.json                  TS 配置
│  ├─ tsconfig.node.json             Node 端 TS 配置
│  ├─ vite.config.ts                 Vite 配置（含 /api 代理）
│  ├─ index.html                     应用模板
│  └─ src/
│     ├─ main.tsx                    入口与路由挂载
│     ├─ App.tsx                     根组件/布局容器
│     ├─ index.css                   全局样式
│     ├─ api/
│     │  └─ client.ts                HTTP 客户端与基础拦截器
│     ├─ components/
│     │  └─ AppLayout.tsx            通用布局（AntD 布局/导航）
│     └─ pages/
│        └─ Home.tsx                 首页（Lesson 1 占位）
├─ infra/
│  └─ docker-compose.yml             本地联调编排（backend/frontend/chroma）
├─ scripts/
│  └─ bootstrap.sh                   初始化本地环境与依赖
├─ data/
│  └─ .gitkeep                       数据占位（放匿名数据集）
└─ research/
   └─ .gitkeep                       实验/调研笔记占位
```

5. **作业与预习**
   - 安装本地数据库（可选 MySQL/PostgreSQL）并准备 Lesson 2 所需的 ORM schema 草图。
   - 阅读 FastAPI Depends、SQLModel/SQLAlchemy ORM 基础；熟悉 AntD Table/Form 组件。
   - 思考工单实体所需字段（渠道、优先级、标签、状态）以及未来如何与 RAG 模块对接。

## 展示 Checklist
- [ ] 运行健康检查并展示响应 JSON。
- [ ] 展示前端 Lesson 1 UI，并说明后续页面占位。
- [ ] 运行 `make dev-up` 验证 Docker Compose 配置。
- [ ] 讲解目录结构与文档，确保学员能够在课后自行拉起环境。
