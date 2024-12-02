from app.utils.db_util import configure_db, db
from app import create_app

# Create the Flask app
app = create_app()
configure_db(app)

@app.before_request
def create_tables():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
