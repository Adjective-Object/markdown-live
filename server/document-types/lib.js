'use strict';
const handlebars = require('handlebars');

const path = require('path');
const fs = require('fs');

function ClientError(toast) {
    this.toast = toast;
    this.toast.kind = this.toast.kind || 'error';
}
ClientError.prototype = Error;

module.exports = {
    ClientError: ClientError,
};
