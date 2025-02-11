from app.utils.db_util import db
import enum

# Enum for grass type
class GrassTypeEnum(enum.Enum):
    ryegrass = "ryegrass"
    bermudagrass = "bermudagrass"
    fescue = "fescue"
    clover = "clover"

class Paddock(db.Model):
    __tablename__ = 'paddock'

    paddockID = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Primary key
    size = db.Column(db.Numeric, nullable=False)  # Size of the paddock
    grass_type = db.Column(db.Enum(GrassTypeEnum), nullable=False)  # Grass type as enum
    capacity = db.Column(db.String(45), nullable=False)  # Capacity description
    locationID = db.Column(db.Integer, db.ForeignKey('location.locationID'), nullable=False)  # Foreign key to location table

    def to_dict(self):
        return {
            "paddockID": self.paddockID,
            "size": str(self.size),  # Convert size to string for JSON serialization
            "grass_type": self.grass_type.name if self.grass_type else None,  # Enum name
            "capacity": self.capacity,
            "locationID": self.locationID
        }