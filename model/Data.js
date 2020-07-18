const mongoose = require("mongoose");

const UserDataSchema = new mongoose.Schema({
  loggedUser: {
    type: String,
    required: true,
  },
  job_number: {
    type: Number,
  },
  job_description: {
    type: String,
  },
  job_hours: {
    type: Number,
  },
  // date: {
  //   type: Date,
  //   default: Date.now,
  // }
  date: {
    type: String,
  },
});

const UserData = mongoose.model("UserData", UserDataSchema);

module.exports = UserData;
