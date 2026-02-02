import os
from langchain_community.document_loaders import PyPDFLoader 
from llama_index.core.node_parser import SentenceSplitter
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
EMBED_MODEL = "gemini-embedding-001"

# SentenceSplitter ensures we don't cut off sentences mid-thought
splitter = SentenceSplitter(chunk_size=1000, chunk_overlap=200)

def load_and_chunk_pdf(pdf_path: str) -> list[str]:
    """
    Standard PDF extraction and chunking.
    """
    try:
        # 1. Load the PDF
        loader = PyPDFLoader(pdf_path)
        pages = loader.load()
        
        # 2. Combine page content
        full_text = " ".join([p.page_content for p in pages])
        
        # 3. Guard clause for empty/scanned PDFs
        if not full_text.strip():
            print(f"⚠️ Warning: No text extracted from {pdf_path}. Document might be scanned.")
            return []

        # 4. Use semantic splitting for RAG chunks
        chunks = splitter.split_text(full_text)
        return chunks

    except Exception as e:
        print(f"❌ Error loading PDF: {e}")
        return []

def embed_text(texts: list[str]) -> list[list[float]]:
    """
    Embeds text using Gemini with Batching for high performance.
    """
    if not texts:
        return []

    try:
        # We process in batches of 50 to keep API requests stable
        all_embeddings = []
        for i in range(0, len(texts), 50):
            batch = texts[i:i + 50]
            result = client.models.embed_content(
                model=EMBED_MODEL,
                contents=batch,
            )
            all_embeddings.extend([e.values for e in result.embeddings])
            
        return all_embeddings

    except Exception as e:
        print(f"❌ Batch embedding failed: {e}")
        return []