import Framework from './Framework';
import {network} from '../platform'

class ConnectionManager extends Framework {
  initialize(Models, Views, Controllers) {
    this.controllers = {
      toast: Controllers.Toast,
    };
  }

  events() {
    network.on('disconnect', () => {
      this.controllers.toast.notify(
        'disconnect',
        'socket connection to server was lost',
        'error',
        [],
        2000
      );
    });

    network.on('reconnect', () => {
      this.controllers.toast.notify(
        'reconnect',
        'socket connection restored',
        'ok',
        [],
        2000
      );
    });
  }
}

export default {
  Controller: ConnectionManager,
};
