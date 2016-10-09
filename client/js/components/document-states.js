import Gator from 'gator';
import Framework from './Framework';
import _ from 'underscore';

class DocumentStatesController extends Framework {
  initialize(Models, Views, Controllers) {
    this.set('classes', {});
    this.views = {};
    this.views.files = Views.Files;
    this.elements = {};
    this.elements.docview = document.getElementById('docview');
  }

  events() {
    Gator(document).on('click', '#toggle-collapse', (e) => {
      e.preventDefault();
      this.toggleStateClass('collapsed');
    });

    Gator(document).on('click', '#toggle-nightmode', (e) => {
      e.preventDefault();
      this.toggleStateClass('night');
    });

    this.views.files.on('newFrame', this.setStateClasses.bind(this));
  }

  setStateClasses(iframe) {
    const classes = this.data.classes;
    for (const className in this.gt('classes')) {
      iframe.contentDocument.body.classList.toggle(
        className,
        classes[className]
      );
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
      this.elements.docview.getElementsByTagName('iframe')
    ).forEach((iframe) => {
      this.setStateClasses(iframe);
    });
  }
}

export default {
  Controller: DocumentStatesController,
};
