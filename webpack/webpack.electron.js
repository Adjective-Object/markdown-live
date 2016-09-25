// electron configs
const electronClient = [
  require('./electron/webpack.electron.client.js'),
  require('./electron/webpack.electron.style.js'),
];

const electronServer = [
  require('./electron/webpack.electron.main.js'),
];

module.exports = electronClient.concat(electronServer);
