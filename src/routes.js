
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { webhookController, tokenVerificationController } = require("./controllers");

dotenv.config();

function useV1Routes() {
  const app = express();
  app.use(bodyParser.json());
  // Accepts POST requests at /webhook endpoint
  app.post("/webhook", webhookController);
  // app.post("/outbound", OutboundController);

  // Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
  // info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
  app.get("/webhook", tokenVerificationController);
  return app;
}

module.exports = { useV1Routes };