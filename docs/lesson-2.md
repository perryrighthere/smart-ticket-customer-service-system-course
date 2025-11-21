# Lesson 2 · 后端基础与工单模型设计

## 课程目标
- 掌握 FastAPI 路由与依赖注入机制
- 设计并实现工单系统的数据库模型（User、Ticket、Reply）
- 开发完整的 RESTful CRUD API
- 理解 ORM (SQLAlchemy) 的使用与最佳实践
- 实践 API 测试驱动开发

## 课堂演示步骤

### 准备工作
1. 启动后端服务
   ```bash
   make run-backend
   ```

2. 在浏览器打开 Swagger UI
   ```
   http://localhost:8000/docs
   ```

### 演示流程（使用 Swagger UI）

**Step 1: 创建用户**
- 找到 `POST /api/users` 接口
- 点击 "Try it out"
- 输入 Request body：
  ```json
  {
    "email": "alice@example.com",
    "name": "Alice"
  }
  ```
- 点击 "Execute"
- 记下返回的 `id`（例如：1）

**Step 2: 创建工单（绑定到用户）**
- 找到 `POST /api/tickets` 接口
- 点击 "Try it out"
- 输入 Request body：
  ```json
  {
    "title": "系统无法登录",
    "content": "尝试登录时提示密码错误",
    "priority": "high",
    "status": "open",
    "tags": "login,auth",
    "requester_id": 1
  }
  ```
  **注意**：`requester_id` 必须是存在的用户 ID，否则会返回 404 错误
- 点击 "Execute"
- 记下返回的工单 `id`（例如：1）
- 观察返回结果中包含了 `requester_id` 字段

**Step 3: 查询工单列表（演示过滤）**
- 找到 `GET /api/tickets` 接口
- 点击 "Try it out"
- 填写参数：
  - `status`: open
  - `priority`: high
  - `page`: 1
  - `page_size`: 10
- 点击 "Execute"
- 查看返回的工单列表

**Step 4: 更新工单状态**
- 找到 `PUT /api/tickets/{ticket_id}` 接口
- 点击 "Try it out"
- 填写 `ticket_id`: 1
- 输入 Request body：
  ```json
  {
    "status": "in_progress"
  }
  ```
- 点击 "Execute"
- 查看 `updated_at` 字段已更新

**Step 5: 添加回复**
- 找到 `POST /api/tickets/{ticket_id}/replies` 接口
- 点击 "Try it out"
- 填写 `ticket_id`: 1
- 输入 Request body：
  ```json
  {
    "author_id": 1,
    "content": "我们正在调查这个问题"
  }
  ```
- 点击 "Execute"

**Step 6: 查询回复列表**
- 找到 `GET /api/tickets/{ticket_id}/replies` 接口
- 点击 "Try it out"
- 填写 `ticket_id`: 1
- 点击 "Execute"
- 查看刚刚添加的回复

**Step 7: 删除工单（演示级联删除）**
- 找到 `DELETE /api/tickets/{ticket_id}` 接口
- 点击 "Try it out"
- 填写 `ticket_id`: 1
- 点击 "Execute"
- 返回 204 No Content 表示删除成功
- 再次执行 `GET /api/tickets/{ticket_id}/replies`，返回 404 证明回复被级联删除

**Step 8: 运行测试**
```bash
make test-backend
# 或者详细模式
cd backend && pytest tests/test_tickets_crud.py -v
```

### 补充：使用 curl 命令行演示（可选）

如果需要演示 curl 命令，可以使用以下方式：

```bash
# 1. 创建用户
curl -X POST "http://localhost:8000/api/users" \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "name": "Alice"}'

# 2. 创建工单
curl -X POST "http://localhost:8000/api/tickets" \
  -H "Content-Type: application/json" \
  -d '{"title": "系统无法登录", "content": "尝试登录时提示密码错误", "priority": "high", "status": "open", "tags": "login,auth", "requester_id": 1}'

# 3. 查询工单（带过滤）
curl "http://localhost:8000/api/tickets?status=open&priority=high&page=1&page_size=10"

# 4. 更新工单
curl -X PUT "http://localhost:8000/api/tickets/1" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'

# 5. 添加回复
curl -X POST "http://localhost:8000/api/tickets/1/replies" \
  -H "Content-Type: application/json" \
  -d '{"author_id": 1, "content": "我们正在调查这个问题"}'
```

