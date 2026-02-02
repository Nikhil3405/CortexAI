from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct, Filter, FieldCondition, MatchAny, PayloadSchemaType
from dotenv import load_dotenv
import os

load_dotenv()

qdrant_url = os.getenv("QDRANT_URL")
qdrant_api_key = os.getenv("QDRANT_API_KEY")

class QdrantStorage:
    def __init__(self, collection="doc", dim=3072):
        self.client = QdrantClient(
            url=qdrant_url,
            api_key=qdrant_api_key,
            timeout=30,
        )
        self.collection = collection

        if not self.client.collection_exists(self.collection):
            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(
                    size=dim,
                    distance=Distance.COSINE,
                ),
            )

            self.client.create_payload_index(
                collection_name=self.collection,
                field_name="pdf_id",
                field_schema=PayloadSchemaType.KEYWORD, # or .UUID if your IDs are clean UUIDs
            )
            print(f"Index created for 'pdf_id' in {self.collection}")

    def upsert(self, ids, vectors, payloads):
        points = [
            PointStruct(
                id=ids[i],
                vector=vectors[i],
                payload=payloads[i],
            )
            for i in range(len(ids))
        ]

        self.client.upsert(
            collection_name=self.collection,
            points=points,
        )

    def search(self, query_vector, top_k=5, allowed_pdf_ids=None):
        """
        Search for context, restricted to specific PDF IDs to ensure data isolation.
        """
        query_filter = None
        
        # 🔹 Handle filtering logic
        if allowed_pdf_ids:
            # Ensure allowed_pdf_ids is a list even if a single ID is passed
            ids_to_match = [allowed_pdf_ids] if isinstance(allowed_pdf_ids, str) else allowed_pdf_ids
            
            query_filter = Filter(
                must=[
                    FieldCondition(
                        key="pdf_id", 
                        match=MatchAny(any=ids_to_match)
                    )
                ]
            )

        # Qdrant's modern query API
        results = self.client.query_points(
            collection_name=self.collection,
            query=query_vector,
            query_filter=query_filter, 
            limit=top_k,
            with_payload=True,
        )

        contexts = []
        sources = set()

        for r in results.points:
            payload = r.payload or {}
            text = payload.get("text")
            source = payload.get("source")

            if text:
                contexts.append(text)
                if source:
                    sources.add(source)

        return {
            "contexts": contexts,
            "sources": list(sources),
        }