"use strict";
// Imports dependencies and set up http server
const useV1Routes = require("./src/utils/routes");

const createServer = require("./src/utils/server");
const server = createServer();

useV1Routes(server);



