import { assign } from 'underscore';

export default class Framework {
  constructor() {
    this._guidCounter = 0;
    this.data = {};
    this.listeners = {};

    this.initialize();
    this.events();
  }

  push(val, emit = true) {
    if (Array.isArray(val)) {
      for (let v of val) {
        this.push(v, false);
      }
    } else {
      val._id = this._guidCounter++;
      this.data[val._id] = val;
    }
    if (emit) {
      this.emit('change');
    }
  }

  set(key, val) {
    this.data[key] = val;
    this.emit('change');
  }

  get(filter) {
    for(let k in this.data) {
      if (filter(this.data[k])) {
        return this.data[k];
      }
    }
    return null;
  }

  update(id, newVal) {
    this.data[id] = assign(this.data[id], newVal);
    this.emit('change');
    return this.data[id];
  }

  remove(filter) {
    let shouldUpdate = false;

    for(let k in this.data) {
      if (filter(this.data[k])) {
        delete this.data[k];
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      this.emit('change');
    }
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
    let args = Array.prototype.slice.call(arguments, 1);
    for(let x of this.listeners[evt] || []) {
      x.apply(null, args);
    }
  }
}

