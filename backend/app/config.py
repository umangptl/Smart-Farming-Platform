# app/config.py
import os

SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_default_secret_key'
