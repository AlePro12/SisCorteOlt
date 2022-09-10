const express = require("express");
const router = express.Router();
const Task = require("../models/tasks");
//const { isAuthenticated } = require('../helpers/auth');

router.get("/tasks", async (req, res) => {
  //finalizado para abajo y Pendiente para arriba
  const tasks = await Task.find().sort({ dateInit: "desc" }).lean();
  res.json(tasks);
});
//get task pendientes
router.get("/tasks/pendientes", async (req, res) => {
  const tasks = await Task.find({ status: "Pendiente" });
  res.json(tasks);
});
router.get("/tasks/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);
  res.json(task);
});

module.exports = router;
