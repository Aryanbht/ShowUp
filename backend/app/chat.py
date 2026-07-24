import os
import requests as http_requests
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Student, ChatRequest, Conversation, Message, Notification, BlockedUser, Report
from app.rate_limiter import limit_authed
from app.validators import require_json_schema, schemas

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')


def _success(data=None, message=""):
    return jsonify({"success": True, "data": data, "message": message})


def _error(message, status=400):
    return jsonify({"success": False, "data": None, "message": message}), status


# ─────────────────────────────────────────────────────────────────────────────
# CONNECTION REQUESTS
# ─────────────────────────────────────────────────────────────────────────────

@chat_bp.route('/request/send', methods=['POST'])
@jwt_required()
@limit_authed()
@require_json_schema(schemas.SEND_REQUEST)
def send_request():
    """Send a chat connection request to another user."""
    sender_id   = get_jwt_identity()
    body        = request.validated
    receiver_id = body["receiver_id"].strip()
    note        = body.get("note") or ""
    if receiver_id == sender_id:
        return _error("You cannot connect with yourself")

    receiver = Student.query.get(receiver_id)
    if not receiver:
        return _error("User not found", 404)

    # Check if any block exists
    block = BlockedUser.query.filter(
        ((BlockedUser.blocker_id == sender_id) & (BlockedUser.blocked_id == receiver_id)) |
        ((BlockedUser.blocker_id == receiver_id) & (BlockedUser.blocked_id == sender_id))
    ).first()
    if block:
        return _error("Cannot send request to this user", 403)

    # Check if request already exists
    existing = ChatRequest.query.filter_by(
        sender_id=sender_id, receiver_id=receiver_id
    ).first()
    if existing:
        if existing.status == 'pending':
            return _error("You already sent a request to this user")
        if existing.status == 'accepted':
            return _error("You are already connected with this user")
        # If declined, allow re-sending by updating the existing record
        existing.status = 'pending'
        existing.note = note
        existing.created_at = datetime.utcnow()
        
        sender = Student.query.get(sender_id)
        notif = Notification(
            user_id=receiver_id,
            actor_id=sender_id,
            notification_type='new_request',
            message=f"{sender.name} sent you a connection request.",
        )
        db.session.add(notif)
        
        db.session.commit()
        return _success(existing.to_dict(), "Request re-sent!")

    # Also check reverse direction
    reverse = ChatRequest.query.filter_by(
        sender_id=receiver_id, receiver_id=sender_id
    ).first()
    if reverse and reverse.status == 'accepted':
        return _error("You are already connected with this user")

    chat_req = ChatRequest(
        sender_id=sender_id,
        receiver_id=receiver_id,
        note=note,
    )
    db.session.add(chat_req)

    sender = Student.query.get(sender_id)
    notif = Notification(
        user_id=receiver_id,
        actor_id=sender_id,
        notification_type='new_request',
        message=f"{sender.name} sent you a connection request.",
    )
    db.session.add(notif)

    db.session.commit()
    return _success(chat_req.to_dict(), "Connection request sent!"), 201


@chat_bp.route('/request/inbox', methods=['GET'])
@jwt_required()
@limit_authed()
def get_inbox_requests():
    """Get all pending chat requests received by the current user."""
    user_id = get_jwt_identity()
    reqs = ChatRequest.query.filter_by(
        receiver_id=user_id, status='pending'
    ).order_by(ChatRequest.created_at.desc()).all()
    return _success([r.to_dict() for r in reqs])


@chat_bp.route('/request/sent', methods=['GET'])
@jwt_required()
@limit_authed()
def get_sent_requests():
    """Get all requests sent by the current user."""
    user_id = get_jwt_identity()
    reqs = ChatRequest.query.filter_by(
        sender_id=user_id
    ).order_by(ChatRequest.created_at.desc()).all()
    return _success([r.to_dict() for r in reqs])


