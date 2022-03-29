const excelToJson = require('convert-excel-to-json');
//require moongose
var FormData = require('form-data');

const mongoose = require('mongoose');
const fetch = require('node-fetch');
const axios = require('axios');
const bodyParser = require('body-parser');
const Headers = require('node-fetch');
const fs = require('fs');
const onus = require('../models/onus');
class SmartOltMixedSDKByAP {
    constructor(options) {
        this.OltId = options.OltId
        this.ListaDeCorte = []; //Lo almaceno como un array
        this.ListaDeActivacion = [];
        this.subdomain = options.subdomain
        this.API = options.API
    }
    async SendMassCut(ListaDeCorte, ListaDeActivacion) {


        return {
            status: true,
            Corte: ListaDeCorte,
            Activacion: ListaDeActivacion,
            CortesCompletados: CortesCompletados,
            ActivacionesCompletadas: ActivacionesCompletadas,
            ActivacionesFallidas: ActivacionesFallidas,
            CortesFallidos: CortesFallidos,
        }
    }

    async ClientList() {
        const oltid = this.OltId
            //Actualizar la lista de onus
        var requestOptions = {
            method: 'GET',
            headers: {
                'X-Token': this.API
            }
        };
        console.log("AQUI EMPIEZA EL FETCH")
        fetch("https://" + this.subdomain + ".smartolt.com/api/onu/get_all_onus_details", requestOptions)
            .then(response => response.json())
            .then(async function(result) {
                //   console.log(result)
                //Save json file to mongoDB
                console.log(result);
                if (result.status == false) {
                    console.log("Error al obtener la lista de onus");
                    return false;
                }
                const onusf = result.onus
                for (const resultOlt of onusf) {
                    //save each onu in the mongoDB
                    console.log(resultOlt.sn)
                        //find a onu by sn and update it or create a new one
                    await onus.findOne({
                        PON: resultOlt.sn
                    }, async function(err, onu) {
                        console.log(err)
                        var AdminStatus = false;
                        if (resultOlt.administrative_status == "Enabled") {
                            AdminStatus = true;
                        } else {
                            AdminStatus = false;
                        }
                        if (onu == null) {
                            //create a new onu with onus schema
                            var newOnu = new onus({
                                OltInfo: resultOlt,
                                LocalInfo: {
                                    AdminState: AdminStatus,
                                    Nombre: resultOlt.name,
                                    Direccion: "",
                                    Telefono: "",
                                    Correo: "",
                                    status: resultOlt.status,
                                    signal: resultOlt.signal,
                                },
                                PON: resultOlt.sn,
                                Olt_id: mongoose.Types.ObjectId(oltid),
                                Puerto: "-"
                            });
                            await newOnu.save(function(err, onu) {
                                if (err) return console.error(err);
                                console.log("Onu saved successfully");
                            });

                        } else {
                            //update the onu
                            onu.OltInfo = resultOlt;
                            onu.LocalInfo = {
                                AdminState: AdminStatus,
                                Nombre: resultOlt.name,
                                Direccion: onu.LocalInfo.Direccion,
                                Telefono: onu.LocalInfo.Telefono,
                                Correo: onu.LocalInfo.Correo,
                                status: resultOlt.status,
                                signal: resultOlt.signal,
                            };
                            await onu.save(async function(err, onu) {
                                if (err) return console.error(err);
                                console.log("Onu updated successfully Smart");
                            });
                        }
                    });
                };
                return true;
            })
            .catch(error => {
                return false;
            })
            //res.send(Onus)
    }
    async CortarGrupo(Grupo) {
        var CompleteCor = 0;
        var errorlist = [];
        var errorcount = 0;
        var bodyFormData = new FormData();
        bodyFormData.append('onus_external_ids', Grupo);
        //console.log(bodyFormData)
        try {
            let response = await axios({
                    method: "post",
                    url: `https://${this.subdomain}.smartolt.com/api/onu/bulk_disable`,
                    data: `onus_external_ids=${encodeURIComponent(Grupo)}`,
                    headers: { "X-Token": this.API },
                })
                //handle success
            console.log(response.data)
            console.log("OK");
            if (response.data.status == true) {
                var data = response.data
                    //if data is array   
                if (Array.isArray(data.response) == true) {
                    console.log("Es un array")
                    for (var i = 0; i < data.response.length; i++) {
                        if (data.response[i].includes("No ONU was found")) {
                            console.log("No ONU was found");
                            errorlist.push(data.response[i]);
                            errorcount = errorcount + 1;
                        } else {
                            CompleteCor = CompleteCor + 1;
                        }
                    }
                    return {
                        response: data,
                        status: true,
                        errorcount: errorcount,
                        errorlist: errorlist,
                        CompleteCor: CompleteCor
                    };
                } else {
                    var ResultArray = Object.values(data.response);
                    for (var i in ResultArray) {
                        if (ResultArray[i].includes("No ONU was found")) {
                            errorlist.push(ResultArray);
                            errorcount = errorcount + 1;
                        } else {
                            CompleteCor = CompleteCor + 1;
                        }
                        return {
                            response: data,
                            status: true,
                            errorcount: errorcount,
                            errorlist: errorlist,
                            CompleteCor: CompleteCor
                        };
                    }

                }
            } else {
                return {
                    error: response.data,
                    status: false
                };
            }
        } catch (error) {
            console.log(error)
            console.log("ERROR");
            return {
                error: error,
                status: false
            };
        }
    }
    async ActivarGrupo(Grupo) {
        var CompleteAct = 0;
        var errorlist = [];
        var errorcount = 0;
        var bodyFormData = new FormData();
        bodyFormData.append('onus_external_ids', Grupo);
        // console.log(bodyFormData)
        try {
            let response = await axios({
                    method: "post",
                    url: `https://${this.subdomain}.smartolt.com/api/onu/bulk_enable`,
                    data: `onus_external_ids=${encodeURIComponent(Grupo)}`,
                    headers: { "X-Token": this.API },
                })
                //handle success
            console.log(response.data)
            console.log("OK");
            if (response.data.status == true) {
                var data = response.data
                    //if data is array   
                if (Array.isArray(data.response) == true) {
                    console.log("Es un array")
                    for (var i = 0; i < data.response.length; i++) {
                        if (data.response[i].includes("No ONU was found")) {
                            errorlist.push(data.response[i]);
                            errorcount = errorcount + 1;
                        } else {
                            CompleteAct = CompleteAct + 1;
                        }
                    }
                    return {
                        response: data,
                        status: true,
                        errorcount: errorcount,
                        errorlist: errorlist,
                        CompleteAct: CompleteAct
                    };
                } else {
                    var ResultArray = Object.values(data.response);
                    console.log(ResultArray)
                    for (var i in ResultArray) {
                        if (ResultArray[i].includes("No ONU was found")) {
                            errorlist.push(ResultArray);
                            errorcount = errorcount + 1;
                        } else {
                            CompleteAct = CompleteAct + 1;
                        }
                        return {
                            response: data,
                            status: true,
                            errorcount: errorcount,
                            errorlist: errorlist,
                            CompleteAct: CompleteAct
                        };
                    }
                }
            } else {
                return {
                    error: response,
                    status: false
                };
            }

        } catch (error) {
            return {
                error: error,
                status: false
            };
        }
    }
    async EnableOnu(Onu) {
        //subdomain
        const oltid = this.OltId;
        const subdomain = this.subdomain;
        var requestOptions = {
            method: 'POST',
            headers: {
                'X-Token': this.API
            }
        };
        var requestOptionsGet = {
            method: 'GET',
            headers: {
                'X-Token': this.API
            }
        };
        await fetch(`https://${subdomain}.smartolt.com/api/onu/enable/` + Onu, requestOptions)
            .then(response => response.text())
            .then(async function(result2) {
                console.log(result2)
                await fetch(`https://${subdomain}.smartolt.com/api/onu/get_onus_details_by_sn/` + Onu, requestOptionsGet)
                    .then(response => response.json())
                    .then(async function(resultOltq) {
                        var resultOlt = resultOltq.onus[0];
                        console.log(resultOlt)
                        await onus.findOne({
                            PON: resultOlt.sn
                        }, async function(err, onu) {
                            console.log(err)
                            var AdminStatus = false;
                            if (resultOlt.administrative_status == "Enabled") {
                                AdminStatus = true;
                            } else {
                                AdminStatus = false;
                            }
                            if (onu == null) {
                                //create a new onu with onus schema
                                var newOnu = new onus({
                                    OltInfo: resultOlt,
                                    LocalInfo: {
                                        AdminState: AdminStatus,
                                        Nombre: resultOlt.name,
                                        Direccion: "",
                                        Telefono: "",
                                        Correo: "",
                                        status: resultOlt.status,
                                        signal: resultOlt.signal,
                                    },
                                    PON: resultOlt.sn,
                                    Olt_id: mongoose.Types.ObjectId(oltid),
                                    Puerto: "-"
                                });
                                await newOnu.save(function(err, onu) {
                                    if (err) return console.error(err);
                                    console.log("Onu saved successfully");
                                });

                            } else {
                                //update the onu
                                onu.OltInfo = resultOlt;
                                onu.LocalInfo = {
                                    AdminState: AdminStatus,
                                    Nombre: resultOlt.name,
                                    Direccion: onu.LocalInfo.Direccion,
                                    Telefono: onu.LocalInfo.Telefono,
                                    Correo: onu.LocalInfo.Correo,
                                    status: resultOlt.status,
                                    signal: resultOlt.signal,
                                };
                                await onu.save(async function(err, onu) {
                                    if (err) return console.error(err);
                                    console.log("Onu updated successfully Smart");
                                });
                            }
                        });
                    })
                    .catch(error => console.log('error', error));
            })
            .catch(error => console.log('error', error));
        return { ok: true };
    }

