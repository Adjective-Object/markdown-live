const {app, BrowserWindow} = require('electron');
const path = require('path');
import mdliveServer from '../server/app.js';

// start the electron app
let mainWindow;
app.on('ready', () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
  });

  const localPath = path.join(app.getAppPath(), 'assets/index.html');
  mainWindow.loadURL('file://' + localPath);
  // this might be a hack
  global.mainWindow = mainWindow;
});

// start the server using cli args
const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    h: 'help',
    p: 'port',
    d: 'dir',
    v: 'verbose',
    f: 'file',
    s: 'socket',
  },
});

new mdliveServer(argv);
