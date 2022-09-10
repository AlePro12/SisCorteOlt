import AlphaApi_Fetch from "./httpservice";
const getOltApi = {
  getOlt() {
    return AlphaApi_Fetch("/api/Olt/", "GET", {}, "");
  },
  getAllOnu() {
    return AlphaApi_Fetch("api/onu/getAllOnus/", "GET", {}, "");
  },
};
export default getOltApi;
