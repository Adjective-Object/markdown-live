import Gator from 'gator';
import Framework from './Framework';

class SidebarController extends Framework {
  initialize(Models, Views, Controllers) {
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
  }
}

export default {
  Controller: SidebarController,
};