@chat_bp.route('/request/status/<string:target_user_id>', methods=['GET'])
@jwt_required()
def get_request_status(target_user_id):
    """Check the connection status between current user and another user."""
    user_id = get_jwt_identity()

    # Check for blocks
    block = BlockedUser.query.filter(
        ((BlockedUser.blocker_id == user_id) & (BlockedUser.blocked_id == target_user_id)) |
        ((BlockedUser.blocker_id == target_user_id) & (BlockedUser.blocked_id == user_id))
    ).first()
    if block:
        if block.blocker_id == user_id:
            return _success({'status': 'blocked'})
        else:
            # Hide the fact they are blocked by the other user, just say 'none' or 'blocked_by_them'
            # 'none' will let them try to connect but it will fail. 'blocked_by_them' is clearer to UI to disable button
            return _success({'status': 'blocked_by_them'})

    # Check if already in a conversation
    convo = Conversation.query.filter(
        ((Conversation.participant_a == user_id) & (Conversation.participant_b == target_user_id)) |
        ((Conversation.participant_a == target_user_id) & (Conversation.participant_b == user_id))
    ).first()
    if convo:
        return _success({'status': 'connected', 'conversation_id': convo.id})

    # Check outgoing request
    outgoing = ChatRequest.query.filter_by(sender_id=user_id, receiver_id=target_user_id).first()
    if outgoing:
        return _success({'status': outgoing.status, 'direction': 'outgoing', 'request_id': outgoing.id})

    # Check incoming request
    incoming = ChatRequest.query.filter_by(sender_id=target_user_id, receiver_id=user_id).first()
    if incoming and incoming.status == 'pending':
        return _success({'status': 'incoming', 'direction': 'incoming', 'request_id': incoming.id})

    return _success({'status': 'none'})


@chat_bp.route('/request/<string:req_id>/accept', methods=['POST'])
@jwt_required()
def accept_request(req_id):
    """Accept a chat request — creates a conversation."""
    user_id = get_jwt_identity()
    req = ChatRequest.query.get(req_id)
    if not req:
        return _error("Request not found", 404)
    if req.receiver_id != user_id:
        return _error("Forbidden", 403)
    if req.status != 'pending':
        return _error("This request is no longer pending")

    req.status = 'accepted'

    # Create conversation (sort IDs for consistent uniqueness)
    a, b = sorted([req.sender_id, req.receiver_id])
    convo = Conversation.query.filter_by(participant_a=a, participant_b=b).first()
    if not convo:
        convo = Conversation(participant_a=a, participant_b=b)
        db.session.add(convo)

    # Notify the original sender
    accepter = Student.query.get(user_id)
    notif = Notification(
        user_id=req.sender_id,
        actor_id=user_id,
        notification_type='request_accepted',
        message=f"{accepter.name} accepted your connection request! You can now chat.",
        conversation_id=convo.id,
    )
    db.session.add(notif)
    db.session.commit()

    return _success({'conversation_id': convo.id}, "Request accepted! You can now chat.")


@chat_bp.route('/request/<string:req_id>/decline', methods=['POST'])
@jwt_required()
def decline_request(req_id):
    """Decline a chat request."""
    user_id = get_jwt_identity()
    req = ChatRequest.query.get(req_id)
    if not req:
        return _error("Request not found", 404)
    if req.receiver_id != user_id:
        return _error("Forbidden", 403)
    if req.status != 'pending':
        return _error("This request is no longer pending")

    req.status = 'declined'

    # Notify the sender
    decliner = Student.query.get(user_id)
    notif = Notification(
        user_id=req.sender_id,
        actor_id=user_id,
        notification_type='request_declined',
        message=f"{decliner.name} declined your connection request.",
    )
    db.session.add(notif)
    db.session.commit()

    return _success(None, "Request declined.")


# ─────────────────────────────────────────────────────────────────────────────
# CONVERSATIONS
# ─────────────────────────────────────────────────────────────────────────────

@chat_bp.route('/conversations', methods=['GET'])
@jwt_required()
def list_conversations():
    """Get all accepted conversations for current user."""
    user_id = get_jwt_identity()
    convos = Conversation.query.filter(
        (Conversation.participant_a == user_id) | (Conversation.participant_b == user_id)
    ).order_by(Conversation.last_message_at.desc()).all()
    return _success([c.to_dict(current_user_id=user_id) for c in convos])


