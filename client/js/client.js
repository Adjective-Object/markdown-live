import domready from 'domready';
import {init as initPlatform} from './platform';

import Toast from './components/toasts';
import Directories from './components/directories';
import DocumentStates from './components/document-states';
import ConnectionManager from './components/connection-manager.js';
import Files from './components/files';
import _ from 'underscore';

// informs each Framework object of the
// Models, Views, and Controllers in the application
const initWorkspace = (Models, Views, Controllers) => {
  const all = _.union(
    _.keys(Models),
    _.keys(Views),
    _.keys(Controllers),
  );

  for (const model of all) {
    if (Models[model]) Models[model].initialize(Models, Views, Controllers);
    if (Views[model]) Views[model].initialize(Models, Views, Controllers);
    if (Controllers[model]) Controllers[model].initialize(Models, Views, Controllers);
  }

  for (const model of all) {
    if (Models[model]) Models[model].events();
    if (Views[model]) Views[model].events();
    if (Controllers[model]) Controllers[model].events();
  }
};

const init = () => {
  // sets up a workspace, then initializes it
  const Models = {};
  const Controllers = {};
  const Views = {};

  Controllers.Toast = new Toast.Controller();
  Controllers.Directories = new Directories.Controller();
  Controllers.DocumentStates = new DocumentStates.Controller();
  Controllers.ConnectionManager = new ConnectionManager.Controller();

  Views.Files = new Files.View();
  Models.Files = new Files.Model();
  Controllers.Files = new Files.Controller();

  initWorkspace(Models, Views, Controllers);
  initPlatform();
};

domready(init);
