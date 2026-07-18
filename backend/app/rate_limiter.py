"""
rate_limiter.py
───────────────
Central rate-limiting configuration for ShowUp API.

All thresholds are read from environment variables so they can be tuned
without touching code. Safe defaults are provided for local development.

Usage in a blueprint:
    from app.rate_limiter import limiter, limit_auth_strict, limit_public, ...

    @bp.route("/something")
    @limit_public()
    def some_view(): ...

    @bp.route("/login", methods=["POST"])
    @limit_auth_strict()
    def login(): ...
"""

import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import get_jwt_identity
from flask import request


# ── Key-function helpers ─────────────────────────────────────────────────────

def _get_user_or_ip():
    """
    For authenticated endpoints: key by JWT identity (user ID).
    Falls back to IP if the token is missing (shouldn't happen on @jwt_required routes).
    """
    try:
        identity = get_jwt_identity()
        if identity:
            return f"user:{identity}"
    except Exception:
        pass
    return f"ip:{get_remote_address()}"


def _get_ip():
    """Always key by the client's remote IP address."""
    return f"ip:{get_remote_address()}"


# ── Limiter instance (attached to app in create_app) ────────────────────────

limiter = Limiter(
    key_func=_get_ip,          # default key; overridden per-decorator where needed
    default_limits=[],         # no implicit global limit — we apply explicitly
    storage_uri=os.getenv("RATELIMIT_STORAGE_URL", "memory://"),
    strategy="fixed-window",   # can be "moving-window" for stricter accuracy
)


# ── Threshold helpers — read from env with defaults ─────────────────────────

def _env_int(key: str, default: int) -> int:
    try:
        return int(os.getenv(key, default))
    except (TypeError, ValueError):
        return default


def _auth_login_limits():
    per_min  = _env_int("RL_AUTH_LOGIN_PER_MIN",  5)
    per_hour = _env_int("RL_AUTH_LOGIN_PER_HOUR", 20)
    return [f"{per_min} per minute", f"{per_hour} per hour"]


def _auth_otp_send_limits():
    per_min  = _env_int("RL_AUTH_OTP_SEND_PER_MIN",  3)
    per_hour = _env_int("RL_AUTH_OTP_SEND_PER_HOUR", 10)
    return [f"{per_min} per minute", f"{per_hour} per hour"]


def _auth_otp_verify_limits():
    per_min = _env_int("RL_AUTH_OTP_VERIFY_PER_MIN", 10)
    return [f"{per_min} per minute"]


def _public_limits():
    per_min  = _env_int("RL_PUBLIC_PER_MIN",  60)
    per_hour = _env_int("RL_PUBLIC_PER_HOUR", 600)
    return [f"{per_min} per minute", f"{per_hour} per hour"]


def _authed_limits():
    per_min  = _env_int("RL_AUTHED_PER_MIN",  30)
    per_hour = _env_int("RL_AUTHED_PER_HOUR", 300)
    return [f"{per_min} per minute", f"{per_hour} per hour"]


def _analysis_limits():
    per_min  = _env_int("RL_ANALYSIS_PER_MIN",  5)
    per_hour = _env_int("RL_ANALYSIS_PER_HOUR", 20)
    return [f"{per_min} per minute", f"{per_hour} per hour"]


# ── Reusable decorator factories ─────────────────────────────────────────────

def limit_auth_strict():
    """
    Strict per-IP limit for login / register.
    Default: 5/min, 20/hour per IP.
    """
    return limiter.limit(
        _auth_login_limits,
        key_func=_get_ip,
    )


def limit_auth_otp_send():
    """
    Strict per-IP limit for OTP send.
    Default: 3/min, 10/hour per IP.
    """
    return limiter.limit(
        _auth_otp_send_limits,
        key_func=_get_ip,
    )


def limit_auth_otp_verify():
    """
    Per-IP limit for OTP verify.
    Default: 10/min per IP.
    Account-level exponential backoff is handled in the view logic (auth.py).
    """
    return limiter.limit(
        _auth_otp_verify_limits,
        key_func=_get_ip,
    )


def limit_public():
    """
    Moderate per-IP limit for public read-only endpoints.
    Default: 60/min, 600/hour per IP.
    """
    return limiter.limit(
        _public_limits,
        key_func=_get_ip,
    )


def limit_authed():
    """
    Loose per-user limit for authenticated write actions.
    Default: 30/min, 300/hour per user identity.
    Falls back to IP if no JWT is present.
    """
    return limiter.limit(
        _authed_limits,
        key_func=_get_user_or_ip,
    )


def limit_analysis():
    """
    Strict per-user limit for expensive AI analysis endpoints.
    Default: 5/min, 20/hour per user identity.
    """
    return limiter.limit(
        _analysis_limits,
        key_func=_get_user_or_ip,
    )


# ── Exponential backoff helpers for OTP verify ───────────────────────────────

def get_backoff_delay(attempts: int) -> int:
    """
    Returns required wait seconds based on number of failed OTP attempts.
    Thresholds are read from env vars.
    """
    warn_after  = _env_int("RL_OTP_BACKOFF_WARN",    2)
    delay_tier1 = _env_int("RL_OTP_BACKOFF_DELAY_1", 30)   # after 1-2 fails
    delay_tier2 = _env_int("RL_OTP_BACKOFF_DELAY_2", 120)  # after 3-4 fails
    delay_tier3 = _env_int("RL_OTP_BACKOFF_DELAY_3", 600)  # after 5+ fails

    if attempts <= warn_after:
        return delay_tier1
    elif attempts <= 4:
        return delay_tier2
    else:
        return delay_tier3
