"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const JobExecutionError_1 = require("./JobExecutionError");
const Queue_1 = require("./Queue");
class Job {
    constructor(params) {
        this._startedAt = 0;
        this._endedAt = 0;
        this._hasErrors = [];
        this.hooks = {};
        this._results = [];
        this.name = params?.name;
        this.execAsync = params?.execAsync;
        this.logger = params?.logger || console.log;
        this.queue = new Queue_1.Queue(params?.queueName);
    }
    /**
     * Add a hook to the job.
     * @param hook
     * @param fn
     * @returns
     */
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
    addTask(task, ...fnArgs) {
        task.addHook("onError", (err) => {
            this._hasErrors.push(err);
        });
        this.queue.push({ task, args: fnArgs });
        return this;
    }
    async run() {
        this.logger(`[${this.name}] job starting...`);
        this._startedAt = Date.now();
        await this.hooks.beforeStart?.(this);
        await this.hooks.beforeAll?.();
        while (this.queue.next()) {
            const queue = this.queue.current;
            try {
                await this.hooks.beforeEach?.(queue.task);
                const results = await queue.task.run(...queue.args);
                this._results.push(results);
            }
            catch (error) {
                this._stoppedAt = Date.now();
                let jobError = error;
                if (!(error instanceof JobExecutionError_1.JobExecutionError)) {
                    jobError = new JobExecutionError_1.JobExecutionError(error.message);
                }
                this._hasErrors?.push(jobError);
                await this.hooks.onError?.(jobError);
            }
            finally {
                await this.hooks.afterEach?.(queue.task);
                if (this.shouldStop) {
                    this._stoppedAt = Date.now();
                    break;
                }
            }
        }
        if (!this.hasErrors.length)
            await this.hooks.onSuccess?.(this._results);
        await this.hooks.afterAll?.(this);
        await this.hooks.onFinish?.(this.hasErrors, this._results);
        this._endedAt = Date.now();
        if (this.stoppedAt) {
            this.logger(`[${this.name}] stopped within ${((this.stoppedAt || Date.now()) - this.startedAt) / 1000}s at ${new Date(this.stoppedAt)} with ${this._hasErrors.length} errors.`);
        }
        else {
            this.logger(`[${this.name}] finished job within ${((this.endedAt || Date.now()) - this.startedAt) / 1000}s`);
        }
    }
    stop() {
        this.shouldStop = true;
        this.logger("Process queue set to stop after the current job.");
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
    get results() {
        return this._results;
    }
}
exports.Job = Job;
