'use strict'

var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var haml = require('hamljs');
var yaml = require('js-yaml');
var filewatcher = require('filewatcher')({ interval: 1000 });
var dirwatcher = require('watch');
var open = require('open');
var Markdown = require('marked');
var StructuredDocument = require('./structured-document');
var renderer = new Markdown.Renderer();

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
  file: false,
  socket: 'http://localhost:2304'
}

var _ = {
  log: function(message){
    var arr = _.argsToArr(arguments);

    arr[0] = _.joinArgs('[mdlive] ', message);
    console.log.apply(null, arr);
  },

  isMD: function(file){
    return /\.(markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext)$/.test(file);
  },

  isStructured: function(file){
    return /\.doc\.(yaml|yml)$/.test(file);
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

    var content, type
    if (_.isMD(file)) {
      // compile with markdown
      content = Markdown(data, { renderer: renderer });
      type = 'markdown'
    } else if (_.isStructured(file)) {
      content = StructuredDocument(file, data);
      type = 'structured'
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
  
  renderer: function() {
    var view = fs.readFileSync(path.join(__dirname, 'views', 'code.haml'), 'utf8');

    renderer.code = function(code, lang) {
      return haml.render(view, {
        locals: {
          code: code,
          lang: lang
        }
      });
    }
  }
}

class MarkdownLive {

  constructor(options) {
    this.options = _.extend(DefaultArgs, options);
    this.log = (this.options.verbose) ? _.log : function() {}

    _.renderer();

    this.url = _.joinArgs('http://localhost:', this.options.port);

    this.help();
    this.start();
    this.socket();
    this.open();
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

    app.get('/', function (req, res){
      var view = fs.readFileSync(
        path.join(__dirname, 'views', 'index.haml'),
        'utf8');

      self.prepare();
      self.watch();
      self.check();

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
        return _.isMD(file) || _.isStructured(file);
      }).map(function(name){
        return path.join(self.options.dir, name);
      }) || [];

    if (this.options.file) {
      this.options.file.split(',').forEach(function(file){
        if (fs.existsSync(file) && 
          (_.isMD(file) || _.isStructured(file))){
          files.push(file);
        } else {
          _.log(Message.not_exist, file);
        }
      });
    }

    this.files = files.map(function(file){
      var content = fs.readFileSync(file, 'utf8');
      return _.buildData(file, content);
    });
  }

  /**
   *  Listen on file changes.
   *
   *  @method watch
   */
  watch(){
    var self = this;

    filewatcher.removeAll();

    this.files.forEach(function(file){
      filewatcher.add(file.path);
      _.log(Message.watch, file.path);
    });

    filewatcher.on('change', function(file){
      fs.readFile(file, 'utf8', function(err, data){
        if (err) return;

        io.emit('data', _.buildData(file, data));
        _.log(Message.emit, file);

      });
    });
  }

  /**
   *  Listen on directory changes (removing or creating .md files).
   *
   *  @method check
   */
  check(){
    var self = this;

    dirwatcher.unwatchTree(this.options.dir);

    dirwatcher.watchTree(this.options.dir, { 
      ignoreDirectoryPattern: /.+/,
      ignoreUnreadableDir: true,
      filter: function(file){
        return _.isMD(file);
      }
    }, function(file, current, prev){
      if (_.isObject(file)) return;

      if (prev === null){
        fs.readFile(file, 'utf8', function(err, data){
          if (err) return;

          filewatcher.add(file);
          _.log(Message.added, file);
          io.emit('push', _.buildData(file, data));
        });
      } else if (current.nlink === 0) {
        io.emit('rm', file);
        filewatcher.remove(file);
        _.log(Message.removed, file);
      }
    });
  }

  /**
   *  Open a browser.
   *
   *  @method open
   */
  open(){
    // open(this.url); 
  }

  /**
   *  Create websocket events.
   *
   *  @method socket
   */
  socket(){
    var self = this;

    io.on('connection', function(socket){
      io.emit('initialize', self.files);
    });
  }
}

module.exports = MarkdownLive;
new MarkdownLive();
