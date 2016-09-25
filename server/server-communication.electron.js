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
    console.log('server send', evtclass);
    global.mainWindow.webContents.send('mdlive-ipc-socket', evtclass, payload);
  }

  listen() {
    // on any message, call queued handlers
    ipcMain.on('mdlive-ipc-socket', (event, evtclass, payload)=> {
      console.log('server got', evtclass);
      console.log(this.handlers, this.handlers[evtclass]);
      if (!this.handlers[evtclass]) return;
      console.log('using handlers');

        // iterate through registered handlers and call them
      for (const handler of this.handlers[evtclass]) {
        console.log(evtclass, 'on', payload);
        handler(payload);
      }
    });
  }

  onStart(callback) {
    this.initFn = callback;
  }
}

export default IpcServer;
