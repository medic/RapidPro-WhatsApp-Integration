
function createServer(app) {
  app.listen(process.env.PORT || 1337, () => console.log("webhook is listening on port", process.env.PORT || 1337));
}

exports.module = { createServer };