"use strict";

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  dotenv = require('dotenv'),
  app = express().use(body_parser.json()); // creates express http server
  dotenv.config();

// Access token for the app
const token = process.env.WHATSAPP_TOKEN;
const phone_number_id = process.env.PHONE_NUMBER_ID;

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening on port", process.env.PORT || 1337));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {

  // Check the Incoming webhook message
  console.log(JSON.stringify(req.body, null, 2));

  if (req.body.text && req.body.to_no_plus) {
    //Parsing request from RP
    let text = req.body.text.split("|"); // separate template title and language code
    let to = req.body.to_no_plus;

    const data = {
          "messaging_product": "whatsapp",
          "to": to,
      }

    let msg_body = text[0];
    let language_code = text[1]
    if (!language_code) {
      data.recipient_type = "individual"
      data.type = "text"
      data.text = {
        body: msg_body,
        preview_url: false
      }
    } else {
      data.type = "template"
      data.template = {
        "name": msg_body,
        "language": {
          "code": language_code
        }
      }
    }
    
    console.log('Using token: ', token);
    axios({
      method: "POST",
      url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages`, 
      data,
      headers: { "Content-Type": "application/json", Authorization: 'Bearer ' + token },
    }).catch((error) => {
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
        console.error("Error: There is an error when sending data to facebook ", data); 
    });

  }

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
      
      //posting data to RP
      axios({
        method: "GET",
        url: `${process.env.RP_RECEIVE_URL}?from=${from}&text=${msg_body}`      
      }).catch((err) => {
        console.log("Error: There is an error in GET Req - " + err);
      });
    }
    res.sendStatus(200);
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
