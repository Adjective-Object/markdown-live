'use strict';

function ClientError(toast) {
  this.toast = toast;
  this.toast.kind = this.toast.kind || 'error';
}
ClientError.prototype = Error;

function containsObject(obj, list) {
  let x;
  for (x in list) {
    if (list.hasOwnProperty(x) && list[x] === obj) {
      return true;
    }
  }
  return false;
}

function recurseKeys(obj, slug, blacklist) {
  slug = slug || '';
  blacklist = blacklist || [];
  for (const x in obj) {
    const attrPath = slug + '.' + x;
    if (typeof obj[x] === 'object') {
      if (containsObject(obj[x], blacklist)) {
        console.log(attrPath + '...');
      }
      else {
        const newBlacklist = blacklist.concat([obj[x]]);
        recurseKeys(obj[x], attrPath, newBlacklist);
      }
    }
    else {
      console.log(attrPath);
    }
  }
}

module.exports = {
  ClientError: ClientError,
  recurseKeys: recurseKeys,
};
