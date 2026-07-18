"""
validators.py
─────────────
Strict schema-based input validation for ShowUp API.

Philosophy: REJECT, don't sanitize. If a field doesn't match the schema
exactly (type, length, format), the request is rejected with 422 immediately.

Usage:
    from app.validators import require_json_schema, require_query_schema, schemas

    @bp.route("/login", methods=["POST"])
    @require_json_schema(schemas.LOGIN)
    def login():
        body = request.validated  # already cleaned & type-checked
        ...
"""

import re
import uuid
from functools import wraps
from flask import request, jsonify


# ═══════════════════════════════════════════════════════════════════════════
# CONSTANTS / REGEX PATTERNS
# ═══════════════════════════════════════════════════════════════════════════

_RE_EMAIL      = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')
_RE_HEX_COLOR  = re.compile(r'^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$')
_RE_USERNAME   = re.compile(r'^[a-z0-9_]{3,30}$')
_RE_OTP        = re.compile(r'^\d{6}$')
_RE_DIGITS_ONLY = re.compile(r'^\d+$')

# Allowed URL schemes — reject javascript:, data:, etc.
_SAFE_URL_SCHEMES = ('http://', 'https://')

# GitHub repo URL pattern
_RE_GITHUB_URL = re.compile(
    r'^https?://github\.com/[a-zA-Z0-9\-_.]+/[a-zA-Z0-9\-_.]+(?:\.git)?/?$'
)


# ═══════════════════════════════════════════════════════════════════════════
# VALIDATION ERROR
# ═══════════════════════════════════════════════════════════════════════════

class ValidationError(Exception):
    """Raised when input fails schema validation."""
    def __init__(self, errors: dict):
        self.errors = errors
        super().__init__(str(errors))


# ═══════════════════════════════════════════════════════════════════════════
# FIELD VALIDATORS
# Each returns (cleaned_value, error_string | None)
# ═══════════════════════════════════════════════════════════════════════════

def _v_str(value, *, min_len=0, max_len=255, allow_empty=True, pattern=None, label="Field"):
    if not isinstance(value, str):
        return None, f"{label} must be a string"
    stripped = value.strip()
    if not allow_empty and not stripped:
        return None, f"{label} must not be empty"
    if len(stripped) < min_len:
        return None, f"{label} must be at least {min_len} characters"
    if len(stripped) > max_len:
        return None, f"{label} must be at most {max_len} characters"
    if pattern and not pattern.match(stripped):
        return None, f"{label} has an invalid format"
    return stripped, None


def _v_email(value, *, label="Email"):
    val, err = _v_str(value, min_len=5, max_len=254, allow_empty=False, label=label)
    if err:
        return None, err
    if not _RE_EMAIL.match(val):
        return None, f"{label} must be a valid email address"
    return val.lower(), None


def _v_password(value, *, label="Password"):
    val, err = _v_str(value, min_len=8, max_len=128, allow_empty=False, label=label)
    if err:
        return None, err
    return val, None


def _v_url(value, *, label="URL", allow_empty=True, github_only=False):
    val, err = _v_str(value, max_len=500, label=label)
    if err:
        return None, err
    if not val:
        return None, None  # empty is OK when allow_empty=True
    if github_only:
        if not _RE_GITHUB_URL.match(val):
            return None, f"{label} must be a valid public GitHub repository URL (https://github.com/owner/repo)"
        return val, None
    if not any(val.startswith(s) for s in _SAFE_URL_SCHEMES):
        return None, f"{label} must start with http:// or https://"
    if len(val) < 10:
        return None, f"{label} is too short to be a valid URL"
    return val, None


def _v_hex_color(value, *, label="Color"):
    val, err = _v_str(value, min_len=4, max_len=7, allow_empty=False, label=label)
    if err:
        return None, err
    if not _RE_HEX_COLOR.match(val):
        return None, f"{label} must be a valid hex color (e.g. #fff or #ffffff)"
    return val.lower(), None


def _v_enum(value, *, choices, label="Field"):
    if not isinstance(value, str):
        return None, f"{label} must be a string"
    if value not in choices:
        readable = ", ".join(f'"{c}"' for c in choices)
        return None, f"{label} must be one of: {readable}"
    return value, None


