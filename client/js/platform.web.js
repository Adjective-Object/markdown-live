import io from 'socket.io-client';
// Db is provided by inline script from servers
/* eslint-disable no-undef */
const socketHost = Db.socket || 'http://localhost';
/* eslint-enable no-undef */
const socketClient = io.connect(socketHost);
const network = {
  emit: (evt, payload) => {
    socketClient.emit(evt, payload);
  },
  on: (evt, callback) => {
    socketClient.on(evt, (payload) => {
      callback(payload);
    });
  },
};

function init(Models, Views, Controllers) {
}

export { network, init };
