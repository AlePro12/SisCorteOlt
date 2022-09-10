import { useState, useEffect } from "react";
import getUserApi from "../api/GetUser_api";
function useUser() {
  const [UsersData, setOnu] = useState([]);
  const [Load, setLoad] = useState(false);

  useEffect(() => {
    if (!Load) {
      getUserApi.getUsers().then((res) => {
        setOnu(res.data);
        setLoad(true);
      });
    }
  });

  return { UsersData, Load };
}
export default useUser;
