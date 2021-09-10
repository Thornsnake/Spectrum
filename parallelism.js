//@ts-check

const enqueued_ids = [];
const enqueued_tasks = [];

let running = 0;
let concurrency = 10;

/**
 * Set how many tasks will run concurrently.
 * 
 * @param {Number} max 
 */
function set_concurrency(max) {
    concurrency = max;
};

/**
 * Check whether a task with the specified id is already in the queue.
 * 
 * @param {String} id 
 */
function in_queue(id) {
    if ([undefined, null].includes(id)) { return false; }

    return enqueued_ids.includes(id);
};

/**
 * Check whether any tasks are still in the queue or running or the queue was drained.
 */
function drained() {
    if (enqueued_ids.length === 0 && enqueued_tasks.length === 0 && running === 0) {
        return true;
    }

    return false;
}

/**
 * Add the id for a task to the list of enqueued ids.
 * 
 * @param {String} id 
 */
function enqueue_id(id) {
    if ([undefined, null].includes(id)) { return; }

    enqueued_ids.push(id);
};

/**
 * Remove the id after the task has finished.
 * 
 * @param {String} id 
 */
function dequeue_id(id) {
    if ([undefined, null].includes(id)) { return; }

    enqueued_ids.splice(enqueued_ids.indexOf(id), 1);
};

/*
	Start a new task from the queue.
*/
function fire_task() {
	/*
		If there are pending tasks in the queue ...
	*/
    if (enqueued_tasks.length > 0) {
		/*
			... and there are less tasks running than can run concurrently ...
		*/
        if (running < concurrency) {
			/*
				... get a task from the queue ...
			*/
            const enqueued_task = enqueued_tasks.shift();
            const id = enqueued_task["id"];
            const task = enqueued_task["task"];

			/*
				... and start it.
			*/
            const fired_task = new Promise(function (resolve, reject) {
                running++;

                task()
                    .then(() => { resolve(); })
                    .catch((error) => { reject(error); });
            });

			/*
				The task has finished.
			*/
            fired_task.then(() => {
                running--;

                dequeue_id(id);
                fire_task();
            }).catch((error) => {
                console.log(error);

                running--;

                dequeue_id(id);
                fire_task();
            });
        }
    }
};

/**
 * Add tasks to the queue and have them execute without caring about the result.
 * You should set the number of concurrent tasks with the "set_concurreny (max)" function, if
 * you wish for more than one task to be executed at a time.
 * If a specific task should be unique and only have one instance of itself running, give it
 * an id and check whether it is already in the queue with the "in_queue (id)" function.
 * 
 * @param {String} id 
 * @param {any} task 
 */
async function fire_and_forget(id, task) {
	/*
		If an id is defined, check whether it is already in the queue.
		You should check this yourself before executing this function to avoid an exception.
	*/
    if (in_queue(id)) { throw "Task with id '" + id + "' is already in queue."; }

	/*
		If the id is valid, add it to the list of enqueued ids.
	*/
    enqueue_id(id);

	/*
		Bind the parameters to the task.
	*/
    const bound_task = task.bind.apply(task, [null].concat([].slice.call(arguments).slice(2)));

	/*
		Add the task to the queue.
	*/
    enqueued_tasks.push({
        "id": id,
        "task": bound_task
    });

	/*
		Start a new task from the queue.
	*/
    fire_task();
};

/**
 * Executes all provided tasks in parallel and returns their return values, no matter if the
 * task failed or succeeded.
 * 
 * @param {any} tasks 
 */
async function fire_all_and_return(tasks) {
    return await Promise.all(
        tasks.map(
            p => p.catch(
                (error) => error
            )
        )
    ).catch((error) => {
        /* This should be impossible to trigger. */
        throw error;
    });
};

module.exports.set_concurrency = set_concurrency;
module.exports.in_queue = in_queue;
module.exports.drained = drained;
module.exports.fire_and_forget = fire_and_forget;
module.exports.fire_all_and_return = fire_all_and_return;