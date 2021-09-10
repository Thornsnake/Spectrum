//@ts-check

"use strict";

require("loadavg-windows");

const os = require("os");

const bot = require("./bot.js");
const output = require("./output");

async function displaySystemResources() {
    setInterval(
        async () => {
            try {
                const loadAverage = os.loadavg();
                const cores = os.cpus().length;

                const loadAverageFifteenMinutes = (loadAverage[2] * 100 / cores).toFixed(1);

                const ramUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(0);

                bot.client.user.setActivity(loadAverageFifteenMinutes + "% CPU, " + ramUsage + "MB RAM");
            }
            catch (error) {
                output.error(error);
            }
        },
        60000
    );
}

module.exports.displaySystemResources = displaySystemResources;