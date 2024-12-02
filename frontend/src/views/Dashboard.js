import React from "react";
import ChartistGraph from "react-chartist";

// react-bootstrap components
import { Card, Container, Row, Col } from "react-bootstrap";

function Dashboard() {
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
                      <Card.Title as="h4">65°F</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                View More →
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
                      <Card.Title as="h4">16/60</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                View More →
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
                      <Card.Title as="h4">269</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                View More →
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
                      <Card.Title as="h4">+5</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                View More →
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Main Camera 1</Card.Title>
                <p className="card-category">Location (Name)</p>
              </Card.Header>
              <Card.Body>
                <img
                  src={require("assets/img/main1.png")}
                  alt="..."
                  style={{ width: "525px", height: "250px" }}
                />
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="fas fa-history"></i>
                  Updated 3 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col md="6">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Main Camera 2</Card.Title>
                <p className="card-category">Location (name)</p>
              </Card.Header>
              <Card.Body>
                <img
                  src={require("assets/img/main2.png")}
                  alt="..."
                  style={{ width: "525px", height: "250px" }}
                />
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="fas fa-history"></i>
                  Updated 13 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Important chart</Card.Title>
                <p className="card-category">behaviour</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartHours">
                  <ChartistGraph
                    data={{
                      labels: [
                        "9:00AM",
                        "12:00AM",
                        "3:00PM",
                        "6:00PM",
                        "9:00PM",
                        "12:00PM",
                        "3:00AM",
                        "6:00AM",
                      ],
                      series: [
                        [287, 385, 490, 492, 554, 586, 698, 695],
                        [67, 152, 143, 240, 287, 335, 435, 437],
                        [23, 113, 67, 108, 190, 239, 307, 308],
                      ],
                    }}
                    type="Line"
                    options={{
                      low: 0,
                      high: 800,
                      showArea: false,
                      height: "245px",
                      axisX: {
                        showGrid: false,
                      },
                      lineSmooth: true,
                      showLine: true,
                      showPoint: true,
                      fullWidth: true,
                      chartPadding: {
                        right: 50,
                      },
                    }}
                    responsiveOptions={[
                      [
                        "screen and (max-width: 640px)",
                        {
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
                  <i className="fas fa-circle text-info"></i>
                  Open <i className="fas fa-circle text-danger"></i>
                  Click <i className="fas fa-circle text-warning"></i>
                  Click Second Time
                </div>
                <hr></hr>
                <div className="stats">
                  <i className="fas fa-history"></i>
                  Updated 3 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col md="4">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Inventory Statistics</Card.Title>
                <p className="card-category">Total Animals</p>
              </Card.Header>
              <Card.Body>
                <div
                  className="ct-chart ct-perfect-fourth"
                  id="chartPreferences"
                >
                  <ChartistGraph
                    data={{
                      labels: ["40%", "20%", "40%"],
                      series: [40, 20, 40],
                    }}
                    type="Pie"
                  />
                </div>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i>
                  Cows <i className="fas fa-circle text-danger"></i>
                  Sheeps <i className="fas fa-circle text-warning"></i>
                  chickens
                </div>
                <hr></hr>
                <div className="stats">
                  <i className="far fa-clock"></i>
                  updated 2 days ago
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Chart Title </Card.Title>
                <p className="card-category">All Animals</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartActivity">
                  <ChartistGraph
                    data={{
                      labels: [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "Mai",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ],
                      series: [
                        [
                          542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756,
                          895,
                        ],
                        [
                          412, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636,
                          695,
                        ],
                      ],
                    }}
                    type="Bar"
                    options={{
                      seriesBarDistance: 10,
                      axisX: {
                        showGrid: false,
                      },
                      height: "245px",
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
                  <i className="fas fa-circle text-info"></i>
                  Cows <i className="fas fa-circle text-danger"></i>
                  Sheeps
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
