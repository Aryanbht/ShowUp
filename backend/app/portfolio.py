import re
import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app import db
from app.models import Student, Project
from app.utils import generate_username

portfolio_bp = Blueprint('portfolio', __name__, url_prefix='/api/portfolio')


def _success(data=None, message=""):
    return jsonify({"success": True, "data": data, "message": message})


def _error(message, status=400):
    return jsonify({"success": False, "message": message}), status


@portfolio_bp.route('/check-username', methods=['GET'])
def check_username():
    """Check if a username is available. Returns 200 if available, 409 if taken."""
    username = request.args.get('username', '').strip().lower()
    username = re.sub(r'[^a-z0-9_]', '', username)
    if len(username) < 3:
        return _error("Username must be at least 3 characters")
    existing = Student.query.filter_by(username=username).first()
    if existing:
        return _error("Username already taken — choose another", 409)
    return _success({"available": True}, "Username is available")


@portfolio_bp.route('/<username>', methods=['GET'])
def get_portfolio(username):
    """Public portfolio page data. No auth required."""
    student = Student.query.filter_by(username=username).first()
    if not student:
        return _error("Portfolio not found", 404)

    # Optional viewer identity
    viewer_id = None
    try:
        verify_jwt_in_request(optional=True)
        viewer_id = get_jwt_identity()
    except Exception:
        pass

    projects = Project.query.filter_by(
        student_id=student.id
    ).order_by(Project.created_at.desc()).all()

    projects_data = []
    for project in projects:
        analysis = None
        if project.ai_analysis_used and project.ai_analysis and project.show_ai_analysis:
            try:
                analysis = json.loads(project.ai_analysis)
            except Exception:
                analysis = None
            if analysis and not getattr(project, 'show_brutal_line', True):
                analysis.pop('brutal_honest_line', None)

        projects_data.append({
            "id": str(project.id),
            "title": project.title,
            "description": project.description,
            "tech_stack": project.tech_stack,
            "live_url": project.live_url,
            "github_url": project.github_url,
            "screenshot_url": project.screenshot_url,
            "view_count": project.view_count,
            "ai_analysis": analysis,
            "ai_analysis_used": project.ai_analysis_used,
            "analysis_is_public": project.show_ai_analysis,
            "created_at": project.created_at.isoformat() if project.created_at else None,
        })


    skills = student.skills.split(",") if student.skills else []

    return _success({
        "student": {
            "id": str(student.id),
            "name": student.name,
            "username": student.username,
            "college": student.college,
            "bio": student.bio,
            "avatar_url": student.avatar_url,
            "credibility_score": student.credibility_score,
            "skills": skills,
        },
        "customization": {
            "template": student.portfolio_template or 'classic',
            "bg_color": student.portfolio_bg_color or '#FFFFFF',
            "text_color": student.portfolio_text_color or '#1A1A1A',
            "accent_color": student.portfolio_accent_color or '#1A1A1A',
            "card_color": student.portfolio_card_color or '#F8F8F8',
            "font": student.portfolio_font or 'Inter',
        },
        "projects": projects_data,
        "viewer_is_owner": str(student.id) == str(viewer_id) if viewer_id else False,
    })


@portfolio_bp.route('/customization', methods=['PATCH'])
@jwt_required()
def update_customization():
    """Update portfolio template, colors, font, and username. Owner only."""
    current_user_id = get_jwt_identity()
    student = Student.query.get(current_user_id)
    if not student:
        return _error("User not found", 404)

    data = request.get_json() or {}

    allowed_templates = ['modern_midnight', 'game_dev_edition', 'neural_os', 'terminal_core', 'obsidian_iridescence']
    allowed_fonts = ['Inter', 'IBM Plex Mono', 'Georgia', 'Space Grotesk',
                     'DM Serif Display', 'Roboto', 'Poppins', 'Sora', 'JetBrains Mono']

    if 'template' in data:
        if data['template'] not in allowed_templates:
            return _error("Invalid template")
        student.portfolio_template = data['template']

    if 'bg_color' in data:
        student.portfolio_bg_color = data['bg_color']

    if 'text_color' in data:
        student.portfolio_text_color = data['text_color']

    if 'accent_color' in data:
        student.portfolio_accent_color = data['accent_color']

    if 'card_color' in data:
        student.portfolio_card_color = data['card_color']

    if 'font' in data:
        if data['font'] not in allowed_fonts:
            return _error("Invalid font")
        student.portfolio_font = data['font']

    if 'username' in data:
        new_username = data['username'].strip().lower()
        new_username = re.sub(r'[^a-z0-9_]', '', new_username)
        if len(new_username) < 3:
            return _error("Username must be at least 3 characters")
        existing = Student.query.filter_by(username=new_username).first()
        if existing and str(existing.id) != str(current_user_id):
            return _error("Username already taken", 409)
        student.username = new_username

    db.session.commit()

    return _success({
        "template": student.portfolio_template,
        "bg_color": student.portfolio_bg_color,
        "text_color": student.portfolio_text_color,
        "accent_color": student.portfolio_accent_color,
        "card_color": student.portfolio_card_color,
        "font": student.portfolio_font,
        "username": student.username,
        "portfolio_url": f"/portfolio/{student.username}",
    }, "Portfolio updated")
