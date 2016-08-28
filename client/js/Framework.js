import { assign } from 'underscore';
import { MD5 as ObjMd5 } from 'object-hash';

export default class Framework {
  constructor() {
    this._guidCounter = 0;
    this.data = {};
    this.hashes = {};
    this.listeners = {};

    this.initialize();
    this.events();
  }

  push(val, emit = true) {
    if (Array.isArray(val)) {
      return val.map((v) => this.push(v, false));
    }

    val._id = this._guidCounter++;
    this.data[val._id] = val;

    if (emit) {
      this.emit('change');
    }

    return val._id;
  }

  set(id, val) {
    const valMd5 = ObjMd5(val);
    if (this.hashes[id] === valMd5) {
      return;
    }

    this.hashes[id] = valMd5;
    this.data[id] = val;
    this.emit('change');
  }

  get(filter) {
    for (const k in this.data) {
      if (filter(this.data[k])) {
        return this.data[k];
      }
    }
    return null;
  }

  gt(id) {
    return this.data[id];
  }

  update(id, newVal) {
    const valMd5 = ObjMd5(newVal);
    if (this.hashes[id] === valMd5) {
      return this.data[id];
    }

    this.data[id] = assign(this.data[id], newVal);
    this.hashes[id] = valMd5;
    this.emit('change');
    return this.data[id];
  }

  remove(filter) {
    let shouldUpdate = false;

    for (const k in this.data) {
      if (filter(this.data[k])) {
        delete this.data[k];
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      this.emit('change');
    }
  }

  rm(id) {
    delete this.data[id];
    this.emit('change');
  }

  clear() {
    this.data = {};
    this._guidCounter = 0;
  }

  asList() {
    return Object.getOwnPropertyNames(this.data).map((k) => this.data[k]);
  }

  on(evt, callback) {
    this.listeners[evt] = this.listeners[evt] || [];
    this.listeners[evt].push(callback);
  }

  emit(evt) {
    const args = Array.prototype.slice.call(arguments, 1);
    for (const x of this.listeners[evt] || []) {
      x.apply(null, args);
    }
  }
}

