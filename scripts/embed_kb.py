#!/usr/bin/env python3
"""Ingest local KB documents into Chroma.

Usage examples:
  python scripts/embed_kb.py --path samples/kb --collection kb_main
  python scripts/embed_kb.py --text "FAQ: Password reset steps" --collection kb_main

This script imports the backend app's RAG helpers directly to avoid HTTP.
Ensure dependencies are installed and run from repo root.
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from typing import List

# Ensure backend/app is importable and vector store path aligns with backend container volume
REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = REPO_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Point VECTOR_STORE_PATH to backend/vector_store if not explicitly set
os.environ.setdefault("VECTOR_STORE_PATH", str((BACKEND_DIR / "vector_store").resolve()))

from app.rag.chunk import chunk_many
from app.rag.store import add_documents
from app.rag.utils import extract_title, derive_doc_id


def load_texts_from_path(path: str) -> List[str]:
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(path)
    texts: List[str] = []
    for file in p.rglob("*"):
        if file.is_file() and file.suffix.lower() in {".txt", ".md"}:
            texts.append(file.read_text(encoding="utf-8", errors="ignore"))
    return texts


def main() -> None:
    parser = argparse.ArgumentParser(description="Embed local KB documents into Chroma")
    parser.add_argument("--path", type=str, default="samples/kb", help="Directory containing .md/.txt files")
    parser.add_argument("--text", type=str, default=None, help="Single text to ingest (optional)")
    parser.add_argument("--collection", type=str, default="kb_main", help="Collection name")
    parser.add_argument("--max-chars", type=int, default=600, help="Max chars per chunk")
    parser.add_argument("--overlap", type=int, default=80, help="Overlap between chunks")
    args = parser.parse_args()

    texts: List[str] = []
    if args.text:
        texts.append(args.text)
    if args.path and os.path.isdir(args.path):
        texts.extend(load_texts_from_path(args.path))
    if not texts:
        print("No texts to ingest. Provide --text or ensure --path has files.")
        return

    # Build per-chunk metadata with stable title/doc_id for consistent display
    chunks: list[str] = []
    metas: list[dict] = []
    for t in texts:
        title = extract_title(t) or "Untitled"
        doc_id = derive_doc_id(t, title)
        doc_chunks = chunk_many([t], max_chars=args.max_chars, overlap=args.overlap)
        chunks.extend(doc_chunks)
        metas.extend([{ "title": title, "doc_id": doc_id }] * len(doc_chunks))

    ids = add_documents(texts=chunks, ids=None, metadatas=metas, collection=args.collection)
    print(f"Ingested {len(ids)} chunks into collection '{args.collection}'.")


if __name__ == "__main__":
    main()
