"use strict";
// Imports dependencies and set up http server
const { useV1Routes } = require("./src/routes");

const createServer = require("./src/server");

const app = useV1Routes();
createServer(app);




