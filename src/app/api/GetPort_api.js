import AlphaApi_Fetch from "./httpservice";
const getPortApi = {
  getPort(olt) {
    return AlphaApi_Fetch("/api/onu/Ports/" + olt, "GET", {}, "");
  },
};
export default getPortApi;
