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
        livestock_list = Livestock.query.order_by(Livestock.livestockID.asc()).all()
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

        # Loop through data keys and update only existing attributes in Livestock model
        for key, value in data.items():
            if hasattr(livestock, key):  # Check if the attribute exists in the model
                if isinstance(getattr(Livestock, key).property.columns[0].type, db.Enum):  
                    # Convert Enums correctly
                    enum_class = getattr(Livestock, key).type.enum_class
                    setattr(livestock, key, enum_class(value))
                else:
                    setattr(livestock, key, value)

        db.session.commit()
        return jsonify(livestock.to_dict()), 200
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

@livestock_bp.route('/livestock/dashboard', methods=['GET'])
def get_livestock_stats():
    try:
        total_livestock = Livestock.query.count()
        return jsonify({"total_livestock": total_livestock})
    except Exception as e:
        return jsonify({"error": f"Failed to fetch livestock count: {str(e)}"}), 500

@livestock_bp.route('/livestock/dashboard/type', methods=['GET'])
def get_livestock_count_by_type():
    try:
        results = (
            db.session.query(Livestock.type, db.func.count(Livestock.livestockID))
            .group_by(Livestock.type)
            .all()
        )
        data = {type_.value: count for type_, count in results}
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": f"Failed to get livestock type counts: {str(e)}"}), 500

@livestock_bp.route('/livestock/dashboard/gender', methods=['GET'])
def get_livestock_count_by_gender():
    try:
        results = (
            db.session.query(Livestock.gender, db.func.count(Livestock.livestockID))
            .group_by(Livestock.gender)
            .all()
        )
        data = {gender.value: count for gender, count in results}
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": f"Failed to get gender stats: {str(e)}"}), 500

@livestock_bp.route('/livestock/dashboard/breeds', methods=['GET'])
def get_breed_count_by_type():
    try:
        type_param = request.args.get('type')
        if not type_param:
            return jsonify({"error": "Missing 'type' query parameter"}), 400

        try:
            livestock_type = LivestockTypeEnum(type_param)
        except ValueError:
            return jsonify({"error": "Invalid livestock type"}), 400

        results = (
            db.session.query(Livestock.breed, db.func.count(Livestock.livestockID))
            .filter(Livestock.type == livestock_type)
            .group_by(Livestock.breed)
            .all()
        )

        # Convert to the desired structured list
        data = [
            {
                "breed_counts": breed,
                "count": count
            }
            for breed, count in results
        ]

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": f"Failed to get breed stats: {str(e)}"}), 500


@livestock_bp.route('/livestock/dashboard/purchase_trend', methods=['GET'])
def get_cumulative_livestock_trend():
    try:
        # Step 1: Get raw counts by date and type
        results = (
            db.session.query(Livestock.purchase_date, Livestock.type, db.func.count(Livestock.livestockID))
            .group_by(Livestock.purchase_date, Livestock.type)
            .order_by(Livestock.purchase_date.asc())
            .all()
        )

        # Step 2: Process into a cumulative format
        from collections import defaultdict
        from datetime import date

        # Organize the raw data by date
        date_type_map = defaultdict(lambda: defaultdict(int))
        all_dates = set()

        for purchase_date, livestock_type, count in results:
            date_str = purchase_date.isoformat()
            date_type_map[date_str][livestock_type.value] += count
            all_dates.add(purchase_date)

        # Step 3: Sort all dates
        sorted_dates = sorted(all_dates)

        # Step 4: Build cumulative counts
        cumulative_counts = defaultdict(int)
        final_data = []

        for d in sorted_dates:
            date_str = d.isoformat()
            entry = {"date": date_str}

            for livestock_type in LivestockTypeEnum:
                type_str = livestock_type.value
                # Add today's count to cumulative if exists
                if type_str in date_type_map[date_str]:
                    cumulative_counts[type_str] += date_type_map[date_str][type_str]
                # Only include in output if > 0
                if cumulative_counts[type_str] > 0:
                    entry[type_str] = cumulative_counts[type_str]

            final_data.append(entry)

        return jsonify(final_data)

    except Exception as e:
        return jsonify({"error": f"Failed to fetch cumulative livestock trend: {str(e)}"}), 500

@livestock_bp.route('/livestock/dashboard/health-status', methods=['GET'])
def get_health_status_by_type():
    try:
        from collections import defaultdict

        # Query grouped by health_status and type
        results = (
            db.session.query(Livestock.health_status, Livestock.type, db.func.count(Livestock.livestockID))
            .group_by(Livestock.health_status, Livestock.type)
            .all()
        )

        # Initialize structure to hold health_status as keys
        stats = defaultdict(lambda: {"health_status": "", "cattle": 0, "horse": 0, "sheep": 0})

        for health_status, livestock_type, count in results:
            hs = health_status.value
            lt = livestock_type.value
            stats[hs]["health_status"] = hs
            stats[hs][lt] = count

        return jsonify(list(stats.values()))

    except Exception as e:
        return jsonify({"error": f"Failed to fetch health status breakdown: {str(e)}"}), 500


@livestock_bp.route('/livestock/dashboard/breeding-status', methods=['GET'])
def get_breeding_status_distribution():
    try:
        results = (
            db.session.query(Livestock.breeding_status, db.func.count(Livestock.livestockID))
            .group_by(Livestock.breeding_status)
            .all()
        )
        data = [
            {
                "breeding_status": status.value,
                "count": count
            }
            for status, count in results
        ]
        return jsonify(data)

    except Exception as e:
        return jsonify({"error": f"Failed to fetch breeding status distribution: {str(e)}"}), 500

