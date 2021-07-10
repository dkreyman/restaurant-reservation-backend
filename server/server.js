const express = require("express");
const cors = require("cors");

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 5000;

router.get("/", cors(), (req, res) => {
  res.json({ message: "Hello Heroku!" });
});

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT} `);
});

module.exports = app;
