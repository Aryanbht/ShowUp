"""
ShowUp Data Serializers
=======================
Thin wrappers over the model's to_dict() methods.

- serialize_student_public   → safe for anyone (feed, portfolio, discover)
- serialize_student_private  → only for the authenticated owner (/me, edit profile)
- serialize_project_public   → safe for anyone
- serialize_project_private  → only for the project owner
- serialize_message_public   → safe chat message (no sender email)
- serialize_connection_public→ safe conversation summary

NEVER call serialize_student_private on a public endpoint.
"""


def serialize_student_public(student):
    """Safe for public endpoints — no email, location, or internal flags."""
    return student.to_dict(include_private=False)


def serialize_student_private(student):
    """Only for the logged-in owner. Includes email + sensitive fields."""
    return student.to_dict(include_private=True)


def serialize_project_public(project, current_user_id=None):
    """Safe for public endpoints. Readme hidden, analysis respects show flag."""
    return project.to_dict(include_student=True, current_user_id=current_user_id)


def serialize_project_private(project, current_user_id):
    """For the project owner — includes readme and full analysis."""
    return project.to_dict(include_student=False, current_user_id=current_user_id)


def serialize_message_public(message):
    """Safe message — sender object contains only id/name/avatar."""
    return message.to_dict()


def serialize_connection_public(conversation, current_user_id):
    """Safe conversation summary — other_user uses public serializer."""
    return conversation.to_dict(current_user_id=current_user_id)
