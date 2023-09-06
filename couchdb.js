const couchdb_url = process.env.COUCHDB_URL;
const couchdb_username = process.env.COUCHDB_USERNAME;
const couchdb_password = process.env.COUCHDB_PASSWORD;

/**
 * @typedef {Object} ErrorLog
 * @property {string} message
 * @property {string} type
 * @property {string} code
 * @property {string} description
 * @property {string} reported_date
 */

/**
 * @typedef {Object} StatusLog
 * @property {string} status
 * @property {string} type
 */

/**
 * 
 * @param { ( ErrorLog | StatusLog ) } data 
 */

function saveLog(phone, data) {
  const axios = require('axios');
  data.type = 'wa-rp-integration-log';
  data.reported_date = Date.now();
  data.phone = phone;

  axios({
    method: "POST",
    url: `${couchdb_url}/wa-rp-integration-logs`,
    data,
    auth: {
      username: couchdb_username,
      password: couchdb_password
    }
  }).catch((error) => {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
    } else if (error.request) {
      console.log(error.request);
    }
    console.error("Error: There is an error when sending data to CouchDB ", data);
  });
}

module.exports = { saveLog }; 