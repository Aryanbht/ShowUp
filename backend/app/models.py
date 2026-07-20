import uuid
from datetime import datetime
from app import db


def generate_uuid():
    return str(uuid.uuid4())


class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for Google OAuth users
    is_google_auth = db.Column(db.Boolean, default=False)
    email_verified = db.Column(db.Boolean, default=False)
    college = db.Column(db.String(255), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    credibility_score = db.Column(db.Integer, default=0)
    is_senior = db.Column(db.Boolean, default=False)
    is_verified_senior = db.Column(db.Boolean, default=False)
    college_start_year = db.Column(db.Integer, nullable=True)
    college_end_year = db.Column(db.Integer, nullable=True)
    course = db.Column(db.String(255), nullable=True)
    location = db.Column(db.String(255), nullable=True)
    github_url = db.Column(db.String(500), nullable=True)
    github_username = db.Column(db.String(100), nullable=True)
    github_access_token = db.Column(db.String(500), nullable=True)
    skills = db.Column(db.Text, nullable=True)
    username = db.Column(db.String(50), unique=True, nullable=True)
    portfolio_template = db.Column(db.String(20), default='classic')
    portfolio_bg_color = db.Column(db.String(7), default='#FFFFFF')
    portfolio_text_color = db.Column(db.String(7), default='#1A1A1A')
    portfolio_accent_color = db.Column(db.String(7), default='#1A1A1A')
    portfolio_card_color = db.Column(db.String(7), default='#F8F8F8')
    portfolio_font = db.Column(db.String(50), default='Inter')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    projects = db.relationship("Project", backref="student", lazy=True, cascade="all, delete-orphan")
    reviews_given = db.relationship("Review", foreign_keys="Review.reviewer_id", backref="reviewer", lazy=True)
    following = db.relationship("Follow", foreign_keys="Follow.follower_id", backref="follower", lazy=True)
    followers = db.relationship("Follow", foreign_keys="Follow.following_id", backref="following_student", lazy=True)

    def to_dict(self, include_email=False, include_private=False):
        """
        Safe public serializer by default.
        Use include_private=True ONLY for the authenticated owner.
        Use include_email=True ONLY for the authenticated owner.
        """
        data = {
            "id": self.id,
            "name": self.name,
            "username": self.username,
            "college": self.college,
            "bio": self.bio,
            "avatar_url": self.avatar_url,
            "credibility_score": self.credibility_score,
            "credibility_level": self._get_credibility_level(),
            "is_senior": self.is_senior,
            "is_verified_senior": self.is_verified_senior,
            "course": self.course,
            "github_url": self.github_url,
            "skills": self.skills.split(",") if self.skills else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "project_count": len(self.projects),
            "portfolio_template": self.portfolio_template,
            "portfolio_bg_color": self.portfolio_bg_color or '#FFFFFF',
            "portfolio_text_color": self.portfolio_text_color or '#1A1A1A',
            "portfolio_accent_color": self.portfolio_accent_color or '#1A1A1A',
            "portfolio_card_color": self.portfolio_card_color or '#F8F8F8',
            "portfolio_font": self.portfolio_font or 'Inter',
            # NEVER expose: email, location, college_start_year, college_end_year,
            # github_username, github_access_token, password_hash
        }
        if include_email or include_private:
            data["email"] = self.email
        if include_private:
            data["location"] = self.location
            data["college_start_year"] = self.college_start_year
            data["college_end_year"] = self.college_end_year
            data["github_username"] = self.github_username
            data["email_verified"] = self.email_verified
            data["is_google_auth"] = self.is_google_auth
            data["portfolio_url"] = f"/portfolio/{self.username or self.id}"
        return data

    def _get_credibility_level(self):
        score = self.credibility_score
        if score >= 100:
            return "Elite"
        elif score >= 50:
            return "Notable"
        elif score >= 20:
            return "Rising"
        else:
            return "Beginner"


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    tech_stack = db.Column(db.String(500), nullable=True)  # comma-separated
    live_url = db.Column(db.String(500), nullable=True)
    github_url = db.Column(db.String(500), nullable=True)
    screenshot_url = db.Column(db.String(500), nullable=True)
    student_id = db.Column(db.String(36), db.ForeignKey("students.id"), index=True, nullable=False)
    ai_analysis = db.Column(db.Text, nullable=True)          # JSON string of latest analysis
    ai_analysis_used = db.Column(db.Boolean, default=False)
    show_ai_analysis = db.Column(db.Boolean, default=True)
    project_hash = db.Column(db.String(64), nullable=True)    # MD5 of title+description+tech_stack at last analysis
    analysis_history = db.Column(db.Text, nullable=True)      # JSON array of all past analyses
    last_analyzed_at = db.Column(db.DateTime, nullable=True)
    view_count = db.Column(db.Integer, default=0)
    readme = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    reviews = db.relationship("Review", backref="project", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_student=True, current_user_id=None):
        import json
        from app.hash_utils import can_analyze
        can, reason = can_analyze(self)
        
        is_owner = current_user_id == self.student_id
        should_show = self.show_ai_analysis or is_owner
        
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "tech_stack": self.tech_stack.split(",") if self.tech_stack else [],
            "live_url": self.live_url,
            "github_url": self.github_url,
            "screenshot_url": self.screenshot_url,
            "student_id": self.student_id,
            "ai_analysis": json.loads(self.ai_analysis) if self.ai_analysis and should_show else None,
            "ai_analysis_used": self.ai_analysis_used,
            "show_ai_analysis": self.show_ai_analysis,
            "ai_analysis_hidden": not should_show and self.ai_analysis is not None,
            "can_analyze": can,
            "can_analyze_reason": reason,
            "last_analyzed_at": self.last_analyzed_at.isoformat() if self.last_analyzed_at else None,
            "view_count": self.view_count,
            # readme is only exposed to the project owner
            "readme": self.readme if is_owner else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_student and self.student:
            data["student"] = self.student.to_dict()  # safe public serializer
        return data


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    project_id = db.Column(db.String(36), db.ForeignKey("projects.id"), index=True, nullable=False)
    reviewer_id = db.Column(db.String(36), db.ForeignKey("students.id"), index=True, nullable=False)
    feedback = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    is_verified_review = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "reviewer_id": self.reviewer_id,
            "feedback": self.feedback,
            "rating": self.rating,
            "is_verified_review": self.is_verified_review,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "reviewer": self.reviewer.to_dict() if self.reviewer else None,
        }


