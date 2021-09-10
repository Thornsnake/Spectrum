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
        const jobId = serverId + "_default";

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
    //queue.setConcurrency(100);
    queue.setConcurrency(1);

    // Run once immediately after start.
    run();

    // Run once every minute.
    /*setInterval(
        async () => {
            if (esi.getErrorResponseCount() >= esi.getErrorThreshold()) {
                const status = await esi.getStatus();

                if (Number(status["status_code"]) === 200 || Number(status["status_code"]) === 304) {
                    esi.setErrorResponseCount(0);
                }
                else {
                    return;
                }
            }
            else {
                esi.setErrorResponseCount(0);
            }

            run();
        },
        60000
    );*/

}

module.exports.start = start;