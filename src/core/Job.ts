import { IJob, JobHooks, JobParams, TaskHooks } from "../types";
import { JobExecutionError } from "./JobExecutionError";
import { Queue } from "./Queue";
import { Task } from "./Task";

export class Job implements IJob {
  readonly name?: string;
  protected queue: Queue<Task>;
  protected _startedAt: number = 0;
  protected _endedAt: number = 0;
  protected _stoppedAt?: number | undefined;
  protected _isRunning: boolean;
  protected _hasErrors: JobExecutionError[] = [];
  protected hooks: JobHooks = {};
  protected execAsync?: boolean;

  constructor(params?: JobParams) {
    this.name = params?.name;
    this.execAsync = params?.execAsync;

    this.queue = new Queue<Task>(params?.queueName);
  }

  addTask(...tasks: Task[]): void {
    this.queue.push(...tasks);
  }

  async run() {
    console.log(`Starting job ${this.name}`);
    this._startedAt = Date.now();

    await this.hooks.beforeAll?.();
    while (this.queue.next()) {
      const task = this.queue.current;
      try {
        await this.hooks.beforeEach?.();
        await task.run();
        await this.hooks.onSuccess?.();
      } catch (error) {
        let jobError = error;
        if (!(error instanceof JobExecutionError)) {
          jobError = new JobExecutionError(error.message);
        }
        this._hasErrors?.push(jobError);
        await this.hooks.onError?.(jobError);
      } finally {
        await this.hooks.afterEach?.();
      }
    }
    await this.hooks.afterAll?.();
    await this.hooks.onFinish?.();
    this._endedAt = Date.now();

    console.log(
      `Finished job ${this.name}`,
      (this.endedAt - this.startedAt) / 1000,
      "s"
    );
  }

  addHook(hook: keyof JobHooks, fn: JobHooks[typeof hook]): void {
    if (!fn || typeof fn !== "function") {
      new JobExecutionError(`Param 'fn' is not a function`);
    }

    this.hooks = {
      ...this.hooks,
      [hook]: fn,
    };
  }

  stop(): void {
    throw new Error("Method not implemented.");
  }

  get hasErrors() {
    return this._hasErrors;
  }
  get startedAt() {
    return this._startedAt;
  }
  get endedAt() {
    return this._endedAt;
  }
  get stoppedAt() {
    return this._stoppedAt;
  }
  get isRunning() {
    return this._isRunning;
  }
}
