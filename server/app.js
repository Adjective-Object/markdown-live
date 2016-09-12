'use strict';

const fs = require('fs');
const _ = require('underscore');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const chokidar = require('chokidar');
const open = require('open');

const MarkdownDocument = require('./document-types/markdown-document');
const StructuredDocument = require('./document-types/structured-document');

const docTypes = [
  MarkdownDocument,
  StructuredDocument,
];

const _lib = require('./document-types/lib.js');
const ClientError = _lib.ClientError;
const errorTemplate = require('./document-types/error-template.handlebars');
const indexTemplate = require('./views/index.handlebars');

/* eslint-disable camelcase */
const Message = {
  start: 'server: %s',
  empty: 'no *.md files in %s',
  emit: 'saved: %s',
  watch: 'watch: %s',
  added: 'added: %s',
  removed: 'removed: %s',
  not_exist: 'doesn\'t exist: %s',
  bad_doc: 'document is malformed',
};
/* eslint-enable camelcase */

const DefaultArgs = {
  port: 2304,
  dir: path.resolve('.'),
  verbose: false,
  help: false,
  browser: false,
  file: false,
  socket: 'http://localhost:2304',
};

const FileTypes = [
  MarkdownDocument,
  StructuredDocument,
];

const __ = {
  log: function log(message) {
    const arr = __.argsToArr(arguments);

    arr[0] = __.joinArgs('[mdlive] ', message);
    console.log.apply(null, arr);
  },

  isWatched: function isWatched(filepath) {
    for (const kind of FileTypes) {
      if (kind.isDoc(filepath)) {
        return true;
      }
    }
    return false;
  },

  isEmpty: function isEmpty(arr) {
    return !arr.length;
  },

  isBool: function isBool(obj) {
    return toString.call(obj) === '[object Boolean]';
  },

  isObject: function isObject(obj) {
    const type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  },

  argsToArr: function argsToarr(args) {
    return Array.prototype.slice.call(args);
  },

  joinArgs: function joinArgs() {
    return __.argsToArr(arguments).join('');
  },

  has: function has(obj, key) {
    return obj !== null && hasOwnProperty.call(obj, key);
  },

  extend: function extend(obj) {
    for (let i = 1, x = arguments.length; i < x; i++) {
      const source = arguments[i];

      for (const property in source) {
        if (__.has(source, property)) {
          obj[property] = source[property];
        }
      }
    }

    return obj;
  },

  isTracked: function isTracked(filePath) {
    for (const kind of docTypes) {
      if (kind.isDoc(filePath)) {
        return true;
      }
    }

    return false;
  },

  buildData: function buildData(file, data, fallback) {
    fallback = fallback || false;

    const name = path.basename(file);
    const dir = file.replace(name, '');

    let content = '';
    let type = 'unknown';

    for (const kind of docTypes) {
      if (kind.isDoc(file)) {
        type = kind.type;

        if (fallback) {
          try {
            content = kind.render(file, data);
          }
          catch (e) {
            content = errorTemplate({
              msg: e.stack,
            });
          }
        }

        else {
          content = kind.render(file, data);
        }

        break;
      }
    }

    return {
      name: name,
      dir: path.relative(DIRNAME, dir),
      path: file,
      source: data,
      content: content,
      type: type,
    };
  },
};

class MarkdownLive {

  constructor(options) {
    this.options = __.extend(DefaultArgs, options);
    this.log = (this.options.verbose) ? __.log : function doNothing() {};

    this.url = __.joinArgs('http://localhost:', this.options.port);

    this.help();
    this.start();
    this.socket();
    this.open();

    this.directories = {};
    this.initDirectory(this.options.dir);
  }

  initDirectory(directory) {
    directory = path.resolve(directory);

    var filewatcher = chokidar.watch(path.join(
        directory,
        '*.*'
      ))
      .on('change', this.onFileChange.bind(this, 'data'))
      .on('add', this.onFileChange.bind(this, 'push'))
      .on('unlink', this.onRemove.bind(this));

    this.directories[path] = {
      directory,
      filewatcher
    };
  }

  removeDirectory(directory) {
    directory = path.resolve(directory);

    // remove all files of this directory
    let ind = 0;
    for (let file of this.files) {
      let fpath = path.resolve(file.dir);
      if (fpath === directory) {
        file.splice(ind, 1);
        io.emit('rm', fpath);
      } else {
        ind++;
      }
    }

    delete this.directories[path];
  }

  onFileChange(event, filepath) {
    if(!__.isTracked(filepath)) {
      return;
    }

    filepath = path.resolve(filepath);
    fs.readFile(filepath, 'utf8', (err, data) => {
      if (err) return;

      try {
        data = __.buildData(filepath, data);
        io.emit(event, data);

        // update the changed file
        const fileIndex = _(this.files).findIndex(
          (file) => file.path === filepath
        );
        if (fileIndex !== -1) {
          this.files[fileIndex] = data;
        }
        else {
          this.files.push(data);
        }

      }
      catch (e) {
        if (e instanceof ClientError) {
          io.emit('toast', e.toast);
        }
        else {
          io.emit('toast', {
            title: 'error',
            text: e.message || e,
            kind: 'error',
            timeout: 0,
          });
        }
      }

      __.log(Message.emit, filepath);

    });
  }

  onRemove(filepath) {
    // remove file from list
    const fileIndex = _(this.files).findIndex(
      (file) => file.path === filepath
    );
    this.files.splice(fileIndex, 1);

    filepath = path.resolve(filepath);
    io.emit('rm', filepath);
    __.log(Message.removed, filepath);
  }

  /**
   *  Show help.
   *
   *  @method help
   */
  help() {
    if (!this.options.help) return;

    const stream = fs.createReadStream(path.join(__dirname, 'help.txt'));
    stream.pipe(process.stdout);
    stream.on('end', process.exit);
  }

  /**
   *  Start a server.
   *
   *  @method start
   */
  start() {
    /* eslint-disable no-undef */
    app.use(express.static(path.join(DIRNAME, 'public')));
    /* eslint-enable no-undef */
    app.use(express.static(this.options.dir));

    this.prepare();

    app.get('/', (req, res) => {
      res.end(indexTemplate({
        url: this.url,
      }));
    });

    server.listen(this.options.port);
    __.log(Message.start, this.url);
  }

  /**
   *  Find all *.md files and create new array.
   *
   *  @method prepare
   */
  prepare() {
    const self = this;
    const files = fs.readdirSync(this.options.dir)
      .filter(function removeWatched(file) {
        return __.isWatched(file);
      }).map(function addOptionPath(name) {
        return path.join(self.options.dir, name);
      }) || [];

    if (this.options.file) {
      this.options.file.split(',').forEach(function addFile(file) {
        if (fs.existsSync(file) && __.isWatched(file)) {
          files.push(file);
        }
        else {
          __.log(Message.not_exist, file);
        }
      });
    }

    this.files = files.map(function readAndBuild(file) {
      const data = fs.readFileSync(file, 'utf8');
      return __.buildData(file, data, true);
    });
  }

  /**
   *  Open a browser.
   *
   *  @method open
   */
  open() {
    if (this.options.browser) {
      open(this.url);
    }
  }

  /**
   *  Create websocket events.
   *
   *  @method socket
   */
  socket() {
    // connection
    io.on('connection', (socket) => {
      io.emit('initialize', this.files);
    });

    // directory client events
    io.on('addDir', (dir) => {
      this.initDirectory(dir);
    });
    io.on('rmDir', (dir) => {
      this.removeDirectory(dir);
    });
  }
}

module.exports = MarkdownLive;
