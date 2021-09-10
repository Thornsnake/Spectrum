//@ts-check

"use strict";

const bot = require("./bot.js");
const web_server = require("./web_server.js");
const socket = require("./socket.js");
const monitoring = require("./monitoring.js");
const modules = require("./modules.js");

async function init() {
    process.setMaxListeners(0);

    process.on("uncaughtException", (err) => {
        console.log(err);
    })

    // Load and connect the Discord bot.
    await bot.startBot();

    // Start monitoring of system resources.
    //await monitoring.displaySystemResources();

    // Create the default namespace for sockets.
    // This is used for web communication that is not server specific.
    // An example would be a user's authentication page, where he has an overview over all characters the bot is managing on all servers.
    //await socket.createDefaultNamespace();

    // Start up all modules and begin their job intervals.
    await modules.load();
    
    // Start the webserver and accept connections.
    //await web_server.startWebserver();

}

init();