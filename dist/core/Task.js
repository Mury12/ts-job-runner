"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const JobExecutionError_1 = require("./JobExecutionError");
class Task {
    constructor(fn, params) {
        this.hooks = {};
        if (!fn || typeof fn !== "function") {
            throw new JobExecutionError_1.JobExecutionError(`Param 'fn' is not a function, cannot be executed.`);
        }
        this.silent = !!params?.silent;
        this.name = params?.name;
        this.fn = fn;
    }
    addHook(hook, fn) {
        if (!fn || typeof fn !== "function") {
            new JobExecutionError_1.JobExecutionError(`Param 'fn' is not a function`);
        }
        this.hooks = {
            ...this.hooks,
            [hook]: fn,
        };
        return this;
    }
    async run(...args) {
        try {
            this._startedAt = Date.now();
            this._isRunning = true;
            await this.hooks.beforeStart?.(this);
            this._results = await this.fn(...args);
            await this.hooks.onSuccess?.(this._results);
            this._endedAt = Date.now();
            return this.results;
        }
        catch (error) {
            const taskError = new JobExecutionError_1.JobExecutionError(error.message);
            this.hasErrors?.push(taskError);
            this.hooks.onError?.(taskError);
            if (!this.silent)
                throw taskError;
        }
        finally {
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
exports.Task = Task;
