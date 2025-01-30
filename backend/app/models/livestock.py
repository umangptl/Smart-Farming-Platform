from flask import Blueprint, jsonify, request
from app.utils.db_util import db
import enum

# Define Blueprint for livestock-related routes
livestock_bp = Blueprint('livestock', __name__)

# Define Enum for Gender
class GenderEnum(enum.Enum):
    male = "male"
    female = "female"

# Define Enum for Livestock Type
class LivestockTypeEnum(enum.Enum):
    cattle = "cattle"
    horse = "horse"
    sheep = "sheep"

# Define the Livestock model
class Livestock(db.Model):
    __tablename__ = 'livestock'
    
    livestockID = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Primary key
    type = db.Column(db.Enum(LivestockTypeEnum), nullable=False)  # Livestock type as enum
    breed = db.Column(db.String(45), nullable=False)  # Breed of livestock
    dob = db.Column(db.Date, nullable=False)  # Date of birth
    health_status = db.Column(db.Boolean, nullable=False)  # Health status (True/False)
    gender = db.Column(db.Enum(GenderEnum), nullable=False)  # Gender as enum
    livestock_name = db.Column(db.String(45), nullable=True)  # Name of the livestock
    weight = db.Column(db.Integer, nullable=True)  # Weight in integers
    paddockID = db.Column(db.Integer, db.ForeignKey('paddock.paddockID'), nullable=False)  # Foreign key to paddock table

    # Define a method to convert the model instance to a dictionary
    def to_dict(self):
        return {
            "livestockID": self.livestockID,
            "type": self.type.value if self.type else None,  # Convert enum to string
            "breed": self.breed,
            "dob": self.dob.isoformat() if self.dob else None,
            "health_status": self.health_status,
            "gender": self.gender.value if self.gender else None,  # Convert enum to string
            "livestock_name": self.livestock_name,
            "weight": self.weight,
            "paddockID": self.paddockID
        }