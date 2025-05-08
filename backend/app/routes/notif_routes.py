from flask import Blueprint, jsonify, request

from app.models.notification import Notification
from app.utils.db_util import db

notification_bp = Blueprint('notifications', __name__)


@notification_bp.route('/notifications', methods=['GET'])
def get_notifications():
    try:
        notifications = Notification.query.order_by(Notification.timestamp.desc()).all()
        return jsonify([notif.to_dict() for notif in notifications])
    except Exception as e:
        return jsonify({"error": f"Failed to fetch notifications: {str(e)}"}), 500


@notification_bp.route('/notifications/recent', methods=['GET'])
def get_recent_notifications():
    try:
        recent = Notification.query.order_by(Notification.timestamp.desc()).limit(5).all()
        return jsonify([notif.to_dict() for notif in recent])
    except Exception as e:
        return jsonify({"error": f"Failed to fetch recent notifications: {str(e)}"}), 500


@notification_bp.route('/notifications', methods=['POST'])
def create_notification():
    try:
        data = request.json
        new_notif = Notification(
            note=data.get('note'),
            severity=data.get('severity')
        )
        db.session.add(new_notif)
        db.session.commit()
        return jsonify(new_notif.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create notification: {str(e)}"}), 500


@notification_bp.route('/notifications/<int:notif_id>', methods=['DELETE'])
def delete_notification(notif_id):
    try:
        notif = Notification.query.get(notif_id)
        if not notif:
            return jsonify({"error": "Notification not found"}), 404

        db.session.delete(notif)
        db.session.commit()
        return jsonify({"message": "Notification deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to delete notification: {str(e)}"}), 500
