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
import useUser from "../hook/getUsers";
import UserArch from "./UserArch";
import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import useMgr from "../hook/useMgr";
export default function CreateUser() {
  const { UsersData, Load } = useUser();
  const { User, Loading, loadUs } = useMgr();

  if (User.role !== "admin") {
    return <h1>No tienes permisos para acceder a esta página</h1>;
  }

  return (
    <div>
      <Container>
        <Row>
          <Col>
            <Card>
              <Card.Header>Usuarios</Card.Header>
              <Card.Body>
                <Button
                  variant="primary"
                  onClick={() => {
                    NiceModal.show(UserArch, {
                      Username: "",
                      actions: [],
                      date: "",
                      name: "",
                      olts: [],
                      role: "User",
                    });
                  }}
                  style={{ float: "right" }}
                >
                  <i className="fa fa-plus" />
                  Crear Usuario
                </Button>
                <br />
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>User</th>
                      <th>Role</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {UsersData.map((user, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.Username}</td>
                        <td>{user.role}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            onClick={() => {
                              NiceModal.show(UserArch, user);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button variant="outline-danger">
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
