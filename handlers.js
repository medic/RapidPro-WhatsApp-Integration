const axios = require("axios").default, dotenv = require('dotenv');
const { saveLog } = require("./couchdb");

dotenv.config();

// Access token for the app
const token = process.env.WHATSAPP_TOKEN;
const phone_number_id = process.env.PHONE_NUMBER_ID;

/**
 * 
 * @param {*} error
 * 
 */

function reqErrorHandler(error, data, from) {
  const err = {};
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    err.data = error.response.data;
    err.status = error.response.status;

  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    err.request = error.request;
    err.status = 'Unknown';
    err.data = null;
  } else {
    err.data = data;
  }

  return saveLog(from, err);
}

function WAResponseHandler(req, res) {
  if (
    req.body.entry &&
    req.body.entry[0].changes &&
    req.body.entry[0].changes[0] &&
    req.body.entry[0].changes[0].value.messages &&
    req.body.entry[0].changes[0].value.messages[0]
  ) {
    const msg = req.body.entry[0].changes[0].value.messages[0];
    const from = msg.from; // extract the phone number from the webhook payload
    let msgBody = '';
    if (msg.text) {
      msgBody = encodeURI(msg.text.body); // extract the message text from the webhook payload
    } else if (msg.audio) {
      msgBody = encodeURI('Client sent an audio message, may need help');
    } else if (msg.reactions) {
      msgBody = encodeURI(`Client sent an emoji: ${msg.reactions.emoji}`);
    }
    const date = new Date(msg.timestamp).toISOString();
    //posting data to RP
    axios({
      method: "POST",
      url: `${process.env.RP_RECEIVE_URL}?from=${from}&text=${msgBody}`,
    }).catch((err) => {
      console.log("Error: There is an error in GET Req - " + err);
    });
  }
  return res.sendStatus(200);
}

function RPPostHandler(req, res) {
  //Parsing request from RP
  let text = req.body.text.split("|"); // separate template title and language code
  let to = req.body.to_no_plus;

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

  return axios({
    method: "POST",
    url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
    data,
    headers: { "Content-Type": "application/json", Authorization: 'Bearer ' + token },
  })
    .then(() => res.sendStatus(200))
    .catch((error) => {
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

module.exports = { reqErrorHandler, WAResponseHandler, RPPostHandler };