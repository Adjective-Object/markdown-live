import Gator from 'gator';
import Framework from './Framework';
import {network} from '../platform';

class DirectoriesController extends Framework {
  initialize(Models, Views, Controllers) {
    this.element = {
      input: document.querySelector('#input-directory'),
    };
  }

  events() {
    Gator(document).on('click', '#submit-directory', (e) => {
      network.emit(
        'addDir',
        { path: this.element.input.value }
      );
    });

    Gator(document).on('click', '.remove-directory', (e) => {
      const targetDir = e.target.getAttribute('data-dir');
      network.emit(
        'rmDir',
        { path: targetDir }
      );
    });
  }
}

export default {
  Controller: DirectoriesController,
};
