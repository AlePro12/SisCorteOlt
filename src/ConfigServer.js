const fs = require('fs');
const path = require('path');


var rawdata = fs.readFileSync(path.join(__dirname, 'API.json'));
var APIKEY = JSON.parse(rawdata).APIKEY;
var Subdomain = JSON.parse(rawdata).Subdomain

module.exports = {
    APIKEY,
    Subdomain
}