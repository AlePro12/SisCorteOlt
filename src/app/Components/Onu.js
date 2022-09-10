import React from "react";
import {
  Nav,
  NavItem,
  NavDropdown,
  MenuItem,
  FormControl,
  Button,
  Container,
  Card,
  Col,
  Row,
  Table,
  Form,
} from "react-bootstrap";
import {
  DatatableWrapper,
  Filter,
  Pagination,
  PaginationOptions,
  TableBody,
  TableHeader,
} from "react-bs-datatable";
import useOnu from "../hook/getOnu";
export default function Onu(props) {
  const { Onuid } = props;
  var Rand = Math.random();
  const { OnuData, Load } = useOnu(Onuid);
  if (!Load) {
    return <div>Cargando...</div>;
  }
  return (
    <div>
      <Container>
        <Row>
          <Col>
            <Card>
              <Card.Header>Verificar Onu: {Onuid}</Card.Header>
              <Card.Body>
                <h2>{OnuData.OltInfo.name}</h2>
                <img
                  src={
                    "/api/onu/getTraffic/" +
                    Onuid +
                    "/" +
                    OnuData.Olt_id +
                    "?" +
                    Rand
                  }
                  alt="onu"
                />
                <Card.Text>
                  <Row>
                    <Col>
                      <h5>
                        <b>Puerto:</b> {OnuData.OltInfo.port}
                      </h5>
                    </Col>
                    <Col>
                      <h5>
                        <b>Zona:</b> {OnuData.OltInfo.zone_name}
                      </h5>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <h5>
                        <b>Dirección:</b> {OnuData.OltInfo.address}
                      </h5>
                    </Col>
                    <Col>
                      <h5>
                        <b>Plan:</b>{" "}
                        <label>
                          Down:{OnuData.OltInfo.service_ports[0].download_speed}
                        </label>{" "}
                        <label>
                          Up:{OnuData.OltInfo.service_ports[0].upload_speed}
                        </label>
                      </h5>
                    </Col>
                  </Row>
                </Card.Text>
                <Form></Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
