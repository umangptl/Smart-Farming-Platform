from flask import Blueprint, jsonify, request
from app.utils.db_util import db

task_bp = Blueprint('tasks', __name__)

class Task(db.Model):
    __tablename__ = 'Tasks'
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=db.func.now())
    dummy = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "dummy": self.dummy
        }


@task_bp.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.all()  # Query all tasks
        return jsonify([task.to_dict() for task in tasks])  # Convert tasks to JSON
    except Exception as e:
        return jsonify({"error": f"Failed to fetch tasks: {str(e)}"}), 500


@task_bp.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.json
        new_task = Task(dummy=data.get('dummy'))
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create task: {str(e)}"}), 500
