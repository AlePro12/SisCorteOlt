const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const onus = require("../models/onus");
const Olts = require("../models/Olts");
const OpenSmartSdk = require("../Controllers/OltFrameworkSmartOlt");

//update name onus mongodb
router.get("/getOnu/:PON", (req, res) => {
  onus
    .find({ PON: req.params.PON }, (err, onu) => {
      if (err)
        return res
          .status(500)
          .send({ message: `Error al realizar la petición: ${err}` });
      if (!onu) return res.status(404).send({ message: "No existen ONUs" });
      res.status(200).send(onu);
    })
    .sort({ _id: -1 });
});
router.get("/Plans/:Oltid", async function (req, res) {
  var Id = req.params.Oltid;
  const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
  if (olt.Method == "smartolt") {
    const oss = new OpenSmartSdk({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    var Result = await oss.PlanList();
    res.json(Result);
  } else {
    res.json({ message: "Equipo no soportado" });
  }
}); //Boards
router.get("/Boards/:Oltid", async function (req, res) {
  var Id = req.params.Oltid;
  const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
  if (olt.Method == "smartolt") {
    const oss = new OpenSmartSdk({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    var Result = await oss.BoardsList();
    res.json(Result);
  } else {
    res.json({ message: "Equipo no soportado" });
  }
});

router.get("/Ports/:Oltid", async function (req, res) {
  var Id = req.params.Oltid;
  const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
  if (olt.Method == "smartolt") {
    const oss = new OpenSmartSdk({
      OltId: Id,
      API: olt.User,
      subdomain: olt.ip,
    });
    var Result = await oss.PortList();
    res.json(Result);
  } else {
    res.json({ message: "Equipo no soportado" });
  }
});
router.get("/getTraffic/:PON/:OLT", async (req, res) => {
  Id = req.params.OLT;
  PON = req.params.PON;
  console.log(Id);
  const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
  //if olt no exist return error
  if (!olt) return res.status(404).send({ message: "No existe la OLT" });

  const oss = new OpenSmartSdk({
    OltId: req.params.OLT,
    API: olt.User,
    subdomain: olt.ip,
  });
  var Result = await oss.GetTraffic(PON, "hourly");
  var base64Data = Result.replace(/^data:image\/png;base64,/, "");
  var img = Buffer.from(base64Data, "base64");

  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": img.length,
  });
  res.end(img);
  //set Content-type: image/png
  //res.setHeader("Content-Type", "image/png");
  //res.send(Result);
}),
  router.get("/Resync/:PON/:OLT", async (req, res) => {
    Id = req.params.OLT;
    PON = req.params.PON;
    console.log(Id);
    const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
    //if olt no exist return error
    if (!olt) return res.status(404).send({ message: "No existe la OLT" });
    const oss = new OpenSmartSdk({
      OltId: req.params.OLT,
      API: olt.User,
      subdomain: olt.ip,
    });
    var Result = await oss.ResyncOnu(PON);
    res.json(Result);
  }),
  router.get("/ChangePlan/:Plan/:PON/:OLT", async (req, res) => {
    Id = req.params.OLT;
    PON = req.params.PON;
    Plan = req.params.Plan;
    console.log(Id);
    const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
    //if olt no exist return error
    if (!olt) return res.status(404).send({ message: "No existe la OLT" });
    const oss = new OpenSmartSdk({
      OltId: req.params.OLT,
      API: olt.User,
      subdomain: olt.ip,
    });
    var Result = await oss.SetPlan(PON, Plan);
    res.status(Result.status).json(Result);
  }),
  router.get("/ResyncAll/:Port/:Board/:OLT", async (req, res) => {
    Id = req.params.OLT;
    Port = req.params.Port;
    Board = req.params.Board;
    console.log(Id);
    const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
    //if olt no exist return error
    if (!olt) return res.status(404).send({ message: "No existe la OLT" });
    const oss = new OpenSmartSdk({
      OltId: req.params.OLT,
      API: olt.User,
      subdomain: olt.ip,
    });
    //db.getCollection('onus').find({ 'OltInfo.port':  "1", Olt_id: ObjectId("62f998ff4a7158a26a462c9e")})
    var onus_e = await onus.find({
      "OltInfo.port": Port,
      Olt_id: Id,
      "OltInfo.board": Board,
    });
    //if onus no exist return error
    if (!onus_e) return res.status(404).send({ message: "No existen ONUs" });
    //resync all onus
    OnusResync = [];
    for (var i = 0; i < onus_e.length; i++) {
      OnusResync.push(onus_e[i].PON);
    }
    console.log(OnusResync);
    oss.resyncMandao(OnusResync);
    res.json({
      message: "Resincronización de ONUs en proceso",
      status: true,
    });
  }),
  router.get("/Testmandao/:OLT", async (req, res) => {
    Id = req.params.OLT;
    PON = req.params.PON;
    Port = req.params.Port;
    console.log(Id);
    const olt = await Olts.findById(mongoose.Types.ObjectId(Id));
    //if olt no exist return error
    if (!olt) return res.status(404).send({ message: "No existe la OLT" });
    const oss = new OpenSmartSdk({
      OltId: req.params.OLT,
      API: olt.User,
      subdomain: olt.ip,
    });
    //find onus by port
    var onus_e = await onus.find({ PON: PON });
    //if onus no exist return error
    if (!onus_e) return res.status(404).send({ message: "No existen ONUs" });
    //resync all onus
    oss.TestMandao();
    res.json({
      message: "Test en proceso",
      status: true,
    });
  }),
  router.put("/edit/:id", async (req, res) => {
    try {
      const { name } = req.body;
      console.log(req.params.id);
      console.log(name);
      //find onu by id
      const onu = await onus.findById(req.params.id);
      //if onu no exist return error
      if (!onu) return res.status(404).send({ message: "No existe la ONU" });
      //update onu Nombre
      onu.LocalInfo = {
        AdminState: onu.LocalInfo.AdminState,
        Nombre: name,
        Direccion: onu.LocalInfo.Direccion,
        Telefono: onu.LocalInfo.Telefono,
        Correo: onu.LocalInfo.Correo,
        status: onu.LocalInfo.status,
        signal: onu.LocalInfo.signal,
      };
      await onu.save();

      res.json({
        status: true,
      });
    } catch (err) {
      res.json({
        status: false,
      });
    }
  });

module.exports = router;
