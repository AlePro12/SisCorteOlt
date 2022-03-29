import React, { Component } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
//import login comp
import Login from './components/Login';
import Home from './components/Home';
import Navb from './components/Navbar';
import CreateOlt from './components/CreateOlt';
import Olt from './Components/Olt';
//import react bootstrap components



render(
<Router>
  <div>
        <Navb/>
          <Switch>
            <Route exact path='/' component={Login} />
            <Route path="/Login" component={Login} />
            <Route path="/Home" component={Home} />
            <Route path="/CreateOlt" component={CreateOlt} />
            <Route path="/Olt/:Oltid"  render={(props) => (
    <Olt Oltid={props.match.params.Oltid}/>
)} />

          </Switch>
          <footer className="footer">
            <div className="container">
              <span className="text-muted">ColnetworkBackoffice. v1.0</span>
              </div>
          </footer>
          </div>
        </Router>, document.getElementById('app'));//ont deactivate 7 VSOL00BCABC9