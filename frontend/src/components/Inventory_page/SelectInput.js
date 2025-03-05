import { Form } from "react-bootstrap";



const SelectInput = ({ label, name, value, options, onChange, ...props }) => {
  // Determine if options contain objects or just strings
  const isObjectOptions = options.some(option => typeof option === "object");

  return (
    <Form.Group {...props}>
      <Form.Label>{label}</Form.Label>
      <Form.Control as="select" name={name} value={value} onChange={(e) => onChange(e)}>
        {options.map((option, index) => {
          if (isObjectOptions) {
            // Object format: { text: "Display Text", value: "ActualValue" }
            const optionValue = option.value ?? option.text; // Default to text if value is missing
            const optionText = option.text;
            return (
              <option key={index} value={optionValue}>
                {optionText}
              </option>
            );
          } else {
            // String format: "OptionValue"
            return (
              <option key={index} value={option}>
                {option}
              </option>
            );
          }
        })}
      </Form.Control>
    </Form.Group>
  );
};


export default SelectInput;