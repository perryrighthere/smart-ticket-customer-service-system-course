from __future__ import annotations

"""Lightweight ticket classifier for Lesson 5.

Primary path:
    - TF-IDF + linear classifier (scikit-learn)
Fallback path:
    - Simple keyword-based rules when scikit-learn is unavailable.
"""

from dataclasses import dataclass
from typing import List, Optional, Tuple


try:  # Optional dependency – we degrade gracefully if missing
    from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
    from sklearn.linear_model import LogisticRegression  # type: ignore
except Exception:  # pragma: no cover - import guard
    TfidfVectorizer = None  # type: ignore[assignment]
    LogisticRegression = None  # type: ignore[assignment]


_TRAIN_TEXTS: List[str] = [
    # Password / reset
    "I cannot reset my password, the reset link expired",
    "password reset email never arrives",
    "forgot password and cannot login",
    # Login / auth
    "login page keeps saying invalid credentials",
    "cannot sign in to my account",
    "two factor authentication failed at login",
    # Account lockout / security
    "my account has been locked after too many attempts",
    "account locked due to suspicious activity",
    "I received a security alert about my account",
    # Billing / refund
    "I was charged twice on my invoice",
    "how can I request a refund",
    "billing statement amount is incorrect",
    # General usage / other
    "how do I update my profile information",
    "where can I change my notification settings",
    "general question about using the dashboard",
]

_TRAIN_LABELS: List[str] = [
    "password_reset",
    "password_reset",
    "password_reset",
    "login_issue",
    "login_issue",
    "login_issue",
    "account_security",
    "account_security",
    "account_security",
    "billing",
    "billing",
    "billing",
    "general",
    "general",
    "general",
]


@dataclass
class TicketClassificationResult:
    """Structured result for a ticket classification."""

    category: str
    confidence: float


class TicketClassifier:
    """Ticket classifier with train-on-first-use behaviour.

    When scikit-learn is available, we train a tiny TF-IDF + LogisticRegression
    model. Otherwise we fall back to deterministic keyword rules.
    """

    def __init__(self) -> None:
        self._vectorizer: Optional["TfidfVectorizer"] = None
        self._model: Optional["LogisticRegression"] = None

        if TfidfVectorizer is not None and LogisticRegression is not None:
            self._vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
            self._model = LogisticRegression(max_iter=200)
            X = self._vectorizer.fit_transform(_TRAIN_TEXTS)
            self._model.fit(X, _TRAIN_LABELS)

    def predict(self, text: str) -> TicketClassificationResult:
        """Classify the given text into a coarse-grained category."""
        if not text.strip():
            return TicketClassificationResult(category="general", confidence=0.0)

        if self._vectorizer is not None and self._model is not None:
            return self._predict_sklearn(text)
        return self._predict_keywords(text)

    def _predict_sklearn(self, text: str) -> TicketClassificationResult:
        assert self._vectorizer is not None
        assert self._model is not None
        X = self._vectorizer.transform([text])
        proba: Optional[List[float]] = None
        if hasattr(self._model, "predict_proba"):
            probs = self._model.predict_proba(X)[0]
            proba = probs.tolist()  # type: ignore[assignment]
        label = self._model.predict(X)[0]
        confidence = 0.0
        if proba is not None:
            try:
                idx = list(self._model.classes_).index(label)  # type: ignore[arg-type]
            except Exception:  # pragma: no cover - defensive
                idx = 0
            confidence = float(proba[idx]) if 0 <= idx < len(proba) else 0.0
        return TicketClassificationResult(category=str(label), confidence=confidence)

    def _predict_keywords(self, text: str) -> TicketClassificationResult:
        lowered = text.lower()
        rules: List[Tuple[str, List[str]]] = [
            ("password_reset", ["reset password", "forgot password", "password reset"]),
            ("login_issue", ["cannot login", "can't login", "invalid credentials", "sign in"]),
            ("account_security", ["account locked", "locked out", "suspicious activity", "security alert"]),
            ("billing", ["charged twice", "invoice", "billing", "refund"]),
        ]
        for label, keywords in rules:
            if any(k in lowered for k in keywords):
                return TicketClassificationResult(category=label, confidence=0.7)
        return TicketClassificationResult(category="general", confidence=0.3)


_CLASSIFIER: Optional[TicketClassifier] = None


def get_ticket_classifier() -> TicketClassifier:
    """Return a process-wide classifier instance."""
    global _CLASSIFIER
    if _CLASSIFIER is None:
        _CLASSIFIER = TicketClassifier()
    return _CLASSIFIER

