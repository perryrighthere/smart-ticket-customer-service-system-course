# Lesson 4 · 引入本地 RAG 检索增强模块

本节引入本地 RAG（检索增强）能力，基于 ChromaDB 作为向量存储，实现：

- 文档切片（chunking）与持久化存储
- 向量化（优先使用 SentenceTransformers；无该依赖时使用轻量哈希向量降级）
- 相似度检索 API（语义检索/关键词近似检索）

## 技术要点

- 向量库：Chroma（Python 内嵌，持久化路径见 `VECTOR_STORE_PATH`）
- 向量化：
  - 首选 `sentence-transformers/all-MiniLM-L6-v2`（可选依赖，需网络下载模型）
  - 无法使用时，自动降级为无依赖的哈希向量器（用于教学与本地演示）
- 文本切片：段落 + 窗口滑动（600 字符窗口，80 字符重叠，均可配置）

## 代码结构

```
backend/app/rag/
├── chunk.py            # 文本切片
├── embeddings.py       # 向量化（ST 优先，哈希降级）
└── store.py            # Chroma 持久化存取与搜索

backend/app/api/kb.py   # KB API：/api/kb/ingest, /api/kb/search, /api/kb/delete
backend/app/schemas/kb.py
scripts/embed_kb.py     # 本地批量导入脚本（读取 samples/kb/*.md|*.txt）
samples/kb/*.md         # 示例知识库
```

## 运行与演示（基于示例文档）

1) 安装依赖（含 `chromadb`）
```bash
make bootstrap
```

2) 启动后端 + 前端
```bash
make run-backend
make run-frontend
```

3) 导入示例知识库（samples）
```bash
# 使用 samples/kb 目录下的示例文档（.md）
python scripts/embed_kb.py --path samples/kb --collection kb_main --max-chars 600 --overlap 80
```

4) 通过 API 检索（或在前端 /kb 页面体验）
```bash
curl -s http://localhost:8000/api/kb/search \
  -H 'Content-Type: application/json' \
  -d '{"collection":"kb_main","query":"reset password link expire", "n_results":3}' | jq
```

5) 前端演示路径
- 打开 `http://localhost:5173/kb`
- 在左侧“导入”卡片中：
  - 可直接粘贴文本，或不粘贴改为使用“上传文件”选择 `samples/kb` 下的任意 `.md` 文档
  - 保持“Chunk”开启（可调整 `Max Chars` 与 `Overlap`）
  - 点击“ Ingest ”后，右下会提示导入成功并显示部分插入的 ID
- 在右侧“检索”卡片中：
  - 输入查询，例如：`reset password link expire` 或 `account lockout unlock` 或 `refund policy`
  - 点击“Search”，列表将展示命中文本、元数据与距离
  - 可直接点击“Delete”按 ID 删除某条记录

## API 说明

路由前缀：`/api/kb`

- `POST /ingest`
  - 请求：
    ```json
    {
      "collection": "kb_main",
      "chunk": true,
      "max_chars": 600,
      "overlap": 80,
      "documents": [
        {"id": "doc1", "text": "...", "metadata": {"source": "faq"}}
      ]
    }
    ```
  - 响应：返回插入的 `inserted_ids` 与 `chunks_added`。

- `POST /search`
  - 请求：`{"collection":"kb_main","query":"...","n_results":5}`
  - 响应：`matches` 数组，包含 `text`/`metadata`/`distance`。

- `POST /delete`
  - 请求：`{"collection":"kb_main","ids":["doc_1", "doc_2"]}`
  - 响应：删除数量。

## 可选：更高质量嵌入

若网络环境允许，可安装并启用 SentenceTransformers：
```bash
pip install sentence-transformers
```
默认模型：`sentence-transformers/all-MiniLM-L6-v2`（可通过环境变量覆盖）。首次运行将下载权重。

## 小结与展示建议

至此，系统具备本地可运行的知识库构建与相似度检索能力。

演示建议：
- 先在 samples/kb 中挑选 2–3 篇文档导入，展示切片后插入的数量与部分 ID；
- 使用“常见问题”类查询（如 reset、lockout、refund），对比不同查询词的命中片段；
- 在前端页面上删除某条命中项，再次检索对比结果差异；
- 若网络允许，切换到 SentenceTransformers 模型并对比效果。

---

## 架构与数据流（更详细）

- Ingest：前端上传/粘贴 → 后端切片（chunk）→ 向量化 → 写入 Chroma（ids、documents、embeddings、metadatas）。
- Search：前端 query → 后端向量化 → Chroma 相似度检索 → 返回 `documents`、`metadatas`、`distances`、`ids`。
- Manage：分页列出/批量删除（保持库整洁）。

