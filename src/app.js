const express = require("express");
const config = require("config");
const sharp = require("sharp");
const { Storage } = require("@google-cloud/storage");

const storage = new Storage();

// Image settings
const IMAGE_MAX_WIDTH = 800;

// Express setup
const app = express();
app.use(express.json());
const port = process.env.PORT || 8080;

app.post("/", async (req, res) => {
  console.log(req.body);
  res.status(200).send();
});

app.listen(port, () => console.log(`Instance started on port ${port}`));
