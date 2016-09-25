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
    socketClient.on(evt, function(payload) {
      callback(payload);
    });
  },
};

function init(Models, Views, Controllers) {
  network.on('disconnect', () => {
    Models.Toast.notify(
      'disconnect',
      'socket connection to server was lost',
      'error',
      [],
      2000
    );
  });

  network.on('reconnect', () => {
    Models.Toast.notify(
      'reconnect',
      'socket connection restored',
      'ok',
      [],
      2000
    );
  });
}

export { network, init };
