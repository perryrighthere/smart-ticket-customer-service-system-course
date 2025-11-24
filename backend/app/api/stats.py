from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.models import Ticket, TicketStatus, User
from app.db.session import get_db
from pydantic import BaseModel

router = APIRouter()


class DailyTrendItem(BaseModel):
    date: str
    count: int


class DashboardStats(BaseModel):
    total_tickets: int
    open_tickets: int
    resolved_tickets: int
    avg_response_time_minutes: float  # Mocked for now or calculated if possible
    status_distribution: dict[str, int]
    daily_trend: list[DailyTrendItem]


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Basic Counts
    total_tickets = db.query(Ticket).count()
    open_tickets = db.query(Ticket).filter(Ticket.status == TicketStatus.open).count()
    resolved_tickets = db.query(Ticket).filter(Ticket.status == TicketStatus.resolved).count()
    
    # 2. Status Distribution
    # Result: [('open', 10), ('resolved', 5), ...]
    status_counts = db.query(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status).all()
    status_distribution = {status: count for status, count in status_counts}
    
    # Ensure all statuses are present with 0 if missing
    for status in TicketStatus:
        if status.value not in status_distribution:
            status_distribution[status.value] = 0

    # 3. Daily Trend (Last 7 days)
    # SQLite doesn't have great date functions, so we might do some processing in Python for simplicity in this teaching project
    # or use func.date(Ticket.created_at) if SQLite version supports it.
    # Let's try to fetch last 7 days tickets and aggregate in Python to be safe and DB-agnostic for this simple case.
    
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_tickets = db.query(Ticket.created_at).filter(Ticket.created_at >= seven_days_ago).all()
    
    trend_map = {}
    # Initialize last 7 days with 0
    for i in range(7):
        day = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
        trend_map[day] = 0
        
    for ticket in recent_tickets:
        day_str = ticket.created_at.strftime("%Y-%m-%d")
        if day_str in trend_map:
            trend_map[day_str] += 1
            
    daily_trend = [{"date": date, "count": count} for date, count in sorted(trend_map.items())]

    return DashboardStats(
        total_tickets=total_tickets,
        open_tickets=open_tickets,
        resolved_tickets=resolved_tickets,
        avg_response_time_minutes=120.5,  # Mocked for this lesson
        status_distribution=status_distribution,
        daily_trend=daily_trend
    )
