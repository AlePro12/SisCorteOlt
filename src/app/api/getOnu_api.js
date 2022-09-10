import AlphaApi_Fetch from "./httpservice";
const getOnuApi = {
  getOnuByPON(PON) {
    return AlphaApi_Fetch("/api/onu/getOnu/" + PON, "GET", {}, "");
  },
  getAllOnu() {
    return AlphaApi_Fetch("api/onu/getAllOnus/", "GET", {}, "");
  },
};
export default getOnuApi;
