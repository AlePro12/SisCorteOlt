import axios from "axios";
//get lic
const urlbase = "";
//auth-token
const AlphaApi_Fetch = (url, method, data, emp = false, authtoken = true) => {
  var Headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  if (authtoken) {
    Headers["auth-token"] = sessionStorage.getItem("usertoken");
  }
  return axios({
    method: method,
    url: urlbase + url,
    data: data,
    headers: Headers,
  });
};
export default AlphaApi_Fetch;
