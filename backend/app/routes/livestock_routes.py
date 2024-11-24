# app/routes/task_routes.py
from flask import Blueprint, jsonify, request
from app.models.livestock import Livestock
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
    
# Example route to get all livestock
@livestock_bp.route('/livestock', methods=['GET'])
def get_livestock():
    try:
        livestock = Livestock.query.all()
        return jsonify([animal.to_dict() for animal in livestock])
    except Exception as e:
        return jsonify({"error": f"Failed to fetch livestock: {str(e)}"}), 500

# Example route to create a new livestock record
@livestock_bp.route('/livestock', methods=['POST'])
def create_livestock():
    try:
        data = request.json
        new_livestock = Livestock(
            type=LivestockTypeEnum(data.get('type')),
            breed=data.get('breed'),
            dob=data.get('dob'),
            health_status=data.get('health_status'),
            gender=GenderEnum(data.get('gender')),
            livestock_name=data.get('livestock_name'),
            weight=data.get('weight'),
            paddockID=data.get('paddockID')
        )
        db.session.add(new_livestock)
        db.session.commit()
        return jsonify(new_livestock.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create livestock: {str(e)}"}), 500