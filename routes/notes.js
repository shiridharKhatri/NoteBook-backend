const Notes = require("../model/Notes");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const fetchusers = require("../middleware/fetchusers");
router.post(
  "/addnote",
  [
    body("title").isLength({ min: 2 }),
    body("discription").isLength({ min: 4 }),
  ],
  fetchusers,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ success: false, errors: errors.array() });
    }
    try {
      const { title, discription } = req.body;
      let notes = await new Notes({
        title,
        discription,
        user: req.user.id,
      });
      const savedNotes = await notes.save();
      res.json({ success: true, savedNotes });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  }
);
router.get("/fetchnotes", fetchusers, async (req, res) => {
  try {
    let notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
});
router.put("/updatenote/:id", fetchusers, async (req, res) => {
  try {
    const { title, discription } = req.body;
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (discription) {
      newNote.discription = discription;
    }
    let validUserNote = await Notes.findById(req.params.id);
    if (!validUserNote) {
      return res.status(404).json({ msg: "Not Found" });
    }
    if (validUserNote.user.toString() !== req.user.id) {
      return res
        .status(405)
        .json({ msg: "Not Allowed! You dont have access to edit this note" });
    }
    validUserNote = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    const savedNote = await validUserNote.save();
    res.json({ success: true, data: savedNote });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
});

router.delete("/deletenote/:id", fetchusers, async (req, res) => {
  try {
    let validUserNote = await Notes.findById(req.params.id);
    if (!validUserNote) {
      return res.status(404).json({ msg: "Not Found" });
    }
    if (validUserNote.user.toString() !== req.user.id) {
      return res
        .status(405)
        .json({ msg: "Not Allowed! You dont have access to edit this note" });
    }
    validUserNote = await Notes.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Success! Note deleted successfully" });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
});

module.exports = router;
