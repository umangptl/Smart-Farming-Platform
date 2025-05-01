import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ChartistGraph from "react-chartist";
import { Card, Container, Row, Col, Form } from "react-bootstrap";
import { API_BASE_URL } from "../config.js";

function Dashboard() {
  const [temperature, setTemperature] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskProgress, setTaskProgress] = useState(null);
  const [livestockCount, setLivestockCount] = useState(null);
  const [livestockPieData, setLivestockPieData] = useState({
    labels: [],
    series: [],
    types: [],
  });
  const colorClasses = [
    "text-info",
    "text-danger",
    "text-warning",
    "text-success",
    "text-primary",
    "text-secondary",
  ];
  const [purchaseTrendData, setPurchaseTrendData] = useState({
    labels: [],
    series: [],
  });
  const [purchaseTrendTypes, setLivestockLineLabels] = useState([]);
  const [healthStatusData, setHealthStatusData] = useState({
    labels: [],
    series: [],
  });
  const [healthTypes, setHealthTypes] = useState([]);
  const [breedingPieData, setBreedingPieData] = useState({
    labels: [],
    series: [],
  });
  const [selectedChart, setSelectedChart] = useState("breeding");
  const [donutData, setDonutData] = useState({ labels: [], series: [] });
  const [donutLegend, setDonutLegend] = useState([]);
  const chartOptions = [
    { key: "breeding", label: "Breeding Status" },
    { key: "cattle", label: "Cattle Breakdown" },
    { key: "horse", label: "Horse Breakdown" },
    { key: "sheep", label: "Sheep Breakdown" },
  ];

  useEffect(() => {
    const fetchTemperature = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard`);
        setTemperature(res.data.temperature);
      } catch (err) {
        console.error("Failed to fetch temperature", err);
        setTemperature("N/A");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks/dashboard`);
        setTaskProgress(res.data.progress);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setTaskProgress("N/A");
      }
    };

    const fetchLivestock = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/livestock/dashboard`
        );
        setLivestockCount(res.data.total_livestock);
      } catch (err) {
        console.error("Failed to fetch livestock count:", err);
        setLivestockCount("N/A");
      }
    };

    const fetchLivestockByType = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/livestock/dashboard/type`
        );

        const typeCounts = response.data;
        const total = Object.values(typeCounts).reduce((a, b) => a + b, 0);

        const labels = Object.values(typeCounts).map(
          (count) => `${Math.round((count / total) * 100)}%`
        );
        const series = Object.values(typeCounts);
        const types = Object.keys(typeCounts);

        setLivestockPieData({ labels, series, types });
      } catch (err) {
        console.error("Failed to load livestock pie data:", err);
      }
    };

    const fetchPurchaseTrend = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/livestock/dashboard/purchase_trend`
        );
        const raw = res.data;

        const dateMap = {};
        const typesSet = new Set();

        raw.forEach((entry) => {
          const date = entry.date;
          dateMap[date] = dateMap[date] || {};
          Object.keys(entry).forEach((key) => {
            if (key !== "date") {
              dateMap[date][key] = entry[key];
              typesSet.add(key);
            }
          });
        });

        const sortedDates = Object.keys(dateMap).sort();
        const types = Array.from(typesSet);

        const series = types.map((type) => ({
          name: type,
          data: sortedDates.map((date) => dateMap[date][type] || 0),
        }));

        setLivestockLineLabels(types);
        setPurchaseTrendData({
          labels: sortedDates,
          series: series.map((s) => s.data),
        });
      } catch (err) {
        console.error("Failed to fetch purchase trend data:", err);
      }
    };

    const fetchHealthStatus = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/livestock/dashboard/health-status`
        );
        const raw = res.data;

        const labels = raw.map((entry) => entry.health_status);
        const livestockTypes = Object.keys(raw[0]).filter(
          (key) => key !== "health_status"
        );

        const series = livestockTypes.map((type) =>
          raw.map((entry) => entry[type] || 0)
        );

        setHealthStatusData({
          labels,
          series,
        });

        setHealthTypes(livestockTypes);
      } catch (err) {
        console.error("Error loading health status chart", err);
      }
    };

    const fetchDonutChart = async (type) => {
      let url = "";

      if (type === "breeding") {
        url = `${API_BASE_URL}/livestock/dashboard/breeding-status`;
      } else {
        url = `${API_BASE_URL}/livestock/dashboard/breeds?type=${type}`;
      }

      try {
        const res = await axios.get(url);
        const raw = res.data;
        const total = raw.reduce((sum, item) => sum + item.count, 0);
        const labels = raw.map(
          (item) => `${Math.round((item.count / total) * 100)}%`
        );
        const series = raw.map((item) => item.count);
        const legend = raw.map(
          (item, index) =>
            item.breeding_status ||
            item.breed_counts ||
            item.label ||
            item.status
        );

        setDonutData({ labels, series });
        setDonutLegend(legend);
      } catch (err) {
        console.error("Chart fetch failed:", err);
      }
    };

    fetchTemperature();
    fetchTasks();
    fetchLivestock();
    fetchLivestockByType();
    fetchPurchaseTrend();
    fetchHealthStatus();
    fetchDonutChart(selectedChart);
  }, [selectedChart]);

  return (
    <>
      <Container fluid>
        <Row>
          <Col lg="3" sm="6">
            <Card
              className="card-stats"
              style={{
                background: "linear-gradient(45deg, #2150fc, #8cc6f5)",
              }}
            >
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-small text-center icon-warning">
                      <img
                        src={require("assets/img/weather.png")}
                        alt="..."
                        style={{ width: "50px", height: "50px" }}
                      />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category" style={{ color: "black" }}>
                        Temparature
                      </p>
                      <Card.Title as="h4">
                        {isLoading ? "Loading..." : temperature}
                      </Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <Link
                  to="/admin/weather"
                  style={{ textDecoration: "none", color: "black" }}
                >
                  View More →
                </Link>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card
              className="card-stats"
              style={{
                background: "linear-gradient(45deg, #fc1e3c, #fa9bb6)",
              }}
            >
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-small text-center icon-warning">
                      <img
                        src={require("assets/img/task.png")}
                        alt="..."
                        style={{ width: "50px", height: "50px" }}
                      />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category" style={{ color: "black" }}>
                        Tasks
                      </p>
                      <Card.Title as="h4">
                        {isLoading ? "Loading..." : taskProgress}
                      </Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <Link
                  to="/admin/tasks"
                  style={{ textDecoration: "none", color: "black" }}
                >
                  View More →
                </Link>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card
              className="card-stats"
              style={{
                background: "linear-gradient(45deg, #25db09, #8df7cd)",
              }}
            >
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-small text-center icon-warning">
                      <img
                        src={require("assets/img/livestock.png")}
                        alt="..."
                        style={{ width: "50px", height: "50px" }}
                      />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category" style={{ color: "black" }}>
                        Total livestock
                      </p>
                      <Card.Title as="h4">
                        {isLoading ? "Loading..." : livestockCount}
                      </Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <Link
                  to="/admin/inventory"
                  style={{ textDecoration: "none", color: "black" }}
                >
                  View More →
                </Link>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card
              className="card-stats"
              style={{
                background: "linear-gradient(45deg, #e86b2e, #fae673)",
              }}
            >
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-small text-center icon-warning">
                      <img
                        src={require("assets/img/barn.png")}
                        alt="..."
                        style={{ width: "45px", height: "45px" }}
                      />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category" style={{ color: "black" }}>
                        Active Cameras
                      </p>
                      <Card.Title as="h4">+6</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <Link
                  to="/admin/surveillance"
                  style={{ textDecoration: "none", color: "black" }}
                >
                  View More →
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        <Row>
          {/* livestock line chart */}
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Cumulative Livestock</Card.Title>
                <p className="card-category">
                  Inventory Trends by Purchase Date
                </p>
              </Card.Header>
              <Card.Body>
                <div className="legend">
                  {purchaseTrendTypes.map((type, index) => (
                    <span key={type}>
                      <i
                        className={`fas fa-circle ${
                          colorClasses[index % colorClasses.length]
                        }`}
                      ></i>{" "}
                      {type}{" "}
                    </span>
                  ))}
                </div>

                <div className="ct-chart" id="chartHours">
                  <ChartistGraph
                    data={purchaseTrendData}
                    type="Line"
                    options={{
                      fullWidth: true,
                      showPoint: true,
                      height: "300px",
                      chartPadding: { right: 40 },
                      axisY: {
                        onlyInteger: true,
                        offset: 30,
                        labelInterpolationFnc: function (value) {
                          return Math.round(value);
                        },
                      },
                      axisX: {
                        showGrid: false,
                        labelInterpolationFnc: function (value, index, labels) {
                          const interval = Math.ceil(labels.length / 5);
                          if (index % interval === 0) {
                            const date = new Date(value);
                            const month = date.toLocaleString("en-US", {
                              month: "short",
                            });
                            const year = date.getFullYear();
                            return `${month}\u00A0${year}`;
                          }
                          return null;
                        },
                      },
                    }}
                    responsiveOptions={[
                      [
                        "screen and (max-width: 640px)",
                        {
                          axisX: {
                            labelInterpolationFnc: function (
                              value,
                              index,
                              labels
                            ) {
                              return index % 2 === 0 ? value.slice(5) : null;
                            },
                          },
                        },
                      ],
                    ]}
                  />
                </div>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-history"></i> Updated 3 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* pie chart */}
          <Col md="4">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Inventory Statistics</Card.Title>
                <p className="card-category">Total Livestock Distribution</p>
              </Card.Header>
              <Card.Body>
                <div
                  className="ct-chart ct-perfect-fourth"
                  id="chartPreferences"
                >
                  <ChartistGraph
                    data={{
                      labels: livestockPieData.labels,
                      series: livestockPieData.series,
                    }}
                    type="Pie"
                    options={{
                      showLabel: true,
                    }}
                  />
                </div>
                <div className="legend">
                  {livestockPieData.types.map((type, index) => (
                    <span key={type}>
                      <i
                        className={`fas fa-circle ${
                          colorClasses[index % colorClasses.length]
                        }`}
                      ></i>{" "}
                      {type}{" "}
                    </span>
                  ))}
                </div>
                <hr></hr>
                <div className="stats">
                  <i className="far fa-clock"></i>
                  updated 2 days ago
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* donut chart  */}
          <Col md="4">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title as="h4">Breed/ Breeding Chart</Card.Title>
                  <p className="card-category">Dynamic Distribution</p>
                </div>
                <Form.Select
                  size="sm"
                  value={selectedChart}
                  onChange={(e) => setSelectedChart(e.target.value)}
                  style={{ width: "120px" }}
                >
                  {chartOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
              </Card.Header>

              <Card.Body>
                <div className="ct-chart ct-perfect-fourth">
                  <ChartistGraph
                    data={donutData}
                    type="Pie"
                    options={{
                      donut: true,
                      donutWidth: 50,
                      startAngle: 0,
                      showLabel: true,
                    }}
                  />
                </div>

                <div className="legend">
                  {donutLegend.map((label, index) => (
                    <span key={`${label}-${index}`}>
                      <i
                        className={`fas fa-circle ${
                          colorClasses[index % colorClasses.length]
                        }`}
                      ></i>
                      {label} {""}
                    </span>
                  ))}
                </div>

                <hr />
                <div className="stats">
                  <i className="far fa-clock"></i> updated dynamically
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* bar chart */}
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Health Status </Card.Title>
                <p className="card-category">Grouped by Livestock Type</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartActivity">
                  <ChartistGraph
                    data={healthStatusData}
                    type="Bar"
                    options={{
                      seriesBarDistance: 15,
                      axisX: {
                        showGrid: false,
                      },
                      height: "245px",
                      axisY: {
                        onlyInteger: true,
                      },
                    }}
                    responsiveOptions={[
                      [
                        "screen and (max-width: 640px)",
                        {
                          seriesBarDistance: 5,
                          axisX: {
                            labelInterpolationFnc: function (value) {
                              return value[0];
                            },
                          },
                        },
                      ],
                    ]}
                  />
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="legend">
                  {healthTypes.map((type, index) => (
                    <span key={type}>
                      <i
                        className={`fas fa-circle ${
                          colorClasses[index % colorClasses.length]
                        }`}
                      ></i>{" "}
                      {type}{" "}
                    </span>
                  ))}
                </div>

                <hr></hr>
                <div className="stats">
                  <i className="fas fa-check"></i>
                  Data information certified
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Dashboard;
