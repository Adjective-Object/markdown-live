'use strict'

let fs = require('fs');
let path = require('path');
let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let haml = require('hamljs');
let yaml = require('js-yaml');
let chokidar = require('chokidar');
let dirwatcher = require('watch');
let open = require('open');

let MarkdownDocument = require('./document-types/markdown-document');
let StructuredDocument = require('./document-types/structured-document');

let docTypes = [
  MarkdownDocument,
  StructuredDocument
];

var Message = {
  start: 'server: %s',
  empty: 'no *.md files in %s',
  emit: 'saved: %s',
  watch: 'watch: %s',
  added: 'added: %s',
  removed: 'removed: %s',
  not_exist: 'doesn\'t exist: %s',
  bad_doc: 'document is malformed'
}

var DefaultArgs = {
  port: 2304,
  dir: path.resolve('.'),
  verbose: false,
  help: false,
  browser: false,
  file: false,
  socket: 'http://localhost:2304'
}

var FileTypes = [
  MarkdownDocument,
  StructuredDocument
]

var _ = {
  log: function(message){
    var arr = _.argsToArr(arguments);

    arr[0] = _.joinArgs('[mdlive] ', message);
    console.log.apply(null, arr);
  },

  isWatched: function(path) {
    for (let kind of FileTypes) {
      if (kind.isDoc(path)) {
        return true;
      }
    }
    return false
  },

  isEmpty: function(arr){
    return !arr.length;
  },

  isBool: function(obj){
    return toString.call(obj) === '[object Boolean]';
  },

  isObject: function(obj){
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  },

  argsToArr: function(args){
    return Array.prototype.slice.call(args);
  },

  joinArgs: function(){
    return _.argsToArr(arguments).join('');
  },

  has: function(obj, key){
    return obj !== null && hasOwnProperty.call(obj, key);
  },

  extend: function(obj){
    for (var i = 1, x = arguments.length; i < x; i++){
      var source = arguments[i];

      for (var property in source){
        if (_.has(source, property)){
          obj[property] = source[property];
        }
      }
    }

    return obj;
  },

  buildData: function(file, data){
    var name = path.basename(file);
    var dir = file.replace(name, '');

    var content = '', type = 'unknown';

    for (let kind of docTypes) {
      if (kind.isDoc(file)) {
        content = kind.render(file, data);
        kind = kind.type;
        break;
      }
    }

    return {
      name: name, 
      dir: dir,
      path: file, 
      source: data,
      content: content,
      type: type
    }
  },
}

class MarkdownLive {

  constructor(options) {
    this.options = _.extend(DefaultArgs, options);
    this.log = (this.options.verbose) ? _.log : function() {}

    this.url = _.joinArgs('http://localhost:', this.options.port);

    this.help();
    this.start();
    this.socket();
    this.open();

    this.filewatcher = chokidar.watch('./*.*')
      .on('change', this.emitFileChange.bind(this, 'data'))
      .on('add', this.emitFileChange.bind(this, 'push'))
      .on('unlink', this.emitRemove.bind(this))
  }

  emitFileChange(event, filepath) {
    filepath = path.resolve(filepath);
    fs.readFile(filepath, 'utf8', function(err, data){
      if (err) return;

      io.emit(event, _.buildData(filepath, data));
      _.log(Message.emit, filepath);

    });
  }

  emitRemove(filepath) {
    filepath = path.resolve(filepath);
    io.emit('rm', filepath);
    _.log(Message.removed, filepath);
  }


  /**
   *  Show help.
   *
   *  @method help
   */
  help() {
    if (!this.options.help) return;

    var stream = fs.createReadStream(path.join(__dirname, 'help.txt'));
    stream.pipe(process.stdout);
    stream.on('end', function(){
      process.exit();
    });
  }

  /**
   *  Start a server.
   *
   *  @method start
   */
  start(){
    var self = this;

    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(this.options.dir));

    self.prepare();

    app.get('/', function (req, res){
      var view = fs.readFileSync(
        path.join(__dirname, 'views', 'index.haml'),
        'utf8');

      self.prepare();

      var render = haml.render(view, {
        locals: {
          socket: self.options.socket
        }
      })

      res.end(render);
    });

    server.listen(this.options.port);
    _.log(Message.start, this.url);
  }

  /**
   *  Find all *.md files and create new array.
   *
   *  @method prepare
   */
  prepare() {
    var self = this;
    var files = fs.readdirSync(this.options.dir)
      .filter(function(file){
        return _.isWatched(file);
      }).map(function(name){
        return path.join(self.options.dir, name);
      }) || [];

    if (this.options.file) {
      this.options.file.split(',').forEach(function(file){
        if (fs.existsSync(file) && _.isWatched(file)) {
          files.push(file);
        } else {
          _.log(Message.not_exist, file);
        }
      });
    }

    this.files = files.map(function(file){
      var data = fs.readFileSync(file, 'utf8');
      return _.buildData(file, data);
    });
  }

  /**
   *  Open a browser.
   *
   *  @method open
   */
  open(){
    if (this.options.browser) {
      open(this.url); 
    }
  }

  /**
   *  Create websocket events.
   *
   *  @method socket
   */
  socket(){
    io.on('connection', (socket) => {
      io.emit('initialize', this.files);
    });
  }
}

module.exports = MarkdownLive;