    async DisableOnu(Onu) {
        //subdomain
        const oltid = this.OltId;
        const subdomain = this.subdomain;
        var requestOptions = {
            method: 'POST',
            headers: {
                'X-Token': this.API
            }
        };
        var requestOptionsGet = {
            method: 'GET',
            headers: {
                'X-Token': this.API
            }
        };
        await fetch(`https://${subdomain}.smartolt.com/api/onu/disable/` + Onu, requestOptions)
            .then(response => response.text())
            .then(async function(result2) {
                console.log(result2)
                await fetch(`https://${subdomain}.smartolt.com/api/onu/get_onus_details_by_sn/` + Onu, requestOptionsGet)
                    .then(response => response.json())
                    .then(async function(resultOltq) {
                        var resultOlt = resultOltq.onus[0];
                        console.log(resultOlt)
                        await onus.findOne({
                            PON: resultOlt.sn
                        }, async function(err, onu) {
                            console.log(err)
                            var AdminStatus = false;
                            if (resultOlt.administrative_status == "Enabled") {
                                AdminStatus = true;
                            } else {
                                AdminStatus = false;
                            }
                            if (onu == null) {
                                //create a new onu with onus schema
                                var newOnu = new onus({
                                    OltInfo: resultOlt,
                                    LocalInfo: {
                                        AdminState: AdminStatus,
                                        Nombre: resultOlt.name,
                                        Direccion: "",
                                        Telefono: "",
                                        Correo: "",
                                        status: resultOlt.status,
                                        signal: resultOlt.signal,
                                    },
                                    PON: resultOlt.sn,
                                    Olt_id: mongoose.Types.ObjectId(oltid),
                                    Puerto: "-"
                                });
                                await newOnu.save(function(err, onu) {
                                    if (err) return console.error(err);
                                    console.log("Onu saved successfully");
                                });

                            } else {
                                //update the onu
                                onu.OltInfo = resultOlt;
                                onu.LocalInfo = {
                                    AdminState: AdminStatus,
                                    Nombre: resultOlt.name,
                                    Direccion: onu.LocalInfo.Direccion,
                                    Telefono: onu.LocalInfo.Telefono,
                                    Correo: onu.LocalInfo.Correo,
                                    status: resultOlt.status,
                                    signal: resultOlt.signal,
                                };
                                await onu.save(async function(err, onu) {
                                    if (err) return console.error(err);
                                    console.log("Onu updated successfully Smart");
                                });
                            }
                        });
                    })
                    .catch(error => console.log('error', error));
            })
            .catch(error => console.log('error', error));
        return { ok: true };
    }
}



function OpenSmartSdkMixed(options) {
    return new SmartOltMixedSDKByAP(options)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = OpenSmartSdkMixed