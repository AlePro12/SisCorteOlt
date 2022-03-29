const excelToJson = require('convert-excel-to-json');
const fetch = require('node-fetch');
const axios = require('axios');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Headers = require('node-fetch');
const fs = require('fs');
const onus = require('../models/onus');
const OpenTelnet = require('../Controllers/TelnetTplinkUtilty');
class telnetTplinkOltSDKByAP {
    constructor(options) {
        this.OltId = options.OltId
        this.ListaDeCorte = []; //Lo almaceno como un array
        this.ListaDeActivacion = [];
        this.ip = options.ip
        this.user = options.user
        this.pass = options.pass
    }
    async GenerateList(result) {
        var ListaDeCorteIndex = 0
        var ListaDeActivacionIndex = 0
        console.log(result)
        for (let index = 1; index < result['Ont'].length; index++) {
            A = result['Ont'][index].B
            B = result['Ont'][index].C
            if (A !== "") {
                if (B == "FALSE") {
                    console.log("Esta va para lista de corte");
                    this.ListaDeCorte[ListaDeCorteIndex] = A;
                    ListaDeCorteIndex = ListaDeCorteIndex + 1;
                } else {
                    console.log("Esta va para lista de activacion");
                    this.ListaDeActivacion[ListaDeActivacionIndex] = A;
                    ListaDeActivacionIndex = ListaDeActivacionIndex + 1;
                }
            }
        }
        console.log("ListaDeCorte: ");
        console.log(this.ListaDeCorte);
        console.log("ListaDeActivacion: ");
        console.log(this.ListaDeActivacion);
        return { ListaDeCorte: this.ListaDeCorte, ListaDeActivacion: this.ListaDeActivacion };
    }
    async ClientList() {
        var telnet = await new OpenTelnet({
            ip: this.ip,
            user: this.user,
            pass: this.pass,
            level: 3
        });
        result = await telnet.Connect();
        console.log(result)
        await sleep(4000);
        var result = JSON.parse(await telnet.ShowList());
        var result = this.ProcessSaveList(result);
        console.log(result)
        return result;
    }
    async ProcessSaveList(onusf) {
        const oltid = this.OltId
        for (const resultOlt of onusf) {
            console.log(resultOlt.SN)
            await onus.findOne({
                PON: resultOlt.SN
            }, async function(err, onu) {
                console.log(err)
                var AdminStatus = false;
                if (resultOlt.AdminStatus == "Active") {
                    var AdminStatus = true;
                } else {
                    var AdminStatus = false;
                }
                if (onu == null) {
                    var newOnu = new onus({
                        OltInfo: resultOlt,
                        LocalInfo: {
                            AdminState: AdminStatus,
                            Nombre: `Desconocido (${resultOlt.SN})`,
                            Direccion: "",
                            Telefono: "",
                            Correo: "",
                            status: "-",
                            signal: "-",
                        },
                        PON: resultOlt.SN,
                        Olt_id: mongoose.Types.ObjectId(oltid),
                        Puerto: "-"
                    });
                    await newOnu.save(function(err, onu) {
                        if (err) return console.error(err);
                        console.log("Onu saved successfully");
                    });
                } else {
                    onu.OltInfo = resultOlt;
                    onu.LocalInfo = {
                        AdminState: AdminStatus,
                        Nombre: onu.LocalInfo.Nombre,
                        Direccion: onu.LocalInfo.Direccion,
                        Telefono: onu.LocalInfo.Telefono,
                        Correo: onu.LocalInfo.Correo,
                        status: "-",
                        signal: "-",
                    };
                    await onu.save(async function(err, onu) {
                        if (err) return console.error(err);
                        console.log("Onu updated successfully Telnet");
                    });
                }
            });
        };
    }
    async DisableOnu(Onu) {
        var returnn = { ok: false };
        //subdomain
        const oltid = this.OltId;
        var telnet = await new OpenTelnet({
            ip: this.ip,
            user: this.user,
            pass: this.pass,
            level: 3
        });
        var result = await telnet.Connect();
        console.log(result)
        await sleep(4000);
        result = await telnet.EnterInterface("0/0");
        //get onu info from db
        await onus.findOne({
            PON: Onu,
            Olt_id: mongoose.Types.ObjectId(oltid)
        }, async function(err, onu) {
            console.log(err)
            if (onu == null) {
                console.log("No existe la onu");
                returnn = { ok: false };
            } else {
                var comando = "ont deactivate " + onu.OltInfo.Puerto + " " + onu.OltInfo.ONT;
                console.log(comando);
                result = await telnet.sendCommand(comando);
                console.log(result);
                if (result.status == true) {
                    returnn = { ok: true };
                } else {
                    returnn = { ok: false };
                }
            }
        });
        return returnn;
    }
    async EnableOnu(Onu) {
        var returnn = { ok: false };
        //subdomain
        const oltid = this.OltId;
        var telnet = await new OpenTelnet({
            ip: this.ip,
            user: this.user,
            pass: this.pass,
            level: 3
        });
        var result = await telnet.Connect();
        console.log(result)
        await sleep(4000);
        result = await telnet.EnterInterface("0/0");
        //get onu info from db
        await onus.findOne({
            PON: Onu,
            Olt_id: mongoose.Types.ObjectId(oltid)
        }, async function(err, onu) {
            console.log(err)
            if (onu == null) {
                console.log("No existe la onu");
                returnn = { ok: false };
            } else {
                var comando = "ont activate " + onu.OltInfo.Puerto + " " + onu.OltInfo.ONT;
                console.log(comando);
                result = await telnet.sendCommand(comando);
                console.log(result);
                if (result.status == true) {
                    returnn = { ok: true };
                } else {
                    returnn = { ok: false };
                }
            }
        });
        return returnn;
    }
    async SendMassCut(ListaDeCorte, ListaDeActivacion) {
        var CortesFallidos = 0;
        var ActivacionesFallidas = 0;
        var ActivacionesCompletadas = 0;
        var CortesCompletados = 0;
        const oltid = this.OltId;
        var telnet = await new OpenTelnet({
            ip: this.ip,
            user: this.user,
            pass: this.pass,
            level: 3
        });
        var result = await telnet.Connect();
        console.log(result)
        await sleep(4000);
        result = await telnet.EnterInterface("0/0");
        console.log(result)
        for (let index = 0; index < ListaDeActivacion.length; index++) { //ont activate
            console.log(ListaDeActivacion[index]);
            //obtener onu por sn 
            await onus.findOne({
                PON: ListaDeActivacion[index],
                Olt_id: mongoose.Types.ObjectId(oltid)
            }, async function(err, onu) {
                console.log(err)
                if (onu == null) {
                    //error 
                    console.log("No se encontro la onu");
                    ActivacionesFallidas = ActivacionesFallidas + 1;
                } else {
                    //cortar onu
                    var comando = "ont activate " + onu.OltInfo.Puerto + " " + onu.OltInfo.ONT;
                    console.log(comando);
                    result = await telnet.sendCommand(comando);
                    console.log(result);
                    if (result.status == true) {
                        ActivacionesCompletadas = ActivacionesCompletadas + 1;
                    } else {
                        ActivacionesFallidas = ActivacionesFallidas + 1;
                    }
                }
            });
            await sleep(2000);
        }
        for (let index = 0; index < ListaDeCorte.length; index++) { //ont activate
            console.log(ListaDeCorte[index]);
            //obtener onu por sn 
            await onus.findOne({
                PON: ListaDeCorte[index],
                Olt_id: mongoose.Types.ObjectId(oltid)
            }, async function(err, onu) {
                console.log(err)
                if (onu == null) {
                    //error 
                    console.log("No se encontro la onu");
                    CortesFallidos = CortesFallidos + 1;
                } else {
                    //cortar onu
                    var comando = "ont deactivate " + onu.OltInfo.Puerto + " " + onu.OltInfo.ONT;
                    console.log(comando);
                    result = await telnet.sendCommand(comando);
                    console.log(result);
                    if (result.status == true) {
                        CortesCompletados = CortesCompletados + 1;
                    } else {
                        CortesFallidos = CortesFallidos + 1;
                    }
                }
            });
            await sleep(2000);
        }
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
}

function OpenTplinkOltSdk(options) {
    return new telnetTplinkOltSDKByAP(options)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports = OpenTplinkOltSdk