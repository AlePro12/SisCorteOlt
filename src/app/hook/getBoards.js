import { useState, useEffect } from "react";
import getBoardsApi from "../api/GetBoards_api";
function useBoards(olt) {
  const [BoardsData, setBoards] = useState([]);
  const [Load, setLoad] = useState(false);

  useEffect(() => {
    if (!Load) {
      getBoardsApi.getBoards(olt).then((res) => {
        setBoards(res.data);
        setLoad(true);
      });
    }
  });

  return { BoardsData, Load };
}
export default useBoards;
