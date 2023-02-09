import { ITask, TaskHooks, TaskParams } from "../types";
import { JobExecutionError } from "./JobExecutionError";

export class Task<
  TExecResult = unknown,
  FnArgs extends Array<unknown> = unknown[]
> implements ITask<TExecResult, FnArgs>
{
  protected name?: string | undefined;
  protected _startedAt?: number | undefined;
  protected _endedAt?: number | undefined;
  protected _stoppedAt?: number | undefined;
  protected _isRunning: boolean;
  protected _hasErrors?: JobExecutionError[] | undefined;
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

  addHook(hook: keyof TaskHooks, fn: TaskHooks[typeof hook]): void {
    if (!fn || typeof fn !== "function") {
      new JobExecutionError(`Param 'fn' is not a function`);
    }

    this.hooks = {
      ...this.hooks,
      [hook]: fn,
    };
  }

  async run(...args: FnArgs): Promise<TExecResult | undefined> {
    try {
      await this.hooks.beforeStart?.();
      this._results = await this.fn(...args);
      await this.hooks.onSuccess?.();
      return this.results;
    } catch (error) {
      const err = new JobExecutionError(error);
      this.hooks.onError?.(err);
      if (!this.silent) throw err;
    } finally {
      this.hooks.onFinish?.();
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
