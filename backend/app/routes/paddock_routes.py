from flask import Blueprint, jsonify, request
from app.utils.db_util import db
from app.models.paddock import Paddock, GrassTypeEnum

# Define Blueprint for paddock-related routes
paddock_bp = Blueprint('paddock', __name__)

# Create a new paddock
@paddock_bp.route('/paddocks', methods=['POST'])
def create_paddock():
    try:
        data = request.json
        new_paddock = Paddock(
            size=data.get("size"),
            grass_type=GrassTypeEnum(data.get("grass_type")),
            capacity=data.get("capacity"),
            locationID=data.get("locationID")
        )
        db.session.add(new_paddock)
        db.session.commit()
        return jsonify(new_paddock.to_dict()), 201
    except ValueError as ve:
        return jsonify({"error": f"Invalid grass_type: {str(ve)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to create paddock: {str(e)}"}), 500

# Retrieve all paddocks
@paddock_bp.route('/paddocks', methods=['GET'])
def get_all_paddocks():
    try:
        paddocks = Paddock.query.all()
        return jsonify([paddock.to_dict() for paddock in paddocks])
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve paddocks: {str(e)}"}), 500

# Retrieve a paddock by ID
@paddock_bp.route('/paddocks/<int:paddockID>', methods=['GET'])
def get_paddock_by_id(paddockID):
    try:
        paddock = Paddock.query.get(paddockID)
        if not paddock:
            return jsonify({"error": "Paddock not found"}), 404
        return jsonify(paddock.to_dict())
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve paddock: {str(e)}"}), 500

# Update a paddock by ID
@paddock_bp.route('/paddocks/<int:paddockID>', methods=['PUT'])
def update_paddock(paddockID):
    try:
        data = request.json
        paddock = Paddock.query.get(paddockID)
        if not paddock:
            return jsonify({"error": "Paddock not found"}), 404

        # Update fields if provided
        if "size" in data:
            paddock.size = data.get("size")
        if "grass_type" in data:
            paddock.grass_type = GrassTypeEnum(data.get("grass_type"))
        if "capacity" in data:
            paddock.capacity = data.get("capacity")
        if "locationID" in data:
            paddock.locationID = data.get("locationID")

        db.session.commit()
        return jsonify(paddock.to_dict())
    except ValueError as ve:
        return jsonify({"error": f"Invalid grass_type: {str(ve)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to update paddock: {str(e)}"}), 500

# Delete a paddock by ID
@paddock_bp.route('/paddocks/<int:paddockID>', methods=['DELETE'])
def delete_paddock(paddockID):
    try:
        paddock = Paddock.query.get(paddockID)
        if not paddock:
            return jsonify({"error": "Paddock not found"}), 404

        db.session.delete(paddock)
        db.session.commit()
        return jsonify({"message": "Paddock deleted successfully"})
    except Exception as e:
        return jsonify({"error": f"Failed to delete paddock: {str(e)}"}), 500
