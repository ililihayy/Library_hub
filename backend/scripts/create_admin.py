#!/usr/bin/env python3
"""
Create or update a librarian (admin) account with a bcrypt-hashed password.

Usage (from repository `backend/` directory):

  python scripts/create_admin.py --email admin@example.com --password 'YourSecurePass'

Environment (optional):

  ADMIN_EMAIL, ADMIN_PASSWORD — used when CLI flags are omitted.

  DATABASE_URL — same as the API (default: sqlite:///./library_hub.db)
"""

from __future__ import annotations

import argparse
import getpass
import os
import sys

# Allow `python scripts/create_admin.py` from `backend/`
_BACKEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)

from sqlalchemy.orm import Session  # noqa: E402

from app.core.passwords import hash_password  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app import models  # noqa: E402


def upsert_admin(
    db: Session,
    *,
    email: str,
    password: str,
    full_name: str,
    phone: str,
    address: str,
    force: bool,
) -> models.User:
    email = email.strip().lower()
    user = db.query(models.User).filter(models.User.email == email).first()
    hashed = hash_password(password)

    if user:
        if not force:
            raise SystemExit(
                f"User with email {email!r} already exists. "
                "Pass --force to set password and promote to librarian."
            )
        user.full_name = full_name
        user.phone = phone
        user.address = address
        user.role = "librarian"
        user.hashed_password = hashed
        user.blacklisted = False
        user.mfa_enabled = False
        user.mfa_secret = None
        user.mfa_email_code_hash = None
        user.mfa_email_code_expires_at = None
        db.commit()
        db.refresh(user)
        return user

    user = models.User(
        full_name=full_name,
        email=email,
        phone=phone,
        address=address,
        role="librarian",
        blacklisted=False,
        hashed_password=hashed,
        mfa_enabled=False,
        mfa_secret=None,
        mfa_email_code_hash=None,
        mfa_email_code_expires_at=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or update a librarian admin user.")
    parser.add_argument("--email", default=os.getenv("ADMIN_EMAIL", ""), help="Admin email")
    parser.add_argument("--password", default=os.getenv("ADMIN_PASSWORD", ""), help="Password (omit to prompt)")
    parser.add_argument("--full-name", default="System Administrator", dest="full_name")
    parser.add_argument("--phone", default="+0000000000")
    parser.add_argument("--address", default="Library HQ")
    parser.add_argument(
        "--force",
        action="store_true",
        help="If the user exists, reset password and set role to librarian.",
    )
    args = parser.parse_args()

    email = args.email or ""
    if not email:
        parser.error("--email is required (or set ADMIN_EMAIL)")

    password = args.password
    if not password:
        password = getpass.getpass("Password: ")
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            raise SystemExit("Passwords do not match.")

    if len(password) < 8:
        raise SystemExit("Password must be at least 8 characters.")

    db = SessionLocal()
    try:
        user = upsert_admin(
            db,
            email=email,
            password=password,
            full_name=args.full_name,
            phone=args.phone,
            address=args.address,
            force=args.force,
        )
        print(f"OK: librarian user id={user.id} email={user.email!r}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
