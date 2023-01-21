const mongoose = require("mongoose");
const noteSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users_Data",
  },
  title: {
    type: String,
    require: true,
  },
  discription: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Notes_Details", noteSchema);
