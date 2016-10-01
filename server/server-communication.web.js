const express = require('express');
const path = require('path');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const indexTemplate = require('./views/index.handlebars');

class SocketServer {
  constructor(options) {
    this.url = `http://localhost:${options.port}`;

    /* eslint-disable no-undef */
    app.use(express.static(path.join($dirname, 'public')));
    /* eslint-enable no-undef */
    app.use(express.static(options.dir));
    app.get('/', (req, res) => {
      res.end(indexTemplate({
        url: this.url,
      }));
    });

    this.handlers = {};
    this.port = options.port;

    io.on('connection', (socket) => {
      // init the connection
      this.initFn();

      // iterate through registered handlers and bind them
      for (const name in this.handlers) {
        socket.on(name, (event) => {
          for (const handler of this.handlers[name]) {
            handler(event);
          }
        });
      }
    });
  }

  on(evtclass, callback) {
    if (!Object.hasOwnProperty(this.handlers, evtclass)) {
      this.handlers[evtclass] = [];
    }
    this.handlers[evtclass].push(callback);
  }

  emit(evtclass, payload) {
    io.emit(evtclass, payload);
  }

  listen() {
    server.listen(this.port);
    console.log(`server listening on ${this.url}`);
  }

  onStart(callback) {
    this.initFn = callback;
  }
}

export default SocketServer;
