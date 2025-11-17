from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_kb_ingest_and_search():
    # Ingest two small docs
    payload = {
        "collection": "kb_test",
        "chunk": True,
        "max_chars": 80,
        "overlap": 10,
        "documents": [
            {"id": "doc1", "text": "Password reset emails may land in spam. The link expires in 15 minutes."},
            {"id": "doc2", "text": "Login issues can be due to SSO problems or locked accounts."},
        ],
    }
    r = client.post("/api/kb/ingest", json=payload)
    assert r.status_code == 201, r.text
    inserted = r.json()["inserted_ids"]
    assert len(inserted) >= 2

    # Query
    q = {"collection": "kb_test", "query": "How long is the reset link valid?", "n_results": 3}
    r = client.post("/api/kb/search", json=q)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["query"] == q["query"]
    assert len(data["matches"]) >= 1

    # Delete
    r = client.post("/api/kb/delete", json={"collection": "kb_test", "ids": inserted[:1]})
    assert r.status_code == 200
    assert r.json()["deleted"] >= 0

