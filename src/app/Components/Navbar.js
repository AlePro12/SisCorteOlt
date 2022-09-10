import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Image from "react-bootstrap/Image";
import Container from "react-bootstrap/Container";
import { useLocalStorage } from "../hook/uselocalStorage";
export default function Navb() {
  return (
    <>
      <Navbar style={{ backgroundColor: "#062346" }} variant="dark">
        <Container>
          <Navbar.Brand href="#home">
            <img
              alt=""
              src="/log.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{" "}
            Colnetwork BackOffice
          </Navbar.Brand>
          {sessionStorage.getItem("usertoken") !== null ? (
            <>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                  <Nav.Link href="/Home">Inicio</Nav.Link>
                  <Nav.Link href="/CreateUser">Usuarios</Nav.Link>
                  <Nav.Link href="/Tasks">Tareas</Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </>
          ) : (
            <></>
          )}
          {sessionStorage.getItem("usertoken") !== null ? (
            <>
              <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                  <Nav.Link href="/">
                    <Image
                      src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      width="30"
                      height="30"
                      className="d-inline-block align-top"
                    />{" "}
                    {sessionStorage.getItem("username")}
                  </Nav.Link>
                </Navbar.Text>
                <Navbar.Text>
                  <Nav.Link href="/logout">
                    <Image
                      src="https://cdn.pixabay.com/photo/2012/04/12/20/12/x-30465_1280.png"
                      width="30"
                      height="30"
                      className="d-inline-block align-top"
                    />{" "}
                    Cerrar sesion
                  </Nav.Link>
                </Navbar.Text>
              </Navbar.Collapse>
            </>
          ) : (
            <>
              <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                  <Nav.Link href="/">
                    <Image
                      src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      width="30"
                      height="30"
                      className="d-inline-block align-top"
                    />{" "}
                    {sessionStorage.getItem("username")}
                  </Nav.Link>
                </Navbar.Text>
                <Navbar.Text>
                  <Nav.Link href="/">
                    <Image
                      src="https://img2.freepng.es/20180427/yse/kisspng-computer-icons-acceso-5ae2f2259df082.3284883215248225656469.jpg"
                      width="30"
                      height="30"
                      className="d-inline-block align-top"
                    />{" "}
                    Entrar
                  </Nav.Link>
                </Navbar.Text>
              </Navbar.Collapse>
            </>
          )}
        </Container>
      </Navbar>
    </>
  );
}
