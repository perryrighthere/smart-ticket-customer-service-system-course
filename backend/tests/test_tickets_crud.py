import uuid

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def create_user_helper():
    email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    resp = client.post("/api/users/", json={"email": email, "name": "Test User"})
    assert resp.status_code == 201, resp.text
    return resp.json()


def test_ticket_crud_flow():
    # Create requester
    user = create_user_helper()

    # Create ticket
    payload = {
        "title": "Cannot login",
        "content": "I am unable to login with my account",
        "priority": "high",
        "requester_id": user["id"],
        "tags": "login,auth",
    }
    r = client.post("/api/tickets/", json=payload)
    assert r.status_code == 201, r.text
    ticket = r.json()

    # Get by id
    r = client.get(f"/api/tickets/{ticket['id']}")
    assert r.status_code == 200
    assert r.json()["title"] == "Cannot login"

    # List with filter
    r = client.get("/api/tickets", params={"priority": "high", "page": 1, "page_size": 10})
    assert r.status_code == 200
    assert any(t["id"] == ticket["id"] for t in r.json())

    # Update status
    r = client.put(f"/api/tickets/{ticket['id']}", json={"status": "in_progress"})
    assert r.status_code == 200
    assert r.json()["status"] == "in_progress"

    # Add reply
    r = client.post(
        f"/api/tickets/{ticket['id']}/replies",
        json={"author_id": user["id"], "content": "We are looking into it."},
    )
    assert r.status_code == 201, r.text
    reply = r.json()
    assert reply["ticket_id"] == ticket["id"]

    # List replies
    r = client.get(f"/api/tickets/{ticket['id']}/replies")
    assert r.status_code == 200
    replies = r.json()
    assert len(replies) >= 1

    # Delete ticket
    r = client.delete(f"/api/tickets/{ticket['id']}")
    assert r.status_code == 204

    # Now ticket should 404
    r = client.get(f"/api/tickets/{ticket['id']}")
    assert r.status_code == 404

