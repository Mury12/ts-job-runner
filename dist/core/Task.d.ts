import { ITask, TaskHooks, TaskParams } from "../types";
import { JobExecutionError } from "./JobExecutionError";
export declare class Task<TExecResult = unknown, FnArgs extends Array<unknown> = unknown[]> implements ITask<TExecResult, FnArgs> {
    readonly name?: string | undefined;
    protected _startedAt?: number | undefined;
    protected _endedAt?: number | undefined;
    protected _stoppedAt?: number | undefined;
    protected _isRunning: boolean;
    protected _hasErrors?: JobExecutionError[];
    protected _results?: TExecResult;
    protected silent: boolean;
    protected hooks: TaskHooks;
    protected fn: (...args: FnArgs) => TExecResult | Promise<TExecResult>;
    constructor(fn: (...args: FnArgs) => TExecResult | Promise<TExecResult>, params?: TaskParams);
    addHook(hook: "onSuccess", fn: <T = unknown[]>(result: T) => void | Promise<void>): this;
    addHook(hook: "beforeStart", fn: (task: Task<TExecResult, FnArgs>) => void | Promise<void>): this;
    addHook(hook: "onError", fn: (error: JobExecutionError) => void | Promise<void>): this;
    addHook(hook: "onError", fn: () => void | Promise<void>): this;
    run(...args: FnArgs): Promise<TExecResult | undefined>;
    get startedAt(): number;
    get endedAt(): number;
    get stoppedAt(): number;
    get isRunning(): boolean;
    get hasErrors(): JobExecutionError[];
    get results(): TExecResult;
}
