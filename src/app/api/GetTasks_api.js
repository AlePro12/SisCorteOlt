import AlphaApi_Fetch from "./httpservice";
const getPortApi = {
  getTasks() {
    return AlphaApi_Fetch("/api/task/tasks", "GET", {}, "");
  },
};
export default getPortApi;
