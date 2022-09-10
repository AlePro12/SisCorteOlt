const mongoose = require("mongoose");
const { Schema } = mongoose;

// Create Schema for Users
const UsersSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  Username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  //add role
  role: {
    type: String,
    default: "user",
  },
  olts: {
    type: Array,
    required: true,
    ref: "Olt",
  },
  actions: {
    type: Array,
    required: true,
    ref: "Action",
  },
  // Permisologia por zona
});
//export Users model

//add user  function
UsersSchema.statics.addUser = function (user) {
  const newUser = new this(user);
  return newUser.save();
};

module.exports = mongoose.model("Users", UsersSchema);
