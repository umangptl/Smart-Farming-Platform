import { Card, Container, Row, Col, ProgressBar } from "react-bootstrap";
import TwoColumnGrid from "components/Inventory_page/TwoColumnGrid";
import useLivestock from "hooks/useLivestock";
import { FaCalendarAlt, FaMoneyBillWave, FaVenusMars, FaBirthdayCake, FaHorse, } from "react-icons/fa";
import { FaCow } from "react-icons/fa6"
import { GiBullHorns, GiSheep } from "react-icons/gi";
import { MdHealthAndSafety } from "react-icons/md";

function TableList() {
  const {livestock, loading, error} = useLivestock([]);
  
  // Function to calculate age based on Date of Birth
  const calculateAgeString = (birth_date) => {
    const dob = new Date(birth_date)
    const now = new Date();
    const days = Math.floor((now - dob) / (1000 * 60 * 60 * 24))
    
    if (days < 7) {
      return `${days} day${days !== 1 ? 's' : 's'}`
    }

    const weeks = Math.floor(days / 7);
    if (days < 365) {
      return `${weeks} week${weeks !== 1 ? 's' : ''}`
    }

    const years = days / 365.25;
    return `${years.toFixed(1)} year${years !== 1 ? 's' : ''}`

  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

  const livestockIconMap = {
    "cattle": <FaCow size={24}/>,
    "horse": <FaHorse size={24}/>,
    "sheep": <GiSheep size={24}/>
  }

  return (
    <Container fluid>
      <Row>
        {livestock.map((animal) => (
          <Col key={animal.livestockID} md={4} sm={6} className="mb-2">
            <Card className="shadow-sm">
              <Card.Body className="px-0">
                <div className="d-flex justify-content-between align-items-center mb-3 px-3">
                  <div className="d-flex align-items-center">
                    <div size={24} className="mr-2 text-success">{livestockIconMap[animal.type]}</div>
                    <h5 className="mb-0">{animal.type.toUpperCase()}</h5>
                  </div>
                  <h5 className="mb-0">{animal.livestockID}</h5>
                </div>
                <TwoColumnGrid
                  data={[
                    { icon: <FaCalendarAlt />, label: "Purchase Date", value: formatDate(animal.purchase_date) },
                    { icon: <FaMoneyBillWave />, label: "Purchase Price", value: `$${animal.purchase_price}` },
                    { icon: <FaBirthdayCake />, label: "Age", value: calculateAgeString(animal.dob) },
                    { icon: <FaVenusMars />, label: "Gender", value: animal.gender },
                    { icon: <GiBullHorns />, label: "Breed", value: animal.breed },
                    { icon: <FaCow />, label: "Breeding Status", value: animal.breeding_status }
                  ]}
                />
                <div className="mt-3 px-3">
                  <MdHealthAndSafety /> <strong>Health Status:</strong>
                  <ProgressBar now={animal.health_status === 'healthy' ? 100 : animal.health_status === 'improving' ? 60 : animal.health_status === 'poor' ? 30 : 10} variant={animal.health_status === 'healthy' ? 'success' : animal.health_status === 'improving' ? 'warning' : 'danger'} />
                  <div className="d-flex justify-content-between">
                    <span>Bad</span>
                    <span>Poor</span>
                    <span>Improving</span>
                    <span>Healthy</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default TableList;
