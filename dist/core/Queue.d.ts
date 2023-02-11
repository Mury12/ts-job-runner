import { IQueue } from "../types";
export declare class Queue<T> implements IQueue<T> {
    readonly name?: string;
    protected _current: T;
    protected _list: T[];
    protected _executed: T[];
    constructor(name?: string);
    push(...items: T[]): void;
    next(): T | undefined;
    get current(): T;
    get length(): number;
    get executed(): T[];
    get list(): T[];
}
