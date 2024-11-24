from flask import Blueprint, jsonify, request
from app.models.location import Location
from app.utils.db_util import db

# Define Blueprint for location-related routes
location_bp = Blueprint('location', __name__)

# Route to get all locations
@location_bp.route('/locations', methods=['GET'])
def get_locations():
    try:
        locations = Location.query.all()
        return jsonify([location.to_dict() for location in locations])
    except Exception as e:
        return jsonify({"error": f"Failed to fetch locations: {str(e)}"}), 500

# Route to create a new location
@location_bp.route('/locations', methods=['POST'])
def create_location():
    try:
        data = request.json
        new_location = Location(
            location_name=data.get('location_name'),
            coordinates=data.get('coordinates')
        )
        db.session.add(new_location)
        db.session.commit()
        return jsonify(new_location.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create location: {str(e)}"}), 500