def _v_int(value, *, min_val=None, max_val=None, label="Field"):
    if isinstance(value, bool):  # bool is subclass of int — reject
        return None, f"{label} must be an integer, not a boolean"
    if not isinstance(value, int):
        return None, f"{label} must be an integer"
    if min_val is not None and value < min_val:
        return None, f"{label} must be at least {min_val}"
    if max_val is not None and value > max_val:
        return None, f"{label} must be at most {max_val}"
    return value, None


def _v_bool(value, *, label="Field"):
    if not isinstance(value, bool):
        return None, f"{label} must be true or false"
    return value, None


def _v_list(value, *, max_items=20, item_max_len=60, label="Field"):
    if not isinstance(value, list):
        return None, f"{label} must be an array"
    if len(value) > max_items:
        return None, f"{label} must have at most {max_items} items"
    cleaned = []
    for i, item in enumerate(value):
        if not isinstance(item, str):
            return None, f"{label}[{i}] must be a string"
        s = item.strip()
        if len(s) > item_max_len:
            return None, f"{label}[{i}] must be at most {item_max_len} characters"
        if s:
            cleaned.append(s)
    return cleaned, None


def _v_otp(value, *, label="OTP"):
    val, err = _v_str(value, min_len=6, max_len=6, allow_empty=False, label=label)
    if err:
        return None, err
    if not _RE_OTP.match(val):
        return None, f"{label} must be exactly 6 digits"
    return val, None


def _v_username(value, *, label="Username"):
    val, err = _v_str(value, min_len=3, max_len=30, allow_empty=False, label=label)
    if err:
        return None, err
    lower = val.lower()
    if not _RE_USERNAME.match(lower):
        return None, f"{label} may only contain lowercase letters, numbers, and underscores (3–30 chars)"
    return lower, None


# ═══════════════════════════════════════════════════════════════════════════
# SCHEMA DEFINITIONS
# Format: { "field_name": (validator_fn, required, kwargs) }
# ═══════════════════════════════════════════════════════════════════════════

class _FieldDef:
    __slots__ = ("fn", "required", "kwargs")

    def __init__(self, fn, required=True, **kwargs):
        self.fn = fn
        self.required = required
        self.kwargs = kwargs

    def validate(self, value, name):
        return self.fn(value, label=name.replace("_", " ").title(), **self.kwargs)


def _f(fn, required=True, **kw):
    return _FieldDef(fn, required, **kw)


