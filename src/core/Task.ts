import { ITask, TaskHooks, TaskParams } from "../types";
import { JobExecutionError } from "./JobExecutionError";

export class Task<
  TExecResult = unknown,
  FnArgs extends Array<unknown> = unknown[]
> implements ITask<TExecResult, FnArgs>
{
  readonly name?: string | undefined;
  protected _startedAt?: number | undefined;
  protected _endedAt?: number | undefined;
  protected _stoppedAt?: number | undefined;
  protected _isRunning: boolean;
  protected _hasErrors?: JobExecutionError[] = [];
  protected _results?: TExecResult;
  protected silent: boolean;
  protected hooks: TaskHooks = {};
  protected fn: (...args: FnArgs) => TExecResult | Promise<TExecResult>;

  constructor(
    fn: (...args: FnArgs) => TExecResult | Promise<TExecResult>,
    params?: TaskParams
  ) {
    if (!fn || typeof fn !== "function") {
      throw new JobExecutionError(
        `Param 'fn' is not a function, cannot be executed.`
      );
    }
    this.silent = !!params?.silent;
    this.name = params?.name;
    this.fn = fn;
  }
  addHook(
    hook: "onSuccess",
    fn: <T = unknown[]>(result: T) => void | Promise<void>
  ): this;
  addHook(
    hook: "beforeStart",
    fn: (task: Task<TExecResult, FnArgs>) => void | Promise<void>
  ): this;
  addHook(
    hook: "onError",
    fn: (error: JobExecutionError) => void | Promise<void>
  ): this;
  addHook(hook: "onError", fn: () => void | Promise<void>): this;

  addHook(
    hook: keyof TaskHooks,
    fn: TaskHooks[typeof hook]
  ): Task<TExecResult, FnArgs> {
    if (!fn || typeof fn !== "function") {
      new JobExecutionError(`Param 'fn' is not a function`);
    }

    this.hooks = {
      ...this.hooks,
      [hook]: fn,
    };

    return this;
  }

  async run(...args: FnArgs): Promise<TExecResult | undefined> {
    try {
      this._startedAt = Date.now();
      this._isRunning = true;
      await this.hooks.beforeStart?.(this);
      this._results = await this.fn(...args);
      await this.hooks.onSuccess?.(this._results);
      this._endedAt = Date.now();
      return this.results;
    } catch (error) {
      const taskError = new JobExecutionError(error.message);
      this.hasErrors?.push(taskError);
      this.hooks.onError?.(taskError);
      if (!this.silent) throw taskError;
    } finally {
      this._stoppedAt = Date.now();
      this.hooks.onFinish?.();
      this._isRunning = false;
    }
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
  get hasErrors() {
    return this._hasErrors;
  }
  get results() {
    return this._results;
  }
}
