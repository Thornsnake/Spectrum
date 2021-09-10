let _queue = [];
let _running = 0;
let _concurrency = 1;

function drained() {
    return _queue.length === 0;
};

function add(task, params) {
    return new Promise((resolve, reject) => {
        enqueue(task, params, (error, result) => {
            error ? reject(error) : resolve(result);
        });
    });
};

function enqueue(task, params, callback) {
    const boundTask = task.bind.apply(task, [null].concat(params));
    _queue.push({
        task: boundTask,
        callback: callback
    });
    fireTask();
};

function fireTask() {
    if (_queue.length === 0) {
        return;
    }
    if (_running >= _concurrency) {
        return;
    }
    const task = _queue.shift();
    _running++;
    task.task().then((result) => {
        task.callback(null, result);
        _running--;
        fireTask();
    }).catch((error) => {
        task.callback(error);
        _running--;
        fireTask();
    });
};

module.exports.drained = drained;
module.exports.add = add;