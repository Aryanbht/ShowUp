"""
github_oauth.py
Handles GitHub OAuth connect flow and repo import for ShowUp.
"""
import os
import requests
from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Student, Project

github_bp = Blueprint("github", __name__)

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Scope: read public repos + user identity
GITHUB_SCOPE = "read:user,public_repo"


def _success(data=None, message=""):
    return jsonify({"success": True, "data": data, "message": message})


def _error(message, status=400):
    return jsonify({"success": False, "data": None, "message": message}), status


# ────────────────────────────────────────────────────────────────────
# STEP 1: Redirect user to GitHub OAuth
# ────────────────────────────────────────────────────────────────────
@github_bp.route("/connect", methods=["GET"])
@jwt_required()
def connect():
    """Generate a GitHub OAuth URL and return it to the frontend."""
    student_id = get_jwt_identity()
    state = student_id  # use student id as state for verification
    oauth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&scope={GITHUB_SCOPE}"
        f"&state={state}"
    )
    return _success({"oauth_url": oauth_url})


# ────────────────────────────────────────────────────────────────────
# STEP 2: GitHub redirects back here with ?code=&state=
# ────────────────────────────────────────────────────────────────────
@github_bp.route("/callback", methods=["GET"])
def callback():
    """Handle GitHub OAuth callback. Exchanges code for token, saves to DB."""
    code = request.args.get("code")
    state = request.args.get("state")  # this is student_id we passed

    if not code or not state:
        return redirect(f"{FRONTEND_URL}/profile/edit?github=error&reason=missing_params")

    # Exchange code for access token
    token_resp = requests.post(
        "https://github.com/login/oauth/access_token",
        json={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
        },
        headers={"Accept": "application/json"},
        timeout=10,
    )

    if token_resp.status_code != 200:
        return redirect(f"{FRONTEND_URL}/profile/edit?github=error&reason=token_exchange_failed")

    token_data = token_resp.json()
    access_token = token_data.get("access_token")

    if not access_token:
        return redirect(f"{FRONTEND_URL}/profile/edit?github=error&reason=no_token")

    # Fetch GitHub user info
    user_resp = requests.get(
        "https://api.github.com/user",
        headers={
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github+json",
        },
        timeout=8,
    )

    if user_resp.status_code != 200:
        return redirect(f"{FRONTEND_URL}/profile/edit?github=error&reason=github_api_failed")

    gh_user = user_resp.json()
    github_username = gh_user.get("login")
    github_profile_url = gh_user.get("html_url")

    # Save to student record
    student = Student.query.get(state)
    if not student:
        return redirect(f"{FRONTEND_URL}/profile/edit?github=error&reason=student_not_found")

    student.github_access_token = access_token
    student.github_username = github_username
    student.github_url = github_profile_url
    db.session.commit()

    return redirect(
        f"{FRONTEND_URL}/profile/edit?github=success&username={github_username}"
    )


# ────────────────────────────────────────────────────────────────────
# List connected user's GitHub repos
# ────────────────────────────────────────────────────────────────────
@github_bp.route("/repos", methods=["GET"])
@jwt_required()
def list_repos():
    """Return the authenticated student's GitHub repos."""
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)

    if not student or not student.github_access_token:
        return _error("GitHub account not connected. Please connect first.", 401)

    page = request.args.get("page", 1, type=int)
    per_page = 30

    resp = requests.get(
        f"https://api.github.com/user/repos",
        headers={
            "Authorization": f"token {student.github_access_token}",
            "Accept": "application/vnd.github+json",
        },
        params={
            "sort": "updated",
            "per_page": per_page,
            "page": page,
            "type": "owner",   # only repos owned by the user
        },
        timeout=10,
    )

    if resp.status_code == 401:
        # Token expired / revoked — clear it
        student.github_access_token = None
        student.github_username = None
        db.session.commit()
        return _error("GitHub token expired. Please reconnect.", 401)

    if resp.status_code != 200:
        return _error("Failed to fetch GitHub repositories.", 500)

    repos = resp.json()
    result = [
        {
            "id": r["id"],
            "name": r["name"],
            "full_name": r["full_name"],
            "description": r.get("description") or "",
            "html_url": r["html_url"],
            "homepage": r.get("homepage") or "",
            "language": r.get("language") or "",
            "topics": r.get("topics", []),
            "stars": r.get("stargazers_count", 0),
            "forks": r.get("forks_count", 0),
            "updated_at": r.get("updated_at", ""),
            "private": r.get("private", False),
        }
        for r in repos
    ]

    return _success(result)


# ────────────────────────────────────────────────────────────────────
# Import a repo as a project
# ────────────────────────────────────────────────────────────────────
@github_bp.route("/import", methods=["POST"])
@jwt_required()
def import_repo():
    """Import a GitHub repo as a ShowUp project."""
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)

    if not student or not student.github_access_token:
        return _error("GitHub account not connected.", 401)

    body = request.get_json() or {}
    repo_full_name = body.get("full_name")  # e.g. "aryanb/my-project"
    if not repo_full_name:
        return _error("repo full_name is required.")

    # Fetch full repo details
    repo_resp = requests.get(
        f"https://api.github.com/repos/{repo_full_name}",
        headers={
            "Authorization": f"token {student.github_access_token}",
            "Accept": "application/vnd.github+json",
        },
        timeout=8,
    )
    if repo_resp.status_code != 200:
        return _error("Failed to fetch repo details from GitHub.")

    repo = repo_resp.json()

    # Try to fetch README
    readme_text = ""
    readme_resp = requests.get(
        f"https://api.github.com/repos/{repo_full_name}/readme",
        headers={
            "Authorization": f"token {student.github_access_token}",
            "Accept": "application/vnd.github.raw",
        },
        timeout=8,
    )
    if readme_resp.status_code == 200:
        readme_text = readme_resp.text[:5000]

    # Fetch languages
    lang_resp = requests.get(
        f"https://api.github.com/repos/{repo_full_name}/languages",
        headers={
            "Authorization": f"token {student.github_access_token}",
            "Accept": "application/vnd.github+json",
        },
        timeout=6,
    )
    languages = list(lang_resp.json().keys()) if lang_resp.status_code == 200 else []
    if repo.get("language") and repo["language"] not in languages:
        languages.insert(0, repo["language"])

    tech_stack = ",".join(languages[:8])

    # Check if already imported
    existing = Project.query.filter_by(
        github_url=repo["html_url"]
    ).first()
    if existing:
        return _error("This repository has already been imported as a project.")

    # Create the project
    project = Project(
        title=repo["name"].replace("-", " ").replace("_", " ").title(),
        description=repo.get("description") or "",
        tech_stack=tech_stack,
        live_url=repo.get("homepage") or "",
        github_url=repo["html_url"],
        screenshot_url="",
        readme=readme_text,
        student_id=student_id,
    )
    db.session.add(project)
    db.session.commit()

    return _success(project.to_dict(), "Project imported successfully!")


# ────────────────────────────────────────────────────────────────────
# Disconnect GitHub
# ────────────────────────────────────────────────────────────────────
@github_bp.route("/disconnect", methods=["POST"])
@jwt_required()
def disconnect():
    """Remove GitHub connection from the student's account."""
    student_id = get_jwt_identity()
    student = Student.query.get(student_id)

    if not student:
        return _error("Student not found.", 404)

    student.github_access_token = None
    student.github_username = None
    # Keep github_url so portfolio still shows the link
    db.session.commit()

    return _success(message="GitHub account disconnected.")
