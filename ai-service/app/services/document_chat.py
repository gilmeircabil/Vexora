import math
import re
from typing import List, Dict, Any, Optional
from collections import Counter
from app.services.language_model import llm_service

class DocumentChatService:
    def __init__(self):
        # In-memory document session cache: doc_id -> list of chunks
        self.sessions: Dict[str, List[Dict[str, Any]]] = {}

    def index_document(self, doc_id: str, chunks: List[Dict[str, Any]]):
        self.sessions[doc_id] = chunks

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\b\w+\b', text.lower())

    def retrieve_relevant_chunks(self, doc_id: str, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        chunks = self.sessions.get(doc_id, [])
        if not chunks:
            return []

        query_tokens = Counter(self._tokenize(query))
        if not query_tokens:
            return chunks[:top_k]

        scored_chunks = []
        for chunk in chunks:
            chunk_tokens = Counter(self._tokenize(chunk["text"]))
            # Cosine similarity between token frequencies
            dot_product = sum(query_tokens[token] * chunk_tokens.get(token, 0) for token in query_tokens)
            query_norm = math.sqrt(sum(v ** 2 for v in query_tokens.values()))
            chunk_norm = math.sqrt(sum(v ** 2 for v in chunk_tokens.values())) or 1.0

            score = dot_product / (query_norm * chunk_norm)
            scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [c for score, c in scored_chunks[:top_k]]

    async def answer_question(self, doc_id: str, query: str, chunks: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        if chunks:
            self.index_document(doc_id, chunks)

        relevant = self.retrieve_relevant_chunks(doc_id, query, top_k=4)
        if not relevant:
            return {
                "answer": "No relevant content found in the document to answer your question.",
                "citations": []
            }

        context_blocks = []
        citations = []
        for c in relevant:
            page_num = c.get("page", 1)
            context_blocks.append(f"[Page {page_num}]: {c['text']}")
            citations.append({
                "page": page_num,
                "text_snippet": c['text'][:180] + "..."
            })

        context_str = "\n\n".join(context_blocks)
        system_prompt = (
            "You are an expert document assistant for ToolNest. Answer questions accurately and concisely "
            "based ONLY on the provided document excerpts. When referencing information, cite the page number [Page X]. "
            "If the answer cannot be found in the document, state that clearly."
        )

        user_prompt = f"Document Context:\n{context_str}\n\nQuestion: {query}\n\nAnswer:"

        res = await llm_service.generate(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=0.3
        )

        return {
            "answer": res.get("text", "").strip(),
            "citations": citations,
            "model": res.get("model")
        }

document_chat = DocumentChatService()
