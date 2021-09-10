//@ts-check

"use strict";

const moduleDefault = require("./module/default/module.js");
const moduleNotification = require("./module/notification/module.js");

const data = {
    "notification": {
        "title": "Notification",
        "description": "Forward ingame notifications of corporations, alliances and factions to Discord channels. This will also add a notification control panel for every authenticated user with which they can forward their private notifications to their Discord account.",
        "commands": {
            "!notify (not implemented yet)": "A page where authenticated users can select the notifications they wish to forward via private message to their Discord account."
        },
        "scopes": [
            "esi-characters.read_notifications.v1",
            "esi-universe.read_structures.v1"
        ]
    }
};

async function load() {
    //await moduleCleanup.start();
    await new Promise(resolve => setTimeout(resolve, 10000));
    await moduleDefault.start();
    await moduleNotification.start();
}

module.exports.data = data;
module.exports.load = load;