class Follow(db.Model):
    __tablename__ = "follows"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    follower_id = db.Column(db.String(36), db.ForeignKey("students.id"), index=True, nullable=False)
    following_id = db.Column(db.String(36), db.ForeignKey("students.id"), index=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("follower_id", "following_id", name="unique_follow"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "follower_id": self.follower_id,
            "following_id": self.following_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ExitReview(db.Model):
    __tablename__ = "exit_reviews"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(255), nullable=False)
    feedback = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "feedback": self.feedback,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CustomSkill(db.Model):
    __tablename__ = 'custom_skills'
    id = db.Column(db.Integer, primary_key=True)
    skill = db.Column(db.String(100), unique=True, nullable=False)
    usage_count = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ChatRequest(db.Model):
    __tablename__ = 'chat_requests'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    sender_id = db.Column(db.String(36), db.ForeignKey('students.id'), index=True, nullable=False)
    receiver_id = db.Column(db.String(36), db.ForeignKey('students.id'), index=True, nullable=False)
    note = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending | accepted | declined
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship('Student', foreign_keys=[sender_id])
    receiver = db.relationship('Student', foreign_keys=[receiver_id])

    __table_args__ = (
        db.UniqueConstraint('sender_id', 'receiver_id', name='unique_chat_request'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            # Use safe public serializer — never exposes email/location
            'sender': self.sender.to_dict() if self.sender else None,
            'receiver': self.receiver.to_dict() if self.receiver else None,
            'note': self.note,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Conversation(db.Model):
    __tablename__ = 'conversations'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    participant_a = db.Column(db.String(36), db.ForeignKey('students.id'), index=True, nullable=False)
    participant_b = db.Column(db.String(36), db.ForeignKey('students.id'), index=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_message_at = db.Column(db.DateTime, default=datetime.utcnow)

    student_a = db.relationship('Student', foreign_keys=[participant_a])
    student_b = db.relationship('Student', foreign_keys=[participant_b])
    messages = db.relationship('Message', backref='conversation', lazy=True, cascade='all, delete-orphan')

    __table_args__ = (
        db.UniqueConstraint('participant_a', 'participant_b', name='unique_conversation'),
    )

    def to_dict(self, current_user_id=None):
        other = self.student_b if self.participant_a == current_user_id else self.student_a
        unread = 0
        is_blocked_by_me = False
        is_blocked_by_them = False
        
        if current_user_id and other:
            unread = Message.query.filter_by(
                conversation_id=self.id, is_read=False
            ).filter(Message.sender_id != current_user_id).count()
            
            block_by_me = BlockedUser.query.filter_by(blocker_id=current_user_id, blocked_id=other.id).first()
            if block_by_me:
                is_blocked_by_me = True
                
            block_by_them = BlockedUser.query.filter_by(blocker_id=other.id, blocked_id=current_user_id).first()
            if block_by_them:
                is_blocked_by_them = True

        last_msg = Message.query.filter_by(conversation_id=self.id).order_by(Message.created_at.desc()).first()
        return {
            'id': self.id,
            'other_user': other.to_dict() if other else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_message_at': self.last_message_at.isoformat() if self.last_message_at else None,
            'last_message': last_msg.to_dict() if last_msg else None,
            'unread_count': unread,
            'is_blocked_by_me': is_blocked_by_me,
            'is_blocked_by_them': is_blocked_by_them,
        }


class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    conversation_id = db.Column(db.String(36), db.ForeignKey('conversations.id'), index=True, nullable=False)
    sender_id = db.Column(db.String(36), db.ForeignKey('students.id'), index=True, nullable=False)
    content = db.Column(db.Text, nullable=True)          # text content
    voice_url = db.Column(db.String(500), nullable=True)  # cloudinary URL for voice notes
    message_type = db.Column(db.String(10), default='text')  # text | voice
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship('Student', foreign_keys=[sender_id])

    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'sender_id': self.sender_id,
            # Safe public serializer — never exposes sender email/location
            'sender': {
                'id': self.sender.id,
                'name': self.sender.name,
                'avatar_url': self.sender.avatar_url,
            } if self.sender else None,
            'content': self.content,
            'voice_url': self.voice_url,
            'message_type': self.message_type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('students.id'), index=True, nullable=False)
    actor_id = db.Column(db.String(36), db.ForeignKey('students.id'), index=True, nullable=True)
    notification_type = db.Column(db.String(30), nullable=False)  # request_accepted | request_declined
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    conversation_id = db.Column(db.String(36), nullable=True)  # for accepted requests
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('Student', foreign_keys=[user_id])
    actor = db.relationship('Student', foreign_keys=[actor_id])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'actor': self.actor.to_dict() if self.actor else None,
            'notification_type': self.notification_type,
            'message': self.message,
            'is_read': self.is_read,
            'conversation_id': self.conversation_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class BlockedUser(db.Model):
    __tablename__ = 'blocked_users'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    blocker_id = db.Column(db.String(36), db.ForeignKey('students.id'), index=True, nullable=False)
    blocked_id = db.Column(db.String(36), db.ForeignKey('students.id'), index=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('blocker_id', 'blocked_id', name='unique_block'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'blocker_id': self.blocker_id,
            'blocked_id': self.blocked_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    reporter_id = db.Column(db.String(36), db.ForeignKey('students.id'), index=True, nullable=False)
    reported_id = db.Column(db.String(36), db.ForeignKey('students.id'), index=True, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'reporter_id': self.reporter_id,
            'reported_id': self.reported_id,
            'reason': self.reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

