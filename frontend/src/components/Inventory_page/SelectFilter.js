import { Form } from "react-bootstrap";

const SelectFilter = ({ label, value, options, onSelect }) => {
  return (
    <Form.Group className="d-flex flex-column">
      <Form.Label className="mb-0">{label}</Form.Label>
      <Form.Select value={value} onChange={(e) => onSelect(e.target.value)}>
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export default SelectFilter;
