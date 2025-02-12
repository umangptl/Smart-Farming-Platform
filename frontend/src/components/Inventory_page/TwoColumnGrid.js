import { Container, Row, Col } from "react-bootstrap";

const TwoColumnGrid = ({data}) => {
  return (
    <Container className="border-top border-bottom">
      {data.reduce((rows, item, index) => {
        if (index % 2 === 0) {
          rows.push([item]); // Start a new row
        } else {
          rows[rows.length - 1].push(item); // Add to the last row
        }
        return rows;
      }, []).map((row, rowIndex, allRows) => (
        <Row key={rowIndex} className={rowIndex < allRows.length - 1 ? "border-bottom" : ""}>
          {row.map((item, colIndex) => (
            <Col key={colIndex} xs={6} className={`py-2 ${colIndex === 0 ? "border-right" : ""}`}>
              <div>{item.icon && <span className="me-2">{item.icon}</span>} {item.label}</div>
              <div>{item.value}</div>
            </Col>
          ))}
        </Row>
      ))}
    </Container>
  );
};

export default TwoColumnGrid;
