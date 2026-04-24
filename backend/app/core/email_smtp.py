import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


def smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_FROM)


def send_plain_email(to_addr: str, subject: str, body: str) -> None:
    """Send a single plain-text email. Raises on SMTP failure."""
    if not smtp_configured():
        raise RuntimeError("SMTP is not configured (SMTP_HOST / SMTP_FROM)")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_addr
    msg.set_content(body)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as server:
        if settings.SMTP_USE_TLS:
            server.starttls()
        if settings.SMTP_USER:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
