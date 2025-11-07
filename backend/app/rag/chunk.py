from __future__ import annotations

"""Simple text chunking utilities for Lesson 4.

We chunk by paragraphs then by character windows to keep implementation simple
and dependency-free. Adjust sizes as needed for your models.
"""

from typing import Iterable, List
import re


def split_paragraphs(text: str) -> List[str]:
    parts = [p.strip() for p in text.replace("\r\n", "\n").split("\n\n")]
    return [p for p in parts if p]


def window_chunks(text: str, max_chars: int = 600, overlap: int = 80) -> List[str]:
    if max_chars <= 0:
        return [text]
    result: List[str] = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        result.append(text[start:end].strip())
        if end == len(text):
            break
        start = max(0, end - overlap)
    return [c for c in result if c]


def chunk_text(text: str, max_chars: int = 600, overlap: int = 80) -> List[str]:
    """Chunk text via paragraphs + windows for better boundaries."""
    chunks: List[str] = []
    for para in split_paragraphs(text):
        if len(para) <= max_chars:
            chunks.append(para)
        else:
            chunks.extend(window_chunks(para, max_chars=max_chars, overlap=overlap))
    return chunks


def chunk_many(docs: Iterable[str], max_chars: int = 600, overlap: int = 80) -> List[str]:
    chunks: List[str] = []
    for d in docs:
        chunks.extend(chunk_text(d, max_chars=max_chars, overlap=overlap))
    return chunks


def _split_by_delimiters(text: str, delimiters: str) -> List[str]:
    if not delimiters:
        return [text]
    s = text.replace("\r\n", "\n")
    # Build regex to capture segments ending with delimiters
    cls = re.escape(delimiters)
    pattern = rf"[^{cls}]+(?:[{cls}]+)?"
    parts = [p.strip() for p in re.findall(pattern, s) if p and p.strip()]
    return parts if parts else [text]


def chunk_text_punctuation(text: str, delimiters: str, max_chars: int = 600) -> List[str]:
    """Chunk text by punctuation delimiters, then pack into windows under max_chars."""
    sentences = _split_by_delimiters(text, delimiters)
    chunks: List[str] = []
    buf = ""
    for sent in sentences:
        if not buf:
            if len(sent) <= max_chars:
                buf = sent
            else:
                # very long single sentence, hard cut
                chunks.extend(window_chunks(sent, max_chars=max_chars, overlap=0))
        else:
            if len(buf) + 1 + len(sent) <= max_chars:
                buf = f"{buf} {sent}"
            else:
                chunks.append(buf)
                buf = sent if len(sent) <= max_chars else ""
                if not buf:
                    chunks.extend(window_chunks(sent, max_chars=max_chars, overlap=0))
    if buf:
        chunks.append(buf)
    return chunks


def chunk_text_strategy(
    text: str,
    strategy: str = "window",
    max_chars: int = 600,
    overlap: int = 80,
    delimiters: str | None = None,
) -> List[str]:
    if strategy == "punctuation":
        delims = delimiters or "。！？?!"
        return chunk_text_punctuation(text, delimiters=delims, max_chars=max_chars)
    # default window strategy
    return chunk_text(text, max_chars=max_chars, overlap=overlap)
