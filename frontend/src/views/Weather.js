import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Button } from "react-bootstrap";
import "leaflet/dist/leaflet.css";

// react-bootstrap components
import { Card, Row, Col } from "react-bootstrap";

const Weather = () => {
  const [formData, setFormData] = useState({
    city: "San Jose",
    lat: "",
    lon: "",
  });

  const [weatherData, setWeatherData] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWeather();
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView(center, zoom);
      }
    }, [center, zoom, map]);
    return null;
  };

  const fetchWeather = async () => {
    const { city, lat, lon } = formData;

    let queryParams = "";
    if (city) {
      queryParams = `?city=${city}`;
    } else if (lat && lon) {
      queryParams = `?lat=${lat}&lon=${lon}`;
    } else {
      setError("Please provide a city or latitude and longitude.");
      return;
    }

    try {
      // Fetch weather data
      const response = await fetch(
        `http://127.0.0.1:5000/weather${queryParams}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather data.");
      }
      const data = await response.json();
      setWeatherData(data);
      setError("");

      // Fetch temperature map data with the same queryParams
      await fetchTemperatureMap(queryParams);
      await fetchHourly(queryParams);
      await fetchDaily(queryParams);
    } catch (err) {
      setWeatherData(null);
      setError(err.message);
    }
  };

  const fetchTemperatureMap = async (queryParams) => {
    try {
      // Include the selected layer in the queryParams
      const response = await fetch(
        `http://127.0.0.1:5000/temperature-map${queryParams}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch map data.");
      }
      const data = await response.json();
      setMapData(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchHourly = async (queryParams) => {
    try {
      // Include the selected layer in the queryParams
      const response = await fetch(
        `http://127.0.0.1:5000/hourly-forecast${queryParams}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch hourly data.");
      }
      const data = await response.json();
      setHourlyData(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchDaily = async (queryParams) => {
    try {
      // Include the selected layer in the queryParams
      const response = await fetch(
        `http://127.0.0.1:5000/daily-forecast${queryParams}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch hourly data.");
      }
      const data = await response.json();
      setDailyData(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Row>
        <Col md="6">
          <div style={{ padding: "5px", maxWidth: "600px", margin: "auto" }}>
            {/* Form Section */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchWeather();
              }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <label style={{ flex: "1" }}>
                City:
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city name"
                  style={{ marginLeft: "10px", padding: "5px", width: "100%" }}
                />
              </label>
              <label style={{ flex: "1" }}>
                Latitude:
                <input
                  type="text"
                  name="lat"
                  value={formData.lat}
                  onChange={handleChange}
                  placeholder="Enter latitude"
                  style={{ marginLeft: "10px", padding: "5px", width: "100%" }}
                />
              </label>
              <label style={{ flex: "1" }}>
                Longitude:
                <input
                  type="text"
                  name="lon"
                  value={formData.lon}
                  onChange={handleChange}
                  placeholder="Enter longitude"
                  style={{ marginLeft: "10px", padding: "5px", width: "100%" }}
                />
              </label>
              <button
                variant="primary"
                type="submit"
                style={{
                  padding: "8px 10px",
                  flexShrink: "0",
                  marginLeft: "10px",
                  marginTop: "10px",
                }}
              >
                Set Location
              </button>
            </form>
            {/* Error Message */}
            {error && (
              <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
            )}
          </div>

          {weatherData ? (
            <Card>
              <Card.Header>
                <Card.Title as="h4">{weatherData.location}</Card.Title>
                <p className="card-category">Current Weather</p>
              </Card.Header>
              <Card.Body
                style={{
                  width: "100%",
                  height: "265px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundImage: `url(${require(`assets/img/Weather/${weatherData.weather.icon}.jpeg`)})`,
                  color: "white",
                }}
              >
                {/* Top Section: Description */}
                <h4 style={{ margin: 0, textAlign: "left" }}>
                  {weatherData.weather.description}
                </h4>

                {/* Middle Section: Current Temperature */}
                <h2 style={{ margin: 0, textAlign: "right" }}>
                  {Math.round(weatherData.temperature.current)}°F
                </h2>

                {/* Bottom Section */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  {/* High and Low on the Left */}
                  <div>
                    <h5 style={{ margin: 0 }}>
                      H: {Math.ceil(weatherData.temperature.high)}°F
                    </h5>
                    <h5 style={{ margin: 0 }}>
                      L: {Math.floor(weatherData.temperature.low)}°F
                    </h5>
                  </div>

                  {/* Time/Date on the Right */}
                  <p style={{ margin: 0, textAlign: "right" }}>
                    {new Date(weatherData.datetime * 1000).toLocaleString()}
                  </p>
                </div>
              </Card.Body>

              <Card.Footer></Card.Footer>
            </Card>
          ) : (
            !error && <p>Loading default weather data...</p>
          )}
        </Col>
        <Col md="6">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Map Forecast</Card.Title>
              <p className="card-category">Temparature Map</p>
            </Card.Header>
            <Card.Body>
              {/* Map Section */}
              {mapData ? (
                <div style={{ marginTop: "20px" }}>
                  <MapContainer
                    center={[mapData.center.lat, mapData.center.lon]}
                    zoom={mapData.zoom}
                    style={{ height: "300px", width: "100%" }}
                  >
                    {/* Dynamically update map center */}
                    <MapUpdater
                      center={[mapData.center.lat, mapData.center.lon]}
                      zoom={mapData.zoom}
                    />

                    {/* Base Map */}
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />

                    {/* Temperature Overlay */}
                    <TileLayer
                      url={mapData.tile_url}
                      attribution={mapData.attribution}
                      opacity={0.9}
                    />
                  </MapContainer>
                </div>
              ) : (
                <p>Enter a city to view the temperature map.</p>
              )}
            </Card.Body>
            <Card.Footer></Card.Footer>
          </Card>
        </Col>
      </Row>
      {weatherData ? (
        <div style={styles.container}>
          {/* Wind Speed */}
          <div style={styles.card}>
            <i className="fas fa-wind" style={styles.icon}></i>
            <h3 style={styles.label}>Wind Speed</h3>
            <p style={styles.value}>{weatherData.wind.windspeed} m/s</p>
          </div>

          {/* Humidity */}
          <div style={styles.card}>
            <i className="fas fa-tint" style={styles.icon}></i>
            <h3 style={styles.label}>Humidity</h3>
            <p style={styles.value}>{weatherData.temperature.humidity}%</p>
          </div>

          {/* Visibility */}
          <div style={styles.card}>
            <i className="fas fa-eye" style={styles.icon}></i>
            <h3 style={styles.label}>Visibility</h3>
            <p style={styles.value}>{weatherData.visibility / 1000} km</p>
          </div>

          {/* Sunrise/Sunset */}
          <div style={styles.card}>
            <i className="fas fa-sun" style={styles.icon}></i>
            <h3 style={styles.label}>Sunrise & Sunset</h3>
            <p style={styles.value}>
              Sunrise: {formatTime(weatherData.sun.sunrise)}
              <br />
              Sunset: {formatTime(weatherData.sun.sunset)}
            </p>
          </div>
        </div>
      ) : (
        <p>Enter a city to view the temperature map.</p>
      )}

      <h3 style={{ textAlign: "center" }}>3 Hourly Forecast</h3>

      <Row style={{ justifyContent: "center" }}>
        {hourlyData.map((hourlyData, index) => (
          <Col key={index} md="1.2" style={{ margin: "10px" }}>
            <Card>
              <Card.Header>
                <Card.Title as="h5">{hourlyData.time}</Card.Title>
              </Card.Header>
              <Card.Body>
                <img
                  src={require(`assets/img/weathericon/${hourlyData.icon}.png`)}
                  alt="weather icon"
                  style={{ width: "65px", height: "65px" }}
                />
              </Card.Body>
              <Card.Footer style={{ textAlign: "center" }}>
                {hourlyData.temperature}°F
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      <h3 style={{ textAlign: "center" }}>5 Days Forecast</h3>
      <Row style={{ alignItems: "center", flexDirection: "column" }}>
        {dailyData.map((dailyData, index) => (
          <Col key={index} md="5">
            <Card>
              <Card.Body
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h5 style={{ margin: 0 }}>
                  {new Date(dailyData.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </h5>

                <img
                  src={require(`assets/img/weathericon/${dailyData.icon}.png`)}
                  alt="weather icon"
                  style={{ width: "65px", height: "65px" }}
                />

                <p style={{ margin: 0, textAlign: "right" }}>
                  {dailyData.temp_max}°F / {dailyData.temp_min}°F
                </p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Weather;

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    padding: "20px",
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s",
    cursor: "pointer",
  },
  icon: {
    fontSize: "2rem",
    color: "#007BFF",
    marginBottom: "10px",
  },
  label: {
    fontSize: "1.2rem",
    color: "#333",
    margin: "5px 0",
  },
  value: {
    fontSize: "1rem",
    color: "#555",
  },
};
