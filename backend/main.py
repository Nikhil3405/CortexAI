import logging
import os
import uuid
from datetime import datetime
from fastapi import UploadFile, File, Form
from jose import jwt
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, Response, Request
import inngest
import inngest.fast_api
from dotenv import load_dotenv
from google import genai
from sqlalchemy.orm import Session
from data_loader import load_and_chunk_pdf, embed_text
from vector_db import QdrantStorage
from custom_types import (
    RAGSearchResult,
    RAGUpsertResult,
    RAGChunkAndSrc,
)
from db import get_db
from models import User, Conversation, Message, UploadedPDF
from auth import hash_password, verify_password, create_access_token
from schemas import RegisterSchema, LoginSchema, QueryPdfSchema
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import models
from supabase import create_client, Client
# --------------------------------------------------
# Setup
# --------------------------------------------------

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Use Service Role for backend
supabase: Client = create_client(url, key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://cortex-ai-pi.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


inngest_client = inngest.Inngest(
    app_id="rag_app",
    logger=logging.getLogger("uvicorn"),
    is_production=True,
    serializer=inngest.PydanticSerializer(),
)

# --------------------------------------------------
# 🔐 AUTH HELPERS (NEW)
# --------------------------------------------------

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
):
    token = request.cookies.get("token")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(
            token,
            os.getenv("JWT_SECRET"),
            algorithms=["HS256"],
        )
        user_id = payload["sub"]
    except Exception as e:
        print("JWT ERROR:", e)
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

from typing import List
from fastapi import UploadFile, File

@app.post("/upload-pdf")
async def upload_pdf(
    files: List[UploadFile] = File(...),   # ✅ multiple PDFs
    conversation_id: str | None = Form(None),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1️⃣ Get or create conversation
    if conversation_id:
        conv = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id
        ).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = Conversation(id=str(uuid.uuid4()), user_id=user.id)
        db.add(conv)
        db.commit()
        db.refresh(conv)

    uploaded_pdfs = []

    # 2️⃣ Process each PDF
    for file in files:
        pdf_id = str(uuid.uuid4())
        file_content = await file.read()
        storage_path = f"{user.id}/{pdf_id}.pdf"

        # Upload to Supabase
        try:
            supabase.storage.from_("pdfs").upload(
                path=storage_path,
                file=file_content,
                file_options={"content-type": "application/pdf"},
            )
        except Exception as e:
            print("SUPABASE ERROR:", e)
            raise HTTPException(status_code=500, detail="Cloud upload failed")

        # Save metadata in DB
        pdf = UploadedPDF(
            id=pdf_id,
            user_id=user.id,
            filename=file.filename,
            file_path=storage_path,
        )

        db.add(pdf)
        conv.pdfs.append(pdf)

        # Add message for UI
        db.add(
            Message(
                conversation_id=conv.id,
                role="user",
                content=f"Uploaded: {file.filename}",
            )
        )

        uploaded_pdfs.append({
            "id": pdf_id,
            "filename": file.filename,
        })

        # 3️⃣ Trigger async ingestion
        await inngest_client.send(
            inngest.Event(
                name="rag/ingest_pdf",
                data={
                    "storage_path": storage_path,
                    "pdf_id": pdf_id,
                    "source_id": file.filename,
                    "conversation_id": conv.id,
                },
            )
        )

    db.commit()
    db.refresh(conv)

    # 4️⃣ ✅ Return updated conversation immediately (UI FIX)
    return {
        "conversation": {
            "id": conv.id,
            "pdfs": uploaded_pdfs,
            "created_at": conv.created_at,
        }
    }

# --------------------------------------------------
# 🔐 AUTH ROUTES (NEW)
# --------------------------------------------------

@app.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()

    return {"message": "User registered successfully"}


@app.post("/login")
def login(
    data: LoginSchema,
    response: Response,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.id)

    # ✅ Set token in HTTP-only cookie
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="none",
        secure=True,      # ⚠️ True in production (HTTPS)
        path="/",
        max_age=60 * 60 * 24,  # 1 day
    )

    return {"message": "Login successful"}

