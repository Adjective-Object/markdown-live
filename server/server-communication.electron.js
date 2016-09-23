const path = require('path');
const {ipcMain} = require('electron')

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
    this.handlers[evtclass].push(callback)
  }

  emit(evtclass, payload) {
    console.log('server send', evtclass)
    mainWindow.webContents.send("mdlive-ipc-socket", evtclass, payload);
  }

  listen() {
    ipcMain.on("mdlive-ipc-socket", (event, evtclass, payload)=> {
      console.log('server got', evtclass);
      // iterate through registered handlers and bind them
        for (let handler of this.handlers[evtclass]) {
          handler(payload);
        }
      });
  }

  onStart(callback) {
    this.initFn = callback;
  }
}

export default IpcServer;
