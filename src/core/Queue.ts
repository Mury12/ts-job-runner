import { IQueue } from "../types";
import { Task } from "./Task";

export class Queue<T> implements IQueue<T> {
  readonly name?: string;
  protected _current: T;
  protected _list: T[] = [];
  protected _executed: T[] = [];

  constructor(name?: string, private readonly keepRuns = true) {
    this.name = name;
  }

  push(...items: T[]) {
    this.list.push(...items);
  }

  next(): T | undefined {
    const next = this._list.shift();

    if (this._current && this.keepRuns) {
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
