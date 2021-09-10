//@ts-check

"use strict";

const enqueuedIds = [];
const enqueuedTasks = [];

let running = 0;
let concurrency = 1;

/**
 * Set how many tasks will run concurrently.
 * 
 * @param {Number} max 
 */
function setConcurrency(max) {
    concurrency = max;
};

/**
 * Check whether a task with the specified id is already in the queue.
 * 
 * @param {String} id 
 */
function inQueue(id) {
    if ([undefined, null].includes(id)) { return false; }

    return enqueuedIds.includes(id);
};

/**
 * Check whether any tasks are still in the queue or running or the queue was drained.
 */
function drained() {
    if (enqueuedIds.length === 0) {
        return true;
    }

    return false;
}

/**
 * Add the id for a task to the list of enqueued ids.
 * 
 * @param {String} id 
 */
function enqueueId(id) {
    if ([undefined, null].includes(id)) { return; }

    enqueuedIds.push(id);
};

/**
 * Remove the id after the task has finished.
 * 
 * @param {String} id 
 */
function dequeueId(id) {
    if ([undefined, null].includes(id)) { return; }

    enqueuedIds.splice(enqueuedIds.indexOf(id), 1);
};

/**
 * Start a new task from the queue.
 */
function fireTask() {
	/*
		If there are pending tasks in the queue ...
	*/
    if (enqueuedTasks.length > 0) {
		/*
			... and there are less tasks running than can run concurrently ...
		*/
        if (running < concurrency) {
			/*
				... get a task from the queue ...
			*/
            const enqueuedTask = enqueuedTasks.shift();
            const id = enqueuedTask["id"];
            const task = enqueuedTask["task"];

			/*
				... and start it.
			*/
            const firedTask = new Promise(function (resolve, reject) {
                running++;

                task()
                    .then(() => { resolve(); })
                    .catch((error) => { reject(error); });
            });

			/*
				The task has finished.
			*/
            firedTask.then(() => {
                running--;

                dequeueId(id);
                fireTask();
            }).catch((error) => {
                console.log(error);

                running--;

                dequeueId(id);
                fireTask();
            });
        }
    }
};

/**
 * Add tasks to the queue and have them execute without caring about the result.
 * You should set the number of concurrent tasks with the "set_concurreny (max)" function, if
 * you wish for more than one task to be executed at a time.
 * an id and check whether it is already in the queue with the "in_queue (id)" function.
 * 
 * @param {String} id 
 * @param {any} task 
 */
function fireAndForget(id, task) {
	/*
		If an id is defined, check whether it is already in the queue.
		You should check this yourself before executing this function to avoid an exception.
	*/
    if (inQueue(id)) { throw "Task with id '" + id + "' is already in queue."; }

	/*
		If the id is valid, add it to the list of enqueued ids.
	*/
    enqueueId(id);

	/*
		Bind the parameters to the task.
	*/
    const boundTask = task.bind.apply(task, [null].concat([].slice.call(arguments).slice(2)));

	/*
		Add the task to the queue.
	*/
    enqueuedTasks.push({
        "id": id,
        "task": boundTask
    });

	/*
		Start a new task from the queue.
	*/
    fireTask();
};

module.exports.setConcurrency = setConcurrency;
module.exports.inQueue = inQueue;
module.exports.drained = drained;
module.exports.fireAndForget = fireAndForget;