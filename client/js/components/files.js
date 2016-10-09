import Framework from './Framework';
import Gator from 'gator';
import Prism from 'prismjs';
import 'prismjs/components/prism-handlebars.min.js';
import 'prismjs/components/prism-yaml.min.js';
import _ from 'underscore';
import {network} from '../platform';

import navTemplate from '../templates/file-list.handlebars';

const libraries = { Prism, Gator, Framework, _ };
function provideLibrary(name) {
  return libraries[name];
}

// This class is responsible for handling socket events from the server, as well
// as keeping track of the list of files currently being edited
class FilesModel extends Framework {
  initialize(Models, Views, Controllers) {
  }

  events() {
    network.on('initialize', (files) => {
      this.clear();
      if (files) {
        this.push(files);
        if (files[0]) {
          this.select(files[0]._id);
        }
      }
    });

    const pushUpdate = (file) => {
      const existingFile = this.find(file);
      if (!existingFile) {
        this.push(file);

        const node = this.find(file.path);
        this.select(node._id);
      }
      else {
        this.update(existingFile._id, file);
      }
    };

    network.on('push', pushUpdate);
    network.on('data', pushUpdate);

    network.on('rm', (path) => {
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
  initialize(Models, Views, Controllers) {
    this.model = {};
    this.model.files = Models.Files;

    this.element = {
      files: document.getElementById('files-listing'),
      documents: document.getElementById('docview'),
    };

    this.view = Views.Files;

    // perform initial render
    this.render();
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
    this.element.files.innerHTML = navTemplate({ dirs, current });

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
    else {
      Array.prototype.forEach.call(
        this.element.documents.children,
        (item) => item.remove()
      );
    }
  }

  postRender() {
    this.emit('postrender');

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
  initialize(Models, Views, Controllers) {
    this.bindPrintRequest(window);
  }

  events() {
    Gator(document).on('click', '[data-file]', (e) => {
      e.preventDefault();
      this.emit('switchFile', e.target.getAttribute('data-file') | 0);
    });
  }

  // hijacks a same-origin iframe element's links
  hijackIframe(iframe) {
    console.log('hijacking iframe');
    // redirect links
    const anchors =
      Array.prototype.slice.call(
        iframe.contentDocument.getElementsByTagName('a')
      );

    anchors.forEach((a) => {
      if (a.href.startsWith(window.location.href + '#')) {
        // hijack hash links to scroll the iframe
        const targetId = a.href.substring(a.href.indexOf('#') + 1);
        a.href = a.addEventListener('click', (e) => {
          console.log('hijacked ;)');
          e.preventDefault();
          iframe.contentWindow.scrollTo(
            0,
            iframe.contentDocument.getElementById(targetId).offsetTop
          );
        });
      }
      else {
        // hijack other links to open in a new tab
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      }
    });

    this.bindPrintRequest(iframe.contentWindow);

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

export default {
  Model: FilesModel,
  View: FilesView,
  Controller: FilesController,
};
