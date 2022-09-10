const express = require("express");
const router = express.Router();
//import mogoose
const mongoose = require("mongoose");
const Olts = require("../models/Olts");
//require the controller
const fetch = require("node-fetch");
const axios = require("axios");
const Headers = require("node-fetch");
const fs = require("fs");
const { APIKEY, Subdomain } = require("../ConfigServer");

const onus = require("../models/onus"); //190.97
const excelToJson = require("convert-excel-to-json");
const multer = require("multer");
const OpenSmartSdk = require("../Controllers/OltFrameworkSmartOlt");
const OpenTplinkOltSdk = require("../Controllers/OltFrameworktelnet");
const OpenSmartSdkMixed = require("../Controllers/OltFrameworkSmartOltMixedTelnet");
//socket.io
//smartoltMixed
const path = require("path");

//SET STORAGE
const storage = multer.diskStorage({
  destination: "./src/upload",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
var upload = multer({ storage: storage });
//obtener subdomain y token en Auth.json
//create a olts
router.post("/NewOlt", async (req, res) => {
  try {
    const {
      Descrip,
      latitude,
      longitude,
      State,
      City,
      ip,
      Method,
      Olt_Name,
      Model,
      User,
      Pass,
    } = req.body;
    const olt = new Olts({
      Descrip,
      latitude,
      longitude,
      State,
      City,
      ip,
      Method,
      Olt_Name,
      Model,
      User,
      Pass,
    });
    await olt.save();
    res.json({
      status: "ok",
      message: "Olt saved",
    });
  } catch (error) {
    res.json({
      status: "error",
      message: error.message,
    });
  }
});
//get all olts
router.get("/", async (req, res) => {
  try {
    const olts = await Olts.find();
    //if olt is empty
    if (olts.length == 0) {
      res.status(404).send({
        message: "No se encontraron OLTs",
      });
    } else {
      res.status(200).send(olts);
    }
  } catch (err) {
    res.json({ message: err });
  }
});

router.post(
  "/Upload/:OltId",
  upload.single("uploaded_file"),
  async function (req, res, next) {
    Id = req.params.OltId;
    //find Olt by Id
    const olt = await Olts.findById(Id);
    //create a new instance of the OpenSmartSdk
    if (!olt) return res.status(404).send({ message: "No existe la OLT" });
    console.log(req.file);
    const result = excelToJson({
      sourceFile: req.file.path,
    });
    json = await GenerateList(result);
    console.log(json);
    res.json(json);
  }
);
router.post(
  "/UploadPlans/:OltId",
  upload.single("uploaded_file"),
  async function (req, res, next) {
    Id = req.params.OltId;
    //find Olt by Id
    const olt = await Olts.findById(Id);
    //create a new instance of the OpenSmartSdk
    if (!olt) return res.status(404).send({ message: "No existe la OLT" });
    console.log(req.file);
    const result = excelToJson({
      sourceFile: req.file.path,
    });
    json = await GenerateListPlans(result);
    console.log(json);
    res.json(json);
  }
);
router.post(
  "/UploadMove/:OltId",
  upload.single("uploaded_file"),
  async function (req, res, next) {
    Id = req.params.OltId;
    //find Olt by Id
    const olt = await Olts.findById(Id);
    //create a new instance of the OpenSmartSdk
    if (!olt) return res.status(404).send({ message: "No existe la OLT" });
    console.log(req.file);
    const result = excelToJson({
      sourceFile: req.file.path,
    });
    json = await GenerateListMove(result);
    console.log(json);
    res.json(json);
  }
);
router.post(
  "/UploadReSync/:OltId",
  upload.single("uploaded_file"),
  async function (req, res, next) {
    Id = req.params.OltId;
    //find Olt by Id
    const olt = await Olts.findById(Id);
    //create a new instance of the OpenSmartSdk
    if (!olt) return res.status(404).send({ message: "No existe la OLT" });
    console.log(req.file);
    const result = excelToJson({
      sourceFile: req.file.path,
    });
    json = await GenerateListReSync(result);
    console.log(json);
    res.json(json);
  }
);
//GenerateListReSync
router.get("/Lista/:OltId", async function (req, res) {
  //id get from get request
  Id = req.params.OltId;
  console.log(Id);
  const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
  //if olt no exist return error
  if (!olt) return res.status(404).send({ message: "No existe la OLT" });
  if (olt.Method == "smartoltMixed") {
    ListaDeCorte = req.body.ListaDeCorte;
    ListaDeActivacion = req.body.ListaDeActivacion;
    const oss = new OpenSmartSdkMixed({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    //Result = await oss.ClientList(IdOnu);
    res.json(Result);
  } else if (olt.Method == "smartolt") {
    const oss = new OpenSmartSdk({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    Result = await oss.ClientList();
    //const Olt_Name = await this.GetOltName(oltid);
    console.log(Result);
    //get all onus
    onus.find(
      {
        Olt_id: Id,
      },
      async (err, onu) => {
        if (err)
          return res
            .status(500)
            .send({ message: `Error al realizar la petición: ${err}` });
        if (!onu) return res.status(404).send({ message: "No existen ONUs" });
        res.status(200).send({ onu });
      }
    );
  } else if (olt.Method == "telnet") {
    //modelo tplink
    if (olt.Model == "tplink") {
      console.log("telnet");
      const oss = new OpenTplinkOltSdk({
        OltId: Id,
        user: olt.User,
        pass: olt.Pass,
        ip: olt.ip,
      });
      var Result = await oss.ClientList();
      onus.find(
        {
          Olt_id: Id,
        },
        async (err, onu) => {
          if (err)
            return res
              .status(500)
              .send({ message: `Error al realizar la petición: ${err}` });
          if (!onu) return res.status(404).send({ message: "No existen ONUs" });
          res.status(200).send({ onu });
        }
      );
    } else {
      res.json({ message: "Equipo no soportado" });
    }
  } else {
    res.json({ message: "Framework no soportado" });
  }
});
router.get("/DisableOnu/:id/:OltId", async function (req, res) {
  var IdOnu = req.params.id;
  var Id = req.params.OltId;
  const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
  //if olt no exist return error
  if (!olt) return res.status(404).send({ message: "No existe la OLT" });
  if (olt.Method == "smartoltMixed") {
    ListaDeCorte = req.body.ListaDeCorte;
    ListaDeActivacion = req.body.ListaDeActivacion;
    const oss = new OpenSmartSdkMixed({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    Result = await oss.DisableOnu(IdOnu);
    res.json(Result);
  } else if (olt.Method == "smartolt") {
    const oss = new OpenSmartSdk({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    Result = await oss.DisableOnu(IdOnu);
    res.json(Result);
  } else if (olt.Method == "telnet") {
    //modelo tplink
    if (olt.Model == "tplink") {
      const oss = new OpenTplinkOltSdk({
        OltId: Id,
        user: olt.User,
        pass: olt.Pass,
        ip: olt.ip,
      });
      var Result = await oss.DisableOnu(IdOnu);
      res.json(Result);
    } else {
      res.json({ message: "Equipo no soportado" });
    }
  } else {
    res.json({ message: "Framework no soportado" });
  }
});
router.get("/EnableOnu/:id/:OltId", async function (req, res) {
  var IdOnu = req.params.id;
  var Id = req.params.OltId;
  const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
  //if olt no exist return error
  if (!olt) return res.status(404).send({ message: "No existe la OLT" });

  if (olt.Method == "smartoltMixed") {
    const oss = new OpenSmartSdkMixed({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    Result = await oss.EnableOnu(IdOnu);
    res.json(Result);
  } else if (olt.Method == "smartolt") {
    const oss = new OpenSmartSdk({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    Result = await oss.EnableOnu(IdOnu);
    res.json(Result);
  } else if (olt.Method == "telnet") {
    //modelo tplink
    if (olt.Model == "tplink") {
      const oss = new OpenTplinkOltSdk({
        OltId: Id,
        user: olt.User,
        pass: olt.Pass,
        ip: olt.ip,
      });
      var Result = await oss.EnableOnu(IdOnu);
      res.json(Result);
    } else {
      res.json({ message: "Equipo no soportado", ok: false });
    }
  } else {
    res.json({ message: "Framework no soportado", ok: false });
  }
});
router.post("/SendMassCut/:OltId", async function (req, res) {
  Id = req.params.OltId;
  console.log(Id);
  const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
  if (!olt) return res.status(404).send({ message: "No existe la OLT" });
  if (olt.Method == "smartoltMixed") {
    ListaDeCorte = req.body.ListaDeCorte;
    ListaDeActivacion = req.body.ListaDeActivacion;
    const oss = new OpenSmartSdkMixed({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    Result = await oss.SendMassCut(ListaDeCorte, ListaDeActivacion);
    res.json(Result);
  } else if (olt.Method == "smartolt") {
    ListaDeCorte = req.body.ListaDeCorte;
    ListaDeActivacion = req.body.ListaDeActivacion;
    const oss = new OpenSmartSdk({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    Result = oss.SendMassCut_Task(ListaDeCorte, ListaDeActivacion);
    res.json({
      message: "Tarea enviada",
      ok: true,
      status: true,
    });
  } else if (olt.Method == "telnet") {
    //modelo tplink
    if (olt.Model == "tplink") {
      console.log("telnet");
      const oss = new OpenTplinkOltSdk({
        OltId: Id,
        user: olt.User,
        pass: olt.Pass,
        ip: olt.ip,
      });
      var Result = await oss.SendMassCut(ListaDeCorte, ListaDeActivacion);
      res.json(Result);
    } else {
      res.json({ message: "Equipo no soportado" });
    }
  } else {
    res.json({ message: "Framework no soportado" });
  }
});
//SendMassMove
router.post("/SendMassMove/:OltId", async function (req, res) {
  Id = req.params.OltId;
  console.log(Id);
  const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
  if (!olt) return res.status(404).send({ message: "No existe la OLT" });
  if (olt.Method == "smartolt") {
    Lista = req.body.Lista;
    const oss = new OpenSmartSdk({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    Result = oss.moveTask(Lista);
    res.json({
      message: "Tarea enviada",
      ok: true,
      status: true,
    });
  } else {
    res.json({ message: "Equipo no soportado" });
  }
});
router.post("/SendMassReSync/:OltId", async function (req, res) {
  Id = req.params.OltId;
  console.log(Id);
  const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
  if (!olt) return res.status(404).send({ message: "No existe la OLT" });
  if (olt.Method == "smartolt") {
    Lista = req.body.Lista;
    const oss = new OpenSmartSdk({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    Result = oss.resyncTask(Lista);
    res.json({
      message: "Tarea enviada",
      ok: true,
      status: true,
    });
  } else {
    res.json({ message: "Equipo no soportado" });
  }
});
router.post("/SendMassPlans/:OltId", async function (req, res) {
  Id = req.params.OltId;
  console.log(Id);
  const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
  if (!olt) return res.status(404).send({ message: "No existe la OLT" });
  if (olt.Method == "smartolt") {
    Lista = req.body.Lista;
    const oss = new OpenSmartSdk({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    Result = await oss.SendMassPlans(Lista);
    res.json(Result);
  } else {
    res.json({ message: "Equipo no soportado" });
  }
});

async function GenerateListPlans(result) {
  this.Lista = [];
  var ListaIndex = 0;
  console.log(result);
  for (let index = 1; index < result["Ont"].length; index++) {
    var ONU = result["Ont"][index].B;
    var PLAN = result["Ont"][index].C;
    if (ONU !== "" && PLAN !== "") {
      //A es la onu y B es el PLAN
      Lista.push({
        PON: ONU,
        Plan: PLAN,
      });
    }
  }
  return Lista;
}
async function GenerateListMove(result) {
  this.Lista = [];
  var ListaIndex = 0;
  console.log(result);
  for (let index = 1; index < result["Ont"].length; index++) {
    var ONU = result["Ont"][index].B;
    var OLT = result["Ont"][index].C;
    var BOARD = result["Ont"][index].D;
    var PORT = result["Ont"][index].E;

    if (ONU !== "" && OLT !== "" && BOARD !== "" && PORT !== "") {
      //A es la onu y B es el PLAN
      Lista.push({
        onuId: ONU,
        oltId: OLT,
        portId: PORT,
        boardId: BOARD,
      });
    }
  }
  return Lista;
}
async function GenerateListReSync(result) {
  this.Lista = [];
  var ListaIndex = 0;
  console.log(result);
  for (let index = 1; index < result["Ont"].length; index++) {
    var ONU = result["Ont"][index].B;
    var BOARD = result["Ont"][index].C;
    var PORT = result["Ont"][index].D;

    if (ONU !== "" && BOARD !== "" && PORT !== "") {
      //A es la onu y B es el PLAN
      Lista.push({
        onuId: ONU,
        portId: PORT,
        boardId: BOARD,
      });
    }
  }
  return Lista;
}
async function GenerateList(result) {
  this.ListaDeCorte = [];
  this.ListaDeActivacion = [];
  var ListaDeCorteIndex = 0;
  var ListaDeActivacionIndex = 0;
  console.log(result);
  for (let index = 1; index < result["Ont"].length; index++) {
    var A = result["Ont"][index].B;
    var B = result["Ont"][index].C;
    if (A !== "") {
      console.log(A);
      if (B == "FALSE") {
        console.log("Esta va para lista de corte");
        ListaDeCorte[ListaDeCorteIndex] = A;
        ListaDeCorteIndex = ListaDeCorteIndex + 1;
      } else {
        console.log("Esta va para lista de activacion");
        ListaDeActivacion[ListaDeActivacionIndex] = A;
        ListaDeActivacionIndex = ListaDeActivacionIndex + 1;
      }
    }
  }

  //Procesando lista de corte
  //Limite 10 en 10
  var contador10 = 0;
  var tmpListaCorte = "";
  return { ListaDeCorte: ListaDeCorte, ListaDeActivacion: ListaDeActivacion };
}
module.exports = router;
