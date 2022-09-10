const excelToJson = require("convert-excel-to-json");
//require moongose
var FormData = require("form-data");
//require blob of node:buffer

const mongoose = require("mongoose");
const fetch = require("node-fetch");
const axios = require("axios");
const bodyParser = require("body-parser"); // 497d188fc843341ff5796fd460b54e82e565e229
const Headers = require("node-fetch");
const fs = require("fs");
const onus = require("../models/onus");
const Olts = require("../models/Olts");
const tasks = require("../models/tasks");

const btoa = (text) => {
  return Buffer.from(text, "binary").toString("base64");
};
class SmartOltSDKByAP {
  constructor(options) {
    this.OltId = options.OltId;
    this.ListaDeCorte = []; //Lo almaceno como un array
    this.ListaDeActivacion = [];
    this.subdomain = options.subdomain;
    this.API = options.API;
    console.log("SDK Iniciado");
    console.log(options.API);
  }
  async UpdateOnu(Onu) {
    const oltid = this.OltId;
    var requestOptionsGet = {
      method: "GET",
      headers: {
        "X-Token": this.API,
      },
    };
    await fetch(
      `https://${this.subdomain}.smartolt.com/api/onu/get_onus_details_by_sn/` +
        Onu,
      requestOptionsGet
    )
      .then((response) => response.json())
      .then(async function (resultOltq) {
        var resultOlt = resultOltq.onus[0];
        console.log(resultOlt);
        await onus.findOne(
          {
            PON: resultOlt.sn,
          },
          async function (err, onu) {
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
              await newOnu.save(function (err, onu) {
                if (err) return console.error(err);
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
              await onu.save(async function (err, onu) {
                if (err) return console.error(err);
              });
            }
          }
        );
      })
      .catch((error) => console.log("error", error));
  }
  async GetOltName(id) {
    //obtengo el nombre de la olt en la base de datos
    var OltName = await Olts.findOne({
      _id: id,
    });
    return OltName.Olt_Name;
  }
  async SetPlan(plan, onuId) {
    var CompleteCor = 0;
    var Log = [];
    var errorlist = [];
    var errorcount = 0;
    var bodyFormData = new FormData();
    //console.log(bodyFormData)
    try {
      let response = await axios({
        method: "post",
        url: `https://${this.subdomain}.smartolt.com/api/onu/update_onu_speed_profiles/${onuId}`,
        data: `upload_speed_profile_name=${encodeURIComponent(
          plan
        )}&download_speed_profile_name=${encodeURIComponent(plan)}`,
        headers: { "X-Token": this.API },
      });
      //handle success
      console.log(response.data);
      console.log("OK");
      if (response.data.status == true) {
        this.UpdateOnu(onuId);
        Log.push(response.data.response);
        return {
          response: response.data,
          status: 200,
          errorcount: errorcount,
          errorlist: errorlist,
          CompleteCor: CompleteCor,
          Log: Log,
        };
      } else {
        log.push(response.data.response);
        return {
          response: response.data,
          error: response.data.error,
          status: response.status,
          errorcount: errorcount,
          errorlist: errorlist,
          CompleteCor: CompleteCor,
          Log: Log,
        };
      }
    } catch (error) {
      Log.push(error);
      console.log(error);
      console.log("ERROR");
      return {
        Log: Log,
        error: error.status,
        status: false,
      };
    }
  }
  async SendMassPlans(Lista) {
    var PlanesFallidos = 0;
    var tmpListaCorte = "";
    var PlanesCompletadas = 0;
    var Log = [];
    var LogAll = [];
    var result;
    console.log(Lista.length - 1);
    for (let index = 0; index < Lista.length; index++) {
      const element = Lista[index];
      result = await this.SetPlan(element.Plan, element.PON);
      LogAll.push(result.Log);
      if (result.status == true || result.status == 200) {
        PlanesCompletadas++;
      } else {
        PlanesFallidos++;
        Log.push(result.Log);
      }
      await sleep(300); //Relajao como quien dice
    }
    return {
      status: true,
      Lista: Lista,
      PlanesCompletadas: PlanesCompletadas,
      PlanesFallidos: PlanesFallidos,
      Log: Log,
      LogAll: LogAll,
    };
  }
  async SendMassCut_Task(ListaDeCorte, ListaDeActivacion) {
    var result_task;
    var log = [];
    var log_error = [];
    var completed = 0;
    var total = Onus.length;
    var error = 0;
    var task = new tasks({
      title: "Activacion/Corte GPON",
      status: "Pendiente",
      description: "Activacion/Corte Onus",
      user: "-",
      Log: {
        log: log,
        log_error: log_error,
      },
    });
    await task.save(async function (err, task) {
      if (err) return log_error.push(err);
      log.push("Tarea creada");
    });
    if (log_error.length > 0) {
      return {
        status: false,
        log: log,
        log_error: log_error,
      };
    }
    var result = await this.SendMassCut(ListaDeCorte, ListaDeActivacion);
    await tasks.findByIdAndUpdate(
      task._id,
      {
        status: "Corte Realizado",
        Log: {
          log: result.LogAll,
          log_error: result.Log,
        },
        dateEnd: Date.now(),
        completed: result.CortesCompletados + result.ActivacionesCompletadas,
        total:
          result.CortesCompletados +
          result.ActivacionesCompletadas +
          result.ActivacionesFallidas +
          result.CortesFallidos,
        error: result.ActivacionesFallidas + result.CortesFallidos,
      },
      function (err, task) {
        if (err) return log_error.push(err);
      }
    );
    //Ejecuta los resync por cada onu
    log.push("Tarea finalizada...");
    //actualiza el estado de la tarea
    await tasks.findByIdAndUpdate(
      task._id,
      {
        status: "Finalizado",
        Log: {
          log: log,
          log_error: log_error,
        },
        dateEnd: Date.now(),
        completed: completed,
        total: total,
        error: error,
      },
      function (err, task) {
        if (err) return log_error.push(err);
      }
    );
    return {
      status: true,
      log: log,
      log_error: log_error,
    };
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
  async GetTraffic(OnuId, time) {
    try {
      let response = await axios({
        method: "get",
        url: `https://${this.subdomain}.smartolt.com/api/onu/get_onu_traffic_graph/${OnuId}/${time}`,
        headers: { "X-Token": this.API },
        responseType: "arraybuffer",
      });
      let image = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      return `data:${response.headers[
        "content-type"
      ].toLowerCase()};base64,${image}`;
    } catch (error) {
      console.log(error);
      return "error";
    }
  }
  async PlanList() {
    try {
      let response = await axios({
        method: "get",
        url: `https://${this.subdomain}.smartolt.com/api/system/get_speed_profiles`,
        headers: { "X-Token": this.API },
      });
      if (response.status == 200) {
        return response.data.response;
      } else {
        return "error";
      }
    } catch (error) {
      console.log(error);
    }
  }
  async BoardsList() {
    try {
      var Onus = await onus.find({
        Olt_id: this.OltId,
      });
      var ListaDeBoards = [];
      for (let index = 0; index < Onus.length; index++) {
        const element = Onus[index];
        if (!ListaDeBoards.includes(element.OltInfo.board)) {
          ListaDeBoards.push(element.OltInfo.board);
        }
      }
      return ListaDeBoards;
    } catch (error) {
      console.log(error);
    }
  }
  async PortList() {
    try {
      //make list of ports in Onus on mongo
      //onus
      var Onus = await onus.find({
        Olt_id: this.OltId,
      });
      var ListaDePuertos = [];
      for (let index = 0; index < Onus.length; index++) {
        const element = Onus[index];
        //verificar si el puerto esta en la lista de puertos
        if (!ListaDePuertos.includes(element.OltInfo.port)) {
          ListaDePuertos.push(element.OltInfo.port);
        }
      }
      return ListaDePuertos;
    } catch (error) {
      console.log(error);
    }
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
        ".smartolt.com/api/onu/get_all_onus_details?olt_id=" +
        Olt_Name,
      requestOptions
    )
      .then((response) => response.json())
      .then(async function (result) {
        //   console.log(result)
        //Save json file to mongoDB
        //console.log(result);
        if (result.status == false) {
          console.log("Error al obtener la lista de onus");
          return false;
        }
        const onusf = result.onus;
        for (const resultOlt of onusf) {
          await onus.findOne(
            {
              PON: resultOlt.sn,
            },
            async function (err, onu) {
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
                await newOnu.save(function (err, onu) {
                  if (err) return console.error(err);
                  //   console.log("Onu saved successfully");
                });
              } else {
                //update the onu
                onu.Olt_id = mongoose.Types.ObjectId(oltid);
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
                await onu.save(async function (err, onu) {
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
        Log.push("Grupo Cortado: " + JSON.stringify(response.data));
        if (Array.isArray(data.response) == true) {
          console.log("Es un array");
          for (var i = 0; i < data.response.length; i++) {
            Log.push("Arr Crt [" + CompleteCor + "]: " + data.response[i]);
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
            Log.push(ResultArray[i]);
            if (ResultArray[i].includes("No ONU was found")) {
              Log.push("For Crt [" + CompleteCor + "]: " + data.response[i]);
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
    try {
      let response = await axios({
        method: "post",
        url: `https://${this.subdomain}.smartolt.com/api/onu/enable/${Onu}`,
        headers: { "X-Token": this.API },
      });
      //console.log(response.data);
      //si es code 200
      this.UpdateOnu(Onu);
      if (response.status == 200) {
        return response.data;
      } else {
        return response.data;
      }
    } catch (error) {
      return {
        error: error,
        status: false,
      };
    }
  }
  async EnableOnu_Old(Onu) {
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
      .then(async function (result2) {
        console.log(result2);
        await fetch(
          `https://${subdomain}.smartolt.com/api/onu/get_onus_details_by_sn/` +
            Onu,
          requestOptionsGet
        )
          .then((response) => response.json())
          .then(async function (resultOltq) {
            var resultOlt = resultOltq.onus[0];
            console.log(resultOlt);
            await onus.findOne(
              {
                PON: resultOlt.sn,
              },
              async function (err, onu) {
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
                  await newOnu.save(function (err, onu) {
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
                  await onu.save(async function (err, onu) {
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
    try {
      let response = await axios({
        method: "post",
        url: `https://${this.subdomain}.smartolt.com/api/onu/disable/${Onu}`,
        headers: { "X-Token": this.API },
      });
      //console.log(response.data);
      //si es code 200
      this.UpdateOnu(Onu);
      if (response.status == 200) {
        return response.data;
      } else {
        return response.data;
      }
    } catch (error) {
      return {
        error: error,
        status: false,
      };
    }
  }
  async DisableOnu_Old(Onu) {
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
      .then(async function (result2) {
        console.log(result2);
      })
      .catch((error) => console.log("error", error));
    this.UpdateOnu(Onu);
    return { ok: true };
  }
  async ResyncOnu(Onu) {
    //subdomain
    var response = {
      status: false,
      error: "",
      LogMsg: "",
    };

    const oltid = this.OltId;
    const subdomain = this.subdomain;
    var requestOptions = {
      method: "POST",
      headers: {
        "X-Token": this.API,
      },
    };

    await fetch(
      `https://${subdomain}.smartolt.com/api/onu/resync_config/` + Onu,
      requestOptions
    )
      .then((response) => response.json())
      .then(async function (result2) {
        if (result2.status == true) {
          console.log(result2);
          //await this.UpdateOnu(Onu); Deberia de estar aqui
          response.status = true;
          response.LogMsg = result2.response;
        } else {
          response.status = false;
          response.error = result2.error;
          response.LogMsg = result2.error;
        }
      })
      .catch((error) => {
        console.log("error", error);
        response.status = false;
        response.error = error;
        response.LogMsg = error;
      });
    return response;
  }
  ResyncOnuSincronico(Onu) {
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
    fetch(
      `https://${subdomain}.smartolt.com/api/onu/resync_config/` + Onu,
      requestOptions
    )
      .then((response) => response.text())
      .then(async function (result2) {
        console.log(result2);
      })
      .catch((error) => console.log("error", error));
    return { ok: true };
  }
  async resyncMandao(Onus) {
    //crea una task para resincronizar las onus
    var result_task;
    var log = [];
    var log_error = [];
    var completed = 0;
    var total = Onus.length;
    var error = 0;
    var task = new tasks({
      title: "Resincronizar Onus",
      status: "Pendiente",
      description: "Resincronizar Onus",
      user: "-",
      Log: {
        log: log,
        log_error: log_error,
      },
    });
    await task.save(async function (err, task) {
      if (err) return log_error.push(err);
      log.push("Tarea creada");
    });
    if (log_error.length > 0) {
      return {
        status: false,
        log: log,
        log_error: log_error,
      };
    }
    //Ejecuta los resync por cada onu
    for (let i = 0; i < Onus.length; i++) {
      result_task = await this.ResyncOnu(Onus[i]);
      if (result_task.status == true) {
        log.push(result_task.LogMsg);
        completed++;
      } else {
        log_error.push(result_task.LogMsg);
        error++;
      }
      //actualiza el log de la tarea
      await tasks.findByIdAndUpdate(
        task._id,
        {
          Log: {
            log: log,
            log_error: log_error,
          },
          Count: i + 1,
          completed: completed,
          total: total,
          error: error,
        },
        function (err, task) {
          if (err) return log_error.push(err);
        }
      );
    }
    log.push("Tarea finalizada...");
    //actualiza el estado de la tarea
    await tasks.findByIdAndUpdate(
      task._id,
      {
        status: "Finalizado",
        Log: {
          log: log,
          log_error: log_error,
        },
        dateEnd: Date.now(),
        completed: completed,
        total: total,
        error: error,
      },
      function (err, task) {
        if (err) return log_error.push(err);
      }
    );
    return {
      status: true,
      log: log,
      log_error: log_error,
    };
  }
  async resyncTask(Onus) {
    var result_task;
    var log = [];
    var log_error = [];
    var completed = 0;
    var total = Onus.length;
    var error = 0;
    var task = new tasks({
      title: "Resincronizar Onus",
      status: "Pendiente",
      description: "Resincronizar Onus",
      user: "-",
      Log: {
        log: log,
        log_error: log_error,
      },
    });
    await task.save(async function (err, task) {
      if (err) return log_error.push(err);
      log.push("Tarea creada");
    });
    if (log_error.length > 0) {
      return {
        status: false,
        log: log,
        log_error: log_error,
      };
    }
    //Ejecuta los resync por cada onu
    for (let i = 0; i < Onus.length; i++) {
      result_task = await this.ResyncOnu(Onus[i].onuId);
      if (result_task.status == true) {
        log.push(result_task.LogMsg);
        completed++;
      } else {
        log_error.push(result_task.LogMsg);
        error++;
      }
      //actualiza el log de la tarea
      await tasks.findByIdAndUpdate(
        task._id,
        {
          Log: {
            log: log,
            log_error: log_error,
          },
          Count: i + 1,
          completed: completed,
          total: total,
          error: error,
        },
        function (err, task) {
          if (err) return log_error.push(err);
        }
      );
    }
    log.push("Tarea finalizada...");
    //actualiza el estado de la tarea
    await tasks.findByIdAndUpdate(
      task._id,
      {
        status: "Finalizado",
        Log: {
          log: log,
          log_error: log_error,
        },
        dateEnd: Date.now(),
        completed: completed,
        total: total,
        error: error,
      },
      function (err, task) {
        if (err) return log_error.push(err);
      }
    );
    return {
      status: true,
      log: log,
      log_error: log_error,
    };
  }

  async TestMandao() {
    //crea una task para resincronizar las onus
    var result_task;
    var log = [];
    var log_error = [];
    var completed = 0;
    var total = 2;
    var error = 0;
    var task = new tasks({
      title: "Prueba",
      status: "Pendiente",
      description: "Prueba",
      user: "-",
      Log: {
        log: [],
        log_error: [],
      },
    });
    await task.save(async function (err, task) {
      if (err) return log_error.push(err);
      log.push("Tarea creada");
    });
    if (log_error.length > 0) {
      return {
        status: false,
        log: log,
        log_error: log_error,
      };
    }
    //sleep 360 segundos
    await sleep(30000);
    log.push("Primeros 30 segundos");
    completed++;
    await tasks.findByIdAndUpdate(
      task._id,
      {
        Log: {
          log: log,
          log_error: log_error,
        },
        Count: completed,
        completed: completed,
        total: total,
        error: error,
      },
      function (err, task) {
        if (err) return log_error.push(err);
      }
    );
    await sleep(30000);
    log.push("Segundos 30 segundos");
    completed++;
    await tasks.findByIdAndUpdate(
      task._id,
      {
        Log: {
          log: log,
          log_error: log_error,
        },
        Count: completed,
        completed: completed,
        total: total,
        error: error,
      },
      function (err, task) {
        if (err) return log_error.push(err);
      }
    );
    await sleep(30000);
    log.push("terceros 30 segundos");
    completed++;
    await tasks.findByIdAndUpdate(
      task._id,
      {
        Log: {
          log: log,
          log_error: log_error,
        },
        Count: completed,
        completed: completed,
        total: total,
        error: error,
      },
      function (err, task) {
        if (err) return log_error.push(err);
      }
    );
    log.push("Tarea finalizada...");
    //actualiza el estado de la tarea
    await tasks.findByIdAndUpdate(
      task._id,
      {
        status: "Finalizado",
        Log: {
          log: log,
          log_error: log_error,
        },
        dateEnd: Date.now(),
        completed: completed,
        total: total,
        error: error,
      },
      function (err, task) {
        if (err) return log_error.push(err);
      }
    );
    return {
      status: true,
      log: log,
      log_error: log_error,
    };
  }
  async moveOnu(onuId, oltId, portId, boardId) {
    var data = new FormData();
    data.append("olt_id", oltId);
    data.append("board", boardId);
    data.append("port", portId);

    var config = {
      method: "post",
      url: "https://" + this.subdomain + ".smartolt.com/api/onu/move/" + onuId,
      headers: {
        "X-Token": this.API,
        ...data.getHeaders(),
      },
      data: data,
    };
    var response = await axios(config);
    await this.UpdateOnu(onuId);
    return response.data;
  }
  //536d6b6291059cb2602bcf4babc92525ad4660c9
  async moveTask(Onus) {
    //crea una task para mover las onus
    var result_task;
    var log = [];
    var log_error = [];
    var completed = 0;
    var total = Onus.length;
    var error = 0;
    var task = new tasks({
      title: "Mover Lista de Onus",
      status: "Pendiente",
      description: "Lista de Onus",
      user: "-",
      Log: {
        log: log,
        log_error: log_error,
      },
    });
    await task.save(async function (err, task) {
      if (err) return log_error.push(err);
      log.push("Tarea creada");
    });
    if (log_error.length > 0) {
      return {
        status: false,
        log: log,
        log_error: log_error,
      };
    }
    for (let i = 0; i < Onus.length; i++) {
      result_task = await this.moveOnu(
        Onus[i].onuId,
        Onus[i].oltId,
        Onus[i].portId,
        Onus[i].boardId
      );
      if (result_task.status == true) {
        log.push(result_task.response);
        completed++;
      } else {
        log_error.push(result_task.error);
        error++;
      }
      await tasks.findByIdAndUpdate(
        task._id,
        {
          Log: {
            log: log,
            log_error: log_error,
          },
          Count: i + 1,
          completed: completed,
          total: total,
          error: error,
        },
        function (err, task) {
          if (err) return log_error.push(err);
        }
      );
    }
    log.push("Tarea finalizada...");
    //actualiza el estado de la tarea
    await tasks.findByIdAndUpdate(
      task._id,
      {
        status: "Finalizado",
        Log: {
          log: log,
          log_error: log_error,
        },
        dateEnd: Date.now(),
        completed: completed,
        total: total,
        error: error,
      },
      function (err, task) {
        if (err) return log_error.push(err);
      }
    );
    return {
      status: true,
      log: log,
      log_error: log_error,
    };
  }
}

function OpenSmartSdk(options) {
  return new SmartOltSDKByAP(options);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = OpenSmartSdk;