后端模块职责：
- `rag/chunk.py`：切片策略（window、punctuation）。
- `rag/embeddings.py`：向量化（SentenceTransformers 优先，哈希降级）。
- `rag/store.py`：Chroma 增删改查与分页、检索封装；处理空 metadata 的兼容逻辑。
- `rag/utils.py`：标题抽取、稳定 `doc_id` 生成。
- `api/kb.py`：/ingest、/search、/delete、/items 四个接口。

前端页面（`/kb`）：
- 导入（可配置 chunk 策略与参数）。
- 检索（显示 title、id、distance、元数据）。
- Stored Chunks（分页、刷新、批量删除）。

## 向量化（Embeddings）更深入

- SentenceTransformers（推荐）
  - `all-MiniLM-L6-v2`（384 维），对话/FAQ 类文本表现良好，默认开启归一化（normalize_embeddings）。
  - 环境允许时安装：`pip install sentence-transformers`；通过 `SENTENCE_TRANSFORMERS_MODEL` 可替换模型。

- 哈希向量器（教学用途）
  - 依赖为零、即用即走；通过 token hashing 形成稀疏表达，便于环境受限时跑通演示。
  - 语义效果有限、distance 分布可能较“粗”，但配合小样本即可展示端到端流程。

选择建议：有网/生产 → ST；离线/快速演示 → 哈希。

## Vector Store（Chroma）要点

- 持久化路径：`VECTOR_STORE_PATH`；容器中请挂载到宿主机路径以保留数据。
- 字段设计：
  - `ids`：每个 chunk 的唯一 id。
  - `documents`：chunk 文本（前端展示摘要）。
  - `embeddings`：向量（来源于 ST 或哈希）。
  - `metadatas`：字典，存放 `title`、`doc_id`、`filename` 等。
- 检索结果的 `distance`：后端定义“越小越相似”；不同向量器表现不同，无需拘泥具体度量。
- 兼容细节：当所有 `metadatas` 为空时需省略该参数；本项目已在 `store.add_documents` 中处理。

## 切片策略与参数（更详细）

- window（默认）：
  - 先按空行切段，再滑动窗口；建议 `max_chars=400~800`、`overlap=40~120`。
  - 适合一般技术/FAQ 文档；`overlap` 可保留跨句/跨段信息。

- punctuation：
  - 按分隔符（默认 `。！？?!`）切句，再按 `max_chars` 聚合；语义更完整。
  - 适合结构强、句边界明确的文本；中文可追加 `；`，英文可追加 `.!?;:`。

调参思路：
- 若召回过碎 → 增大 `max_chars` 或减少分隔符。
- 若召回过泛 → 减小 `max_chars` 或改用 punctuation 保证语义完整。

## 元数据（title / doc_id）与展示一致性

- `title` 提取优先级：front matter `title:` > Markdown 一级标题 > 首行非空文本。
- `doc_id`：基于 `title+全文` 的稳定哈希，利于后续合并/追踪；同一文档的所有 chunk 使用相同 `title`/`doc_id`。
- 前端 Stored Chunks 与检索结果均展示 `metadata.title`，避免出现 `doc_0` 这类无语义信息的标题。

## 批量管理与分页

- 列表接口：`GET /api/kb/items?collection=kb_main&limit=10&offset=0` 返回 `{ total, items }`，用于分页展示。
- 批量删除：勾选后统一调用 `POST /api/kb/delete`，支持一次性删除多个 `ids`。

## 评估与调优建议

- 制作问答对，统计 Top-K 命中率与位置；迭代 `chunk_strategy/max_chars/overlap`。
- 观测 distance 分布：相似对应该明显小于不相似对。
- 向量库膨胀：重复导入会增长 chunk 数量；请配合批量删除保持整洁。

## 运维与配置

- 环境变量
  - `VECTOR_STORE_PATH`：Chroma 存储路径（默认 `./vector_store`）。
  - `SENTENCE_TRANSFORMERS_MODEL`：可覆盖默认模型。
- Docker：`infra/docker-compose.yml` 已包含 chroma 与后端/前端；建议挂载向量库目录。

## 常见问题（Troubleshooting）

- 集合名无效（400）：
  - 必须 3–512 字符，仅含 `[A-Za-z0-9._-]`，且首尾为字母或数字；本项目默认 `kb_main`。
- metadata 为空：
  - Chroma 要求非空字典；本项目在存储层自动忽略“全空”元数据列表。
- 搜索报错 `NoneType`：
  - 已改用健壮的结果提取；若仍遇到，请确认集合中确有数据且查询参数正确。
