const fs = require('fs');
const path = require('path');
let rawdata = fs.readFileSync(path.join(__dirname, 'server.json'));
let MongoServ = JSON.parse(rawdata);

const mongoose = require('mongoose');
const { Schema } = mongoose;

const URI = MongoServ.URI + MongoServ.User + ':' + MongoServ.Pass + '@' + MongoServ.Host;
console.log(URI);
mongoose.connect(URI)
    .then(db => console.log('Db is connected'))
    .catch(error => console.error(error));

module.exports = mongoose, Schema;