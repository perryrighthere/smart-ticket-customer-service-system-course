# AstraTickets

> 企业级 AI 智能客服工单系统教学项目 — 第 1 节：项目启动与架构设计

## 项目简介
AstraTickets 是一个覆盖 “来单 → 分类 → 检索 → AI 首答 → 人工协同 → 看板” 全链路的企业级智能客服工单系统。本仓库当前定位在课程第 1 节，完成了技术选型、架构拆解以及本地开发环境的骨架搭建，便于课堂演示与后续迭代。

### 技术选型
- **后端**：FastAPI、SQLAlchemy、SQLite（后续可切换 MySQL/PostgreSQL）
- **前端**：React 18、Vite、TypeScript、Ant Design
- **向量检索**：Chroma（Docker 中预留，Lesson 4 起使用）
- **AI 模块**：LLM 提供者可插拔（OpenAI / DeepSeek / Qwen / 本地模型）

## 项目结构
```
.
├── backend/          # FastAPI 应用、配置、健康检查示例
├── frontend/         # Vite + React + AntD 控制台骨架
├── infra/            # docker-compose，统一拉起前后端 + Chroma
├── scripts/          # 环境初始化脚本
├── docs/             # Lesson 1 架构说明
├── 项目介绍.md / 课程大纲.md
└── AGENTS.md         # 仓库协作规范
```

## 快速开始
1. **安装依赖**
   ```bash
   make bootstrap
   ```
2. **启动 FastAPI 后端**
   ```bash
   make run-backend
   ```
3. **启动 React 前端**
   ```bash
   make run-frontend
   ```
4. **一键启动全栈（可选）**
   ```bash
   make dev-up
   ```
   > 首次执行会在容器内运行 `npm install`，需要网络访问 NPM，完成后前端/后端/Chroma 将同时启动。

访问 `http://localhost:8000/health` 验证 API，或在浏览器打开 `http://localhost:5173` 查看 Lesson 1 展示界面。

## 架构速览
- **前端**：展示课程里程碑与技术栈卡片，提供后续 Ticket UI 的容器。
- **后端**：FastAPI 暴露系统健康检查与即将拓展的工单接口，使用 `.env` 注入配置。
- **Chroma**：Docker 预拉起，等待 Lesson 4 注入嵌入向量。
- **LLM 接口**：暂未接入，Lesson 5 起通过环境变量启用。