const mongoose = require("mongoose");
const avatarSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users_Data",
  },
  avatar: {
    type: String,
  },
  date:{
    type:Date,
    default:Date.now
  }
});
module.exports = mongoose.model("avatar", avatarSchema);
