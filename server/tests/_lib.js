import {fs} from 'mz';
import path from 'path';

function write(fpath, content) {
  let fd = 0;
  return fs.open(fpath, 'wx')
    .then((_fd: int) => {
      fd = _fd;
      return fs.write(fd, content);
    })
    .then(() => fs.close(fd));
}

export function initDir(dir, files) {
  const promises = [];

  for (const file in files) {
    promises.push(write(path.join(dir, file)));
  }

  return Promise.all(promises);
}
