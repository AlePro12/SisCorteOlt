import AlphaApi_Fetch from "./httpservice";
const getUserApi = {
  getUsers() {
    return AlphaApi_Fetch("/api/LoginAgent/all/", "GET", {}, "");
  },
};
export default getUserApi;
