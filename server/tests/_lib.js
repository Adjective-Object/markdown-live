import {fs} from 'mz';
import path from 'path';

function mkdirp(dirname) {
  return fs.exists(dirname)
    .then((exists) => {
      if (!exists) {
        return fs.mkdir(dirname);
      }
    });
}

function write(fpath, content) {
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

  for (const file in files) {
    promises.push(write(path.join(dir, file), files[file]));
  }

  return mkdirp(dir)
    .then(() => Promise.all(promises))
    .catch((e) => {
      console.error('o shit I can\'t even', e);
      process.exit(1);
    });
}

export function _try(itfn) {
  return (done) => {
    try {
      itfn(done);
    }
    catch(e) {
      done(e);
    }
  };
}
