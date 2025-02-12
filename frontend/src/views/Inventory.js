import { FaCheckCircle } from "react-icons/fa";
import { MdSick } from "react-icons/md";

// react-bootstrap components
import { Card, Table, Container, Row, Col } from "react-bootstrap";
import useLivestock from "hooks/useLivestock";

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

  return (
    <>
      <Container fluid>
        <Row>
          <Col md="12">
            <Card className="strpied-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Livestock Inventory</Card.Title>
                <p className="card-category">
                  Here is a subtitle for this table
                </p>
              </Card.Header>
              <Card.Body className="table-full-width table-responsive px-0">
                <Table className="table-hover table-striped">
                  <thead>
                    <tr>
                      <th className="border-0">ID</th>
                      <th className="border-0">Animal</th>
                      <th className="border-0">Breed</th>
                      <th className="border-0">Age</th>
                      <th className="border-0">Weight</th>
                      <th className="border-0">Health Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livestock.map((animal) => (
                      <tr key={animal.livestockID}>
                        <td>{animal.livestockID}</td>
                        <td>{animal.type}</td>
                        <td>{animal.breed}</td>
                        <td>{calculateAge(animal.dob)} years</td>
                        <td>{animal.weight}</td>
                        <td>{animal.health_status ? <FaCheckCircle/> : <MdSick/> }</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default TableList;
