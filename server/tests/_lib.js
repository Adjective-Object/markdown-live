import {fs} from 'mz';
import path from 'path';
import rmdir from 'rmdir';

function mkdirp(dirname) {
  return fs.exists(dirname)
    .then((exists): ?Promise<void> => {
      if (!exists) return fs.mkdir(dirname);
      return null;
    });
}

export function write(fpath, content) {
  let fd = 0;
  return (
    fs.exists(fpath)
    .then((exists) => {
      if (exists) {
        return fs.unlink(fpath);
      }
      return null;
    })
    .then(() => fs.open(fpath, 'wx'))
    .then((_fd) => {
      fd = _fd;
      return fs.write(fd, content, 0, content.length);
    })
    .then(() => fs.close(fd))
  );
}

export function initDir(dir, files) {
  const promises = [];

  return mkdirp(dir)
    .then(() => {
      for (const file in files) {
        promises.push(write(path.join(dir, file), files[file]));
      }

      return Promise.all(promises);
    })
    .catch((e) => {
      console.error('o shit I can\'t even', e);
      console.trace(e.stack);
      process.exit(1);
    });
}

export function rmDir(dirname) {
  return new Promise(function promiseRmdir(resolve, reject) {
    try {
      rmdir(dirname, resolve);
    }
    catch(e) {
      reject();
    }
  });
}

export function _try(itfn) {
  return (done) => {
    try {
      const x = itfn(done);
      if (x instanceof Promise) {
        x.catch(done);
      }
    }
    catch(e) {
      done(e);
    }
  };
}
