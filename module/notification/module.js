//@ts-check

"use strict";

const bot = require("../../bot.js");
const esi = require("../../esi.js");

const queue = require("./queue.js");
const job = require("./job.js");

async function run() {

    // Get a list of all servers and their ids.
    const serverIdList = bot.client.guilds.cache.keyArray();

    for (let i = 0; i < serverIdList.length; i++) {

        // If the job for this server and module is already running, skip it.
        const serverId = serverIdList[i];
        const jobId = serverId + "_notification";

        if (queue.inQueue(jobId)) {
            continue;
        }

        // Enqueue a new job.
        queue.fireAndForget(
            jobId,
            job.run,
            serverId
        );

    }

}

async function start() {

    // Set how many jobs will run concurrently.
    queue.setConcurrency(1000);

    // Run once immediately after start.
    run();

    // Run once every minute.
    setInterval(
        async () => {
            if (esi.getErrorResponseCount() >= esi.getErrorThreshold()) {
                return;
            }

            run();
        },
        60000
    );

}

module.exports.start = start;