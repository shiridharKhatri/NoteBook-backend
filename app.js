const connectToServer = require("./database");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
connectToServer();
app.use(cors());
app.use(express.json());
app.use("/auth", require("./routes/users"));
app.use("/notes", require("./routes/notes"));
app.use("/photo", require("./routes/avatar"));
app.use("/images", express.static("./images"));
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, './client/public/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})
app.listen(PORT, () => {
  console.log(`Connected to port ${PORT}`);
});
