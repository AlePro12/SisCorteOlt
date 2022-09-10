import React, { Component } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
//import login comp
import Login from "./components/Login";
import Home from "./components/Home";
import Navb from "./components/Navbar";
import CreateOlt from "./components/CreateOlt";
import CreateUser from "./components/CreateUser";
//import Usuarios from "./components/Usuarios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Olt from "./Components/Olt";
import Onu from "./Components/Onu";
import Tasks from "./Components/Tasks";

import NiceModal from "@ebay/nice-modal-react";

//import react bootstrap components

render(
  <Router>
    <div>
      <NiceModal.Provider>
        <Navb />
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/Login" component={Login} />
          <Route
            path="/Logout"
            component={() => {
              sessionStorage.removeItem("usertoken");
              sessionStorage.removeItem("username");
              sessionStorage.removeItem("user");
              window.location.href = "/";
              return <Login />;
            }}
          />

          <Route path="/Home" component={Home} />
          <Route path="/Tasks" component={Tasks} />

          <Route path="/CreateOlt" component={CreateOlt} />
          <Route path="/CreateUser" component={CreateUser} />

          <Route
            path="/Olt/:Oltid"
            render={(props) => (
              <Olt Oltid={props.match.params.Oltid} history={props.history} />
            )}
          />
          <Route
            path="/Onu/:Onuid"
            render={(props) => <Onu Onuid={props.match.params.Onuid} />}
          />
        </Switch>
        <footer className="footer">
          <div className="container">
            <span className="text-muted">ColnetworkBackoffice. v1.0.2</span>
          </div>
        </footer>
        <ToastContainer />
      </NiceModal.Provider>
    </div>
  </Router>,
  document.getElementById("app")
); //ont deactivate 7 VSOL00BCABC9
