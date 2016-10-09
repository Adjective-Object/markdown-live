// @flow
import * as types from 'flowtype/sangria-types';

import Framework from './Framework';
import {network} from '../platform';
import notificationTemplate from '../templates/notification.handlebars';
import _ from 'underscore';

function htmlToDomNodes(html: string): HTMLElement {
  const template = // HTMLTemplateElement
    document.createElement('template');
  template.innerHTML = html;
  return template.content.firstChild;
}

class ToastController extends Framework {
  elements: {
    dock: HTMLElement
  };

  initialize(
      Models: types.SangriaModels,
      Views: types.SangriaViews,
      Controllers: types.SangriaController
      ) {
    this.elements = {
      dock: document.getElementById('notification-dock'),
    };
  }

  events() {
    network.on('toast', (msg: types.Toast) => {
      this.notify(
        msg.title,
        msg.text || '',
        msg.kind || 'info',
        msg.actions || [],
        msg.timeout || null);
    });
  }

  notify(
    title: string,
    text: string,
    kind: types.ToastKind = 'info',
    actions: types.ToastMessage[] = [],
    timeout: number = 0) {
    let id: ?number = null;

    actions = actions.map(
      (a: types.ToastMessage): types.EvaluatedToastMessage => {
        if (typeof a.action === 'string') {
          return {
            text: a.text,
            /* eslint-disable no-eval */
            action: eval('(function() {' + a.action + '})'),
            /* eslint-enable no-eval */
          };
        }

        return a;
      });

    actions.push({
      text: 'ok',
      action: (e: MouseEvent): void => this.dismiss(id),
    });

    // create the element, bind the actions
    const toast = htmlToDomNodes(notificationTemplate({
      title, text, kind, actions,
    }));

    _.each(
        toast.querySelectorAll('button[notification-action]'),
        (button: HTMLElement, i: number) => { // HTMLButtonElement
          button.addEventListener('click', actions[i].action);
        });

    id = this.push({
      text,
      kind,
      actions,
      timeoutHandle: timeout
        ? setTimeout(() => { this.dismiss(id); }, timeout)
        : null,
      element: toast,
    });

    this.elements.dock.appendChild(toast);
    toast.classList.add('enter');
    setTimeout(() => {
      toast.classList.remove('enter');
    }, 0);
  }

  dismiss(id: ?number) {
    if (id === null || id === undefined) return;

    const tokill = this.data[id];
    if (tokill.timeoutHandle) {
      clearTimeout(tokill.timeoutHandle);
    }

    this.rm(id);

    tokill.element.classList.add('exit');
    setTimeout(() => {
      tokill.element.remove();
    }, 200);
  }
}

export default {
  Controller: ToastController,
}