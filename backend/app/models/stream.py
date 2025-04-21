from app.utils.db_util import db


class Stream(db.Model):
    __tablename__ = 'streams'

    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )
    name = db.Column(db.String(255), nullable=False)
    url = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "url": self.url,
        }
