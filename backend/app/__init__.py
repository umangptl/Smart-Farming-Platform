# app/__init__.py
from flask import Flask
from flask_cors import CORS
from .routes.example_route import main_routes
from .routes.task_routes import task_bp
from .routes.user_routes import user_bp

def create_app():
    app = Flask(__name__)
    app.config.from_pyfile('config.py')  # Load configuration settings

    # Enable CORS for all domains (you can restrict this later)
    CORS(app)

    # Import and register the Blueprint
    app.register_blueprint(main_routes)
    app.register_blueprint(task_bp)
    app.register_blueprint(user_bp)
    return app
