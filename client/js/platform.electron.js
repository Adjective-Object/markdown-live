import { ipcRenderer } from 'electron';

const handlers = {};
ipcRenderer.on('mdlive-ipc-socket', (event, evt, payload) => {
  if (!Object.prototype.hasOwnProperty.call(handlers, evt)) {
    return;
  }

  for (const handler of handlers[evt]) {
    handler(payload);
  }
});

const network = {
  emit: (evt, payload) => {
    ipcRenderer.send('mdlive-ipc-socket', evt, payload);
  },
  on: (evt, callback) => {
    if (!Object.prototype.hasOwnProperty(handlers, evt)) {
      handlers[evt] = [];
    }
    handlers[evt].push(callback);
  },
};

const init = (Models, Views, Controllers) => {
  network.emit('connection');
};

export { network, init };
