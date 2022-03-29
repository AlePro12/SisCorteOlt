import React from 'react'
import {  Nav, NavItem, NavDropdown, MenuItem, FormControl, Button,Container, Card,Row,Col,Form } from 'react-bootstrap';

            //TODO: CreateOlt

export default function CreateOlt() {
    return (
        <div>
            <Container>
                <Row>
                    <Col>  
                        <Card>
                            <Card.Header>Create Olt</Card.Header>
                            <Card.Body>
                                <Form>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label>Olt Descrip</Form.Label>
                                        <Form.Control type="text" placeholder="Olt Descrip" />
                                    </Form.Group>
                                    <Form.Group controlId="formBasicNumber">
                                        <Form.Label>Olt Latitud</Form.Label>
                                        <Form.Control type="number" placeholder="Latitude" />
                                    </Form.Group>
                                    <Form.Group controlId="formBasicNumber">
                                        <Form.Label>Olt Logitud</Form.Label>
                                        <Form.Control type="number" placeholder="Logitud" />
                                    </Form.Group>
                                    <Form.Group controlId="formBasicPassword">
                                        <Form.Label>Olt Location</Form.Label>
                                        <Form.Control type="password" placeholder="Enter Olt Location" />
                                    </Form.Group>
                                    <Form.Group controlId="formBasicNumber">
                                        <Form.Label>{"Olt->Ubicacion->Estado"}</Form.Label>
                                        <Form.Control as="select">
                                            <option>zulia</option>
                                            <option>vargas</option>
                                            <option>bolivar</option>
                                            <option>carabobo</option>
                                            <option>tachira</option>
                                            <option>sucre</option>
                                            <option>portuguesa</option>
                                            <option>aragua</option>
                                            <option>lara</option>
                                            <option>merida</option>
                                            <option>monagas</option>
                                            <option>guarico</option>
                                            <option>falcon</option>
                                            <option>trujillo</option>
                                            <option>bolivar</option>
                                            <option>vargas</option>

                                        </Form.Control>
                                    </Form.Group>
                                    <Form.Group controlId="formBasicNumber">
                                        <Form.Label>{"Olt->Ubicacion->Ciudad"}</Form.Label>
                                        <Form.Control type="text" >
                                        </Form.Control>
                                    </Form.Group>
                                    <Form.Group controlId="formBasicPassword">
                                        <Form.Label>Olt Description</Form.Label>
                                        <Form.Control type="password" placeholder="Enter Olt Description" />
                                    </Form.Group>
                                    <Button variant="primary" type="submit">
                                        Submit
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

        </div>
    )
}
