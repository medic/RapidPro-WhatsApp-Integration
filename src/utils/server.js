const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

function createServer() {
  const app = express();
  app.use(bodyParser.json());

  app.listen(process.env.PORT || 1337, () => console.log("webhook is listening on port", process.env.PORT || 1337));
  return app;
}

exports.module = { createServer };