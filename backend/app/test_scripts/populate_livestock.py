import random
from datetime import datetime, timedelta
from app import create_app
from app.utils.db_util import db
from app.models.livestock import Livestock, LivestockTypeEnum, HealthStatusEnum, BreedingStatusEnum, GenderEnum

# List of paddock IDs available in the database
PADDOCK_IDS = [1, 3, 4, 5, 6, 7, 8, 9]

# Sample breeds for each livestock type
BREEDS = {
    "cattle": ["Angus", "Hereford", "Charolais", "Brahman"],
    "horse": ["Arabian", "Quarter Horse", "Thoroughbred", "Appaloosa"],
    "sheep": ["Merino", "Dorper", "Suffolk", "Rambouillet"]
}

def generate_random_date(start_year=2015, end_year=2023):
    """Generate a random date between start_year and end_year."""
    start_date = datetime(start_year, 1, 1)
    end_date = datetime(end_year, 12, 31)
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    return start_date + timedelta(days=random_days)

def populate_livestock():
    """Populate the database with 25 random livestock entries."""
    app = create_app()
    
    with app.app_context():
        livestock_entries = []

        for _ in range(25):
            livestock_type = random.choice(list(LivestockTypeEnum))
            breed = random.choice(BREEDS[livestock_type.value])
            dob = generate_random_date(start_year=2015, end_year=2020)  # Random birthdate
            purchase_date = generate_random_date(start_year=2021, end_year=2023)  # Random purchase date
            purchase_price = random.randint(500, 5000)  # Random price between $500-$5000
            health_status = random.choice(list(HealthStatusEnum))
            breeding_status = random.choice(list(BreedingStatusEnum))
            gender = random.choice(list(GenderEnum))
            livestock_name = f"{livestock_type.value.capitalize()}-{random.randint(100, 999)}"
            weight = random.randint(50, 1200)  # Weight varies by livestock type
            paddock_id = random.choice(PADDOCK_IDS)

            new_livestock = Livestock(
                type=livestock_type,
                breed=breed,
                dob=dob,
                purchase_price=purchase_price,
                purchase_date=purchase_date,
                health_status=health_status,
                breeding_status=breeding_status,
                gender=gender,
                livestock_name=livestock_name,
                weight=weight,
                paddockID=paddock_id
            )

            livestock_entries.append(new_livestock)

        db.session.bulk_save_objects(livestock_entries)
        db.session.commit()
        print("✅ Successfully populated the database with 25 livestock records.")

if __name__ == "__main__":
    populate_livestock()
