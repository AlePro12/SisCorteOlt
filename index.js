const fetch = require('node-fetch');
const Headers = require('node-fetch');


var APIKEY = "72994b750fa3f7b8bf21826e17dc0616"

const meta = {
    'X-Token': APIKEY
};
var myHeaders = new Headers(meta);
//myHeaders.append("X-Token", APIKEY);

var requestOptions = {
    method: 'GET',
    headers: myHeaders
};


console.log("AQUI EMPIEZA EL FETCH")

fetch("https://colnetwork.smartolt.com/api/system/get_onu_types", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));