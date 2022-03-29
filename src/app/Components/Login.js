import React, { Component } from "react";
import {  Nav, NavItem, NavDropdown, MenuItem, Form, FormControl, Button,Container, Card,Row,Col } from 'react-bootstrap';
//import navbar.js
import Navb from './Navbar'; 
//import axios
import axios from 'axios';
//import jwt_decode
import jwt_decode from 'jwt-decode';

export default class Login extends Component {
   
    render() {
        //handleSubmit 
        const handleSubmit = (e) => {
            const data = new FormData(event.currentTarget);
            // eslint-disable-next-line no-console
            console.log({
              Usuario: data.get('Usuario'),
              password: data.get('Pass'),
            });  
            e.preventDefault();
            console.log(this.state);
            //login with axios
            axios.post('/api/LoginAgent/', {
                Username: data.get('Usuario'),
                password: data.get('Pass'),
            })
            .then(res => {
                console.log(res.data);
                //save token in local storage
                localStorage.setItem('usertoken', res.data.token);
                //decode token
                const decoded = jwt_decode(res.data.token);
                console.log(decoded);
                //redirect to home
                this.props.history.push('/Home');
            }
            )
            .catch(err => {
                console.log(err);
                alert('Usuario o contraseña incorrectos');
            }
            );





        }
        const styles = {
            body: {
                Background: '#1C8EF9 !important',
                minHeight: '100vh',
                Display: 'flex',
                FontWeight: '400'
            }
          };
        return (
            <div style={styles.body}>
                <Container>
                    <Card>
                <Row>
    <Col xs={{ order: 12 }}>
                        <Card.Header>
                            <h1>Login</h1>
                        </Card.Header>
                        <Card.Body>
                            <form onSubmit={handleSubmit}>
                <h3>Entrar al Sistema De Cortes</h3>

                <div className="form-group">
                    <label>Usuario</label>
                    <input type="text" id="Usuario" name="Usuario" className="form-control" placeholder="Usuario" />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input type="password" id="Pass" name="Pass" className="form-control" placeholder="Clave" />
                </div>
                <br></br>
        
                <button type="submit" className="btn btn-primary btn-block">Entrar</button>
                <p className="forgot-password text-right">
                </p>
            </form>
            
                        </Card.Body>
  
        </Col>
      <Col xs={{ order: 1 }}>
            <img src="Login.jpg" alt="background" className="img-fluid" />


      </Col>  
  </Row>
          </Card>
            </Container>
            </div>
        );
    }
}