### 代码讲解顺序
1. `backend/app/core/config.py` - 配置管理（重点：database_url）
2. `backend/app/db/session.py` - 会话管理与数据库初始化
3. `backend/app/db/models.py` - 数据模型与关系
4. `backend/app/schemas/ticket.py` - Pydantic Schema 分层
5. `backend/app/api/tickets.py` - CRUD 实现与依赖注入
6. `backend/tests/test_tickets_crud.py` - 测试用例

### 数据存储说明

**重要：Lesson 2 使用 SQLite 嵌入式数据库**

- **无需启动数据库服务**：SQLite 是文件型数据库
- **数据文件位置**：`backend/astratickets.db`
- **表结构**：应用启动时通过 `init_models()` 自动创建
- **数据持久化**：每次 `session.commit()` 后数据写入文件

查看数据库内容：
```bash
# 查看所有表
sqlite3 backend/astratickets.db ".tables"

# 查看用户数据
sqlite3 backend/astratickets.db "SELECT * FROM users;"

# 查看工单数据
sqlite3 backend/astratickets.db "SELECT * FROM tickets;"

# 查看工单和用户的关联（JOIN 查询）
sqlite3 backend/astratickets.db "
  SELECT t.id, t.title, t.status, t.priority,
         u.name AS requester_name, u.email AS requester_email
  FROM tickets t
  JOIN users u ON t.requester_id = u.id;
"

# 查看工单的所有回复
sqlite3 backend/astratickets.db "
  SELECT r.id, r.content, r.created_at,
         u.name AS author_name,
         t.title AS ticket_title
  FROM replies r
  JOIN users u ON r.author_id = u.id
  JOIN tickets t ON r.ticket_id = t.id;
"

# 查看表结构（验证外键约束）
sqlite3 backend/astratickets.db ".schema tickets"
```

**关系说明**：
- Ticket.requester_id → User.id (外键)
- Reply.author_id → User.id (外键)
- Reply.ticket_id → Ticket.id (外键，级联删除)

**生产环境建议**：后续课程会切换到 PostgreSQL/MySQL，需要启动独立数据库服务。

## 课程内容

### 1. 数据库模型设计

#### 实体关系分析
```
User (用户)
  ├── 1:N → Ticket (作为提交人)
  └── 1:N → Reply (作为回复作者)

Ticket (工单)
  ├── N:1 → User (提交人)
  └── 1:N → Reply (工单回复)

Reply (回复)
  ├── N:1 → Ticket (所属工单)
  └── N:1 → User (回复作者)
```

#### 核心模型实现 (backend/app/db/models.py)

**User 模型**
- `id`: 主键，自增
- `email`: 邮箱，唯一索引
- `name`: 用户名，可选
- `created_at`: 创建时间，自动生成

**Ticket 模型**
- `id`: 主键，自增
- `title`: 工单标题
- `content`: 工单详情
- `status`: 工单状态 (open, in_progress, resolved, closed)
- `priority`: 优先级 (low, medium, high, urgent)
- `tags`: 标签，逗号分隔（Lesson 2 简化方案）
- `requester_id`: 提交人外键
- `created_at`: 创建时间
- `updated_at`: 更新时间（自动维护）

**Reply 模型**
- `id`: 主键，自增
- `ticket_id`: 工单外键
- `author_id`: 作者外键
- `content`: 回复内容
- `created_at`: 创建时间

#### 关键技术点

1. **枚举类型管理**
   ```python
   class TicketStatus(str, Enum):
       open = "open"
       in_progress = "in_progress"
       resolved = "resolved"
       closed = "closed"
   ```

2. **时间戳最佳实践**
   ```python
   from datetime import datetime, timezone
   
   def utcnow() -> datetime:
       return datetime.now(timezone.utc)
   
   created_at: Mapped[datetime] = mapped_column(
       DateTime(timezone=True), 
       default=utcnow
   )
   ```

3. **级联删除配置**
   ```python
   replies: Mapped[list["Reply"]] = relationship(
       back_populates="ticket", 
       cascade="all, delete-orphan"
   )
   ```

### 2. Pydantic Schemas 设计

#### Schema 分层策略

- **Base**: 共享的基础字段
- **Create**: 创建时需要的字段（含外键）
- **Update**: 更新时的可选字段
- **Read**: 返回给客户端的字段（含 ID 和时间戳）

