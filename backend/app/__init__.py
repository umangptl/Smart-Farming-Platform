from flask import Flask
from flask_cors import CORS
from app.utils.db_util import configure_db
from app.routes.task_routes import task_bp
from app.routes.livestock_routes import livestock_bp
from app.routes.location_routes import location_bp
from app.routes.paddock_routes import paddock_bp

def create_app():
    # Initialize the Flask app
    app = Flask(__name__)
    app.config.from_pyfile('config.py')  # Load configuration settings

    # Enable CORS for all domains (you can restrict this later)
    CORS(app)

    # Configure the database
    configure_db(app)

    # Register Blueprints
    app.register_blueprint(task_bp)
    app.register_blueprint(location_bp)
    app.register_blueprint(paddock_bp)
    app.register_blueprint(livestock_bp)

    return app