# app/routes/example_route.py
from flask import Blueprint

main_routes = Blueprint('main_routes', __name__)

@main_routes.route('/')
def home():
    return "Welcome to the Flask API!"