#### 示例：Ticket Schemas (backend/app/schemas/ticket.py)

```python
class TicketBase(BaseModel):
    title: str
    content: str
    status: TicketStatus | None = "open"
    priority: TicketPriority | None = "medium"
    tags: str | None = None

class TicketCreate(TicketBase):
    requester_id: int  # 创建时必须指定提交人

class TicketUpdate(BaseModel):
    # 更新时所有字段都是可选的
    title: str | None = None
    content: str | None = None
    status: TicketStatus | None = None
    priority: TicketPriority | None = None
    tags: str | None = None

class TicketRead(TicketBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    requester_id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None
```

### 3. FastAPI 路由与 CRUD 实现

#### 路由组织结构

```
/api
├── /users
│   ├── POST   /          # 创建用户
│   ├── GET    /          # 用户列表（分页）
│   └── GET    /{id}      # 用户详情
└── /tickets
    ├── POST   /          # 创建工单
    ├── GET    /          # 工单列表（过滤+分页）
    ├── GET    /{id}      # 工单详情
    ├── PUT    /{id}      # 更新工单
    ├── DELETE /{id}      # 删除工单
    ├── POST   /{id}/replies    # 添加回复
    └── GET    /{id}/replies    # 回复列表
```

#### 依赖注入：数据库会话

```python
from app.db.session import get_session

@router.post("/", response_model=TicketRead)
def create_ticket(
    payload: TicketCreate, 
    session: Session = Depends(get_session)
) -> Ticket:
    # 使用依赖注入的 session
    ticket = Ticket(**payload.model_dump())
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    return ticket
```

#### 关键实现细节

**1. 外键验证（确保用户和工单正确绑定）**
```python
# backend/app/api/tickets.py:25-28
# 创建工单前验证 requester 是否存在
requester = session.get(User, payload.requester_id)
if requester is None:
    raise HTTPException(status_code=404, detail="Requester not found")

# 验证通过后，创建工单并保存 requester_id
ticket = Ticket(
    title=payload.title,
    content=payload.content,
    requester_id=payload.requester_id,  # 外键绑定
    ...
)
```

**演示要点**：
- 尝试使用不存在的 `requester_id`（如 999），会得到 404 错误
- 数据库层面的外键约束确保数据一致性
- SQLAlchemy 的 `relationship` 允许通过 `ticket.requester` 访问关联的用户对象

**2. 过滤与分页**
```python
@router.get("/", response_model=list[TicketRead])
def list_tickets(
    status: str | None = None,
    priority: str | None = None,
    requester_id: int | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_session)
):
    conditions = []
    if status:
        conditions.append(Ticket.status == status)
    if priority:
        conditions.append(Ticket.priority == priority)
    if requester_id:
        conditions.append(Ticket.requester_id == requester_id)
    
    stmt = select(Ticket).order_by(Ticket.created_at.desc())
    if conditions:
        stmt = stmt.where(and_(*conditions))
    stmt = stmt.limit(page_size).offset((page - 1) * page_size)
    
    result = session.execute(stmt)
    return list(result.scalars().all())
```

**3. 部分更新（PATCH 语义）**
```python
@router.put("/{ticket_id}", response_model=TicketRead)
def update_ticket(
    ticket_id: int,
    payload: TicketUpdate,
    session: Session = Depends(get_session)
):
    ticket = session.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # 只更新提供的字段
    data = payload.model_dump(exclude_unset=True)
    if data:
        data["updated_at"] = datetime.now(timezone.utc)
        session.execute(
            update(Ticket)
            .where(Ticket.id == ticket_id)
            .values(**data)
        )
        session.commit()
    
    updated = session.get(Ticket, ticket_id)
    return updated
```

### 4. 测试驱动开发

