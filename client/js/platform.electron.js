import { ipcRenderer } from 'electron';

let handlers = {};
ipcRenderer.on("mdlive-ipc-socket", (event, evt, payload) => {
  console.log('ipcRenderer.on', evt, payload);
  if (!Object.prototype.hasOwnProperty.call(handlers, evt)) {
    return;
  }

  for (let handler of handlers[evt]) {
    handler(payload);
  }
})

const network = {
  emit: function(evt, payload) {
    ipcRenderer.send("mdlive-ipc-socket", evt, payload)
  },
  on: function(evt, callback) {
    if (!Object.prototype.hasOwnProperty(handlers, evt)) {
      handlers[evt] = [];
    }
    handlers[evt].push(callback);
  }
};

function init(Models, Views, Controllers) {
  console.log('try to init connection');
  network.emit('connection');
}

export { network, init };
