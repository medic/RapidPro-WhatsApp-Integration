const axios = require("axios").default, dotenv = require('dotenv');
const e = require("express");
const { saveLog } = require("./network");

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

function sendMsgToRP(msg) {
  const from = msg.from; // extract the phone number from the webhook payload
  let msgBody = '';
  switch (msg.type) {
    case 'image':
      msgBody = encodeURI('Client sent an image, may need help');
      break;
    case 'text':
      msgBody = encodeURI(msg.text.body); // extract the message text from the webhook payload
      break;
    case 'audio':
      msgBody = encodeURI('Client sent an audio message, may need help');
      break;
    case 'reaction':
      msgBody = encodeURI(`Client sent an emoji: ${msg.reactions.emoji}`);
      break;
    default:
      msgBody = encodeURI('Client sent an unknown message format, may need help');
      break;
  }

  return axios({
    method: "POST",
    url: `${process.env.RP_RECEIVE_URL}?from=${from}&text=${msgBody}`,
  });
}

function logWAMsgStatus(status) {
  const couchdb_url = process.env.COUCHDB_URL;
  const couchdb_username = process.env.COUCHDB_USERNAME;
  const couchdb_password = process.env.COUCHDB_PASSWORD;

  const newStatus = {
    status: status.status,
    timestamp: status.timestamp,
    recipient_id: status.recipient_id,
    id: status.id,
    conversation: status.conversation,
    reported_date: status.timestamp,
    type: 'wa-status-log',
  };

  return axios({
    method: 'POST',
    url: `${couchdb_url}/wa-rp-integration-logs`,
    data: newStatus,
    auth: {
      username: couchdb_username,
      password: couchdb_password
    }
  });
}

function WAResponseHandler(entry) {
  if (!(entry[0].changes)) {
    throw new Error('Unexpected body format');
  }

  const changes = entry[0].changes;

  if (!Array.isArray(changes)) {
    throw new Error('Unexpected changes format');
  }

  const value = changes[0].value;

  if (value && value.messages) {
    return sendMsgToRP(value.messages[0]);
  }

  if (value && value.statuses) {
    return logWAMsgStatus(value.statuses[0]);
  }
  throw new Error('Invalid body format');
}

async function RPPostHandler(data) {
  const response = await axios({
    method: "POST",
    url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
    data,
    headers: { "Content-Type": "application/json", Authorization: 'Bearer ' + token },
  });

  return response;
}

module.exports = { reqErrorHandler, WAResponseHandler, RPPostHandler };