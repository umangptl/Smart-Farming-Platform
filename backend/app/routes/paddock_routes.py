from flask import Blueprint, jsonify, request
from app.models.paddock import Paddock, GrassTypeEnum
from app.utils.db_util import db

# Define Blueprint for paddock-related routes
paddock_bp = Blueprint('paddock', __name__)

# Route to get all paddocks
@paddock_bp.route('/paddocks', methods=['GET'])
def get_paddocks():
    try:
        paddocks = Paddock.query.all()
        return jsonify([paddock.to_dict() for paddock in paddocks])
    except Exception as e:
        return jsonify({"error": f"Failed to fetch paddocks: {str(e)}"}), 500

# Route to create a new paddock
@paddock_bp.route('/paddocks', methods=['POST'])
def create_paddock():
    try:
        data = request.json
        new_paddock = Paddock(
            size=data.get('size'),
            grass_type=GrassTypeEnum(data.get('grass_type')),
            capacity=data.get('capacity'),
            locationID=data.get('locationID')
        )
        db.session.add(new_paddock)
        db.session.commit()
        return jsonify(new_paddock.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create paddock: {str(e)}"}), 500
