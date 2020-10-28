const express = require("express");
const config = require("config");

// Express setup
const app = express();
app.use(express.json());
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.status(200).send("Howdy!");
});

app.listen(port, () => console.log(`Instance started on port ${port}`));
