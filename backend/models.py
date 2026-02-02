from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Table
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

# 🔹 Link Table for Many-to-Many relationship
conversation_pdfs = Table(
    "conversation_pdfs",
    Base.metadata,
    Column("conversation_id", String, ForeignKey("conversations.id"), primary_key=True),
    Column("pdf_id", String, ForeignKey("uploaded_pdfs.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    conversations = relationship("Conversation", back_populates="user")

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    
    # 🔹 New: Access all PDFs in this conversation
    pdfs = relationship("UploadedPDF", secondary=conversation_pdfs, back_populates="conversations")

class UploadedPDF(Base):
    __tablename__ = "uploaded_pdfs"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="pdfs")
    # 🔹 New: See which conversations use this PDF
    conversations = relationship("Conversation", secondary=conversation_pdfs, back_populates="pdfs")

class Message(Base):
    __tablename__ = "messages"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id"))
    role = Column(String) # user / assistant
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    conversation = relationship("Conversation", back_populates="messages")