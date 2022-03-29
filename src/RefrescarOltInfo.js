//import moongose from 'mongoose';
const express = require('express');
const router = express.Router();
const { Olt } = require('../models/olt');




function getOltInfo(req, res) {
    Olt.find({}, (err, olt) => {
        if (err) {
            res.send(err);
        }
        res.json(olt);
    });
}
//make a function to update OltSchema
function updateOltInfo(Descrip, MapX, MapY, ip, Method, Status, Last_status) {
    Olt.findOneAndUpdate({ Olt_id: Olt_id }, {
            $set: {
                Descrip: Descrip,
                MapX: MapX,
                MapY: MapY,
                ip: ip,
                Method: Method,
                Status: Status,
                Last_status: Last_status,
                Last_status_date: Last_status_date
            }
        }, { new: true },
        (err, olt) => {
            if (err) {
                console.log(err);
            }
            console.log(olt);
        });
}




module.exports = router;