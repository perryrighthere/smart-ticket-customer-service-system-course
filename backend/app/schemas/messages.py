from datetime import datetime
from pydantic import BaseModel

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    ticket_id: int
    sender_id: int
    sender_type: str
    created_at: datetime

    class Config:
        from_attributes = True
