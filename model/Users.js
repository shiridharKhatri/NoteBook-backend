const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  profession: {
    type: String,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  token: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Users_Data", userSchema);
