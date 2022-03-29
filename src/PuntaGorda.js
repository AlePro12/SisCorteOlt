/*
    Colnetwork ONU - DisableOnus y panel de corte PARA PUNTA GORDA
    By Alejandro Sanchez (FKGG<3) DETC
*/

const express = require('express');
const morgan = require('morgan');
const multer = require('multer')
const excelToJson = require('convert-excel-to-json');
const path = require('path');
const app = express();
var Papa = require("papaparse");

const fetch = require('node-fetch');
const axios = require('axios');
// parser to parse the data(separated by tabs and spaces)
const CSV = require('csv-string');

const Headers = require('node-fetch');

app.set('port', 2020);
app.use(morgan('dev'));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'PuntaGorda')));;
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'PuntaGorda/index.html'));
});
app.get('/View', (req, res) => {
    res.sendFile(path.join(__dirname, 'PuntaGorda/View.html'));
});
// Starting the server
app.listen(app.get('port'), () => {
    console.log(`
    *
    *
    Colnetwork ONU - DisableOnus y panel de corte PUNTA GORDA - Client Telnet
    By Alejandro Sanchez (FKGG<3) DETC
    *
    *
    `);
    console.log(`Servidor iniciado en el puerto: ${app.get('port')}`);
    const FrangiGuillen = "<3"
});


/*
const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
    console.log('Client :: ready');

    conn.exec('uptime', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect({
    host: '10.60.0.10',
    localAddress: '192.168.32.114',
    forceIPv4: true,
    port: 22,
    username: 'root',
    password: 'admin',
    agent: ''
});
*/






const Telnet = require('telnet-client')
let connection = new Telnet()

let params = {
    debug: true,
    host: '10.60.0.10',
    port: 23,
    pageSeparator: "  --More ( Press 'Q' to quit )--",
    shellPrompt: /OLT>/i, // or negotiationMandatory: true,
    loginPrompt: />>User name[: ]*$/i,
    passwordPrompt: />>User password[: ]*$/i,
    failedLoginMatch: /The user name or password is invalid!/i,
    username: 'root',
    password: 'admin',
    negotiationMandatory: false,
    timeout: 8000,
}




console.log("connected")
connection.on('data', function(call) {
    console.log("Data")
    console.log(call)
})
connection.on('ready', function(prompt) {
    const action = "activate"
    console.log("ready")
    console.log(prompt)
    console.log("entrando al Modo enable...")
    const command = "ena"
    connection.exec(command, { shellPrompt: 'OLT#' }, function(err, response) {
            console.log(response)
            console.error(err)
            const command = "config"
            console.log("entrando al Modo de configuracion...")

            connection.exec(command, { shellPrompt: 'OLT(config)#' }, function(err, response) {
                console.log(response.replace(/(\-+)/g, "a"))
                console.error(err)
                console.log("Obteniendo ont infos...")
                const command = "show ont info all"
                const csv2json = require('csvjson-csv2json');

                connection.exec(command, { shellPrompt: 'OLT(config)#', pageSeparator: "--More", timeout: 60000, maxBufferLength: 10000000 }, function(err, response) {
                    const input = ((response.replace(/(\-+)/g, "")).replace(/Total(.*)/g, "").replace(/ID(.*)\n+/g, "").replace(/  F\/S(.*)/i, "Interfaz,Puerto,ONT,SN,AdminStatus,RunState,Config,Match").replace(/\n          /i, "").replace(/(  )0/g, "0").replace(/( +\n)/g, "\n").replace(/( +)/g, ",").replace(/(ch+\n\n*,)/i, "ch").trim())


                    const json = csv2json(input, { parseNumbers: true });
                    console.log(JSON.stringify(json));



                    console.log(input)

                    console.error(err)

                })
            })
        }) //OLT(config-interface-gpon-0/0)#

})
connection.on('timeout', function() { console.log('timeout') })
connection.on('close', function() { console.log('connection closed') })


connection.connect(params)
    .then(prompt => {
        console.log("Result: ", prompt);
    })
    .catch(error => {
        console.error(error);

    });


//test ssh
app.get('/ssh', async(req, res) => {



    /*
     res = await connection.exec('ena')
     console.log('async result:', res)
     res = await connection.exec('config')
     console.log('async result:', res)
     res = await connection.exec('show ont info all')
     console.log('async result:', res)
     */
})





function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//var csv is the CSV file with headers
function csvJSON(csv) {

    var lines = csv.split("\n");

    var result = [];

    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step 
    // (you might convert them to &&& or something, then covert them back later)
    // jsfiddle showing the issue https://jsfiddle.net/
    var headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {

        var obj = {};
        var currentline = lines[i].split(",");

        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }

    //return result; //JavaScript object
    return JSON.stringify(result); //JSON
}