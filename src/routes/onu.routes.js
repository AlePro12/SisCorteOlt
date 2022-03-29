const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const onus = require('../models/onus');

//update name onus mongodb
router.put('/edit/:id', async(req, res) => {
    try {
        const {
            name
        } = req.body;
        console.log(req.params.id)
        console.log(name)
            //find onu by id 
        const onu = await onus.findById(req.params.id);
        //if onu no exist return error
        if (!onu) return res.status(404).send({ message: 'No existe la ONU' });
        //update onu Nombre
        onu.LocalInfo = {
            AdminState: onu.LocalInfo.AdminState,
            Nombre: name,
            Direccion: onu.LocalInfo.Direccion,
            Telefono: onu.LocalInfo.Telefono,
            Correo: onu.LocalInfo.Correo,
            status: onu.LocalInfo.status,
            signal: onu.LocalInfo.signal
        };
        await onu.save();

        res.json({
            status: true
        });
    } catch (err) {
        res.json({
            status: false
        });
    }
});

module.exports = router;