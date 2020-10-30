const express = require("express");
const config = require("config");
const sharp = require("sharp");
const { Storage } = require("@google-cloud/storage");

// Configs
const SOURCE_BUCKET_NAME = "image-drop.george.black";
const DESTINATION_BUCKET_NAME = "media.george.black";

// Image settings
const IMAGE_MAX_WIDTH = 800;

// Express setup
const app = express();
app.use(express.json());
const port = process.env.PORT || 8080;

const storage = new Storage();

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
    console.log(`Ignoring unrelated event type: ${eventType}`);
    return res.status(200).send(`Ignoring unrelated event type: ${eventType}`);
  }

  let data;
  try {
    data = JSON.parse(Buffer.from(message.data, "base64").toString("ascii"));
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

  if (data.bucket !== SOURCE_BUCKET_NAME) {
    console.log(`Ignoring event for bucket: ${data.bucket}`);
    return res.status(200).send(`Ignoring event for bucket: ${data.bucket}`);
  }

  const original = await storage.bucket(data.bucket).file(data.name);
  const [exists] = await original.exists();

  if (!exists) {
    console.log(`Ignoring event for nonexistent object: ${data.name}`);
    return res
      .status(200)
      .send(`Ignoring event for nonexistent object: ${data.name}`);
  }

  const originalContents = await original.download()[0];
  const name = data.name.split(".")[0];
  const extension = data.name.split(".").pop();

  if (!["jpg", "jpeg"].includes(extension)) {
    console.log(
      `Ignoring event for file with unsupported extension: ${data.name}`
    );
    return res
      .status(200)
      .send(`Ignoring event for file with unsupported extension: ${data.name}`);
  }

  try {
    // generate jpg
    const outputJpg = await storage
      .bucket(DESTINATION_BUCKET_NAME)
      .file(`${name}.jpg`);
    const outputJpgContents = await sharp(originalContents)
      .resize({
        width: IMAGE_MAX_WIDTH,
      })
      .jpeg({
        quality: 85,
      })
      .toBuffer();
    const outputJpgResponse = await outputJpg.save(outputJpgContents);

    // generate webp
    const outputWebp = await storage
      .bucket(DESTINATION_BUCKET_NAME)
      .file(`${name}.webp`);
    const outputWebpContents = await sharp(originalContents)
      .resize({
        width: IMAGE_MAX_WIDTH,
      })
      .webp({
        quality: 85,
      })
      .toBuffer();
    const outputWebpResponse = await outputWebp.save(outputWebpContents);
  } catch (err) {
    console.log(err);
    res.status(500).send(`Error: Failed to process image: ${data.name}`);
  }

  res.status(200).send("Done");
});

app.listen(port, () => console.log(`Instance started on port ${port}`));
