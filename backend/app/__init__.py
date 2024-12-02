# app/__init__.py
from flask import Flask
from flask_cors import CORS  # Import Flask-CORS

def create_app():
    app = Flask(__name__)
    app.config.from_pyfile('config.py')  # Load configuration settings

    # Enable CORS for all domains (you can restrict this later)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    # Import and register the Blueprint
    from .routes.example_route import main_routes  # Correct import
    app.register_blueprint(main_routes)

    return app
