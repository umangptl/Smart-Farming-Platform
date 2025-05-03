from flask import Blueprint, jsonify, request

from app.models.users import User
from app.utils.db_util import db

user_bp = Blueprint('users', __name__)


@user_bp.route('/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        return jsonify([user.to_dict() for user in users])
    except Exception as e:
        return jsonify({"error": f"Failed to fetch users: {str(e)}"}), 500


@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user.to_dict())
    except Exception as e:
        return jsonify({"error": f"Failed to fetch user: {str(e)}"}), 500


@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.json
        user.username = data.get('username', user.username)
        user.role = data.get('role', user.role)
        user.email = data.get('email', user.email)
        user.phone = data.get('phone', user.phone)

        db.session.commit()
        return jsonify(user.to_dict())
    except Exception as e:
        return jsonify({"error": f"Failed to update user: {str(e)}"}), 500


@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to delete user: {str(e)}"}), 500
