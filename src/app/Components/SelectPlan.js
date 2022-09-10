import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import AlphaApi_Fetch from "../api/httpservice";
export default function SelectPlan(props) {
  const [PlanSel, setPlanSel] = React.useState(props.planDownSelect);
  if (props.ExistAcciones("CPlan")) {
    return (
      <Form.Group controlId="formBasicEmail">
        <Form.Label>Plan {props.planDownSelect}</Form.Label>
        <Form.Select
          aria-label="Default select example"
          onChange={(e) => {
            setPlanSel(e.target.value);
          }}
        >
          {props.planes.map((plan, index) => {
            if (plan.direction === "download") {
              return (
                <option key={plan.index}
                  selected={plan.name === props.planDownSelect}
                  value={plan.name}>
                  {plan.name}
                </option>
              );
            }
          })}
        </Form.Select>
        <Button
          variant="primary"
          onClick={() => {
            props.setPlanSelect(PlanSel, props.PON);
          }}
        >
          Guardar
        </Button>
      </Form.Group>
    );
  } else {
    return null;
  }
}
