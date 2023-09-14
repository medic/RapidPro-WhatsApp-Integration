const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const couchdb_url = process.env.COUCHDB_URL;
const couchdb_username = process.env.COUCHDB_USERNAME;
const couchdb_password = process.env.COUCHDB_PASSWORD;

const post = async (url, data, auth) => {
  return axios({
    method: "POST",
    url,
    data,
    auth
  });
};

const get = async (url, auth) => {
  return axios({
    method: "GET",
    url,
    auth
  });
};

/**
 * @typedef {Object} StatusLog
 * @property {string} message
 * @property {string} type
 * @property {string} code
 * @property {string} description
 * @property {string} reported_date
 * @property {string} status
 * @property {string} phone
 */

/**
 * 
 * @param { StatusLog } data 
 */

function saveLog(data) {
  data.type = 'status-log';
  data.reported_date = Date.now();
  return post(`${couchdb_url}/wa-rp-integration-logs`, data, {
    username: couchdb_username,
    password: couchdb_password
  });

}

const netWork = { saveLog, post, get };

module.exports = netWork; 