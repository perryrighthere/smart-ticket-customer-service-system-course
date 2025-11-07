from __future__ import annotations

"""Embedding providers for Lesson 4.

- Tries SentenceTransformers model if available (optional dependency)
- Falls back to a simple hashing-based embedding to avoid heavy installs
"""

from dataclasses import dataclass
from typing import List, Optional
import math


def _try_import_sentence_transformers() -> Optional[object]:
    try:
        import sentence_transformers  # type: ignore

        return sentence_transformers
    except Exception:
        return None


class EmbeddingProvider:
    """Abstract embedding provider interface."""

    def embed_documents(self, texts: List[str]) -> List[List[float]]:  # pragma: no cover - interface
        raise NotImplementedError

    def embed_query(self, text: str) -> List[float]:  # pragma: no cover - interface
        raise NotImplementedError


@dataclass
class HashingEmbedding(EmbeddingProvider):
    """A tiny, dependency-free hashing embedding.

    Not semantically strong but good for local demos without model downloads.
    """

    dim: int = 384

    def _vec(self, text: str) -> List[float]:
        vec = [0.0] * self.dim
        # Very simple bag-of-words hashing
        for token in text.lower().split():
            h = hash(token) % self.dim
            vec[h] += 1.0
        # L2 normalize
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        return [v / norm for v in vec]

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._vec(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._vec(text)


@dataclass
class SentenceTransformerEmbedding(EmbeddingProvider):
    model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    _st_model: object | None = None

    def _ensure_model(self) -> None:
        if self._st_model is not None:
            return
        st = _try_import_sentence_transformers()
        if st is None:
            raise RuntimeError("sentence-transformers not available")
        self._st_model = st.SentenceTransformer(self.model_name)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        self._ensure_model()
        assert self._st_model is not None
        # encode returns numpy array; convert to list of floats
        vecs = self._st_model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
        return [v.tolist() for v in vecs]

    def embed_query(self, text: str) -> List[float]:
        return self.embed_documents([text])[0]


def get_default_provider() -> EmbeddingProvider:
    """Return the best available embedding provider."""
    # Attempt to use SentenceTransformers if present
    if _try_import_sentence_transformers() is not None:
        return SentenceTransformerEmbedding()
    # Fallback to hashing embedder
    return HashingEmbedding()
