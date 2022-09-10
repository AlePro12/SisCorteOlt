import { useState, useEffect } from "react";
import getUserApi from "../api/GetUser_api";
function useMgr() {
  const [User, setUser] = useState({
    olts: [],
  });
  const [Loading, setLoad] = useState(false);

  useEffect(() => {
    if (!Loading) {
      var user = sessionStorage.getItem("user");
      console.log("🚀 ~ file: useMgr.js ~ line 10 ~ useEffect ~ user", user);
      if (user != null) {
        setUser(JSON.parse(user));
        setLoad(true);
      } else {
        window.location.href = "/";
      }
    }
  });
  const ExistOltid = (oltid) => {
    var exist = false;
    if (Loading) {
      User.olts.forEach((olt) => {
        if (olt.id == oltid) {
          exist = true;
        }
      });
    }
    return exist;
  };
  const ExistAcciones = (accion) => {
    return User.actions.includes(accion);
  };

  return { User, Loading, ExistOltid, ExistAcciones };
}
export default useMgr;
