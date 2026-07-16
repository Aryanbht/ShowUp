import bcrypt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app import db
from app.models import Student, ExitReview, BlockedUser
from better_profanity import profanity

profanity.load_censor_words()
if "aryan" in profanity.CENSOR_WORDSET:
    profanity.CENSOR_WORDSET.remove("aryan")

def contains_profanity(text):
    return profanity.contains_profanity(text)

students_bp = Blueprint("students", __name__)


def _success(data=None, message=""):
    return jsonify({"success": True, "data": data, "message": message})


def _error(message, status=400):
    return jsonify({"success": False, "data": None, "message": message}), status


@students_bp.route("/leaderboard", methods=["GET"])
def leaderboard():
    """Top 10 students by credibility_score."""
    top_students = (
        Student.query
        .order_by(Student.credibility_score.desc())
        .limit(10)
        .all()
    )
    return _success([s.to_dict() for s in top_students])


@students_bp.route("/<string:student_id>", methods=["GET"])
def get_student(student_id):
    """Public student portfolio — no auth required."""
    student = Student.query.get(student_id)
    if not student:
        return _error("Student not found", 404)
    return _success(student.to_dict(include_email=False))


@students_bp.route("/<string:student_id>", methods=["PUT"])
@jwt_required()
def update_student(student_id):
    """Update profile — owner only."""
    current_id = get_jwt_identity()
    if str(current_id) != str(student_id):
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    student = Student.query.get(student_id)
    if not student:
        return jsonify({"success": False, "message": "Student not found"}), 404

    body = request.get_json() or {}

    # Fields to validate for profanity
    fields_to_check = {
        'name': body.get('name', ''),
        'college': body.get('college', ''),
        'bio': body.get('bio', ''),
        'location': body.get('location', ''),
    }

    for field, value in fields_to_check.items():
        if value and contains_profanity(value):
            return jsonify({
                "success": False,
                "message": f"Inappropriate language detected in {field}. Please keep it professional.",
                "field": field
            }), 400

    skills = body.get('skills', [])
    if isinstance(skills, list):
        for s in skills:
            if s and contains_profanity(s):
                return jsonify({
                    "success": False,
                    "message": "Inappropriate language detected in skills. Please keep it professional.",
                    "field": "skills"
                }), 400
    elif isinstance(skills, str):
        if skills and contains_profanity(skills):
            return jsonify({
                "success": False,
                "message": "Inappropriate language detected in skills. Please keep it professional.",
                "field": "skills"
                }), 400


    # Bio word limit — 500 words
    bio = body.get('bio', '')
    if bio:
        word_count = len(bio.strip().split())
        if word_count > 500:
            return jsonify({
                "success": False,
                "message": f"Bio exceeds 500 word limit. Currently {word_count} words.",
                "field": "bio"
            }), 400

    if "name" in body:
        student.name = body["name"].strip()
    if "college" in body:
        student.college = body["college"].strip()
    if "bio" in body:
        student.bio = body["bio"].strip() or None
    if "avatar_url" in body:
        student.avatar_url = body["avatar_url"].strip() or None
    if "college_start_year" in body:
        student.college_start_year = body.get("college_start_year")
    if "college_end_year" in body:
        student.college_end_year = body.get("college_end_year")
    if "course" in body:
        student.course = body.get("course", "").strip() or None
    if "location" in body:
        student.location = body.get("location", "").strip() or None
    if "github_url" in body:
        gh = body.get("github_url", "").strip()
        if gh and not gh.startswith("http"):
            gh = f"https://github.com/{gh.lstrip('@')}"
        student.github_url = gh or None
    if "skills" in body:
        skills = body.get("skills")
        if isinstance(skills, list):
            student.skills = ",".join(s.strip() for s in skills if s.strip())
        else:
            student.skills = skills.strip() if skills else None
    if "password" in body:
        pw = body["password"]
        if len(pw) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400
        student.password_hash = bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    db.session.commit()
    return jsonify({
        "success": True,
        "message": "Profile updated successfully",
        "data": student.to_dict(include_email=True)
    }), 200


