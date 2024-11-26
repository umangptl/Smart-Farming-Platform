from flask import Blueprint, jsonify, request
from app.utils.db_util import db

user_bp = Blueprint('users', __name__)

class User(db.Model):
    __tablename__ = 'Users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False, unique=True)
    role = db.Column(db.String(50), nullable=False, default="Staff")
    email = db.Column(db.String(255), nullable=False, unique=True)
    phone = db.Column(db.String(15), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role,
            "email": self.email,
            "phone": self.phone
        }

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

@user_bp.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.json
        new_user = User(
            username=data.get('username'),
            role=data.get('role', 'Staff'),
            email=data.get('email'),
            phone=data.get('phone')
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create user: {str(e)}"}), 500

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
