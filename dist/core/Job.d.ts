import { IJob, JobHooks, JobParams } from "../types";
import { JobExecutionError } from "./JobExecutionError";
import { Queue } from "./Queue";
import { Task } from "./Task";
export declare class Job implements IJob {
    readonly name?: string;
    protected queue: Queue<{
        task: Task;
        args: unknown[];
    }>;
    protected _startedAt: number;
    protected _endedAt: number;
    protected _stoppedAt?: number | undefined;
    protected _isRunning: boolean;
    protected _hasErrors: JobExecutionError[];
    protected hooks: JobHooks;
    protected execAsync?: boolean;
    protected results: unknown[];
    protected shouldStop: boolean;
    private logger;
    constructor(params?: JobParams);
    addTask(task: Task<any, any[]>, ...fnArgs: unknown[]): Job;
    run(): Promise<void>;
    addHook(hook: keyof JobHooks, fn: JobHooks[typeof hook]): Job;
    stop(): void;
    get hasErrors(): JobExecutionError[];
    get startedAt(): number;
    get endedAt(): number;
    get stoppedAt(): number;
    get isRunning(): boolean;
}
