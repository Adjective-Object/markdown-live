const {ipcMain} = require('electron');

class IpcServer {
  constructor(options) {
    this.handlers = [];

    this.on('connection', () => {
      this.initFn();
    });
  }

  on(evtclass, callback) {
    if (!Object.hasOwnProperty(this.handlers, evtclass)) {
      this.handlers[evtclass] = [];
    }
    this.handlers[evtclass].push(callback);
  }

  emit(evtclass, payload) {
    global.mainWindow.webContents.send('mdlive-ipc-socket', evtclass, payload);
  }

  listen() {
    // on any message, call queued handlers
    ipcMain.on('mdlive-ipc-socket', (event, evtclass, payload)=> {
      if (!this.handlers[evtclass]) return;

        // iterate through registered handlers and call them
      for (const handler of this.handlers[evtclass]) {
        handler(payload);
      }
    });
  }

  onStart(callback) {
    this.initFn = callback;
  }
}

export default IpcServer;
