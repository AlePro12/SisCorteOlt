// Tengo N cantidad de items y esos items tienen diferentes metodos de pago
//Debo de tener una lista de items para poder seleccionar los difentes metodo de pagos
import { useState, useEffect } from "react";
import getPortApi from "../api/GetPort_api";
function usePort(olt) {
  const [PortsData, setPort] = useState([]);
  const [LoadPort, setLoad] = useState(false);

  useEffect(() => {
    if (!LoadPort) {
      getPortApi.getPort(olt).then((res) => {
        setPort(res.data);
        setLoad(true);
      });
    }
  });

  return { PortsData, LoadPort };
}
export default usePort;