#### 测试结构 (backend/tests/test_tickets_crud.py)

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ticket_crud_flow():
    # 1. 创建测试用户
    user = client.post("/api/users/", json={
        "email": "test@example.com",
        "name": "Test User"
    }).json()
    
    # 2. 创建工单
    ticket = client.post("/api/tickets/", json={
        "title": "Cannot login",
        "content": "I am unable to login",
        "priority": "high",
        "requester_id": user["id"]
    }).json()
    
    # 3. 验证查询
    resp = client.get(f"/api/tickets/{ticket['id']}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Cannot login"
    
    # 4. 更新工单
    resp = client.put(
        f"/api/tickets/{ticket['id']}", 
        json={"status": "in_progress"}
    )
    assert resp.json()["status"] == "in_progress"
    
    # 5. 添加回复
    reply = client.post(
        f"/api/tickets/{ticket['id']}/replies",
        json={
            "author_id": user["id"],
            "content": "We are looking into it."
        }
    ).json()
    
    # 6. 验证回复列表
    replies = client.get(f"/api/tickets/{ticket['id']}/replies").json()
    assert len(replies) >= 1
    
    # 7. 删除工单
    resp = client.delete(f"/api/tickets/{ticket['id']}")
    assert resp.status_code == 204
    
    # 8. 验证级联删除
    resp = client.get(f"/api/tickets/{ticket['id']}")
    assert resp.status_code == 404
```

### 5. 配置管理与环境变量

#### Pydantic Settings (backend/app/core/config.py)

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "AstraTickets API"
    environment: str = "development"
    database_url: str = "sqlite+aiosqlite:///./astratickets.db"
    vector_store_path: str = "./vector_store"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    @property
    def sync_database_url(self) -> str:
        """同步数据库 URL（去除 aiosqlite）"""
        return self.database_url.replace("+aiosqlite", "")

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

#### 环境变量文件 (backend/.env.example)

```bash
APP_NAME=AstraTickets API
ENVIRONMENT=development
DATABASE_URL=sqlite+aiosqlite:///./astratickets.db
VECTOR_STORE_PATH=./vector_store
```

### 6. 数据库初始化

#### 会话管理 (backend/app/db/session.py)

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import get_settings

def _get_engine():
    settings = get_settings()
    engine = create_engine(
        settings.sync_database_url, 
        echo=False, 
        future=True
    )
    return engine

def get_session() -> Generator[Session, None, None]:
    """FastAPI 依赖：提供请求级别的数据库会话"""
    SessionLocal = sessionmaker(bind=_get_engine())
    with SessionLocal() as session:
        yield session

def init_models() -> None:
    """创建所有表（Lesson 2 原型阶段，无迁移）"""
    from app.db import models  # 确保模型已注册
    Base.metadata.create_all(bind=_get_engine())
```

#### 应用启动时初始化 (backend/app/main.py)

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动：创建数据库表
    init_models()
    yield
    # 关闭：清理资源（可选）

app = FastAPI(title="AstraTickets API", lifespan=lifespan)
```

## 技术要点总结

### 1. 现代化 Python 实践
- 使用 `datetime.now(timezone.utc)` 替代已弃用的 `datetime.utcnow()`
- Pydantic v2 的 `model_config = ConfigDict(...)` 替代旧版 `class Config`
- FastAPI 的 `lifespan` 上下文管理器替代 `@app.on_event()`

### 2. 数据库设计原则
- 合理使用索引（外键、状态、时间戳）
- 时间戳字段自动维护（`default`, `onupdate`）
- 级联删除保证数据一致性
- 枚举类型集中管理

### 3. API 设计规范
- RESTful 风格路由
- 合理的 HTTP 状态码（201/204/404）
- 参数验证与错误处理
- 过滤、分页、排序支持

### 4. 测试覆盖
- 端到端 CRUD 测试
- 外键约束验证
- 级联删除验证
- 使用 TestClient 模拟 HTTP 请求

## 课后作业

### 必做
1. **扩展 User 模型**
   - 添加 `role` 字段（customer / agent / admin）
   - 实现用户角色过滤接口

2. **优化 Ticket 查询**
   - 实现全文搜索（标题 + 内容）
   - 返回分页元数据（total_count, total_pages）

3. **添加测试用例**
   - 测试创建工单时 requester_id 不存在的情况
   - 测试更新不存在的工单
   - 测试过滤条件的边界情况

### 选做
1. **实现软删除**
   - 添加 `deleted_at` 字段
   - 修改删除接口为软删除
   - 过滤查询时排除已删除记录

2. **添加审计日志**
   - 创建 AuditLog 模型
   - 记录工单的状态变更历史

3. **性能优化**
   - 使用 `joinedload` 预加载关联数据
   - 添加查询缓存

## 下节预告

**Lesson 3: 前端界面与工单管理模块**
- 使用 React + Ant Design 构建前端界面
- 开发工单列表、创建、详情页
- 前后端联调与数据绑定
- 实现工单状态流转 UI
