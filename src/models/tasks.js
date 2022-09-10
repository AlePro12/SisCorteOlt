const mongoose = require("mongoose");
const { Schema } = mongoose;

const TaskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dateInit: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dateEnd: {
    type: Date,
    required: false,
  },
  user: {
    type: String,
    required: true,
  },
  Log: {
    type: Object,
    required: false,
  },
  Count: {
    type: Number,
    required: false,
  },
  completed: {
    type: Number,
    required: false,
  },
  total: {
    type: Number,
    required: false,
  },
  error: {
    type: Number,
    required: false,
  },
});

//export the model
module.exports = mongoose.model("Task", TaskSchema);
