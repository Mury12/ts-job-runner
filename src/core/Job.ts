import { IJob, JobHooks, JobParams, TaskHooks } from "../types";
import { JobExecutionError } from "./JobExecutionError";
import { Queue } from "./Queue";
import { Task } from "./Task";

export class Job implements IJob {
  readonly name?: string;
  protected queue: Queue<{ task: Task; args: unknown[] }>;
  protected _startedAt: number = 0;
  protected _endedAt: number = 0;
  protected _stoppedAt?: number | undefined;
  protected _isRunning: boolean;
  protected _hasErrors: JobExecutionError[] = [];
  protected hooks: JobHooks = {};
  protected execAsync?: boolean;
  protected results: unknown[] = [];
  private logger: (str: string) => void;

  constructor(params?: JobParams) {
    this.name = params?.name;
    this.execAsync = params?.execAsync;
    this.logger = params?.logger || console.log;
    this.queue = new Queue(params?.queueName);
  }

  addTask(task: Task<any, any[]>, ...fnArgs: unknown[]): Job {
    task.addHook("onError", (err) => {
      this._hasErrors.push(err);
    });

    this.queue.push({ task, args: fnArgs });
    return this;
  }

  async run() {
    this.logger(`[${this.name}] job starting...`);
    this._startedAt = Date.now();

    await this.hooks.beforeAll?.();
    while (this.queue.next()) {
      const queue = this.queue.current;
      try {
        await this.hooks.beforeEach?.(queue.task);
        const results = await queue.task.run(...queue.args);
        this.results.push(results);
      } catch (error) {
        this._stoppedAt = Date.now();
        let jobError = error;
        if (!(error instanceof JobExecutionError)) {
          jobError = new JobExecutionError(error.message);
        }
        this._hasErrors?.push(jobError);
        await this.hooks.onError?.(jobError);
      } finally {
        await this.hooks.afterEach?.(queue.task);
      }
    }
    if (!this.hasErrors.length) await this.hooks.onSuccess?.(this.results);
    await this.hooks.afterAll?.();
    await this.hooks.onFinish?.(this.hasErrors, this.results);
    this._endedAt = Date.now();

    this.logger(
      `[${this.name}] finished job within ${
        (this.endedAt || this.stoppedAt || Date.now() - this.startedAt) / 1000
      }s`
    );
  }

  addHook(hook: keyof JobHooks, fn: JobHooks[typeof hook]): Job {
    if (!fn || typeof fn !== "function") {
      new JobExecutionError(`Param 'fn' is not a function`);
    }

    this.hooks = {
      ...this.hooks,
      [hook]: fn,
    };

    return this;
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
