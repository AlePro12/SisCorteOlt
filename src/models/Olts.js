const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the schema
/*{
"Olt_id" : 1,
"Descrip" : "Punta Gorda",
"MapX" : 0,
"MapY" : 0,
"ip" : "10.60.0.10",
"Method" : "telnet"
}
  */
const Olts = new Schema({
  Olt_id: { type: Number, required: false },
  Descrip: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  State: { type: String, required: true },
  City: { type: String, required: true },
  ip: { type: String, required: true },
  Method: { type: String, required: true },
  Olt_Name: { type: String, required: true },
  Model: { type: String, required: true },
  User: { type: String, required: true },
  Pass: { type: String, required: true },
  Status: { type: String, required: true, default: "Active" },
  Last_update: {
    type: Date,
    required: true,
    default: Date.now,
  },
  Last_status: { type: String, required: true, default: "Active" },
  Last_status_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});
// Export the model
module.exports = mongoose.model("Olts", Olts);