class schemas:
    """All endpoint schemas as class attributes."""

    # ── Auth ──────────────────────────────────────────────────────────────
    REGISTER = {
        "name":     _f(_v_str,   min_len=2, max_len=80,  allow_empty=False),
        "email":    _f(_v_email),
        "college":  _f(_v_str,   min_len=2, max_len=120, allow_empty=False),
        "password": _f(_v_password),
    }

    LOGIN = {
        "email":    _f(_v_email),
        "password": _f(_v_str, min_len=1, max_len=128, allow_empty=False),
    }

    SEND_OTP = {
        "email": _f(_v_email),
        "name":  _f(_v_str, required=False, min_len=0, max_len=80),
    }

    VERIFY_OTP = {
        "email":   _f(_v_email),
        "otp":     _f(_v_otp),
        "name":    _f(_v_str, required=False, min_len=2, max_len=80),
        "college": _f(_v_str, required=False, min_len=2, max_len=120),
    }

    # ── Projects ──────────────────────────────────────────────────────────
    CREATE_PROJECT = {
        "title":           _f(_v_str,  min_len=2, max_len=100, allow_empty=False),
        "description":     _f(_v_str,  required=False, min_len=0, max_len=500),
        "tech_stack":      _f(_v_list, required=False, max_items=15, item_max_len=30),
        "github_url":      _f(_v_url,  required=False, allow_empty=True),
        "live_url":        _f(_v_url,  required=False, allow_empty=True),
        "screenshot_url":  _f(_v_url,  required=False, allow_empty=True),
        "show_ai_analysis":_f(_v_bool, required=False),
        "readme":          _f(_v_str,  required=False, min_len=0, max_len=5000),
    }

    UPDATE_PROJECT = {
        "title":           _f(_v_str,  required=False, min_len=2, max_len=100, allow_empty=False),
        "description":     _f(_v_str,  required=False, min_len=0, max_len=500),
        "tech_stack":      _f(_v_list, required=False, max_items=15, item_max_len=30),
        "github_url":      _f(_v_url,  required=False, allow_empty=True),
        "live_url":        _f(_v_url,  required=False, allow_empty=True),
        "screenshot_url":  _f(_v_url,  required=False, allow_empty=True),
        "show_ai_analysis":_f(_v_bool, required=False),
        "readme":          _f(_v_str,  required=False, min_len=0, max_len=5000),
    }

    ANALYSE_PROJECT = {
        "year_of_study": _f(_v_int, required=False, min_val=1, max_val=6),
    }

    GITHUB_FETCH = {
        "url": _f(_v_url, github_only=True, allow_empty=False),
    }

    # ── Students ──────────────────────────────────────────────────────────
    UPDATE_STUDENT = {
        "name":               _f(_v_str,  required=False, min_len=2, max_len=80,   allow_empty=False),
        "college":            _f(_v_str,  required=False, min_len=2, max_len=120,  allow_empty=False),
        "bio":                _f(_v_str,  required=False, min_len=0, max_len=2000),
        "avatar_url":         _f(_v_url,  required=False, allow_empty=True),
        "location":           _f(_v_str,  required=False, min_len=0, max_len=100),
        "github_url":         _f(_v_url,  required=False, allow_empty=True),
        "skills":             _f(_v_list, required=False, max_items=20, item_max_len=40),
        "password":           _f(_v_password, required=False),
        "college_start_year": _f(_v_int,  required=False, min_val=1990, max_val=2035),
        "college_end_year":   _f(_v_int,  required=False, min_val=1990, max_val=2040),
        "course":             _f(_v_str,  required=False, min_len=0, max_len=100),
    }

    FIND_TEAMMATES = {
        "type":   _f(_v_enum, choices=["Online", "Offline"]),
        "region": _f(_v_str,  required=False, min_len=0, max_len=100),
        "skills": _f(_v_list, required=False, max_items=20, item_max_len=40),
    }

    EXIT_SURVEY = {
        "email":    _f(_v_email),
        "feedback": _f(_v_str, min_len=10, max_len=2000, allow_empty=False),
    }

    # ── Portfolio ─────────────────────────────────────────────────────────
    _ALLOWED_TEMPLATES = [
        'modern_midnight', 'game_dev_edition', 'neural_os',
        'terminal_core', 'obsidian_iridescence', 'shaolin_zen'
    ]
    _ALLOWED_FONTS = [
        'Inter', 'IBM Plex Mono', 'Georgia', 'Space Grotesk',
        'DM Serif Display', 'Roboto', 'Poppins', 'Sora', 'JetBrains Mono'
    ]

    UPDATE_CUSTOMIZATION = {
        "template":     _f(_v_enum,      required=False, choices=_ALLOWED_TEMPLATES),
        "font":         _f(_v_enum,      required=False, choices=_ALLOWED_FONTS),
        "bg_color":     _f(_v_hex_color, required=False),
        "text_color":   _f(_v_hex_color, required=False),
        "accent_color": _f(_v_hex_color, required=False),
        "card_color":   _f(_v_hex_color, required=False),
        "username":     _f(_v_username,  required=False),
    }

    CHECK_USERNAME_QUERY = {
        "username": _f(_v_username),
    }

    # ── Chat ──────────────────────────────────────────────────────────────
    SEND_REQUEST = {
        "receiver_id": _f(_v_str, min_len=1, max_len=100, allow_empty=False),
        "note":        _f(_v_str, required=False, min_len=0, max_len=500),
    }

    SEND_MESSAGE = {
        "message_type": _f(_v_enum, choices=["text", "voice"]),
        "content":      _f(_v_str, required=False, min_len=1, max_len=2000),
        "voice_url":    _f(_v_url, required=False, allow_empty=True),
    }

    REPORT_USER = {
        "reason": _f(_v_str, min_len=10, max_len=500, allow_empty=False),
    }

    # ── Skills ────────────────────────────────────────────────────────────
    SAVE_SKILL = {
        "skill": _f(_v_str, min_len=2, max_len=60, allow_empty=False),
    }


