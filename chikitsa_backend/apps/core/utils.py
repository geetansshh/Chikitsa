"""
Utility functions for the Chikitsa application.
Reusable helper functions following DRY principle.
"""

from datetime import datetime, timedelta
from typing import Optional, List

from django.utils import timezone


def generate_time_slots(
    start_hour: int = 9,
    end_hour: int = 17,
    interval_minutes: int = 30,
    date: Optional[datetime] = None
) -> List[str]:
    """
    Generate available time slots for appointments.
    
    Args:
        start_hour: Starting hour (24-hour format)
        end_hour: Ending hour (24-hour format)
        interval_minutes: Interval between slots in minutes
        date: Date for which to generate slots
    
    Returns:
        List of time slot strings in HH:MM format
    """
    slots = []
    current_time = datetime.combine(
        date or datetime.today(),
        datetime.min.time().replace(hour=start_hour)
    )
    end_time = datetime.combine(
        date or datetime.today(),
        datetime.min.time().replace(hour=end_hour)
    )
    
    while current_time < end_time:
        slots.append(current_time.strftime('%H:%M'))
        current_time += timedelta(minutes=interval_minutes)
    
    return slots


def calculate_age(birth_date: datetime) -> int:
    """
    Calculate age from birth date.
    
    Args:
        birth_date: Date of birth
    
    Returns:
        Age in years
    """
    today = timezone.now().date()
    return today.year - birth_date.year - (
        (today.month, today.day) < (birth_date.month, birth_date.day)
    )
