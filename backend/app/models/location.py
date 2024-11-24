from app.utils.db_util import db

class Location(db.Model):
    __tablename__ = 'location'

    locationID = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Primary key
    location_name = db.Column(db.String(45), nullable=False)  # Location name
    coordinates = db.Column(db.String(45), nullable=False)  # Coordinates

    def to_dict(self):
        return {
            "locationID": self.locationID,
            "location_name": self.location_name,
            "coordinates": self.coordinates
        }
