import { useState, useEffect } from "react";
import getOltApi from "../api/GetOlts_api";
function useOlts() {
  const [OltsData, setOnu] = useState([]);
  const [Load, setLoad] = useState(false);

  useEffect(() => {
    if (!Load) {
      getOltApi.getOlt().then((res) => {
        setOnu(res.data);
        setLoad(true);
      });
    }
  });

  return { OltsData, Load };
}
export default useOlts;
