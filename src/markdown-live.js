import Gator from 'gator';
import Prism from 'prismjs';
import io from 'socket.io-client';
import _ from 'underscore';

import Framework from './Framework';

let markdownTemplate = require('./markdown.handlebars');

// Db is provided by inline script from serverS
/* eslint-disable no-undef */
let socketHost = Db.socket || 'http://localhost';
/* eslint-enable no-undef */
let socketClient = io.connect(socketHost);

// initializers
let Models = {};
let Controllers = {};
let Views = {};

// Models logic
class FilesModel extends Framework {
  initialize() {
    socketClient.on('initialize', (files) => {
      this.clear();
      files[0].selected = true;
      this.push(files);
    });
  }

  events() {
    let pushUpdate = (file) => {
      let existingFile = this.find(file);
      if (!existingFile) {
        this.push(file);

        let node = this.find(file.path);
        this.select(node);
      } else {
        this.update(existingFile._id, file);
      }
    };

    socketClient.on('push', pushUpdate);
    socketClient.on('data', pushUpdate);

    socketClient.on('rm', (path) => {
      let killedFile = this.find(path);
      if (killedFile) {
        this.remove((x) => x._id === killedFile._id);
      }
    });
  }

  find(fileOrPath) {
    let path = typeof (fileOrPath) === 'string'
        ? fileOrPath        // is path
        : fileOrPath.path;  // is file
    return this.get((file) => {
      return file.path === path;
    });
  }

  getActive() {
    return this.get((file) => file.selected || false);
  }

  unselect() {
    let active = this.getActive();

    if (active) {
      this.update(active._id, { selected: false });
    }
  }

  select(id) {
    this.unselect();
    return this.update(id, {
      selected: true
    });
  }
}

// controllers
class FilesController extends Framework {
  initialize() {
    this.model = {};
    this.model.files = Models.Files;

    this.element = {
      markdown: document.getElementById('markdown')
    };

    this.view = Views.Files;
  }

  events() {
    this.model.files.on('change', this.render.bind(this));

    this.view.on('switchFile', (a) => {
      this.model.files.select(a);
    }
    );
  }

  render() {
    let directories = _.groupBy(
        this.model.files.asList(),
        (a) => {
          return a.dir;
        });


    let directoryHTML = markdownTemplate({
      dirs: directories,
      current: this.model.files.getActive()
    });

    this.element.markdown.innerHTML = directoryHTML;
    Prism.highlightAll();
  }
}


// runtime event handlers
class FilesView extends Framework {
  initialize() {}

  events() {
    Gator(document).on('click', '[data-file]', (e) => {
      e.preventDefault();
      this.emit('switchFile', e.target.getAttribute('data-file') | 0);
    });

    Gator(document).on('click', '#toggle-collapse', (e) => {
      e.preventDefault();
      document.getElementsByTagName('body')[0]
              .classList.toggle('collapsed');
    });

    Gator(document).on('click', '#toggle-nightmode', (e) => {
      e.preventDefault();
      document.getElementsByTagName('body')[0]
              .classList.toggle('night');
    });

  }
}

const init = () => {
  Views.Files = new FilesView();
  Models.Files = new FilesModel();
  Controllers.Files = new FilesController();
};

export default init;


