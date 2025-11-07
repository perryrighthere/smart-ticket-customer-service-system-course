from __future__ import annotations

"""Utilities for KB ingestion: extract titles, derive stable doc ids."""

import hashlib
from typing import Optional


def extract_title(text: str) -> Optional[str]:
    """Extract a reasonable title from text.

    Priority:
    1) YAML front matter 'title: ...' between leading --- blocks
    2) First markdown heading (line starting with '#')
    3) First non-empty line (trimmed)
    """
    if not text:
        return None

    s = text.replace("\r\n", "\n")
    # YAML front matter
    if s.startswith("---\n"):
        try:
            end = s.find("\n---", 4)
            if end != -1:
                fm = s[4:end].splitlines()
                for line in fm:
                    if line.lower().startswith("title:"):
                        return line.split(":", 1)[1].strip().strip('"\' ')
        except Exception:
            pass

    # First markdown heading
    for line in s.splitlines():
        ls = line.strip()
        if ls.startswith("#"):
            # Remove leading #'s and spaces
            return ls.lstrip("#").strip()

    # First non-empty line
    for line in s.splitlines():
        ls = line.strip()
        if ls:
            return (ls[:120]).strip()
    return None


def derive_doc_id(text: str, title: Optional[str] = None) -> str:
    """Derive a stable doc id from content/title for metadata purposes."""
    base = (title or "") + "\n" + (text or "")
    h = hashlib.sha1(base.encode("utf-8", errors="ignore")).hexdigest()
    return f"doc-{h[:12]}"

