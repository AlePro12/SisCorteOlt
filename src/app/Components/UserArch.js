import React from "react";
import BootstrapModal from "react-bootstrap/Modal";
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
import NiceModal, { useModal, bootstrapDialog } from "@ebay/nice-modal-react";
import useOlts from "../hook/getOlts";
import AlphaApi_Fetch from "../api/httpservice";
//react toastify
import { ToastContainer, toast } from "react-toastify";
const MyBootstrapDialog = NiceModal.create((Us) => {
  const modal = useModal();
  const { OltsData, Load } = useOlts();
  const [user, setUser] = React.useState(Us);
  const SaveUser = () => {
    toast.promise(
      AlphaApi_Fetch("/api/LoginAgent/usercrud", "POST", user, true),
      {
        error: "No se pudo crear el usuario",
        pending: "En proceso de creación",
        success: "Usuario creado con éxito",
      }
    );
    modal.hide();
  };

  return (
    <BootstrapModal {...bootstrapDialog(modal)} title="{Usuario}">
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>
          {user.name == "" ? "Crear Usuario" : "Editar Usuario"}
        </BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>
        <Form>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>
              <b>Nombre</b>
            </Form.Label>
            <Form.Control
              type="text"
              value={user.name}
              onChange={(e) => {
                setUser({ ...user, name: e.target.value });
              }}
            />
          </Form.Group>
          <Form.Group controlId="formBasicUser">
            <Form.Label>
              <b>Username</b>
            </Form.Label>
            <Form.Control
              type="text"
              value={user.Username}
              onChange={(e) => {
                setUser({ ...user, Username: e.target.value });
              }}
            />
          </Form.Group>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>
              <b>Password</b>
            </Form.Label>
            <Form.Control
              type="password"
              value={user.password}
              onChange={(e) => {
                setUser({ ...user, password: e.target.value });
              }}
            />
          </Form.Group>
          <Form.Group controlId="formBasicRole">
            <Form.Label>
              <b>Role</b>
            </Form.Label>
            <Form.Control
              as="select"
              value={user.role}
              onChange={(e) => {
                setUser({ ...user, role: e.target.value });
              }}
            >
              <option>Admin</option>
              <option>User</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formBasicPermit">
            <Form.Label>
              <b>Olts Permitidas</b>
            </Form.Label>
            <Form.Check
              type="checkbox"
              label={"Todas"}
              //add to olts array
              onChange={(e) => {
                setUser({ ...user, olts: [...user.olts, "All"] });
              }}
              checked={user.olts.includes("All")}
            />
            {OltsData.map((olt, index) => (
              <Form.Check
                type="checkbox"
                label={olt.Descrip}
                //add to olts array
                onChange={(e) => {
                  if (e.target.checked) {
                    setUser({ ...user, olts: [...user.olts, olt._id] });
                  } else {
                    setUser({
                      ...user,
                      olts: user.olts.filter((x) => x !== olt._id),
                    });
                  }
                }}
                checked={user.olts.includes(olt._id)}
              />
            ))}
          </Form.Group>
          <Form.Group controlId="formBasicPermit">
            <Form.Label>
              <b>Acciones Permitidas</b>
            </Form.Label>
            <Form.Check
              type="checkbox"
              label={"Activar"}
              //add to actions array
              onChange={(e) => {
                if (e.target.checked) {
                  setUser({ ...user, actions: [...user.actions, "Activar"] });
                } else {
                  setUser({
                    ...user,
                    actions: user.actions.filter((a) => a !== "Activar"),
                  });
                }
              }}
              checked={user.actions.includes("Activar")}
            />
            <Form.Check
              type="checkbox"
              label={"Desactivar"}
              //add to actions array
              checked={user.actions.includes("Desactivar")}
              onChange={(e) => {
                if (e.target.checked) {
                  setUser({
                    ...user,
                    actions: [...user.actions, "Desactivar"],
                  });
                } else {
                  setUser({
                    ...user,
                    actions: user.actions.filter((a) => a !== "Desactivar"),
                  });
                }
              }}
            />
            <Form.Check
              type="checkbox"
              label={"Cambiar Plan"}
              //add to actions array
              checked={user.actions.includes("CPlan")}
              onChange={(e) => {
                if (e.target.checked) {
                  setUser({ ...user, actions: [...user.actions, "CPlan"] });
                } else {
                  setUser({
                    ...user,
                    actions: user.actions.filter((a) => a !== "CPlan"),
                  });
                }
              }}
            />
            <Form.Check
              type="checkbox"
              label={"Resync"}
              //add to actions array
              checked={user.actions.includes("Resync")}
              onChange={(e) => {
                if (e.target.checked) {
                  setUser({
                    ...user,
                    actions: [...user.actions, "Resync"],
                  });
                } else {
                  setUser({
                    ...user,
                    actions: user.actions.filter((a) => a !== "Resync"),
                  });
                }
              }}
            />
            <Form.Check
              type="checkbox"
              label={"ResyncAll"}
              //add to actions array

              checked={user.actions.includes("ResyncAll")}
              onChange={(e) => {
                if (e.target.checked) {
                  setUser({
                    ...user,
                    actions: [...user.actions, "ResyncAll"],
                  });
                } else {
                  setUser({
                    ...user,
                    actions: user.actions.filter((a) => a !== "ResyncAll"),
                  });
                }
              }}
            />
            <Form.Check
              type="checkbox"
              label={"Activar o Desactivar Excel"}
              //add to actions array

              checked={user.actions.includes("Excel")}
              onChange={(e) => {
                if (e.target.checked) {
                  setUser({
                    ...user,
                    actions: [...user.actions, "Excel"],
                  });
                } else {
                  setUser({
                    ...user,
                    actions: user.actions.filter((a) => a !== "Excel"),
                  });
                }
              }}
            />
          </Form.Group>
        </Form>
      </BootstrapModal.Body>

      <BootstrapModal.Footer>
        <Button variant="secondary" onClick={modal.hide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={SaveUser}>
          Guardar
        </Button>
      </BootstrapModal.Footer>
    </BootstrapModal>
  );
});
export default MyBootstrapDialog;
