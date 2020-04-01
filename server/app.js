'use strict';

import fs from 'fs';
import path from 'path';
import process from 'process';

import _ from 'underscore';

import chokidar from 'chokidar';
import open from 'open';

import Server from './server-communication';
import config from './config-manager';

import MarkdownDocument from './document-types/markdown-document';
import StructuredDocument from './document-types/structured-document';

const docTypes = [
  MarkdownDocument,
  StructuredDocument,
];


import { ClientError } from './document-types/lib.js';
import errorTemplate from './document-types/error-template.handlebars';

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

  isWatched: function isWatched(filePath) {
    for (const kind of FileTypes) {
      if (kind.isDoc(filePath)) {
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

  getDocType: function getDocType(filePath) {
    for (const types of docTypes) {
      if (types.isDoc(filePath)) {
        return types;
      }
    }
    return null;
  },

  buildData: function buildData(filePath, data, fallback) {
    fallback = fallback || false;

    const name = path.basename(filePath);
    const dir = filePath.replace(name, '');

    let content = '';
    const docType = __.getDocType(filePath);

    try {
      content = docType.render(filePath, data);
    }
    catch (e) {
      if (fallback) {
        content = errorTemplate({
          msg: e.stack,
        });
      }
      else {
        throw e;
      }
    }

    return {
      name: name,
      dir: path.join(
        path.basename(process.cwd()),
        path.relative(process.cwd(), dir),
      ),
      path: filePath,
      source: data,
      content: content,
      type: (docType ? docType.type : 'unknown'),
    };
  },
};

class MarkdownLive {

  constructor(options) {
    this.options = __.extend(DefaultArgs, options);
    this.log = (this.options.verbose) ? __.log : function doNothing() {};
    this.directories = {};

    this.help();
    config.init()
      .then(() => {
        this.start();
        this.socket();
        this.open();

        this.initDirectory(this.options.dir);
      });
  }

  initDirectory(directory) {
    directory = path.resolve(directory);

    if (!fs.existsSync(directory)) {
      throw new Error(`directory ${directory} does not exist`);
    }

    const filewatcher = chokidar.watch(path.join(
        directory,
        '*.*'
      ))
      .on('add', this.initFile.bind(this))
      .on('unlink', this.onRemove.bind(this));

    this.directories[path] = {
      directory,
      filewatcher,
    };
  }

  removeDirectory(directory) {
    directory = path.resolve(directory);

    // remove all files of this directory
    let ind = 0;
    while (ind < this.files.length) {
      const file = this.files[ind];
      const fileDirectory = path.resolve(file.dir);
      if (fileDirectory === directory) {
        this.files.splice(ind, 1);
        this.server.emit('rm', file.path);
      }
      else {
        ind++;
      }
    }

    delete this.directories[path];
  }

  initFile(filePath) {
    if(!__.isTracked(filePath)) {
      return;
    }

    const docType = __.getDocType(filePath);
    const dependencies = docType.dependencies(filePath);
    this.dependencyWatchers[filePath] = chokidar.watch(dependencies)
      .on('change', (depPath) => {
        console.log('change in', filePath, depPath);
        this.renderAndSend('data', filePath);
      })
      .on('add', (depPath) => {
        console.log('add in', filePath, depPath);
        this.renderAndSend('data', filePath);
      })
      .on('unlink', (depPath) => {
        console.log('unlink in', filePath, depPath);
        this.renderAndSend('data', filePath);
      });

    this.renderAndSend('push', filePath);
  }

  renderAndSend(event, filePath) {
    filePath = path.resolve(filePath);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return;

      try {
        data = __.buildData(filePath, data);
        this.server.emit(event, data);

        // update the changed file
        const fileIndex = _(this.files).findIndex(
          (file) => file.path === filePath
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
          this.server.emit('toast', e.toast);
        }
        else {
          this.server.emit('toast', {
            title: 'error',
            text: e.message || e,
            kind: 'error',
            timeout: 0,
          });
        }
      }

      __.log(Message.emit, filePath);

    });
  }

  onRemove(filePath) {
    // remove file from list
    const fileIndex = _(this.files).findIndex(
      (file) => file.path === filePath
    );
    this.files.splice(fileIndex, 1);

    filePath = path.resolve(filePath);

    if (Object.prototype.hasOwnProperty(this.dependencyWatchers, filePath)) {
      this.dependencyWatchers[filePath].close();
      delete this.dependencyWatchers[filePath];
    }

    this.server.emit('rm', filePath);
    __.log(Message.removed, filePath);
  }

  help() {
    if (!this.options.help) return;

    const stream = fs.createReadStream(path.join(__dirname, 'help.txt'));
    stream.pipe(process.stdout);
    stream.on('end', process.exit);
  }

  start() {
    this.prepare();
    this.server = new Server(this.options);
    this.server.listen();
  }

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

    this.dependencyWatchers = {};
  }

  open() {
    if (this.options.browser) {
      open(this.url);
    }
  }

  socket() {
    this.server.onStart(() => {
      this.server.emit('initialize', this.files);
    });

    // connection
    this.server.on('addDir', (evt) => {
      try {
        this.initDirectory(evt.path);
      }
      catch (e) {
        this.server.emit('toast', {
          title: 'error',
          text: `directory ${evt.path} does not exist`,
          kind: 'error',
          timeout: 0,
        });
      }
    });

    this.server.on('rmDir', (evt) => {
      this.removeDirectory(evt.path);
    });

  }
}

export default  MarkdownLive;
