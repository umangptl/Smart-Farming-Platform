from flask import Blueprint, jsonify, request
from sqlalchemy.dialects.postgresql import ENUM

from app.utils.db_util import db
from datetime import datetime

task_bp = Blueprint('tasks', __name__)

class Task(db.Model):
    __tablename__ = 'Tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(ENUM('Pending', 'In Progress', 'Completed', name='status_enum'), nullable=False, default='Pending')
    priority = db.Column(ENUM('High', 'Medium', 'Low', name='priority_enum'), nullable=False, default='Medium')

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
        }

@task_bp.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.all()
        return jsonify([task.to_dict() for task in tasks])
    except Exception as e:
        return jsonify({"error": f"Failed to fetch tasks: {str(e)}"}), 500

@task_bp.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.json
        new_task = Task(
            title=data.get('title'),
            description=data.get('description'),
            status=data.get('status', 'Pending'),
            priority=data.get('priority'),
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create task: {str(e)}"}), 500

@task_bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        return jsonify(task.to_dict())
    except Exception as e:
        return jsonify({"error": f"Failed to fetch task: {str(e)}"}), 500

@task_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404

        data = request.json
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        task.status = data.get('status', task.status)
        task.priority = data.get('priority', task.priority)

        db.session.commit()
        return jsonify(task.to_dict())
    except Exception as e:
        return jsonify({"error": f"Failed to update task: {str(e)}"}), 500

@task_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404

        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to delete task: {str(e)}"}), 500

@task_bp.route('/tasks/users/<int:user_id>', methods=['GET'])
def get_user_tasks(user_id):
    try:
        tasks = Task.query.filter_by(assigned_to=user_id).all()
        return jsonify([task.to_dict() for task in tasks])
    except Exception as e:
        return jsonify({"error": f"Failed to fetch tasks for user {user_id}: {str(e)}"}), 500