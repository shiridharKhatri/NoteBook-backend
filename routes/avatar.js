const express = require("express");
const Avatar = require("../model/Avatar");
const router = express();
const multer = require("multer");
const fetchusers = require("../middleware/fetchusers");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${file.originalname}`);
  },
});
const update = multer({
  storage: storage,
  limits: { fileSize: "50mb" },
}).single("avatar");
router.post("/avatar", fetchusers, update, async (req, res) => {
  try {
    const photo = await Avatar.create({
      avatar: req.file.filename,
      user: req.user.id,
    });
    const savePhoto = await photo.save();
    res.json({ success: true, savePhoto });
  } catch (error) {
    return res
      .status(400)
      .json({ msg: "Some error occur ", error: error.message });
  }
});
router.get("/fetchAvatar", fetchusers, async (req, res) => {
  try {
    const photo = await Avatar.find({ user: req.user.id });
    res.json(photo);
  } catch (error) {
    return res
      .status(400)
      .json({ msg: "Some error occur in the server", error: error.message });
  }
});

router.delete("/deleteAvatar/:id", fetchusers, async (req, res) => {
  try {
    let avatar = await Avatar.findById(req.params.id);
    if (!avatar) {
      return res.status(404).json({ msg: "Not Found" });
    }
    if (avatar.user.toString() !== req.user.id) {
      return res.status(405).json({
        msg: "Not Allowed! You dont have access to delete this image",
      });
    }
    avatar = await Avatar.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, msg: "Success! Photo deleted successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, msg: "Some Error occured" });
  }
});
module.exports = router;
