"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    constructor(name) {
        this._list = [];
        this._executed = [];
        this.name = name;
    }
    push(...items) {
        this.list.push(...items);
    }
    next() {
        const next = this._list.shift();
        if (this._current) {
            this._executed.push(this._current);
        }
        if (next) {
            this._current = next;
        }
        return next;
    }
    get current() {
        return this._current;
    }
    get length() {
        return this.list.length;
    }
    get executed() {
        return this._executed;
    }
    get list() {
        return this._list;
    }
}
exports.Queue = Queue;
