from flask import Flask
import os
from flask_cors import CORS
from app.utils.db_util import configure_db
from app.config import Config
from .routes.task_routes import task_bp
from .routes.livestock_routes import livestock_bp
from .routes.location_routes import location_bp
from .routes.paddock_routes import paddock_bp
from .routes.example_route import main_routes
from .routes.task_routes import task_bp
from .routes.user_routes import user_bp
from .routes.weather_route import weather_bp
from .routes.enums_routes import enums_bp
# from .routes.ml_image_routes import ml_bp
from .routes.video_routes import video_bp
from .routes.surveillance_routes import surveillance_bp


def create_app():
    # Initialize the Flask app
    app = Flask(__name__)
    configure_db(app)

    # Enable CORS for all domains (you can restrict this later)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
    
    # Ensure necessary directories exist
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)  # Creates "uploads/" if it doesn't exist
    os.makedirs(Config.STATIC_FOLDER, exist_ok=True)  # Creates "static/" if it doesn't exist

    # Register Blueprints
    app.register_blueprint(task_bp)
    app.register_blueprint(location_bp)
    app.register_blueprint(paddock_bp)
    app.register_blueprint(livestock_bp)
    app.register_blueprint(main_routes)
    app.register_blueprint(user_bp)
    app.register_blueprint(weather_bp)
    app.register_blueprint(enums_bp)
    # app.register_blueprint(ml_bp, url_prefix='/api/ml')
    app.register_blueprint(video_bp, url_prefix='/api/videos')
    app.register_blueprint(surveillance_bp)

    return app
