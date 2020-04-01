// @flow
import express from 'express';
import path from 'path';
import {Server as HttpServer} from 'http';
import socketIo from 'socket.io';
import indexTemplate from './views/index.handlebars';

const app = express();
const server = require('http').Server(app);
const io = socketIo(server);

class SocketServer {
  url: string
  handlers: {[key: string]: Function[]}

  constructor(options: {
    port: number,
    dir: string,
  }) {
    this.url = `http://localhost:${options.port}`;

    app.get('/', (req, res) => {
      res.end(indexTemplate({
        url: this.url,
      }));
    });
    app.get('/template-assets', (req, res) => {
      const templatePath = req.query.templatePath;
      const relativePath = req.query.relativePath;
      if (!templatePath || !relativePath) {
        res.status(401);
        res.end();
      } else {
        const dlPath = path.join(
          templatePath,
          relativePath
        );
        console.log('download', dlPath)
        res.sendFile(dlPath)
      }
    });

    /* eslint-disable no-undef */
    app.use(express.static(path.join($dirname, 'public')));
    /* eslint-enable no-undef */
    app.use(express.static(options.dir));

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
