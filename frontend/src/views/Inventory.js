import { Card, Container, Row, Col, ProgressBar } from "react-bootstrap";
import TwoColumnGrid from "components/Inventory_page/TwoColumnGrid";
import useLivestock from "hooks/useLivestock";
import { FaCalendarAlt, FaMoneyBillWave, FaVenusMars, FaBirthdayCake, FaHorse, } from "react-icons/fa";
import { FaCow } from "react-icons/fa6"
import { GiCow, GiBullHorns, GiSheep } from "react-icons/gi";
import { MdHealthAndSafety } from "react-icons/md";

function TableList() {
  const {livestock, loading, error} = useLivestock([]);
  
  // Function to calculate age based on Date of Birth
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't happened yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

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
                    { icon: <FaMoneyBillWave />, label: "Purchase Price", value: `$${animal.purchase_price}` },
                    { icon: <FaCalendarAlt />, label: "Purchase Date", value: new Date(animal.purchase_date).toDateString() },
                    { icon: <FaBirthdayCake />, label: "Age", value: `${animal.age} Days` },
                    { icon: <FaVenusMars />, label: "Gender", value: animal.gender },
                    { icon: <GiBullHorns />, label: "Breed", value: animal.breed },
                    { icon: <FaCow />, label: "Breeding Status", value: animal.breeding_status }
                  ]}
                />
                <div className="mt-3 px-3">
                  <MdHealthAndSafety /> <strong>Health Status:</strong>
                  <ProgressBar now={animal.health_status === 'Healthy' ? 100 : animal.health_status === 'Improving' ? 75 : animal.health_status === 'Poor' ? 50 : 25} variant={animal.health_status === 'Healthy' ? 'success' : animal.health_status === 'Improving' ? 'warning' : 'danger'} />
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
