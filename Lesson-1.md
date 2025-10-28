# Lesson-1

### 算法岗就业现状

纯算法岗位，数量少+要求极高

AI 应用开发：

- 软件开发
- 调用 AI 接口（OpenAI、Claude）
- 包装成服务

### 项目名称

**AstraTickets | 企业级 AI 智能客服工单系统**

从“来单 -> 分类 -> 检索 -> AI 首次回答 -> 过滤回答 -> 最终回答 -> 统计看板”全链路落地

### 技术选型

- 后端：FastAPI + SQLAlchemy + SQLite （构建后端服务）
- 前端：Vite  + React + Typescript
- AI / RAG：Chroma 向量库，AI 部分较为灵活，通过环境变量（前端选择）切换模型

| 技术       | 类型              | 作用                 |
| ---------- | ----------------- | -------------------- |
| FastAPI    | Python Web 框架   | 后端 API 开发        |
| React      | JavaScript 前端库 | 构建用户界面         |
| SQLAlchemy | Python ORM 库     | 数据库操作           |
| LangChain  | Python AI 框架    | 大模型应用开发       |
| Vite       | 前端构建工具      | 打包                 |
| Chroma     | 向量数据库        | 为 AI 提供知识库检索 |

### 代码结构

- 后端目录：`backend/app/main.py`（入口）、`backend/app/core/config.py`（应用配置）、`.env.example`（配置模板）
- 前端目录：`frontend/src/components/AppLayout.tsx`前端页面布局

```
├─ Makefile                          常用开发命令入口
├─ README.md                         项目总览与快速开始
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

### 作业与预习

- 安装本地数据库（可选 MySQL/PostgresSQL）
- 阅读 SQLModel/SQLAlchemy ORM 基础
- 思考工单系统所需的字段内容（渠道、优先级、标签、状态）以及未来如何将这些字段与 AI 对接