const { WAResponseHandler, RPPostHandler } = require("./handlers");
const dotenv = require('dotenv');
dotenv.config();

// POST /inbound endpoint is used by WhatsApp to send message updates.
// function InboundController(req, res) {
//   // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
//   if (req.body.object) {
//     return WAResponseHandler(req, res);
//   } else {
//     // Return a '404 Not Found' if event is not from a RP/WhatsApp API
//     res.sendStatus(404);
//   }
// }

// // POST /outbound endpoint is used by RP to send message updates.
// function OutboundController(req, res) {
//   // Check the Incoming webhook message
//   console.log(JSON.stringify(req.body, null, 2));

// if (req.body.text && req.body.to_no_plus) {
//   return RPPostHandler(req, res);
// } if (req.body.object) {
//   return WAResponseHandler(req, res);
// } else if (req.body.text) {
//   res.sendStatus(200);
// } else {
//   res.sendStatus(400);
// }
// }

function parseRapidproReqData(body) {
  let text = body.text.split("|"); // separate template title and language code
  let to = body.to_no_plus;

  const data = {
    "messaging_product": "whatsapp",
    "to": to,
  };

  let msg_body = text[0];
  let language_code = text[1];
  if (!language_code) {
    data.recipient_type = "individual";
    data.type = "text";
    data.text = {
      body: msg_body,
      preview_url: false
    };
  } else {
    data.type = "template";
    data.template = {
      "name": msg_body,
      "language": {
        "code": language_code
      }
    };
  }
  return data;
}

// POST /webhook legacy endpoint is used by 
// both WhatsApp and RP to send message updates.
async function webhookController(req, res) {
  // Check the webhook event is from a Page subscription
  console.log(JSON.stringify(req.body, null, 2));

  try {
    if (req.body.text && req.body.to_no_plus) {
      const data = parseRapidproReqData(req.body);
      const response = await RPPostHandler(data);
      return res.sendStatus(response.status);
    } if (req.body.object && req.body.entry) {
      const entry = req.body.entry;
      const response = await WAResponseHandler(entry);
      res.sendStatus(response.status);
    } else if (req.body.text) {
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);

    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    }
    console.error(error);
    res.sendStatus(500);
  }
}


function tokenVerificationController(req, res) {
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
}

module.exports = {
  webhookController,
  tokenVerificationController
};