from flask import Blueprint, jsonify
from app.models.livestock import BreedingStatusEnum, GenderEnum, HealthStatusEnum, LivestockTypeEnum

# Create Blueprint for Enums
enums_bp = Blueprint('enums', __name__)

@enums_bp.route('/enums', methods=['GET'])
def get_enums():
    """Returns all Enums for frontend use"""
    enums = {
        "animalTypeOptions": [e.value for e in LivestockTypeEnum],
        "breedingStatusOptions": [e.value for e in BreedingStatusEnum],
        "genderOptions": [e.value for e in GenderEnum],
        "healthStatusOptions": [e.value for e in HealthStatusEnum]
    }
    return jsonify(enums), 200