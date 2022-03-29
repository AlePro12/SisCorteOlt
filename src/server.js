/*
    Colnetwork ONU - DisableOnus y panel de corte
    By Alejandro Sanchez (FKGG<3) DETC
*/
const express = require('express');
const morgan = require('morgan');
const multer = require('multer')

const path = require('path');
const app = express();
const bodyParser = require('body-parser');



const { mongoose, Schema } = require('./db');
///const { Schema } = mongoose;
const mongoosed = require('mongoose');
//const onus = require('./models/onus');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'Fkgg6673.';
//Make a Onus schema 
const OnusSchema = new Schema({
    sn: {
        type: String,
        required: true
    },
    json: {
        type: Object,
        required: true
    }
});
onusshe = mongoosed.model('onus', OnusSchema);
//Obtener el apiKey de la configuracion
const fs = require('fs');

async function licver() {
    var returnd = {
        msg: "error no se obtuvo respuesta",
        State: false
    };
    var hddserial = require('hddserial');
    console.log(process.cwd() + '/ALPHAOLTLIC');
    hddserial.all(function(err, serial) {
        if (err) return console.error(err);
        console.log('Serial de activacion: ' + serial + '\n');
    });
    try {
        var key = fs.readFileSync(process.cwd() + '/ALPHAOLTLIC', 'utf8');
        console.log('Licencia: ' + key.toString());
        console.log('Info: ' + decrypt(key.toString().trim()) + '\n');
        console.log('Serial: ' + decrypt(key.toString().trim()).split('|')[0]);
        console.log('Empresa Rif: ' + decrypt(key.toString().trim()).split('|')[1]);
        // console.log('\n******'+Thedm+getHDDSerialNumber()+'******\n');

        hddserial.all(function(err, serial) {
            console.log('Seriales En esta PC: ' + serial + '\n');
        });
        await hddserial.check(decrypt(key.toString().trim()).split('|')[0], async function(err, success, serial) {
            if (success) {
                console.log('\n******Su licencia es valida******\n');
                var Resultado = "OK"
                Apprun({
                    msg: Resultado,
                    State: true
                })
                returnd = {
                    msg: Resultado,
                    State: true
                };
                //console.log("true Serial 5L09TDHA founded !!");%s", serial
            } else {
                var Resultado = "ERROR LICENCIA SOLO ES VALIDA AL HARDDISK:" + decrypt(key.toString().trim()).split('|')[0] + " - KEY: " + key.toString().trim();
                console.log('\n******Esta licencia es invalida %s ******\n', serial);
                Apprun({
                    msg: Resultado,
                    State: false
                })
                returnd = {
                    msg: Resultado,
                    State: false
                };
            }
        });
    } catch (e) {
        //console.log('Error:', e.stack);
        Resultado = "error no se pudo obtener licencia. ERROR: ";
        Apprun({
            msg: Resultado,
            State: false
        })
        returnd = {
            msg: Resultado,
            State: false
        };
    }
    return returnd;
}
const oldnb = licver();
app.set('port', 3000);

