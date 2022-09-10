import AlphaApi_Fetch from "./httpservice";
const getBoardsApi = {
  getBoards(olt) {
    return AlphaApi_Fetch("/api/onu/Boards/" + olt, "GET", {}, "");
  },
};
export default getBoardsApi;
