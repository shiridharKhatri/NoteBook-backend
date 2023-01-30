const express = require("express");
const Users = require("../model/Users");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const fetchusers = require("../middleware/fetchusers");
const sendEmailVerificationCode = require("../Mail/nodeMailer");
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
    res.send({ success: true, user: user });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
});

router.post("/forgetPassword", async (req, res) => {
  const { email } = req.body;
  try {
    let user = await Users.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "User with this email doesn't exist, try again",
      });
    }
    let token = Math.floor(Math.random() * 899999 + 100000);
    user = await Users.findByIdAndUpdate(user._id, {
      $set: { token: token },
    });

    sendEmailVerificationCode(user.email, user.name, token);
    res.send({
      success: true,
      msg: `We sent you a message containing 6-digit authentication code in ${user.email}. Please, open it on your device or check spam and enter the code below.`,
    });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
});

router.post(
  "/tokenValidation",
  [body("password").isStrongPassword()],
  async (req, res) => {
    try {
      const { token, email } = req.body;
      let user = await Users.findOne({ email: email });
      if (!user) {
        return res.status(401).json({
          success: false,
          msg: "Email doesn't exist",
        });
      }
      if (user.token === token) {
        user = await Users.findByIdAndUpdate(
          user._id,
          { $set: { token: "" } },
          { new: true }
        );
        res.send({
          success: true,
        });
      } else if (user.token === "") {
        res.send({
          success: false,
          msg: "Invalid code! Please try with valid code",
        });
      } else {
        res.send({
          success: false,
          msg: "Provided code is not valid try with valid code",
        });
      }
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  }
);

router.put("/changePassword", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await Users.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "Email doesn't exist",
      });
    }
    let comparePas = await bcrypt.compare(password, user.password);
    let validation = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if (!validation.test(password)) {
      res.send({
        success: false,
        msg: "Passwords must be 6 characters long and include at least one capital letter, a number, and special character",
      });
    } else if (comparePas) {
      res.send({
        success: false,
        msg: "Your have entered your current password try another one",
      });
    } else {
      let salt = await bcrypt.genSalt(10);
      let secPass = await bcrypt.hash(password, salt);
      user = await Users.findByIdAndUpdate(
        user._id,
        { $set: { password: secPass } },
        { new: true }
      );
      res.send({
        success: true,
        msg: "Password has been changed successfully",
      });
    }
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
});

router.delete('/deleteAccount', fetchusers, async(req,res)=>{
  try {
    const {email} = req.body;
    let userId = req.user.id;
    let user = await Users.findById(userId);
  if(email === user.email){
    user = await Users.findByIdAndDelete(user._id)
    res.send({success:true, msg:"Account deleted successfully"})
  }else{
    res.send({success:false, msg:"Please enter your correct email address"})
  }
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
})
module.exports = router;
