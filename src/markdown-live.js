import Gator from 'gator';
import Prism from 'prismjs';
import io from 'socket.io-client';
import _ from 'underscore';

import Framework from './Framework';

let navTemplate = require('./templates/nav.handlebars');

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
      if (files) {
        this.push(files);
        if (files[0]) {
          this.select(files[0]._id)
        }

      }
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
    if ( active ) {
      this.update(active._id, { selected: false });
    }
  }

  select(id) {
    // do nothing i the document is already active
    let active = this.getActive();
    if ( active && id === active._id) {
      return this.data[id];
    }

    this.unselect();
    let updated = this.update(id, { selected: true });
    document.title = updated ? updated.name : 'Markdown Live';
    return updated;
  }
}

// controllers
class FilesController extends Framework {
  initialize() {
    this.model = {};
    this.model.files = Models.Files;

    this.element = {
      nav: document.getElementById('nav'),
      documents: document.getElementById('docview')
    };

    this.view = Views.Files;
  }

  events() {
    this.model.files.on('change', this.render.bind(this));
    this.view.on('switchFile', (a) => {
      this.model.files.select(a);
    });

    this.bindPrintRequest(window);
  }

  render() {
    let dirs = _.groupBy(
      this.model.files.asList(),
      (a) => a.dir
    );

    let current = this.model.files.getActive();
    this.element.nav.innerHTML = navTemplate({ dirs, current });

    if (current) {
      let newFrame = document.createElement('iframe');
      newFrame.srcdoc = current.content;

      // TODO defer render until after the iframe body is loaded
      // 'load' event does not guarantee this for some reason
      newFrame.addEventListener('load', () => {
        this.postRender()
      });

      this.element.documents.appendChild(newFrame);
    }
  }

  postRender() {
    // dump all but the last iframe
    let firstFrame = this.element.documents.childNodes[0];
    let scrollLeft = firstFrame.contentDocument.body.scrollLeft;
    let scrollTop = firstFrame.contentDocument.body.scrollTop;
    while(this.element.documents.childNodes.length > 1) {
      this.element.documents.childNodes[0].remove();
    }

    let newFrame = this.element.documents.childNodes[0];
    newFrame.contentDocument.body.scrollTop = scrollTop;
    newFrame.contentDocument.body.scrollLeft = scrollLeft;
    this.hijackIframe(newFrame);
    Prism.highlightAll();
  }

  hijackIframe(iframe) {
    // redirect links
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

    this.bindPrintRequest(iframe.contentWindow);
  }

  bindPrintRequest(window) {
    window.addEventListener('keydown', function(evt) {
      if ((evt.ctrlKey || evt.metaKey) && evt.key === 'p') {
        evt.preventDefault();
        var iframe = document.getElementsByTagName('iframe')[0];
        iframe.focus();
        iframe.contentWindow.print();      
      }
    });
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
};

function toggleStateClass(className) {
  var body = document.getElementsByTagName('body')[0];
  body.classList.toggle(className);  
  Array.prototype.slice.call(
      document.getElementById("docview").getElementsByTagName('iframe')
    ).forEach((e) => {
        e.contentDocument.body.classList.toggle(
            className,
            body.classList.contains(className
          ));
      });
}

export default init;
