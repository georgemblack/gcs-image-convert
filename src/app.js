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

app.get("/", async (req, res) => {
  return res.status(200).send();
});

app.post("/", async (req, res) => {
  if (!req.body.message) {
    console.log("Error: Invalid Pub/Sub message format");
    return res.status(400).send("Bad Request: Invalid Pub/Sub message format");
  }

  const message = req.body.message;
  const eventType = message.attributes.eventType;

  if (eventType !== "OBJECT_FINALIZE") {
    print(`Ignoring unrelated Cloud Storage event type: ${eventType}`);
    return res
      .status(200)
      .send(`Ignoring unrelated Cloud Storage event type: ${eventType}`);
  }

  let data;
  try {
    data = JSON.parse(btoa(message.data));
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send("Bad Request: Data property is not valid base64 encoded JSON");
  }

  if (!(data.name || data.bucket)) {
    console.log("Error: Expected name/bucket in notification");
    return res
      .status(200)
      .send("Bad Request: Expected name/bucket in notification");
  }

  res.status(200).send("Happy path");
});

app.listen(port, () => console.log(`Instance started on port ${port}`));
