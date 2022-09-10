// Tengo N cantidad de items y esos items tienen diferentes metodos de pago
//Debo de tener una lista de items para poder seleccionar los difentes metodo de pagos
import { useState, useEffect } from "react";
import getTasksApi from "../api/GetTasks_api";
function useTasks() {
  const [TasksData, setTasks] = useState([]);
  const [Load, setLoad] = useState(false);

  useEffect(() => {
    if (!Load) {
      getTasksApi.getTasks().then((res) => {
        setTasks(res.data);
        setLoad(true);
      });
    }
  });
  useEffect(() => {
    const interval = setInterval(() => {
      getTasksApi.getTasks().then((res) => {
        setTasks(res.data);
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return { TasksData, Load };
}
export default useTasks;
