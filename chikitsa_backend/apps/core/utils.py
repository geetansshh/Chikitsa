"""
Utility functions for the Chikitsa application.
Reusable helper functions following DRY principle.
"""

import re
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings


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


def is_valid_phone(phone: str) -> bool:
    """
    Validate phone number format.
    
    Args:
        phone: Phone number string
    
    Returns:
        True if valid, False otherwise
    """
    pattern = r'^\+?1?\d{9,15}$'
    return bool(re.match(pattern, phone))


def is_valid_email(email: str) -> bool:
    """
    Validate email format.
    
    Args:
        email: Email address string
    
    Returns:
        True if valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def send_notification_email(
    to_email: str,
    subject: str,
    message: str,
    html_message: Optional[str] = None
) -> bool:
    """
    Send notification email.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        message: Plain text message
        html_message: HTML message (optional)
    
    Returns:
        True if sent successfully, False otherwise
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception:
        return False


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


def format_currency(amount: float, currency: str = 'USD') -> str:
    """
    Format amount as currency string.
    
    Args:
        amount: Numeric amount
        currency: Currency code
    
    Returns:
        Formatted currency string
    """
    currency_symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'INR': '₹',
    }
    symbol = currency_symbols.get(currency, '$')
    return f'{symbol}{amount:,.2f}'


def sanitize_text(text: str) -> str:
    """
    Sanitize text input to prevent XSS and other attacks.
    
    Args:
        text: Input text
    
    Returns:
        Sanitized text
    """
    import html
    return html.escape(text.strip())


def get_client_ip(request) -> str:
    """
    Get client IP address from request.
    
    Args:
        request: Django request object
    
    Returns:
        Client IP address string
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')
