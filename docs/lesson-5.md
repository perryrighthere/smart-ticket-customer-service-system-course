# Lesson 5 · AI 智能分类与回复生成

本节课将为系统注入真正的“智能之脑”。我们将结合轻量级分类模型与大型语言模型（LLM），实现两大核心 AI 功能：
1.  **工单自动分类**：根据工单内容（标题+正文）自动预测其类别、优先级和标签。
2.  **AI 初步回复**：结合分类结果和 Lesson 4 构建的 RAG 知识库，调用 LLM 生成高质量的初步答复草稿。

此外，我们还将实现一个更高级的、支持多轮对话的 **RAG 聊天机器人 API**，为未来的客服聊天机器人功能打下基础。

## 技术要点

- **工单分类**：
    - **首选方案**：`scikit-learn`。使用 `TfidfVectorizer` + `LogisticRegression` 在首次使用时自动训练一个内存中的微型分类模型。
    - **降级兼容**：当 `scikit-learn` 未安装时，自动切换到基于关键词规则的简单分类器，确保核心流程可用。
- **LLM 集成**：
    - **驱动方式**：通过 `httpx` 调用任何兼容 OpenAI API 标准的 LLM 推理服务（如本地 Ollama、云端 DeepSeek/Qwen 等）。
    - **配置管理**：通过 `.env` 文件集中管理 LLM provider, base_url, model, api_key，并支持 API 请求级别的参数覆盖，便于调试和演示。
- **提示词工程 (Prompt Engineering)**：
    - **结构化提示词**：精心设计 Prompt 模板，将 `工单内容`、`预测类别`、`知识库片段 (RAG)` 等上下文信息整合，引导 LLM 生成更精准、更具上下文感知能力的回复。
- **RAG 增强聊天**：
    - 新增独立的聊天 API，支持传入用户问题、历史对话和知识库配置，实现带引用的、基于知识库的问答。

## 代码结构

```
backend/app/
│   ├── ai/
│   │   ├── classifier.py     # 工单分类器（scikit-learn 优先，关键词降级）
│   │   ├── llm.py            # LLM 客户端与提示词构建
│   │   └── service.py        # AI 服务编排（分类 + RAG + LLM 生成）
│   ├── api/
│   │   └── ai.py             # 新增 AI 相关 API Endpoints
│   └── schemas/
│       └── ai.py             # AI 功能相关的 Pydantic 模型
```

## 运行与演示

### 1. 前提：启动本地 LLM 服务

