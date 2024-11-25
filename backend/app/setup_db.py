# setup_db.py
from app.utils.db_util import db
from app.__init__ import create_app

app = create_app()

with app.app_context():
    # Create the database schema
    db.create_all()
    print("Database schema created!")
