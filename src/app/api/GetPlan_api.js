import AlphaApi_Fetch from "./httpservice";
const getPlanApi = {
  getPlans(olt) {
    return AlphaApi_Fetch("/api/onu/Plans/"+olt, "GET", {}, "");
  },
};
export default getPlanApi;
