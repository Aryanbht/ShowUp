from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import CustomSkill
from better_profanity import profanity

profanity.load_censor_words()
if "aryan" in profanity.CENSOR_WORDSET:
    profanity.CENSOR_WORDSET.remove("aryan")

skills_bp = Blueprint('skills', __name__, url_prefix='/api/skills')

@skills_bp.route('/custom', methods=['POST'])
@jwt_required()
def save_custom_skill():
    data = request.get_json() or {}
    skill = data.get('skill', '').strip()

    if not skill or len(skill) < 2 or len(skill) > 60:
        return jsonify({"success": False}), 400

    # No profanity in custom skills
    if profanity.contains_profanity(skill):
        return jsonify({"success": False, "message": "Inappropriate skill name"}), 400

    # Save or increment usage count
    existing = CustomSkill.query.filter_by(
        skill=skill.title()
    ).first()

    if existing:
        existing.usage_count += 1
    else:
        new_skill = CustomSkill(skill=skill.title())
        db.session.add(new_skill)

    db.session.commit()
    return jsonify({"success": True}), 200


@skills_bp.route('/custom', methods=['GET'])
def get_custom_skills():
    # Return top 50 most used custom skills
    # Frontend can merge these with the hardcoded list
    skills = CustomSkill.query.order_by(
        CustomSkill.usage_count.desc()
    ).limit(50).all()

    return jsonify({
        "success": True,
        "data": [s.skill for s in skills]
    }), 200
