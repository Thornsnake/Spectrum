//@ts-check

"use strict";

const discord = require("discord.js");

const bot = require("../../bot.js");
const socket = require("../../socket.js");
const output = require("../../output.js");
const disk = require("../../disk.js");

const discordQueue = require("../queue.js");

function fetchServer(bot, serverId) {
    return bot.client.guilds.fetch(serverId);
}

function sendToChannel(server, channel, message, ping, socket, output) {
    if (ping) {
        return channel.send(
            server.roles.everyone,
            message
        ).then(async () => {
            const message = output.highlight("[NOTIFICATION] [" + server.name + " -> " + channel.name + "] Posted new notification.");
            socket.messageToRoom(server.id, "config_server_logs", "highlight", message);
        }).catch((error) => {
            const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
            socket.messageToRoom(server.id, "config_server_logs", "error", message);
        });
    }
    else {
        return channel.send(
            message
        ).then(async () => {
            const message = output.highlight("[NOTIFICATION] [" + server.name + " -> " + channel.name + "] Posted new notification.");
            socket.messageToRoom(server.id, "config_server_logs", "highlight", message);
        }).catch((error) => {
            const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
            socket.messageToRoom(server.id, "config_server_logs", "error", message);
        });
    }
}

/**
 * 
 * @param {String} serverId 
 * @param {String} channelName 
 * @param {Object} message 
 */
async function postNotification(serverId, channelName, message, options) {
    const status = {
        "discordError": false,
        "discordErrorMessage": undefined
    };

    const server = await discordQueue.add(
        fetchServer,
        [
            bot,
            serverId
        ]
    );

    const channel = server.channels.cache.find(val => val.name === channelName);

    if (!channel) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Bot can not post notifications in channel '" + channelName + "', because the channel does not exist.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Get the required permissions.
    const requiredPermissions = new discord.BitField();
    requiredPermissions.add(discord.Permissions.FLAGS.SEND_MESSAGES);
    requiredPermissions.add(discord.Permissions.FLAGS.EMBED_LINKS);

    // Check for missing permissions and abort if the bot is missing one or more.
    const missingPermissions = channel.permissionsFor(server.me).missing(requiredPermissions.bitfield, true);

    if (missingPermissions.length > 0) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Bot can not post notifications in channel '" + channelName + "', because it is missing permission.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }
    
    if (options) {
        const pingEveryone = options["PingEveryone"] === "yes" ? true : false;

        await discordQueue.add(
            sendToChannel,
            [
                server,
                channel,
                message,
                pingEveryone,
                socket,
                output
            ]
        );
    }
    else {
        await discordQueue.add(
            sendToChannel,
            [
                server,
                channel,
                message,
                false,
                socket,
                output
            ]
        );
    }

    return status;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} notificationConfigurationId 
 * @param {Object} status 
 */
async function notifyOperators(serverId, notificationConfigurationId, status) {
    let save = false;

    const notificationConfigurationList = await disk.loadFile("./data/discord/server/" + serverId + "/modules/notification/notifications.json");
    const notificationConfiguration = notificationConfigurationList[notificationConfigurationId];

    if ("failing_since" in notificationConfiguration) {
        if (status["discordError"]) {
            const failingSince = new Date(notificationConfiguration["failing_since"]);
            const currentDate = new Date();

            if (!notificationConfiguration["message_sent"]) {
                const message = "The notification module is failing to post into a channel and will delete the notification configuration for this channel after **7 days** if not fixed.\n`" + status["discordErrorMessage"] + "`";
                bot.send_message_to_operators(serverId, message);

                notificationConfiguration["message_sent"] = true;

                save = true;
            }

            if (currentDate.getTime() > failingSince.setSeconds(failingSince.getSeconds() + 604800)) {
                delete notificationConfigurationList[notificationConfigurationId];

                save = true;
            }
        }
        else {
            delete notificationConfiguration["failing_since"];
            delete notificationConfiguration["message_sent"];

            save = true;
        }
    }
    else {
        if (!status["discordError"]) {
            return;
        }

        notificationConfiguration["failing_since"] = new Date();
        notificationConfiguration["message_sent"] = false;

        save = true;
    }

    if (save) {
        await disk.writeFile("./data/discord/server/" + serverId + "/modules/notification/notifications.json", notificationConfigurationList);
    }
}

module.exports.postNotification = postNotification;
module.exports.notifyOperators = notifyOperators;