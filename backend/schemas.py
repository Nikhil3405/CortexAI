from pydantic import BaseModel
from typing import List, Optional

class RegisterSchema(BaseModel):
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

class MessageSchema(BaseModel):
    role: str
    content: str

class QueryPdfSchema(BaseModel):
    question: str
    # Make these optional so the API is flexible
    conversation_id: Optional[str] = None
    pdf_id: Optional[str] = None

class ConversationResponse(BaseModel):
    id: str
    pdf_id: Optional[str]
    messages: List[MessageSchema]

    class Config:
        from_attributes = True