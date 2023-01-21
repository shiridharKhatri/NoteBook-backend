const express = require("express");
const Users = require("../model/Users");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const fetchusers = require("../middleware/fetchusers");
router.post(
  "/signup",
  [
    body("name", "Name must contain atleast 3 character").isLength({ min: 3 }),
    body("email", "Please enter valid email address").isEmail(),
    body(
      "password",
      "Passwords must be 6 characters long and include at least one capital letter, a number, and special character"
    ).isStrongPassword(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(406)
        .json({ status: 406, success: false, errors: errors.array() });
    }
    try {
      let user = await Users.findOne({ email: req.body.email });
      if (user) {
        return res.status(409).json({
          status: 409,
          success: false,
          msg: "User with this email already exist",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const secPassword = await bcrypt.hash(req.body.password, salt);
      user = await Users.create({
        name: req.body.name,
        profession: req.body.profession,
        email: req.body.email,
        password: secPassword,
      });
      const data = {
        users: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, secret);
      res.send({ success: true, token: token });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  }
);

router.post(
  "/login",
  [
    body("email", "Invalid Email").isEmail(),
    body("password", "Invalid passowrd").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ success: false, errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await Users.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          msg: "Please Login With Correct Crediential",
        });
      }
      let compPassword = await bcrypt.compare(password, user.password);
      if (!compPassword) {
        return res.status(401).json({
          success: false,
          msg: "Please Login With Correct Crediential",
        });
      }
      const data = {
        users: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, secret);
      res.send({ success: true, token: token });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  }
);
router.post("/fetchuser", fetchusers, async (req, res) => {
  try {
    let userId = req.user.id;
    let user = await Users.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
});
module.exports = router;