@chat_bp.route('/conversations/<string:convo_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(convo_id):
    """Get messages in a conversation. Marks received messages as read."""
    user_id = get_jwt_identity()
    convo = Conversation.query.get(convo_id)
    if not convo:
        return _error("Conversation not found", 404)
    if user_id not in [convo.participant_a, convo.participant_b]:
        return _error("Forbidden", 403)

    # Mark unread messages from the other person as read
    Message.query.filter_by(
        conversation_id=convo_id, is_read=False
    ).filter(Message.sender_id != user_id).update({'is_read': True})
    db.session.commit()

    page = request.args.get('page', 1, type=int)
    per_page = 50
    msgs = Message.query.filter_by(conversation_id=convo_id)\
        .order_by(Message.created_at.asc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    return _success({
        'messages': [m.to_dict() for m in msgs.items],
        'has_prev': msgs.has_prev,
        'page': page,
    })


@chat_bp.route('/conversations/<string:convo_id>/messages', methods=['POST'])
@jwt_required()
@require_json_schema(schemas.SEND_MESSAGE)
def send_message(convo_id):
    """Send a text or voice message."""
    user_id = get_jwt_identity()
    convo = Conversation.query.get(convo_id)
    if not convo:
        return _error("Conversation not found", 404)
    if user_id not in [convo.participant_a, convo.participant_b]:
        return _error("Forbidden", 403)

    target_user_id = convo.participant_b if convo.participant_a == user_id else convo.participant_a
    block = BlockedUser.query.filter(
        ((BlockedUser.blocker_id == user_id) & (BlockedUser.blocked_id == target_user_id)) |
        ((BlockedUser.blocker_id == target_user_id) & (BlockedUser.blocked_id == user_id))
    ).first()
    if block:
        return _error("Cannot send message to this user", 403)

    body      = request.validated
    msg_type  = body["message_type"]
    content   = body.get("content") or ""
    voice_url = body.get("voice_url") or ""

    if msg_type == 'text' and not content:
        return _error("Message content is required for text messages")
    if msg_type == 'voice' and not voice_url:
        return _error("voice_url is required for voice messages")

    msg = Message(
        conversation_id=convo_id,
        sender_id=user_id,
        content=content if msg_type == 'text' else None,
        voice_url=voice_url if msg_type == 'voice' else None,
        message_type=msg_type,
    )
    db.session.add(msg)

    # Update conversation last_message_at
    convo.last_message_at = datetime.utcnow()
    db.session.commit()

    return _success(msg.to_dict(), "Message sent"), 201


@chat_bp.route('/messages/<string:message_id>', methods=['PATCH'])
@jwt_required()
def edit_message(message_id):
    """Edit a text message."""
    user_id = get_jwt_identity()
    msg = Message.query.get(message_id)
    if not msg:
        return _error("Message not found", 404)
    if msg.sender_id != user_id:
        return _error("Forbidden", 403)
    if msg.message_type != 'text':
        return _error("Only text messages can be edited")
    if msg.is_deleted:
        return _error("Cannot edit a deleted message")

    body = request.get_json()
    new_content = body.get('content')
    if not new_content or not new_content.strip():
        return _error("Content cannot be empty")

    msg.content = new_content.strip()
    msg.is_edited = True
    msg.edited_at = datetime.utcnow()
    db.session.commit()

    return _success(msg.to_dict(), "Message edited")


@chat_bp.route('/messages/<string:message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    """Delete a message."""
    user_id = get_jwt_identity()
    msg = Message.query.get(message_id)
    if not msg:
        return _error("Message not found", 404)
    if msg.sender_id != user_id:
        return _error("Forbidden", 403)
    if msg.is_deleted:
        return _error("Message already deleted")

    msg.is_deleted = True
    msg.content = None
    msg.voice_url = None
    db.session.commit()

    return _success(msg.to_dict(), "Message deleted")


# ─────────────────────────────────────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────────────────────────────────────

@chat_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get all notifications for current user."""
    user_id = get_jwt_identity()
    notifs = Notification.query.filter_by(user_id=user_id)\
        .order_by(Notification.created_at.desc()).limit(50).all()
    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return _success({
        'notifications': [n.to_dict() for n in notifs],
        'unread_count': unread_count,
    })


@chat_bp.route('/notifications/read', methods=['POST'])
@jwt_required()
def mark_notifications_read():
    """Mark all notifications as read."""
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return _success(None, "Notifications marked as read")


@chat_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Quick count for navbar badge."""
    user_id = get_jwt_identity()
    pending_requests = ChatRequest.query.filter_by(receiver_id=user_id, status='pending').count()
    unread_notifications = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    unread_messages = db.session.query(Message).join(Conversation, Message.conversation_id == Conversation.id).filter(
        ((Conversation.participant_a == user_id) | (Conversation.participant_b == user_id)),
        Message.sender_id != user_id,
        Message.is_read == False
    ).count()
    return _success({
        'pending_requests': pending_requests,
        'unread_notifications': unread_notifications,
        'unread_messages': unread_messages,
        'total': pending_requests + unread_notifications + unread_messages,
    })


# ─────────────────────────────────────────────────────────────────────────────
# TRUST & SAFETY
# ─────────────────────────────────────────────────────────────────────────────

@chat_bp.route('/stop/<string:convo_id>', methods=['POST'])
@jwt_required()
def stop_conversation(convo_id):
    """Delete a conversation entirely. Both users can send new requests later."""
    user_id = get_jwt_identity()
    convo = Conversation.query.get(convo_id)
    if not convo:
        return _error("Conversation not found", 404)
    if user_id not in [convo.participant_a, convo.participant_b]:
        return _error("Forbidden", 403)

    # Delete related chat request (accepted status)
    req = ChatRequest.query.filter(
        ((ChatRequest.sender_id == convo.participant_a) & (ChatRequest.receiver_id == convo.participant_b)) |
        ((ChatRequest.sender_id == convo.participant_b) & (ChatRequest.receiver_id == convo.participant_a))
    ).first()
    if req:
        db.session.delete(req)

    db.session.delete(convo)
    db.session.commit()
    return _success(None, "Conversation stopped. You can reconnect later.")


@chat_bp.route('/block/<string:target_user_id>', methods=['POST'])
@jwt_required()
def block_user(target_user_id):
    """Block a user. Removes existing conversations and requests."""
    user_id = get_jwt_identity()
    if user_id == target_user_id:
        return _error("You cannot block yourself")

    # Check if already blocked
    existing_block = BlockedUser.query.filter_by(blocker_id=user_id, blocked_id=target_user_id).first()
    if not existing_block:
        block = BlockedUser(blocker_id=user_id, blocked_id=target_user_id)
        db.session.add(block)

    # Delete any requests (pending or accepted)
    # We no longer delete conversations or requests so they stay in the inbox
    # and the user can see them and unblock them later.

    db.session.commit()
    return _success(None, "User blocked successfully")


@chat_bp.route('/unblock/<string:target_user_id>', methods=['POST'])
@jwt_required()
def unblock_user(target_user_id):
    """Unblock a user."""
    user_id = get_jwt_identity()
    block = BlockedUser.query.filter_by(blocker_id=user_id, blocked_id=target_user_id).first()
    if block:
        db.session.delete(block)
        db.session.commit()
    return _success(None, "User unblocked successfully")


@chat_bp.route('/report/<string:target_user_id>', methods=['POST'])
@jwt_required()
@require_json_schema(schemas.REPORT_USER)
def report_user(target_user_id):
    """Report a user."""
    user_id = get_jwt_identity()
    body   = request.validated
    reason = body["reason"]

    report = Report(reporter_id=user_id, reported_id=target_user_id, reason=reason)
    db.session.add(report)
    db.session.commit()
    return _success(None, "User reported successfully. Our team will review this.")
