import React from "react";
import { Card, Container } from "react-bootstrap";
import ProgressBar from "react-bootstrap/ProgressBar";

export default function Loading(props) {
  return (
    <div>
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Card>
          <Card.Body>
            <h2>Cargando {props.title !== undefined ? props.title : ""}...</h2>
            <br />
            <ProgressBar animated now={100} />
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
