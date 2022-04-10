const excelToJson = require("convert-excel-to-json");
//require moongose
var FormData = require("form-data");

const mongoose = require("mongoose");
const fetch = require("node-fetch");
const axios = require("axios");
const bodyParser = require("body-parser"); // Franginer katherin guillen griman (te amo mi nina)
const Headers = require("node-fetch");
const fs = require("fs");
const onus = require("../models/onus");
const Olts = require("../models/Olts");
class SmartOltSDKByAP {
    constructor(options) {
        this.OltId = options.OltId;
        this.ListaDeCorte = []; //Lo almaceno como un array
        this.ListaDeActivacion = [];
        this.subdomain = options.subdomain;
        this.API = options.API;
    }
    async GetOltName(id) {
        //obtengo el nombre de la olt en la base de datos
        var OltName = await Olts.findOne({
            _id: id,
        });
        return OltName.Olt_Name;
    }
    async SendMassCut(ListaDeCorte, ListaDeActivacion) {
        var CortesFallidos = 0;
        var ActivacionesFallidas = 0;
        //Procesando lista de corte
        //Limite 10 en 10
        var contador10 = 0;
        var tmpListaCorte = "";
        var ActivacionesCompletadas = 0;
        var CortesCompletados = 0;
        var Log = [];
        var LogAll = [];
        console.log(ListaDeCorte.length - 1);
        for (let index = 0; index < ListaDeCorte.length; index++) {
            const element = ListaDeCorte[index];
            //Send to api
            if (tmpListaCorte == "") {
                tmpListaCorte = element;
            } else {
                tmpListaCorte = tmpListaCorte + "," + element;
            }
            console.log(index);
            if (index % 10 == 0) {
                contador10 = +1;
                console.log("Sleep index: " + index);
                console.log("Lista de corte: " + tmpListaCorte);
                var respuesta = await this.CortarGrupo(tmpListaCorte);
                console.log(respuesta);
                Log.push(respuesta.errorlist);
                LogAll.push(respuesta.Log);
                if (respuesta.status == true) {
                    CortesCompletados = CortesCompletados + respuesta.CompleteCor;
                    CortesFallidos = CortesFallidos + respuesta.errorcount;
                }
                await sleep(4000); //Relajao como quien dice
                tmpListaCorte = "";
            } else {
                if (ListaDeCorte.length - 1 == index) {
                    console.log("Fin mi rey");
                    var respuesta = await this.CortarGrupo(tmpListaCorte);
                    Log.push(respuesta.errorlist);
                    LogAll.push(respuesta.Log);
                    if (respuesta.status == true) {
                        CortesCompletados = CortesCompletados + 1;
                    }
                    console.log("Lista de corte: " + tmpListaCorte);
                    //await sleep(2000); //Relajao como quien dice
                }
            }
        }
        //Lista de Activacion
        var tmpListaDeActivacion = "";
        console.log(ListaDeActivacion.length - 1);
        for (let index = 0; index < ListaDeActivacion.length; index++) {
            const element = ListaDeActivacion[index];
            //Send to api
            if (tmpListaDeActivacion == "") {
                tmpListaDeActivacion = element;
            } else {
                tmpListaDeActivacion = tmpListaDeActivacion + "," + element;
            }
            console.log(index);
            if (index % 10 == 0) {
                contador10 = +1;
                console.log("Sleep index: " + index);
                console.log("Lista de corte: " + tmpListaDeActivacion);
                var respuesta = await this.ActivarGrupo(tmpListaDeActivacion);
                Log.push(respuesta.errorlist);
                if (respuesta.status == true) {
                    ActivacionesCompletadas =
                        ActivacionesCompletadas + respuesta.CompleteAct;
                    ActivacionesFallidas = ActivacionesFallidas + respuesta.errorcount;
                }
                await sleep(4000); //Relajao como quien dice
                tmpListaDeActivacion = "";
            } else {
                if (ListaDeActivacion.length - 1 == index) {
                    var respuesta = await this.ActivarGrupo(tmpListaDeActivacion);
                    Log.push(respuesta.errorlist);
                    // console.log(respuesta)
                    if (respuesta.status == true) {
                        ActivacionesCompletadas =
                            ActivacionesCompletadas + respuesta.CompleteAct;
                        ActivacionesFallidas = ActivacionesFallidas + respuesta.errorcount;
                    }
                    console.log("Lista de Activacion: " + ListaDeActivacion);
                    //await sleep(2000);
                }
            }
        }
        return {
            status: true,
            Corte: ListaDeCorte,
            Log: Log,
            LogAll: LogAll,
            Activacion: ListaDeActivacion,
            CortesCompletados: CortesCompletados,
            ActivacionesCompletadas: ActivacionesCompletadas,
            ActivacionesFallidas: ActivacionesFallidas,
            CortesFallidos: CortesFallidos,
        };
    }

