// Tengo N cantidad de items y esos items tienen diferentes metodos de pago
//Debo de tener una lista de items para poder seleccionar los difentes metodo de pagos
import { useState, useEffect } from "react";
import getOnuApi from "../api/GetOnu_api";
function useOnu(PON) {
  const [OnuData, setOnu] = useState([]);
  const [Load, setLoad] = useState(false);

  useEffect(() => {
    if (!Load) {
      getOnuApi.getOnuByPON(PON).then((res) => {
        setOnu(res.data[0]);
        setLoad(true);
      });
    }
  });

  return { OnuData, Load };
}
export default useOnu;
