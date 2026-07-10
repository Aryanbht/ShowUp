import re


def generate_username(name, Student):
    """Generate a unique username from a student's name."""
    base = re.sub(r'[^a-zA-Z0-9]', '', name.lower())
    if not base:
        base = 'user'
    username = base
    counter = 1
    while Student.query.filter_by(username=username).first():
        username = f"{base}{counter}"
        counter += 1
    return username