    async ClientList() {
        // Separar por olt name
        const oltid = this.OltId;
        const Olt_Name = await this.GetOltName(oltid);
        console.log(Olt_Name);

        //Actualizar la lista de onus
        var requestOptions = {
            method: "GET",
            headers: {
                "X-Token": this.API,
            },
        };
        console.log("AQUI EMPIEZA EL FETCH");

        fetch(
                "https://" +
                this.subdomain +
                ".smartolt.com/api/onu/get_all_onus_details",
                requestOptions
            )
            .then((response) => response.json())
            .then(async function(result) {
                //   console.log(result)
                //Save json file to mongoDB
                //console.log(result);
                if (result.status == false) {
                    console.log("Error al obtener la lista de onus");
                    return false;
                }
                const onusf = result.onus;
                for (const resultOlt of onusf) {
                    await onus.findOne({
                            PON: resultOlt.sn,
                        },
                        async function(err, onu) {
                            console.log(err);
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
                                    Puerto: "-",
                                });
                                await newOnu.save(function(err, onu) {
                                    if (err) return console.error(err);
                                    //   console.log("Onu saved successfully");
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
                        }
                    );
                }
                return true;
            })
            .catch((error) => {
                return false;
            });
        //res.send(Onus)
    }
    async CortarGrupo(Grupo) {
        var CompleteCor = 0;
        var Log = [];
        var errorlist = [];
        var errorcount = 0;
        var bodyFormData = new FormData();
        bodyFormData.append("onus_external_ids", Grupo);
        //console.log(bodyFormData)
        Log.push("Cortando grupo: " + Grupo);
        try {
            let response = await axios({
                method: "post",
                url: `https://${this.subdomain}.smartolt.com/api/onu/bulk_disable`,
                data: `onus_external_ids=${encodeURIComponent(Grupo)}`,
                headers: { "X-Token": this.API },
            });
            //handle success
            console.log(response.data);
            console.log("OK");
            if (response.data.status == true) {
                var data = response.data;
                //if data is array
                Log.push("Grupo Cortado: " + response.data);
                if (Array.isArray(data.response) == true) {
                    console.log("Es un array");
                    for (var i = 0; i < data.response.length; i++) {
                        log.push("Arr Crt [" + CompleteCor + "]: " + data.response[i]);
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
                        CompleteCor: CompleteCor,
                        Log: Log,
                    };
                } else {
                    var ResultArray = Object.values(data.response);
                    console.log(ResultArray);
                    for (var i in ResultArray) {
                        log.push(ResultArray[i]);
                        if (ResultArray[i].includes("No ONU was found")) {
                            log.push("For Crt [" + CompleteCor + "]: " + data.response[i]);
                            errorlist.push(ResultArray[i]);
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
                        CompleteCor: CompleteCor,
                        Log: Log,
                    };
                }
            } else {
                log.push("Error Cortando Grupo: " + response.data);
                return {
                    error: response.data,
                    status: false,
                    Log: Log,
                    errorlist: errorlist,
                    errorcount: errorcount,
                    CompleteCor: CompleteCor,
                };
            }
        } catch (error) {
            console.log(error);
            console.log("ERROR");
            return {
                error: error,
                status: false,
            };
        }
    }
    async ActivarGrupo(Grupo) {
        var CompleteAct = 0;
        var errorlist = [];
        var errorcount = 0;
        var bodyFormData = new FormData();
        bodyFormData.append("onus_external_ids", Grupo);
        // console.log(bodyFormData)
        try {
            let response = await axios({
                method: "post",
                url: `https://${this.subdomain}.smartolt.com/api/onu/bulk_enable`,
                data: `onus_external_ids=${encodeURIComponent(Grupo)}`,
                headers: { "X-Token": this.API },
            });
            //handle success
            console.log(response.data);
            console.log("OK");
            if (response.data.status == true) {
                var data = response.data;
                //if data is array
                if (Array.isArray(data.response) == true) {
                    console.log("Es un array");
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
                        CompleteAct: CompleteAct,
                    };
                } else {
                    var ResultArray = Object.values(data.response);
                    console.log(ResultArray);
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
                            CompleteAct: CompleteAct,
                        };
                    }
                }
            } else {
                return {
                    error: response,
                    status: false,
                };
            }
        } catch (error) {
            return {
                error: error,
                status: false,
            };
        }
    }
    async EnableOnu(Onu) {
        //subdomain
        const oltid = this.OltId;
        const subdomain = this.subdomain;
        var requestOptions = {
            method: "POST",
            headers: {
                "X-Token": this.API,
            },
        };
        var requestOptionsGet = {
            method: "GET",
            headers: {
                "X-Token": this.API,
            },
        };
        await fetch(
                `https://${subdomain}.smartolt.com/api/onu/enable/` + Onu,
                requestOptions
            )
            .then((response) => response.text())
            .then(async function(result2) {
                console.log(result2);
                await fetch(
                        `https://${subdomain}.smartolt.com/api/onu/get_onus_details_by_sn/` +
                        Onu,
                        requestOptionsGet
                    )
                    .then((response) => response.json())
                    .then(async function(resultOltq) {
                        var resultOlt = resultOltq.onus[0];
                        console.log(resultOlt);
                        await onus.findOne({
                                PON: resultOlt.sn,
                            },
                            async function(err, onu) {
                                console.log(err);
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
                                        Puerto: "-",
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
                            }
                        );
                    })
                    .catch((error) => console.log("error", error));
            })
            .catch((error) => console.log("error", error));
        return { ok: true };
    }

    async DisableOnu(Onu) {
        //subdomain
        const oltid = this.OltId;
        const subdomain = this.subdomain;
        var requestOptions = {
            method: "POST",
            headers: {
                "X-Token": this.API,
            },
        };
        var requestOptionsGet = {
            method: "GET",
            headers: {
                "X-Token": this.API,
            },
        };
        await fetch(
                `https://${subdomain}.smartolt.com/api/onu/disable/` + Onu,
                requestOptions
            )
            .then((response) => response.text())
            .then(async function(result2) {
                console.log(result2);
                await fetch(
                        `https://${subdomain}.smartolt.com/api/onu/get_onus_details_by_sn/` +
                        Onu,
                        requestOptionsGet
                    )
                    .then((response) => response.json())
                    .then(async function(resultOltq) {
                        var resultOlt = resultOltq.onus[0];
                        console.log(resultOlt);
                        await onus.findOne({
                                PON: resultOlt.sn,
                            },
                            async function(err, onu) {
                                console.log(err);
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
                                        Puerto: "-",
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
                            }
                        );
                    })
                    .catch((error) => console.log("error", error));
            })
            .catch((error) => console.log("error", error));
        return { ok: true };
    }
}

function OpenSmartSdk(options) {
    return new SmartOltSDKByAP(options);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = OpenSmartSdk;