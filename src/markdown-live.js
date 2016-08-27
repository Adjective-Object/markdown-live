import Gator from 'gator';
import Prism from 'prismjs';
import io from 'socket.io-client';
import _ from 'underscore';

import Framework from './Framework';

const libraries = { Prism, Gator, Framework, _ };
function provideLibrary(name) {
  return libraries[name];
}

const navTemplate = require('./templates/nav.handlebars');

// Db is provided by inline script from servers
/* eslint-disable no-undef */
const socketHost = Db.socket || 'http://localhost';
/* eslint-enable no-undef */
const socketClient = io.connect(socketHost);

// initializers
const Models = {};
const Controllers = {};
const Views = {};

// This class is responsible for handling socket events from the server, as well
// as keeping track of the list of files currently being edited
class FilesModel extends Framework {
  initialize() {
    socketClient.on('initialize', (files) => {
      this.clear();
      if (files) {
        this.push(files);
        if (files[0]) {
          this.select(files[0]._id);
        }
      }
    });
  }

  events() {
    const pushUpdate = (file) => {
      const existingFile = this.find(file);
      if (!existingFile) {
        this.push(file);

        const node = this.find(file.path);
        this.select(node);
      }
      else {
        this.update(existingFile._id, file);
      }
    };

    socketClient.on('push', pushUpdate);
    socketClient.on('data', pushUpdate);

    socketClient.on('rm', (path) => {
      const killedFile = this.find(path);
      if (killedFile) {
        this.remove((x) => x._id === killedFile._id);
      }
    });
  }

  find(fileOrPath) {
    const path = typeof (fileOrPath) === 'string'
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
    const active = this.getActive();
    if (active) {
      this.update(active._id, { selected: false });
    }
  }

  select(id) {
    // do nothing i the document is already active
    const active = this.getActive();
    if (active && id === active._id) {
      return this.data[id];
    }

    this.unselect();
    const updated = this.update(id, { selected: true });
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
      documents: document.getElementById('docview'),
    };

    this.view = Views.Files;
  }

  events() {
    this.model.files.on('change', this.render.bind(this));
    this.view.on('switchFile', (a) => {
      this.model.files.select(a);
    });
  }

  render() {
    const dirs = _.groupBy(
      this.model.files.asList(),
      (a) => a.dir
    );

    const current = this.model.files.getActive();
    this.element.nav.innerHTML = navTemplate({ dirs, current });

    if (current) {
      const newFrame = document.createElement('iframe');
      newFrame.srcdoc = current.content;

      // TODO defer render until after the iframe body is loaded
      // 'load' event does not guarantee this for some reason
      newFrame.addEventListener('load', () => {
        this.postRender();
      });

      this.element.documents.appendChild(newFrame);
    }
  }

  postRender() {
    // dump all but the last iframe
    const firstFrame = this.element.documents.childNodes[0];
    const scrollLeft = firstFrame.contentDocument.body.scrollLeft;
    const scrollTop = firstFrame.contentDocument.body.scrollTop;
    while(this.element.documents.childNodes.length > 1) {
      this.element.documents.childNodes[0].remove();
    }

    // scroll to the place the old iframe was at
    const newFrame = this.element.documents.childNodes[0];
    newFrame.contentDocument.body.scrollTop = scrollTop;
    newFrame.contentDocument.body.scrollLeft = scrollLeft;
    this.view.hijackIframe(newFrame);

    // inform the iframe that the post-render processing is complete
    const event = new CustomEvent('post-render', {});
    newFrame.contentDocument.dispatchEvent(event);
  }
}

// This 'Stapes' type object is responsible for handling user interaction
// with the dom
class FilesView extends Framework {
  initialize() {
    this.bindPrintRequest(window);
    this.set('classes', {});
  }

  setStateClasses(iframe) {
    const classes = this.data.classes;
    for (const className in classes) {
      iframe.contentDocument.body.classList.toggle(
        className,
        classes[className]);
    }
  }

  toggleStateClass(className) {
    // toggle if the class is set
    this.set('classes', _.assign(
      this.data.classes, {
        [className]: !this.data.classes[className],
      }));

    const body = document.getElementsByTagName('body')[0];
    body.classList.toggle(className);
    Array.prototype.slice.call(
        document.getElementById('docview').getElementsByTagName('iframe')
      ).forEach((iframe) => {
        this.setStateClasses(iframe);
      });
  }

  events() {
    Gator(document).on('click', '[data-file]', (e) => {
      e.preventDefault();
      this.emit('switchFile', e.target.getAttribute('data-file') | 0);
    });

    Gator(document).on('click', '#toggle-collapse', (e) => {
      e.preventDefault();
      this.toggleStateClass('collapsed');
    });

    Gator(document).on('click', '#toggle-nightmode', (e) => {
      e.preventDefault();
      this.toggleStateClass('night');
    });
  }

  // hijacks a same-origin iframe element's links
  hijackIframe(iframe) {
    // redirect links
    const anchors =
      Array.prototype.slice.call(
        iframe.contentDocument.getElementsByTagName('a')
      );

    anchors.forEach((a) => {
      if (a.href.startsWith(window.location.origin + '/#')) {
        // hijack hash links to scroll the iframe
        a.href = a.href.substring(a.href.indexOf('#') + 1);
      }
      else {
        // hijack other links to open in a new tab
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      }
    });

    this.bindPrintRequest(iframe.contentWindow);
    this.setStateClasses(iframe);

    // introduce a require-type hook in the iframe child
    iframe.contentWindow.use = provideLibrary;
  }

  bindPrintRequest(window) {
    window.addEventListener('keydown', function printHijacker(evt) {
      if ((evt.ctrlKey || evt.metaKey) && evt.key === 'p') {
        evt.preventDefault();
        const iframe = document.getElementsByTagName('iframe')[0];
        iframe.focus();
        iframe.contentWindow.print();
      }
    });
  }
}

const init = () => {
  Views.Files = new FilesView();
  Models.Files = new FilesModel();
  Controllers.Files = new FilesController();
};

export default init;
