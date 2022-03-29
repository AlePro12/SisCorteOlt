import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
export default function Navb() {
  return (
    <>
    <Navbar style={{backgroundColor:'#062346'}} variant="dark">
      <Container>
        <Navbar.Brand href="#home">
          <img
            alt=""
            src="/log.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{' '}
        Colnetwork BackOffice
        </Navbar.Brand>
      </Container>
    </Navbar>
  </>
  )
}


