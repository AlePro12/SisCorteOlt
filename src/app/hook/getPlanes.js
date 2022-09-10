// Tengo N cantidad de items y esos items tienen diferentes metodos de pago
//Debo de tener una lista de items para poder seleccionar los difentes metodo de pagos
import { useState, useEffect } from "react";
import getPlanApi from "../api/GetPlan_api";
function usePlan(olt) {
  const [PlansData, setOnu] = useState([]);
  const [Load, setLoad] = useState(false);

  useEffect(() => {
    if (!Load) {
      getPlanApi.getPlans(olt).then((res) => {
        setOnu(res.data);
        setLoad(true);
      });
    }
  });

  return { PlansData, Load };
}
export default usePlan;
