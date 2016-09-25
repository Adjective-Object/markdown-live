// client configs configs
const webClient = [
  require('./web/webpack.web.client.js'),
  require('./web/webpack.web.style.js'),
];

const webServer = [
  require('./web/webpack.web.server.js'),
];

module.exports = webClient.concat(webServer);
