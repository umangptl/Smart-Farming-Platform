from flask import Blueprint, jsonify, request
from app.utils.db_util import db
from app.models.location import Location  # Import the Location model

# Define Blueprint for location-related routes
location_bp = Blueprint('location', __name__)

# Create a new location
@location_bp.route('/locations', methods=['POST'])
def create_location():
    try:
        data = request.json
        new_location = Location(
            location_name=data.get("location_name"),
            coordinates=data.get("coordinates")
        )
        db.session.add(new_location)
        db.session.commit()
        return jsonify(new_location.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create location: {str(e)}"}), 500

# Retrieve all locations
@location_bp.route('/locations', methods=['GET'])
def get_all_locations():
    try:
        locations = Location.query.all()
        return jsonify([location.to_dict() for location in locations])
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve locations: {str(e)}"}), 500

# Retrieve a location by ID
@location_bp.route('/locations/<int:locationID>', methods=['GET'])
def get_location_by_id(locationID):
    try:
        location = Location.query.get(locationID)
        if not location:
            return jsonify({"error": "Location not found"}), 404
        return jsonify(location.to_dict())
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve location: {str(e)}"}), 500

# Update a location by ID
@location_bp.route('/locations/<int:locationID>', methods=['PUT'])
def update_location(locationID):
    try:
        data = request.json
        location = Location.query.get(locationID)
        if not location:
            return jsonify({"error": "Location not found"}), 404

        # Update fields if provided
        if "location_name" in data:
            location.location_name = data.get("location_name")
        if "coordinates" in data:
            location.coordinates = data.get("coordinates")

        db.session.commit()
        return jsonify(location.to_dict())
    except Exception as e:
        return jsonify({"error": f"Failed to update location: {str(e)}"}), 500

# Delete a location by ID
@location_bp.route('/locations/<int:locationID>', methods=['DELETE'])
def delete_location(locationID):
    try:
        location = Location.query.get(locationID)
        if not location:
            return jsonify({"error": "Location not found"}), 404

        db.session.delete(location)
        db.session.commit()
        return jsonify({"message": "Location deleted successfully"})
    except Exception as e:
        return jsonify({"error": f"Failed to delete location: {str(e)}"}), 500
