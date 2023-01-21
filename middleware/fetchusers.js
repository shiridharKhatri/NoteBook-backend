const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const fetchusers = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return res.status(401).json({ msg: "Please Enter Correct Token" });
    }
    let data = await jwt.verify(token, secret);
    req.user = data.users;
  } catch (error) {
    return res.status(400).json({ msg: error });
  }
  next();
};
module.exports = fetchusers;
