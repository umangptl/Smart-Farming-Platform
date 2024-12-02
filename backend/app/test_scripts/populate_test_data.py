# populate_test_data.py
from app.utils.db_util import db
from app.models.paddock import Paddock, GrassTypeEnum
from app.models.livestock import Livestock, LivestockTypeEnum, GenderEnum
from app.models.location import Location
from app import create_app

app = create_app()

with app.app_context():
    # Add a test location
    location = Location(location_name="Farm A", coordinates="37.7749° N, 122.4194° W")
    db.session.add(location)
    db.session.commit()

    # Add a test paddock
    paddock = Paddock(size=15.5, grass_type=GrassTypeEnum.ryegrass, capacity="10 livestock", locationID=location.locationID)
    db.session.add(paddock)
    db.session.commit()

    # Add a test livestock
    livestock = Livestock(
        type=LivestockTypeEnum.cattle,
        breed="Angus",
        dob="2024-01-01",
        health_status=True,
        gender=GenderEnum.female,
        livestock_name="Bessie",
        weight=500,
        paddockID=paddock.paddockID
    )
    db.session.add(livestock)
    db.session.commit()

    print("Test data populated!")
