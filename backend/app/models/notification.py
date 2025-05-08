from sqlalchemy.dialects.postgresql import ENUM
from datetime import datetime
from app.utils.db_util import db


class Notification(db.Model):
    __tablename__ = 'Notifications'

    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    note = db.Column(db.Text, nullable=False)
    severity = db.Column(ENUM('Primary', 'Info', 'Success', 'Warning', 'Danger', name='severity_enum'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "note": self.note,
            "severity": self.severity,
        }