**强烈推荐** 使用 [Ollama](https://ollama.com/) 在本地运行一个小模型。这能让你在完全离线的环境中完成本课程。

打开终端，执行以下命令下载并运行一个轻量级模型（推荐 `qwen:4b`）：
```bash
# 如果你已安装 Ollama，直接运行
ollama run qwen:4b
```
看到 `>>> Send a message (/? for help)` 提示即表示模型已成功运行在 `http://localhost:11434`。

### 2. 配置后端 `.env` 文件

在 `backend/.env` 文件中，添加以下配置，告诉系统如何连接到你本地的 Ollama 服务：

```dotenv
# --- LLM Provider Settings for Lesson 5 ---
LLM_PROVIDER=qwen
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=qwen:4b
QWEN_API_KEY=ollama  # Ollama 默认接受任意字符串作为 key
```

### 3. （可选）安装 `scikit-learn` 以获得更优分类效果

为了体验更高质量的工单分类，建议安装 `scikit-learn`。
```bash
# 激活虚拟环境
source .venv/bin/activate

# 安装 scikit-learn
pip install scikit-learn
```
不安装也完全不影响主流程，系统会自动降级为关键词分类。

### 4. 启动服务

确保你的知识库（Lesson 4）已经导入数据。然后像之前一样启动前后端服务。
```bash
# 终端 1: 启动后端
make run-backend

# 终端 2: 启动前端
make run-frontend
```

### 5. 通过 API 演示 AI 建议功能

假设我们有一个 ID 为 `1` 的工单。我们可以调用新的 API 来为它生成 AI 建议。

```bash
curl -s -X POST 'http://localhost:8000/api/ai/tickets/1/suggest' \
  -H 'Content-Type: application/json' \
  -d '{}' | jq
```

**预期响应**：
你会收到一个 JSON 对象，其中包含了 AI 的全方位建议。

```json
{
  "ticket_id": 1,
  "category": "password_reset",
  "confidence": 0.85,
  "suggested_priority": "medium",
  "suggested_tags": [
    "password",
    "auth"
  ],
  "ai_reply": "Hello! I see you're having trouble with an expired password reset link. To resolve this, you'll need to request a new one. Please go to the login page and click the 'Forgot Password' link again. A new link will be sent to your email address.",
  "kb_snippets": [
    "Password reset links are valid for 24 hours. If a link expires, you must request a new one by repeating the 'Forgot Password' process."
  ]
}
```
这个响应可以直接用于在前端页面展示“AI 建议”卡片。

### 6. 通过 API 演示 RAG 聊天功能

我们还可以调用新增的 `/chat` 接口，体验更强大的 RAG 对话能力。

```bash
curl -s -X POST http://localhost:8000/api/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "My account is locked, what should I do?",
    "collection": "kb_main",
    "n_results": 2
  }' | jq
```

**预期响应**：
LLM 会基于从知识库中检索到的信息，并像 gerçek 客服一样带引用地回答。

```json
{
  "query": "My account is locked, what should I do?",
  "answer": "If your account is locked, you should first wait for 15 minutes before attempting to log in again, as most temporary lockouts resolve on their own [Source 1]. If you are still unable to access your account after this period, please contact customer support for assistance [Source 2].",
  "kb_sources": [
    "Account Lockout Policy",
    "Troubleshooting Login Issues"
  ],
  "kb_snippets": [
    "Source 1: Most account lockouts are temporary and last for 15 minutes. Please wait before trying again.",
    "Source 2: For persistent lockouts, you must contact a support agent to manually unlock your account."
  ]
}
```

## 架构与数据流

**工单建议 (`/suggest`) 流程**：
1.  **API 触发**：前端请求 `POST /api/ai/tickets/{id}/suggest`。
2.  **获取工单**：从数据库加载工单实体。
3.  **文本分类**：`ai.service` 调用 `ai.classifier` 对工单标题和内容进行分类，得到 `category` 和 `confidence`。
4.  **RAG 检索**：使用工单内容作为查询，调用 `rag.store.similarity_search` 从 ChromaDB 检索最相关的 `kb_snippets`。
5.  **规则映射**：根据分类结果，`ai.service` 将 `category` 映射为预设的 `priority` 和 `tags`。
6.  **LLM 调用**：`ai.service` 调用 `ai.llm.generate_reply`，将工单、分类、知识库片段组装成一个结构化 Prompt。
7.  **生成回复**：`ai.llm` 向配置的 LLM 服务（如 Ollama）发送 API 请求，获取 `ai_reply`。
8.  **返回结果**：API 将所有生成的信息（分类、优先级、标签、AI 回复、知识库片段）组合成 `TicketAISuggestionResponse` 返回给前端。

## 模块深度解析

### `ai.classifier`：智能与兼容并存的分类器

这是一个设计精巧的模块。它通过 `try-except` 实现了对 `scikit-learn` 的可选依赖。
- **如果 `scikit-learn` 存在**：它会利用内置的一小份训练数据（`_TRAIN_TEXTS`, `_TRAIN_LABELS`）即时训练一个 TF-IDF + 逻辑回归模型。这提供了不错的分类精度。
- **如果 `scikit-learn` 不存在**：它会回退到 `_predict_keywords` 方法，该方法基于简单的关键词匹配规则进行分类。虽然简单，但足以保证核心功能的演示和运行。

这种“优雅降级”的设计是企业级项目中常见的实践，既保证了最佳性能，又降低了初次部署的门槛。

### `ai.llm`：灵活的 LLM 客户端与提示词艺术

- **`_build_prompt` / `_build_chat_prompt`**：这两个函数是提示词工程的核心。它们不仅仅是简单地把用户问题扔给 LLM，而是扮演“结构化指令官”的角色。通过添加角色扮演（`You are a helpful support agent.`）、明确任务、提供上下文（分类、知识库片段）和输出要求（`Reply in the same language`），极大地提升了 LLM 输出的质量和稳定性。
- **`LLMConfigOverride`**：这个 Pydantic 模型允许 API 请求临时覆盖 `.env` 中的 LLM 配置。这在教学或演示中非常有用，例如，你可以在前端添加几个输入框，让用户动态切换不同的模型或 API endpoint，而无需重启后端服务。

## 小结与展望

至此，我们的系统已经具备了智能工单处理的核心能力。它能自动分析工单、从知识库中寻找答案，并生成初步回复，将客服人员从重复性工作中解放出来。

在接下来的课程中，我们将把这些强大的后端 AI 能力无缝对接到前端界面中，打造一个 AI 辅助的人工客服工作台。
