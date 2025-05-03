from app.utils.db_util import db
from sqlalchemy.dialects.postgresql import ENUM
from app.models.users import User


class Task(db.Model):
    __tablename__ = 'Tasks'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('tasks', lazy=True))

    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(
        ENUM('Pending', 'In Progress', 'Completed', name='status_enum'),
        nullable=False,
        default='Pending'
    )
    priority = db.Column(
        ENUM('High', 'Medium', 'Low', name='priority_enum'),
        nullable=False,
        default='Medium'
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
        }
