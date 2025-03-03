from flask import Blueprint, jsonify, request
from app.utils.db_util import db
from app.models.livestock import GenderEnum, LivestockTypeEnum, HealthStatusEnum, BreedingStatusEnum, Livestock

# Blueprint for livestock-related routes
livestock_bp = Blueprint('livestock', __name__)

# Create a new livestock entry
@livestock_bp.route('/livestock', methods=['POST'])
def create_livestock():
    try:
        data = request.json

        # Convert Enums before unpacking data
        data["type"] = LivestockTypeEnum(data["type"])
        data["gender"] = GenderEnum(data["gender"])
        data["health_status"] = HealthStatusEnum(data["health_status"])
        data["breeding_status"] = BreedingStatusEnum(data["breeding_status"])

        # Create new livestock instance dynamically
        new_livestock = Livestock(**data)

        db.session.add(new_livestock)
        db.session.commit()

        return jsonify(new_livestock.to_dict()), 201

    except ValueError as ve:
        return jsonify({"error": f"Invalid input: {str(ve)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to create livestock: {str(e)}"}), 500

# Retrieve all livestock entries
@livestock_bp.route('/livestock', methods=['GET'])
def get_all_livestock():
    try:
        livestock_list = Livestock.query.all()
        return jsonify([livestock.to_dict() for livestock in livestock_list])
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve livestock: {str(e)}"}), 500

# Retrieve a single livestock entry by ID
@livestock_bp.route('/livestock/<int:livestockID>', methods=['GET'])
def get_livestock_by_id(livestockID):
    try:
        livestock = Livestock.query.get(livestockID)
        if not livestock:
            return jsonify({"error": "Livestock not found"}), 404
        return jsonify(livestock.to_dict())
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve livestock: {str(e)}"}), 500

# Update a livestock entry by ID
@livestock_bp.route('/livestock/<int:livestockID>', methods=['PUT'])
def update_livestock(livestockID):
    try:
        data = request.json
        livestock = Livestock.query.get(livestockID)
        if not livestock:
            return jsonify({"error": "Livestock not found"}), 404

        # Update fields if provided
        if "type" in data:
            livestock.type = LivestockTypeEnum(data.get("type"))
        if "breed" in data:
            livestock.breed = data.get("breed")
        if "dob" in data:
            livestock.dob = data.get("dob")
        if "health_status" in data:
            livestock.health_status = data.get("health_status")
        if "gender" in data:
            livestock.gender = GenderEnum(data.get("gender"))
        if "livestock_name" in data:
            livestock.livestock_name = data.get("livestock_name")
        if "weight" in data:
            livestock.weight = data.get("weight")
        if "paddockID" in data:
            livestock.paddockID = data.get("paddockID")

        db.session.commit()
        return jsonify(livestock.to_dict())
    except ValueError as ve:
        return jsonify({"error": f"Invalid input: {str(ve)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to update livestock: {str(e)}"}), 500

# Delete a livestock entry by ID
@livestock_bp.route('/livestock/<int:livestockID>', methods=['DELETE'])
def delete_livestock(livestockID):
    try:
        livestock = Livestock.query.get(livestockID)
        if not livestock:
            return jsonify({"error": "Livestock not found"}), 404

        db.session.delete(livestock)
        db.session.commit()
        return jsonify({"message": "Livestock deleted successfully"})
    except Exception as e:
        return jsonify({"error": f"Failed to delete livestock: {str(e)}"}), 500
