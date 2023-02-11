# TS Job Runner

Simple queue-based job runner for NodeJS.
This library is meant to be used in order to organise and run jobs/tasks for a process
and also can be used to run any kind of desired function.

> Every task in the queue will be executed in sequence.

> Tasks can be executed by itself without the use of a Queue or a Job, just calling `new Task(fn).run()`

### Hooks

Hooks can be used to fulfill the job lifetime, those are:

- `onSuccess(result)`: executes when job finish with no errors, return the result array as argument
- `beforeStart(job)`: executed before the start, return the job to as argument
- `onError(error)`: executed whenever an error occurs, return the error as an argument
- `beforeAll`: executed before starting the queue
- `beforeEach(task)`: executed before each task, return the next task as argument
- `beforeClose`: executed before onFinish
- `afterEach(task)`: executed after each task has finished, return the task as argument
- `afterAll(job)`: before onClose
- `afterClose`: executed after onFinish
- `onFinish(errors, results)`: executed whenever the job finished with or without errors, return errors and result array as argument

## Usage example

### Prepare and run a Job

```ts
import { Job, Task } from "mury12/job-runner";

function sum(a, b) {
  return a + b;
}

function divide(a, b) {
  return a / b;
}

async function fetchDataFromSomewhere(userId) {
  axios.get(`https://example.com/customers/${userId}`);
}

const job = new Job({ name: "My Job ;)" });

job
  .addTask(new Task(sum, { name: "Task1" }), 25, 30)
  .addTask(new Task(divide), 10, 2)
  .addTask(new Task(fetchDataFromSomewhere, { name: "FetchData" }), userId)
  .addHook("beforeEach", (task: Task) => {
    console.log(`Started task ${task.name}`);
  })
  .addHook("afterEach", (task: Task) => {
    console.log(`Finished task ${task.name}. Results:`);
    console.log(task.results);
  })
  .addHook("onFinish", (job: Job) => {
    SomeService.notify(`Job ${job.name} finished`);
  })
  .run(); // Job run is async
```

---

### Run a Task

```ts
import { Task } from "mury12/job-runner";
// You can use an async function or `.then`
// And can also use hooks:
// onFinish, onSuccess(result), beforeStart(task), and onError(error)
async function runTask() {
  const task = new Task(async (userId) =>
    axios.get(`https://example.com/customers/${userId}`)
  );
  const results = await task.run(2);
  console.log(result.data);
}
```
