import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

export default function Router() {
  return (
    <Router>
      <Switch>
        <Route path="/about">
          <About />
        </Route>{" "}
        <Route path="/Olt">
          <Users />
        </Route>{" "}
        <Route path="/">
          <Home />
        </Route>
        
      </Switch>{" "}Usuarios
    </Router>
  );
}