@students_bp.route("/<string:student_id>", methods=["DELETE"])
@jwt_required()
def delete_student(student_id):
    """Delete student account — cascade deletes projects & reviews."""
    current_id = get_jwt_identity()
    if current_id != student_id:
        return _error("You can only delete your own account", 403)

    student = Student.query.get(student_id)
    if not student:
        return _error("Student not found", 404)

    db.session.delete(student)
    db.session.commit()
    return _success(None, "Account successfully deleted.")


@students_bp.route("/exit-survey", methods=["POST"])
def submit_exit_survey():
    """Submit exit survey after account deletion."""
    body = request.get_json() or {}
    email = body.get("email", "").strip()
    feedback = body.get("feedback", "").strip()

    if not email or not feedback:
        return _error("Email and feedback are required", 400)

    review = ExitReview(email=email, feedback=feedback)
    db.session.add(review)
    db.session.commit()
    return _success(None, "Thank you for your feedback.")


@students_bp.route('/<string:student_id>/template', methods=['PATCH'])
@jwt_required()
def update_template(student_id):
    current_user_id = get_jwt_identity()
    if str(student_id) != str(current_user_id):
        return jsonify({"success": False, "message": "Unauthorized"}), 403
    
    data = request.get_json()
    template = data.get('template')
    
    if template not in ['classic', 'midnight', 'blueprint', 'paper']:
        return jsonify({"success": False, "message": "Invalid template"}), 400
    
    student = Student.query.get_or_404(student_id)
    student.portfolio_template = template
    db.session.commit()
    
    return jsonify({"success": True, "message": "Template updated", "data": {"template": template}}), 200

@students_bp.route("/find-teammates", methods=["POST"])
def find_teammates():
    """Search for teammates by region and skills."""
    body = request.get_json() or {}
    hackathon_type = body.get("type", "Online")
    region = body.get("region", "").strip().lower()
    
    # Skills logic: we receive an array of strings, or comma separated string
    skills_raw = body.get("skills", [])
    if isinstance(skills_raw, str):
        required_skills = [s.strip().lower() for s in skills_raw.split(",") if s.strip()]
    else:
        required_skills = [s.strip().lower() for s in skills_raw if s.strip()]
        
    query = Student.query
    
    # If offline, filter by location
    if hackathon_type == "Offline" and region:
        query = query.filter(Student.location.ilike(f"%{region}%"))
        
    # Exclude current user if logged in
    current_user_id = None
    try:
        verify_jwt_in_request(optional=True)
        current_user_id = get_jwt_identity()
    except:
        pass

    if current_user_id:
        query = query.filter(Student.id != current_user_id)
        
        # Exclude blocked users (either direction)
        blocks = BlockedUser.query.filter(
            (BlockedUser.blocker_id == current_user_id) | 
            (BlockedUser.blocked_id == current_user_id)
        ).all()
        blocked_ids = [b.blocked_id if b.blocker_id == current_user_id else b.blocker_id for b in blocks]
        
        if blocked_ids:
            query = query.filter(~Student.id.in_(blocked_ids))
        
    students = query.all()
    results = []
    
    for s in students:
        student_skills = [sk.strip().lower() for sk in (s.skills.split(",") if s.skills else [])]
        matched_skills = [sk for sk in required_skills if sk in student_skills]
        
        # We might want to sort by matched count later, so we compute it
        match_count = len(matched_skills)
        
        # We can either return all users if no skills were specified, 
        # or only return users who matched at least one skill. Let's return everyone matching region
        # and sort them by the match count, putting users with more matched skills first.
        
        s_dict = s.to_dict()
        s_dict["matched_skills_count"] = match_count
        s_dict["matched_skills"] = matched_skills
        results.append(s_dict)
        
    # Sort results primarily by match count descending, then by credibility descending
    results.sort(key=lambda x: (x["matched_skills_count"], x["credibility_score"]), reverse=True)
    
    return _success(results)