# ═══════════════════════════════════════════════════════════════════════════
# CORE VALIDATION ENGINE
# ═══════════════════════════════════════════════════════════════════════════

def validate(schema: dict, data: dict, partial: bool = False) -> dict:
    """
    Validate `data` against `schema`.

    Args:
        schema:  dict of { field_name: _FieldDef }
        data:    the parsed JSON body (or query params as dict)
        partial: if True, skip required checks (for PATCH/PUT)

    Returns:
        cleaned dict containing only schema-defined fields.

    Raises:
        ValidationError with { field: error_message } dict.
    """
    errors = {}
    cleaned = {}

    for name, field_def in schema.items():
        present = name in data

        if not present:
            if field_def.required and not partial:
                errors[name] = f"{name.replace('_', ' ').title()} is required"
            continue

        value = data[name]

        # Allow explicit null/None only for optional nullable fields
        if value is None:
            if field_def.required and not partial:
                errors[name] = f"{name.replace('_', ' ').title()} must not be null"
            else:
                cleaned[name] = None
            continue

        clean_val, error = field_def.validate(value, name)
        if error:
            errors[name] = error
        else:
            cleaned[name] = clean_val

    # Reject any extra fields not in schema (strict allowlist)
    extra = set(data.keys()) - set(schema.keys())
    if extra:
        for field in extra:
            errors[field] = f"Unknown field '{field}' is not allowed"

    if errors:
        raise ValidationError(errors)

    return cleaned


# ═══════════════════════════════════════════════════════════════════════════
# DECORATOR FACTORIES
# ═══════════════════════════════════════════════════════════════════════════

def _validation_error_response(errors: dict):
    return jsonify({
        "success": False,
        "data": None,
        "code": "VALIDATION_ERROR",
        "message": "Validation failed. Please check the fields below.",
        "errors": errors,
    }), 422


def require_json_schema(schema: dict, partial: bool = False):
    """
    Decorator: parse JSON body, validate against schema, reject with 422 if invalid.
    On success, attaches `request.validated` dict with cleaned values.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return _validation_error_response(
                    {"_body": "Request must have Content-Type: application/json"}
                )
            data = request.get_json(silent=True)
            if data is None:
                return _validation_error_response(
                    {"_body": "Request body must be valid JSON"}
                )
            if not isinstance(data, dict):
                return _validation_error_response(
                    {"_body": "Request body must be a JSON object"}
                )
            try:
                request.validated = validate(schema, data, partial=partial)
            except ValidationError as exc:
                return _validation_error_response(exc.errors)
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def require_query_schema(schema: dict):
    """
    Decorator: validate GET query parameters against schema.
    On success, attaches `request.validated` dict with cleaned values.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            data = {k: v for k, v in request.args.items()}
            try:
                request.validated = validate(schema, data, partial=False)
            except ValidationError as exc:
                return _validation_error_response(exc.errors)
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def require_partial_json_schema(schema: dict):
    """
    Like require_json_schema but in partial mode — no required-field enforcement.
    Use for PATCH/PUT endpoints where all fields are optional.
    Also allows extra fields to pass through (for PATCH where only a subset is sent).
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return _validation_error_response(
                    {"_body": "Request must have Content-Type: application/json"}
                )
            data = request.get_json(silent=True)
            if data is None:
                return _validation_error_response(
                    {"_body": "Request body must be valid JSON"}
                )
            if not isinstance(data, dict):
                return _validation_error_response(
                    {"_body": "Request body must be a JSON object"}
                )
            try:
                # Partial mode: only validate fields that ARE present
                # Filter data to only known fields, reject unknowns
                known = set(schema.keys())
                unknown = set(data.keys()) - known
                if unknown:
                    raise ValidationError(
                        {f: f"Unknown field '{f}' is not allowed" for f in unknown}
                    )
                request.validated = validate(schema, data, partial=True)
            except ValidationError as exc:
                return _validation_error_response(exc.errors)
            return fn(*args, **kwargs)
        return wrapper
    return decorator
