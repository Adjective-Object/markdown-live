import Gator from 'gator';
import Prism from 'prismjs';
import io from 'socket.io-client';
import _ from 'underscore';

import Framework from './Framework';

let navTemplate = require('./templates/nav.handlebars');
let docTemplate = require('./templates/document.handlebars');

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
      if (files[0]) {
        files[0].selected = true;
      }
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
      nav: document.getElementById('nav'),
      doc: document.getElementById('doc')
    };

    this.view = Views.Files;

    this.observer = new MutationObserver(() => {
      setTimeout(this.postRender.bind(this), 100)
    });

    this.observer.observe(
      this.element.doc.contentDocument.body,
      {
        childList: true,
      }
    );
  }

  events() {
    this.model.files.on('change', this.render.bind(this));

    this.view.on('switchFile', (a) => {
      this.model.files.select(a);
    });
  }

  render() {
    let dirs = _.groupBy(
        this.model.files.asList(),
        (a) => {
          return a.dir;
      });

    let current = this.model.files.getActive();

    // TODO try to persist stylesheets between laods
    var existingStylesheets = Array.prototype.slice.call(
      this.element.doc.contentDocument.stylesheets || []
    );

    this.element.nav.innerHTML = navTemplate({ dirs, current });
    existingStylesheets.forEach((e) => {
      this.element.doc.contentDocument.stylesheets.push(e);
    })
    this.element.doc.contentDocument.body.innerHTML = docTemplate({current});
  }

  postRender() {
    this.hijackIframe(doc);
    Prism.highlightAll();
  }

  hijackIframe(iframe) {
      var anchors = 
        Array.prototype.slice.call(
          iframe.contentDocument.getElementsByTagName('a')
        ).filter(
          (a) => a.href.startsWith(window.location.origin + "/#")
        );

    anchors.forEach((a) => {
      var anchorHash = a.href.substring(a.href.indexOf('#') + 1);
      a.addEventListener('click', (evt) => {
        evt.preventDefault();
        var elem = iframe.contentDocument.getElementById(anchorHash);

        iframe.contentDocument.body.scrollTop = elem.offsetTop;
      });
    });

    iframe.style.height = 0;
    iframe.style.minHeight = iframe.contentDocument.body.scrollHeight + "px";
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
      toggleStateClass('collapsed')
    });

    Gator(document).on('click', '#toggle-nightmode', (e) => {
      e.preventDefault();
      toggleStateClass('night')
    });

  }
}

const init = () => {
  Views.Files = new FilesView();
  Models.Files = new FilesModel();
  Controllers.Files = new FilesController();

  window.addEventListener('keydown', function(evt) {
    if ((evt.ctrlKey || evt.metaKey) && evt.key === 'p') {
      evt.preventDefault();
      var iframe = document.getElementsByTagName('iframe')[0];
      iframe.focus();
      iframe.contentWindow.print();      
    }
  });
};

function toggleStateClass(className) {
  var body = document.getElementsByTagName('body')[0];
  body.classList.toggle(className);  
  document.getElementById('document__body')
          .contentDocument.body
          .classList.toggle(className, body.classList.contains(className));
}

export default init;
