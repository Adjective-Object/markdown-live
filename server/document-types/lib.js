'use strict';

function ClientError(toast) {
  this.toast = toast;
  this.toast.kind = this.toast.kind || 'error';
}
ClientError.prototype = Error;

module.exports = {
  ClientError: ClientError,
};
