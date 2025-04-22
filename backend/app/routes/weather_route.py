from flask import Blueprint, jsonify, request
import requests
from dotenv import load_dotenv
from datetime import datetime
from collections import defaultdict
import os

# Load environment variables from .env file
load_dotenv()

weather_bp = Blueprint('weather', __name__)

# Fetch the API key from the environment
API_KEY = os.getenv('OPENWEATHER_API_KEY')
BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
TEMPERATURE_MAP_URL = "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=" + str(API_KEY)
FORECAST_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast'

def map_icon(icon):
    if icon in ["01d", "02d"]:
        return "sun"
    elif icon in ["01n", "02n"]:
        return "moon"
    elif icon in ["03d", "03n"]:
        return "cloud"
    elif icon == "04d":
        return "cloudsun"
    elif icon == "04n":
        return "cloudnight"
    elif icon in ["09d", "09n", "10d", "10n"]:
        return "rain"
    elif icon in ["11d", "11n"]:
        return "thunderstorm"
    elif icon in ["13d", "13n"]:
        return "snowflake"
    elif icon in ["50d", "50n"]:
        return "mist"
    else:
        return icon

@weather_bp.route('/weather', methods=['GET'])
def get_weather():
    try:
        city = request.args.get('city')
        lat = request.args.get('lat')
        lon = request.args.get('lon')

        if not city and (not lat or not lon):
            return jsonify({"error": "Please provide a city or latitude and longitude."}), 400

        if city:
            params = {'q': city, 'appid': API_KEY, 'units': 'Imperial'}
        else:
            params = {'lat': lat, 'lon': lon, 'appid': API_KEY, 'units': 'Imperial'}

        response = requests.get(BASE_URL, params=params)

        if response.status_code != 200:
            return jsonify({"error": f"Weather data not found. API response: {response.json().get('message', 'Unknown error')}"}), 404

        data = response.json()
        result = {
            "location": data.get('name', 'Unknown'),
            "datetime": data.get('dt'),
            "visibility": data.get('visibility'),
            "weather": {
                "description": data['weather'][0]['description'] if data.get('weather') else 'N/A',
                "icon": data['weather'][0]['icon'] if data.get('weather') else 'N/A',
            },
            "temperature": {
                "current": data['main']['temp'],
                "high": data['main']['temp_max'],
                "low": data['main']['temp_min'],
                "humidity":data['main']['humidity'] if 'wind' in data else 'N/A'
            },
            "wind":{
                "windspeed": data['wind']['speed'] if 'wind' in data else 'N/A',
            },
            "sun":{
                "sunrise": data['sys']['sunrise'] if 'wind' in data else 'N/A',
                "sunset": data['sys']['sunset'] if 'wind' in data else 'N/A'
            }
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
@weather_bp.route('/temperature-map', methods=['GET'])
def get_temperature_map():
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not city and not (lat and lon):
        return jsonify({"error": "Please provide a city or latitude and longitude."}), 400

    try:
        # Resolve city to coordinates if a city name is provided
        if city:
            params = {"q": city, "appid": API_KEY}
            weather_response = requests.get(BASE_URL, params=params)
            if weather_response.status_code != 200:
                return jsonify({"error": f"City not found: {city}"}), 404

            weather_data = weather_response.json()
            lat = weather_data["coord"]["lat"]
            lon = weather_data["coord"]["lon"]

        # Construct response
        response = {
            "tile_url": TEMPERATURE_MAP_URL,
            "attribution": "© OpenWeatherMap",
            "center": {
                "lat": float(lat),
                "lon": float(lon),
            },
            "zoom": 10,  # Default zoom level
            "city": city or f"Coordinates: {lat}, {lon}",
        }
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@weather_bp.route('/hourly-forecast', methods=['GET'])
def get_hourly_forecast():
    city = request.args.get('city')
    units = request.args.get('units', 'Imperial')

    if not city:
        return jsonify({"error": "City is required for hourly forecast."}), 400

    params = {
        'q': city,
        'appid': API_KEY,
        'units': units
    }
    try:
        response = requests.get(FORECAST_BASE_URL, params=params)
        if response.status_code != 200:
            return jsonify({
                               "error": f"Forecast data not found. API response: {response.json().get('message', 'Unknown error')}"}), 404

        data = response.json()
        timezone_offset = data.get('city', {}).get('timezone', 0)
        forecast_list = data.get('list', [])

        hourly_forecasts = []
        for forecast in forecast_list[:8]:  # Limit to 8 intervals (next 24 hours)
            timestamp = forecast.get('dt')
            temperature = forecast['main']['temp']
            icon = map_icon(forecast['weather'][0]['icon'])
            dt = datetime.utcfromtimestamp(timestamp + timezone_offset).strftime('%I:%M %p')

            hourly_forecasts.append({
                "time": dt,
                "icon": icon,
                "temperature": round(temperature,0)
            })

        return jsonify(hourly_forecasts), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@weather_bp.route('/daily-forecast', methods=['GET'])
def get_daily_forecast():
    city = request.args.get('city')
    units = request.args.get('units', 'Imperial')

    if not city:
        return jsonify({"error": "City is required for daily forecast."}), 400

    params = {
        'q': city,
        'appid': API_KEY,
        'units': units
    }
    try:
        response = requests.get(FORECAST_BASE_URL, params=params)
        if response.status_code != 200:
            return jsonify({
                               "error": f"Forecast data not found. API response: {response.json().get('message', 'Unknown error')}"}), 404

        data = response.json()
        forecast_list = data.get('list', [])

        # Group forecasts by UTC date
        grouped_forecasts = defaultdict(list)
        for forecast in forecast_list:
            timestamp = forecast.get('dt')
            utc_date = datetime.utcfromtimestamp(timestamp).date()  # Group by raw UTC date
            grouped_forecasts[utc_date].append(forecast)

        daily_forecasts = []
        for i, (date, forecasts) in enumerate(grouped_forecasts.items()):
            if i >= 5:  # Limit to 5 days
                break

            temp_min = min(f['main']['temp_min'] for f in forecasts)
            temp_max = max(f['main']['temp_max'] for f in forecasts)

            icon_counts = defaultdict(int)
            for f in forecasts:
                icon_counts[f['weather'][0]['icon']] += 1

            # Get most frequent icon
            most_common_icon = max(icon_counts, key=icon_counts.get)

            daily_forecasts.append({
                "date": date.isoformat(),  # Send raw UTC date as ISO string
                "icon": map_icon(most_common_icon),
                "temp_max": round(temp_max,0),
                "temp_min": round(temp_min,0)
            })

        return jsonify(daily_forecasts), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@weather_bp.route('/dashboard', methods=['GET'])
def get_dashboard_temperature():
    try:
        params = {'q': 'San Jose', 'appid': API_KEY, 'units': 'Imperial'}
        response = requests.get(BASE_URL, params=params)

        if response.status_code != 200:
            raise Exception(f"API error: {response.json().get('message', 'Unknown error')}")

        data = response.json()
        temperature = round(data['main']['temp'])
        return jsonify({"temperature": f"{temperature}°F"})

    except Exception as e:
        print(f"Error fetching San Jose temperature: {e}")
        return jsonify({"temperature": "N/A"})