function Apprun(licp) {

    if (licp.State == true) {
        let rawdata = fs.readFileSync(path.join(__dirname, 'API.json'));
        let APIKEY = JSON.parse(rawdata).APIKEY;
        let Subdomain = JSON.parse(rawdata).Subdomain
        app.set('Subdomain', Subdomain);
        app.set('API', APIKEY);
        // Middlewares
        // Db connection
        //use bodyParser
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(morgan('dev'));
        app.use(express.json());
        //import routes
        app.use('/api/LoginAgent/', require('./routes/Login.routes'));
        app.use('/api/Olt', require('./routes/Olt.routes'));
        app.use('/api/onu', require('./routes/onu.routes'));
        //SET STORAGE
        const storage = multer.diskStorage({
            destination: './src/upload',
            filename: (req, file, cb) => {
                cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
            }
        });
        var upload = multer({ storage: storage });

        //Rutas

        //ruta de reenvio para evitar que se lleven el apikey y la url solo pa mas seguridad
        app.get('/GetOnus', (req, res) => {
            var APIKEY = "0c905b377bed721197a07e5c5b360e9b"
            const meta = {
                'X-Token': APIKEY
            };
            //var myHeaders = new Headers(meta);
            var requestOptions = {
                method: 'GET',
                headers: meta
            };
            Onus = {}
            console.log("AQUI EMPIEZA EL FETCH")
            fetch("https://colnetwork.smartolt.com/api/onu/get_onus_statuses", requestOptions)
                .then(response => response.json())
                .then(result => {
                    if (result.status == true) {
                        result.response.forEach(OnusStatus => {
                            fetch("https://colnetwork.smartolt.com/api/onu/get_onus_details_by_sn/" + OnusStatus.sn, requestOptions)
                                .then(response => response.json())
                                .then(resultOnu => {
                                        //include data in the Onus object
                                        console.log(resultOnu)
                                        Onus[resultOnu.onus[0].sn] = resultOnu.Onus


                                    }

                                )
                                .catch(error => console.log('error', error));

                        });
                    }
                    res.send(Onus)
                })
                .catch(error => console.log('error', error));
        });

        //EnabledOnu
        app.get('/EnabledOnunjdv/:id', async function(req, res) {
                var requestOptions = {
                    method: 'POST',
                    headers: {
                        'X-Token': app.get('API')
                    }
                };
                var requestOptionsGet = {
                    method: 'GET',
                    headers: {
                        'X-Token': app.get('API')
                    }
                };
                fetch(`https://${app.get('Subdomain')}.smartolt.com/api/onu/enable/` + req.params.id, requestOptions)
                    .then(response => response.text())
                    .then(async function(result2) {
                        console.log(result2)
                        fetch(`https://${app.get('Subdomain')}.smartolt.com/api/onu/get_onus_details_by_sn/` + req.params.id, requestOptionsGet)
                            .then(response => response.json())
                            .then(async function(result) {
                                var rep = result.onus
                                console.log(rep[0].sn)
                                await onusshe.findOne({
                                    sn: rep[0].sn
                                }, async function(err, onu) {
                                    if (onu == null) {
                                        //create a new onu
                                        var newOnu = new onusshe({
                                            sn: result.onus[0].sn,
                                            json: result.onus[0]
                                        });
                                        await newOnu.save(function(err, onu) {
                                            if (err) return console.error(err);
                                            console.log("Onu saved successfully");
                                        });
                                    } else {
                                        //update the onu
                                        onu.json = result.onus[0];
                                        await onu.save(async function(err, onu) {
                                            if (err) return console.error(err);
                                            console.log("Onu updated successfully");
                                        });
                                    }
                                });
                            })
                            .catch(error => console.log('error', error));
                    })
                    .catch(error => console.log('error', error));
                res.json({ ok: true });
            })
            //DisableOnu
        app.get('/GetNameOnu/:id', function(req, res) {
            var Nombre = ""

            onusshe.find({ "sn": req.params.id })
                .sort({ date: -1 })
                .then(empresas => res.json({ status: true, sn: req.params.id, name: empresas[0].json.name }))
                .catch(err => res.status(404).json({ status: false, err: err }));
        })
        app.get('/DisableOnu/:id', async function(req, res) {
            var requestOptions = {
                method: 'POST',
                headers: {
                    'X-Token': app.get('API')
                }
            };
            var requestOptionsGet = {
                method: 'GET',
                headers: {
                    'X-Token': app.get('API')
                }
            };
            fetch(`https://${app.get('Subdomain')}.smartolt.com/api/onu/disable/` + req.params.id, requestOptions)
                .then(response => response.text())
                .then(async function(result2) {
                    fetch(`https://${app.get('Subdomain')}.smartolt.com/api/onu/get_onus_details_by_sn/` + req.params.id, requestOptionsGet)
                        .then(response => response.json())
                        .then(async function(result) {
                            var rep = result.onus
                            console.log(rep[0].sn)

                            findByIdAndUpdate(rep[0].sn, {
                                json: result.onus[0]
                            }, function(err, onu) {
                                if (err) return handleError(err);
                                console.log("Onu updated successfully");
                            });
                        })
                        .catch(error => console.log('error', error));



                })
                .catch(error => console.log('error', error));
            res.json({ ok: true })
        })


        app.use(express.static(path.join(__dirname, 'public')));;
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'public/index.html'));
        });
        app.listen(app.get('port'), () => {
            console.log(`
    *
    *
    Colnetwork ONU - DisableOnus y panel de corte
    By Alejandro Sanchez (FKGG<3) DETC
    *
    *
    `);
            console.log(`Servidor iniciado en el puerto: ${app.get('port')}`);
            const FrangiGuillen = "<3"
        });

    } else {
        app.get('*', (req, res) => {
            res.send(licp.msg);
        });
        app.listen(app.get('port'), () => {
            console.log(`
    *
    *
    Colnetwork ONU - DisableOnus y panel de corte ERROR
    By Alejandro Sanchez (FKGG<3) DETC
    *
    *
    `);
            console.log(`Servidor iniciado en el puerto: ${app.get('port')}`);
            const FrangiGuillen = "<3"
        });
        console.log("Error Licencia Invalida");

    }
}

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}