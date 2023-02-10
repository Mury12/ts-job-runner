import { Task } from "./core/Task";
import { JobExecutionError } from "./core/JobExecutionError";
import { Queue } from "./core/Queue";

export interface TaskHooks {
  onFinish?: () => void | Promise<void>;
  onSuccess?: <T>(result: T) => void | Promise<void>;
  beforeStart?: (task: ITask) => void | Promise<void>;
  onError?: (error: JobExecutionError) => void | Promise<void>;
}

export interface TaskParams<T = unknown> {
  name?: string;
  silent?: boolean;
}

export interface ITask<T = unknown, A extends Array<unknown> = unknown[]> {
  startedAt?: number;
  endedAt?: number;
  stoppedAt?: number;
  isRunning: boolean;
  hasErrors?: JobExecutionError[];
  results?: T;

  run(...args: A): Promise<T | undefined>;

  addHook(hook: keyof TaskHooks, fn: TaskHooks[typeof hook]): void;
}

export interface IQueue<T> {
  length: number;
  name?: string;
  executed: T[];
}

export interface JobHooks {
  onSuccess?: <T = unknown[]>(result: T) => void | Promise<void>;
  beforeStart?: () => void | Promise<void>;
  onError?: (error: JobExecutionError) => void | Promise<void>;
  beforeAll?: () => void | Promise<void>;
  beforeEach?: (task: Task) => void | Promise<void>;
  beforeClose?: () => void | Promise<void>;
  afterEach?: (task: Task) => void | Promise<void>;
  afterAll?: () => void | Promise<void>;
  afterClose?: () => void | Promise<void>;
  onFinish?: <T = unknown[]>(
    errors: JobExecutionError[],
    results: T
  ) => void | Promise<void>;
}

export interface JobParams {
  name?: string;
  queueName?: string;
  execAsync?: boolean;
  logger?: (str: string) => void;
}

export interface IJob {
  startedAt?: number;
  endedAt?: number;
  stoppedAt?: number;
  isRunning: boolean;
  hasErrors?: JobExecutionError[];

  run(): void;
  addHook(hook: keyof JobHooks, fn: JobHooks[typeof hook]): void;
  addTask(task: Task | Task[]): void;
  stop(): void;
}
