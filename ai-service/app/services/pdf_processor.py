import fitz # PyMuPDF
from typing import List, Dict, Any

class PDFProcessorService:
    def extract_document(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Parses PDF bytes, returns page count, metadata, structured page text, and chunks.
        """
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages = []
        chunks = []
        full_text = []

        chunk_size = 800 # characters per chunk
        chunk_overlap = 150

        for page_num, page in enumerate(doc):
            text = page.get_text()
            full_text.append(text)
            pages.append({
                "page": page_num + 1,
                "text": text,
                "char_count": len(text),
                "word_count": len(text.split())
            })

            # Create overlapping chunks
            clean_text = " ".join(text.split())
            if not clean_text:
                continue

            start = 0
            while start < len(clean_text):
                end = min(start + chunk_size, len(clean_text))
                chunk_text = clean_text[start:end]
                chunks.append({
                    "chunk_id": f"p{page_num + 1}_{len(chunks)}",
                    "page": page_num + 1,
                    "text": chunk_text
                })
                if end == len(clean_text):
                    break
                start += (chunk_size - chunk_overlap)

        metadata = {
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", ""),
            "page_count": len(doc),
            "total_words": sum(p["word_count"] for p in pages)
        }

        return {
            "metadata": metadata,
            "pages": pages,
            "chunks": chunks,
            "full_text": "\n\n".join(full_text)
        }

pdf_processor = PDFProcessorService()
