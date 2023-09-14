const { WAResponseHandler, RPPostHandler } = require("./src/handlers");
const dotenv = require('dotenv');
dotenv.config();

function useV1Routes(app) {
  // Accepts POST requests at /webhook endpoint
  app.post("/webhook", (req, res) => {

    // Check the Incoming webhook message
    console.log(JSON.stringify(req.body, null, 2));

    if (req.body.text && req.body.to_no_plus) {
      return RPPostHandler(req, res);
    }

    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    if (req.body.object) {
      return WAResponseHandler(req, res);
    } else if (req.body.text) {
      res.sendStatus(200);
    } else {
      // Return a '404 Not Found' if event is not from a RP/WhatsApp API
      res.sendStatus(404);
    }
  });

  // Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
  // info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests 
  app.get("/webhook", (req, res) => {
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
    **/
    const verify_token = process.env.VERIFY_TOKEN;

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === verify_token) {
        // Respond with 200 OK and challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  });
}

exports.module = { useV1Routes };