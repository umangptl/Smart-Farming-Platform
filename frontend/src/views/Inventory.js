import { useState } from "react";
import { Card, Container, Row, Col, ProgressBar, Alert, Button, Modal, Form } from "react-bootstrap";
import TwoColumnGrid from "components/Inventory_page/TwoColumnGrid";
import useLivestock from "hooks/useLivestock";
import { FaCalendarAlt, FaMoneyBillWave, FaVenusMars, FaBirthdayCake, FaHorse, FaPlus } from "react-icons/fa";
import { FaCow } from "react-icons/fa6"
import { GiBullHorns, GiSheep } from "react-icons/gi";
import { MdHealthAndSafety } from "react-icons/md";

import SelectFilter from "components/Inventory_page/SelectFilter";
import { animalTypeOptions, breedingStatusOptions, genderOptions, healthStatusOptions } from "constants";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { createLivestock } from "api/livestockApi";

function TableList() {
  // Hook to fetch livestock
  const {livestock, setLivestock, loading, error} = useLivestock([]);

  // Filter States
  const [typeFilter, setTypeFilter] = useState("");
  const [breedingStatusFilter, setBreedingStatusFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [breedFilter, setBreedFilter] = useState("");

  // State to control modal visibility
  const [showModal, setShowModal] = useState(false);

  const defaultCattle = {
    type: "cattle",
    breed: "",
    purchase_date: "",
    purchase_price: "",
    dob: "",
    gender: "male",
    breeding_status: "open",
    health_status: "healthy",
  }

  // Form state for new cattle
  const [newCattle, setNewCattle] = useState(defaultCattle);

  // Handle form input changes
  const handleInputChange = (e) => {
    setNewCattle({ ...newCattle, [e.target.name]: e.target.value });
  };

  // Handle adding new cattle
  const handleAddCattle = () => {
    const newEntry = { ...newCattle, livestockID: livestock.length + 1 };
    setLivestock([...livestock, newEntry]); // Update state with new livestock
    setShowModal(false); // Close modal
    // createLivestock(newCattle);
    setNewCattle(defaultCattle); // Reset form
  };

  // Get Unique Breeds Dynamically
  const breedOptions = [...new Set(livestock.map((animal) => animal.breed))];

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

    const months = days / 365.25 * 12;
    if (months < 36) {
      return `${months.toFixed(1)} month${months !== 1 ? 's' : ''}`
    }

    const years = days / 365.25;
    return `${years.toFixed(1)} year${years !== 1 ? 's' : ''}`
  };



  // 🏷️ Apply Filters
  const filteredLivestock = livestock.filter((animal) => {
    const dob = new Date(animal.dob)
    const now = new Date();
    const age = Math.floor((now - dob) / (1000 * 60 * 60 * 24 * 365.25) )
  
    return (
      (typeFilter ? animal.type === typeFilter : true) &&
      (breedingStatusFilter ? animal.breeding_status === breedingStatusFilter : true) &&
      (ageFilter
        ? ageFilter === "<1 years" ? age < 1
        : ageFilter === "1-3 years" ? age >= 1 && age <= 3
        : ageFilter === "3+ years" ? age > 3
        : true
        : true) &&
      (breedFilter ? animal.breed === breedFilter : true)
    );
  });
  
  

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const livestockIconMap = {
    "cattle": <FaCow size={24}/>,
    "horse": <FaHorse size={24}/>,
    "sheep": <GiSheep size={24}/>
  }

  return (
    <Container fluid>
      {/* Error Message */}
      {error && (
        <Alert variant="danger" className="mt-3">
          Failed to load livestock data. Please try again later.
        </Alert>
      )}

      {/* Filters */}
      <Row className="mb-3">
        <Col md={8}>
          <Row>
            <Col><SelectFilter label="Type" value={typeFilter} options={animalTypeOptions} onSelect={setTypeFilter} /></Col>
            <Col><SelectFilter label="Breeding Status" value={breedingStatusFilter} options={breedingStatusOptions} onSelect={setBreedingStatusFilter} /></Col>
            <Col><SelectFilter label="Age" value={ageFilter} options={["<1 years", "1-3 years", "3+ years"]} onSelect={setAgeFilter} /></Col>
            <Col><SelectFilter label="Breed" value={breedFilter} options={breedOptions} onSelect={setBreedFilter} /></Col>
          </Row>
        </Col>
        <Col md={3}>
          <Row className=" px-5 d-flex justify-content-around">
            <Button 
              variant="secondary" 
              onClick={() => { setTypeFilter(""); setBreedingStatusFilter(""); setAgeFilter(""); setBreedFilter(""); }}
            >
              Reset
            </Button>
          </Row>
        </Col>
        <Col md={1} className="d-flex justify-content-end">
          <Button 
            variant="primary" 
            className="d-flex align-items-center justify-content-center rounded-circle" 
            style={{ width: "40px", height: "40px", padding: "0" }}
            onClick={() => setShowModal(true)}
          >
            <FaPlus size={20} />
          </Button>
        </Col>
      </Row>

      {/* Display Filtered Livestock */}
      <Row>
        {/* Skeleton Loader while loading */}
        {loading
          ? [...Array(6)].map((_, index) => (
              <Col key={index} md={4} sm={6} className="mb-2">
                <Card className="shadow-sm">
                  <Card.Body className="px-0">
                    <div className="px-3">
                      <Skeleton height={20} width={150} />
                      <Skeleton height={15} width={100} />
                    </div>
                    <TwoColumnGrid
                      data={[
                        { icon: <FaCalendarAlt />, label: "Purchase Date", value: <Skeleton width={100} /> },
                        { icon: <FaMoneyBillWave />, label: "Purchase Price", value: <Skeleton width={80} /> },
                        { icon: <FaBirthdayCake />, label: "Age", value: <Skeleton width={50} /> },
                        { icon: <FaVenusMars />, label: "Gender", value: <Skeleton width={60} /> },
                        { icon: <GiBullHorns />, label: "Breed", value: <Skeleton width={80} /> },
                        { icon: <FaCow />, label: "Breeding Status", value: <Skeleton width={120} /> },
                      ]}
                    />
                    <div className="mt-3 px-3">
                      <MdHealthAndSafety /> <strong>Health Status:</strong>
                      <Skeleton height={10} width={"100%"} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          : filteredLivestock.map((animal) => (
              <Col key={animal.livestockID} md={4} sm={6} className="mb-2">
                <Card className="shadow-sm">
                  <Card.Body className="px-0">
                    <div className="d-flex justify-content-between align-items-center mb-3 px-3">
                      <div className="d-flex align-items-center">
                        <div size={24} className="mr-2 text-success">
                          {livestockIconMap[animal.type]}
                        </div>
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
                        { icon: <FaCow />, label: "Breeding Status", value: animal.breeding_status },
                      ]}
                    />
                    <div className="mt-3 px-3">
                      <MdHealthAndSafety /> <strong>Health Status:</strong>
                      <ProgressBar
                        now={
                          animal.health_status === "healthy"
                            ? 100
                            : animal.health_status === "improving"
                            ? 60
                            : animal.health_status === "poor"
                            ? 30
                            : 10
                        }
                        variant={
                          animal.health_status === "healthy"
                            ? "success"
                            : animal.health_status === "improving"
                            ? "warning"
                            : "danger"
                        }
                      />
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
      
      {/* Display Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Cattle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Type</Form.Label>
              <Form.Control as="select" name="type" value={newCattle.type} onChange={handleInputChange}>
                {animalTypeOptions.map((type) => (
                  <option value={type}>{type}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Breed</Form.Label>
              <Form.Control type="text" name="breed" value={newCattle.breed} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Purchase Date</Form.Label>
              <Form.Control type="date" name="purchase_date" value={newCattle.purchase_date} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Purchase Price ($)</Form.Label>
              <Form.Control type="number" name="purchase_price" value={newCattle.purchase_price} 
                onChange={(e) => {
                  console(newCattle)
                  setNewCattle({ ...newCattle, purchase_price: Number(e.target.value) })
                  console(newCattle)
                }}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control type="date" name="dob" value={newCattle.dob} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Gender</Form.Label>
              <Form.Control as="select" name="gender" value={newCattle.gender} onChange={handleInputChange}>
              {genderOptions.map((gender) => (
                  <option value={gender}>{gender}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Breeding Status</Form.Label>
              <Form.Control as="select" name="breeding_status" value={newCattle.breeding_status} onChange={handleInputChange}>
              {breedingStatusOptions.map((type) => (
                  <option value={type}>{type}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Health Status</Form.Label>
              <Form.Control as="select" name="health_status" value={newCattle.health_status} onChange={handleInputChange}>
              {healthStatusOptions.map((healthStatus) => (
                  <option value={healthStatus}>{healthStatus}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddCattle}>Add Livestock</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TableList;
