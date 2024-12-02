import React from "react";

// react-bootstrap components
import { Card, Table, Container, Row, Col } from "react-bootstrap";

function TableList() {
  return (
    <>
      <Container fluid>
        <Row>
          <Col md="12">
            <Card className="strpied-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Table data</Card.Title>
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
                      <th className="border-0">Birthdate</th>
                      <th className="border-0">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Goat</td>
                      <td>Alphine</td>
                      <td>06/07/2015</td>
                      <td>$950</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Goat</td>
                      <td>Faining</td>
                      <td>12/12/2020</td>
                      <td>$490</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>Cow</td>
                      <td>Brown Swiss</td>
                      <td>10/15/2019</td>
                      <td>$2400</td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td>Cow</td>
                      <td>Beefalo</td>
                      <td>10/02/2015</td>
                      <td>$4000</td>
                    </tr>
                    <tr>
                      <td>5</td>
                      <td>Cow</td>
                      <td>Red Angus</td>
                      <td>02/15/2017</td>
                      <td>$2300</td>
                    </tr>
                    <tr>
                      <td>6</td>
                      <td>Chicken</td>
                      <td>Sussex</td>
                      <td>03/18/2017</td>
                      <td>$400</td>
                    </tr>
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