@app.get("/protected")
def protected(request: Request):
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(status_code=401)

    return {"ok": True}


@app.post("/logout")
def logout(response: Response):
    response.delete_cookie("token")
    return {"message": "Logged out"}

@app.get("/messages/{conversation_id}")
def get_messages(
    conversation_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(Message)
        .join(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id,
        )
        .order_by(Message.created_at)
        .all()
    )

    return [
        {
            "role": m.role,
            "content": m.content,
            "type": "pdf" if m.content.lower().endswith(".pdf") else "text",
            "created_at": m.created_at,
        }
        for m in messages
    ]

# --------------------------------------------------
# Gemini Answer Generator (UNCHANGED)
# --------------------------------------------------

def generate_answer(contexts: list[str], question: str) -> str:
    context_block = "\n\n".join(contexts)

    prompt = f"""
You are CortexAI, a highly intelligent research assistant. 

INSTRUCTIONS:
1. If the "Document Context" provided below contains information relevant to the question, prioritize it. 
2. Combine the information from the documents with your own extensive knowledge to provide a comprehensive and insightful answer.
3. If the "Document Context" is missing, irrelevant, or insufficient, use your general knowledge to help the user. 
4. If you are relying ONLY on general knowledge because the documents are silent on the topic, start your response with: "I couldn't find specific details in your documents, but based on general knowledge..."
5. Be concise, professional, and avoid unnecessary jargon.
6. If you truly do not know the answer even with your general knowledge, say: "I'm sorry, I don't have the answer to that question."

Context:
{context_block}

Question:
{question}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return response.text.strip()

# --------------------------------------------------
# Ingest PDF Function (UNCHANGED)
# --------------------------------------------------
@inngest_client.create_function(
    fn_id="RAG: Ingest PDF",
    trigger=inngest.TriggerEvent(event="rag/ingest_pdf"),
)
async def rag_ingest_pdf(ctx: inngest.Context):

    def _load() -> RAGChunkAndSrc:
            storage_path = ctx.event.data["storage_path"]
            source_id = ctx.event.data.get("source_id")
            
            # 1. Download file from Supabase
            response = supabase.storage.from_("pdfs").download(storage_path)
            
            # 2. Write to a temporary file locally so the loaders can read it
            temp_filename = f"temp_{ctx.event.data['pdf_id']}.pdf"
            with open(temp_filename, "wb") as f:
                f.write(response)
                
            try:
                # 3. Process the file (This calls your OCR/Standard fallback logic)
                chunks = load_and_chunk_pdf(temp_filename)
            finally:
                # 4. Clean up: Delete temp file after chunks are loaded into memory
                if os.path.exists(temp_filename):
                    os.remove(temp_filename)
                    
            return RAGChunkAndSrc(chunks=chunks, source_id=source_id)

    def _upsert(chunks_and_src: RAGChunkAndSrc) -> RAGUpsertResult:
        chunks = chunks_and_src.chunks
        source_id = chunks_and_src.source_id
        
        # 🔹 CRITICAL: Get the pdf_id from the event data
        # This ID must match what you store in your SQL database
        pdf_id = ctx.event.data.get("pdf_id") 

        vectors = embed_text(chunks)
        
        # 🔹 Use pdf_id in the UUID generation to ensure uniqueness per document
        ids = [
            str(uuid.uuid5(uuid.NAMESPACE_URL, f"{pdf_id}:{i}"))
            for i in range(len(chunks))
        ]
        
        # 🔹 Add pdf_id to the payload so the search filter works!
        payloads = [
            {
                "source": source_id, 
                "text": chunks[i], 
                "pdf_id": pdf_id
            }
            for i in range(len(chunks))
        ]

        QdrantStorage().upsert(
            ids=ids,
            vectors=vectors,
            payloads=payloads,
        )

        return RAGUpsertResult(ingested=len(chunks))

    chunks_and_src = await ctx.step.run(
        "load-and-chunk",
        _load,
        output_type=RAGChunkAndSrc,
    )

    ingested = await ctx.step.run(
        "embed-and-upsert",
        lambda: _upsert(chunks_and_src),
        output_type=RAGUpsertResult,
    )

    # ✅ NEW STEP: Add a system message to stop the frontend polling
    def _mark_complete():
        pdf_id = ctx.event.data.get("pdf_id")
        source_id = ctx.event.data.get("source_id")
        
        # We need the conversation_id, ensure it's passed in event data
        # If not already there, update your upload_pdf route to send it
        conversation_id = ctx.event.data.get("conversation_id")
        if conversation_id:
            db = next(get_db())
            # Add a hidden or status message
            db.add(Message(
                conversation_id=conversation_id,
                role="assistant",
                content=f"I have finished analyzing **{source_id}**. You can now ask questions about it!",
                # Optionally add a custom type to handle this specially in UI
            ))
            db.commit()
        return True

    await ctx.step.run("mark-ingestion-complete", _mark_complete)

    return ingested.model_dump()

# --------------------------------------------------
# Query PDF Function + 💾 STORAGE (UPDATED)
# --------------------------------------------------
@inngest_client.create_function(
    fn_id="RAG: Query PDF",
    trigger=inngest.TriggerEvent(event="rag/query_pdf_ai"),
)
async def rag_query_pdf_ai(ctx: inngest.Context):
    def _search() -> RAGSearchResult:
        question = ctx.event.data["question"]
        allowed_pdf_ids = ctx.event.data.get("allowed_pdf_ids", [])
        
        vectors = embed_text([question])
        if not vectors:
            return RAGSearchResult(contexts=[], sources=[])
        
        query_vec = vectors[0]
        store = QdrantStorage()
        found = store.search(query_vec, top_k=5, allowed_pdf_ids=allowed_pdf_ids)
        
        return RAGSearchResult(
            contexts=found.get("contexts", []),
            sources=found.get("sources", []),
        )

    # 1. Search Vector DB
    found = await ctx.step.run(
        "embed-and-search",
        _search,
        output_type=RAGSearchResult,
    )

    # 2. Generate Hybrid Answer
    question = ctx.event.data["question"]
    answer = await ctx.step.run(
        "generate-answer",
        lambda: generate_answer(found.contexts, question),
    )

    # 3. Atomic Database Commit
    conversation_id = ctx.event.data["conversation_id"]

    def _save_to_db():
        db = next(get_db())
        try:
            # 🔹 We save BOTH here so the frontend polling 
            # sees the complete state in one go.
            db.add(
                Message(
                    conversation_id=conversation_id,
                    role="assistant",
                    content=answer,
                )
            )
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e

    await ctx.step.run("save-to-db", _save_to_db)

    return {
        "status": "stored",
        "num_contexts": len(found.contexts),
    }

@app.post("/query-pdf")
async def query_pdf(
    data: QueryPdfSchema,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not data.conversation_id:
        conv = Conversation(id=str(uuid.uuid4()), user_id=user.id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        active_id = conv.id
        allowed_pdf_ids = []
    else:
        conv = db.query(Conversation).filter(
            Conversation.id == data.conversation_id,
            Conversation.user_id == user.id
        ).first()
        if not conv:
            raise HTTPException(status_code=404)
        active_id = conv.id
        allowed_pdf_ids = [p.id for p in conv.pdfs]

    # ✅ SAVE USER MESSAGE IMMEDIATELY
    db.add(
        Message(
            conversation_id=active_id,
            role="user",
            content=data.question,
        )
    )
    db.commit()

    # 🔹 Trigger AI processing
    await inngest_client.send(
        inngest.Event(
            name="rag/query_pdf_ai",
            data={
                "question": data.question,
                "conversation_id": active_id,
                "allowed_pdf_ids": allowed_pdf_ids,
            }
        )
    )

    return {"status": "processing", "conversation_id": active_id}


@app.get("/pdfs")
def list_pdfs(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pdfs = (
        db.query(UploadedPDF)
        .filter(UploadedPDF.user_id == user.id)
        .order_by(UploadedPDF.created_at.desc())
        .all()
    )

    return [
        {
            "id": p.id,
            "filename": p.filename,
            "created_at": p.created_at,
        }
        for p in pdfs
    ]

@app.delete("/pdfs/{pdf_id}")
def delete_pdf(
    pdf_id: str, 
    user=Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    pdf = db.query(UploadedPDF).filter(
        UploadedPDF.id == pdf_id, 
        UploadedPDF.user_id == user.id
    ).first()

    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")

    # 1. Delete from Supabase Storage
    try:
        supabase.storage.from_("pdfs").remove([pdf.file_path])
    except Exception as e:
        print(f"Failed to delete from Supabase: {e}")

    # 2. Delete from Qdrant Vector DB
    try:
        from vector_db import QdrantStorage
        QdrantStorage().client.delete(
            collection_name="cortex_chunks",
            points_selector=models.Filter(
                must=[models.FieldCondition(key="pdf_id", match=models.MatchValue(value=pdf_id))]
            ),
        )
    except Exception as e:
        print(f"Failed to delete from Qdrant: {e}")

    # 3. Delete from SQL Database
    db.delete(pdf)
    db.commit()

    return {"message": "PDF and associated vectors deleted"}
# --------------------------------------------------
# 📜 FETCH CONVERSATIONS (NEW)
# --------------------------------------------------
@app.get("/conversations")
def get_conversations(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Fetch conversations for the current user
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == user.id)
        .order_by(Conversation.created_at.desc())
        .all()
    )

    result = []
    for c in conversations:
        # Determine title from the first user message
        first_message = db.query(Message).filter(
            Message.conversation_id == c.id, 
            Message.role == "user"
        ).order_by(Message.created_at).first()

        title = first_message.content[:40] + "..." if first_message else "New Chat"

        # 🔹 Group all PDFs linked to this specific conversation
        pdf_list = [
            {"id": p.id, "filename": p.filename} 
            for p in c.pdfs
        ]

        result.append({
            "id": c.id,
            "title": title,
            "pdfs": pdf_list, 
            "created_at": c.created_at,
        })

    return result

@app.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str, 
    user=Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # 1. Fetch the conversation with linked PDFs
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id, 
        Conversation.user_id == user.id
    ).first()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # 2. Collect metadata for external cleanups
    storage_paths = [pdf.file_path for pdf in conv.pdfs]
    pdf_ids = [pdf.id for pdf in conv.pdfs]

    try:
        # 3. Distributed Cleanup: Supabase Storage
        if storage_paths:
            try:
                # remove() expects a list of paths
                supabase.storage.from_("pdfs").remove(storage_paths)
            except Exception as e:
                print(f"⚠️ Supabase storage cleanup failed/skipped: {e}")

        store = QdrantStorage()
        # 🚨 FIX: Use your actual collection name from vector_db setup
        collection_name = "doc" 

        for p_id in pdf_ids:
            try:
                store.client.delete(
                    collection_name=collection_name,
                    points_selector=models.Filter(
                        must=[models.FieldCondition(key="pdf_id", match=models.MatchValue(value=p_id))]
                    ),
                )
            except Exception as e:
                # Log but don't crash if Qdrant collection is missing
                print(f"⚠️ Qdrant cleanup skipped for PDF {p_id}: {e}")

        # 5. Database Cleanup: SQL
        # In a Many-to-Many setup, we manually delete the PDFs linked to this chat
        for pdf in conv.pdfs:
            db.delete(pdf)

        # Delete the conversation (Cascade handles the messages)
        db.delete(conv)
        db.commit()

        return {"message": "Conversation and all associated data deleted successfully"}

    except Exception as e:
        db.rollback()
        print(f"❌ Critical Cleanup Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete conversation data")
# --------------------------------------------------
# Serve Inngest (UNCHANGED)
# --------------------------------------------------

inngest.fast_api.serve(
    app,
    inngest_client,
    [rag_ingest_pdf, rag_query_pdf_ai],
)
