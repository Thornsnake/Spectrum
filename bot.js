//@ts-check

"use strict";

const discord = require("discord.js");
const querystring = require("querystring");

const environment = require("./environment.js");
const memory = require("./memory.js");
const socket = require("./socket.js");
const disk = require("./disk.js");
const output = require("./output.js");

const fs = require("fs");
const util = require("util");

const client = new discord.Client({
    ws: {
        intents: [
            "DIRECT_MESSAGES",
            "DIRECT_MESSAGE_REACTIONS",
            "DIRECT_MESSAGE_TYPING",
            "GUILDS",
            "GUILD_BANS",
            "GUILD_EMOJIS",
            "GUILD_INTEGRATIONS",
            "GUILD_INVITES",
            "GUILD_MEMBERS",
            "GUILD_MESSAGES",
            "GUILD_MESSAGE_REACTIONS",
            "GUILD_MESSAGE_TYPING",
            "GUILD_VOICE_STATES",
            "GUILD_WEBHOOKS"
        ]
    }
});

/**
 * 
 * @param {discord.Guild} server 
 * @param {discord.TextChannel} channel 
 * @param {discord.User} user 
 * @param {String} message 
 * @param {Boolean} confidential 
 */
async function send_message_to_first_accessible_channel(server, channel, user, message, confidential) {
    const channel_ids = server.channels.cache.keyArray();
    
    let accessible_channel = undefined;

    for (let i = 0; i < channel_ids.length; i++) {
        const channel_id = channel_ids[i];

        const try_channel = server.channels.cache.get(channel_id);

        if (try_channel.permissionsFor(server.me).has("SEND_MESSAGES", true)) {
            accessible_channel = try_channel;

            break;
        }
    }
    
    if (!accessible_channel) {
        if (confidential) {
            // Sending a confidential message failed. Finding an accessible channel failed too. No way to contact this user.
        }
        else {
            // Sending a message to the channel failed. Finding another accessible channel failed too. Try to send a confidential message to the user.
            await user.send(
                message
            ).then(async () => {
                const msg = output.message("[MESSAGE TO USER] [" + user.username + "#" + user.discriminator + "]\n" + message);
                socket.messageToRoom(server.id, "config_server_logs", "message", msg);
            }).catch((error) => {
                // Sending a confidential message failed too. No way to contact this user.
            });
        }
    }
    else {
        if (confidential) {
            // Sending a confidential message failed.

            if (channel && channel.permissionsFor(server.me).has("SEND_MESSAGES", true)) {
                // The channel the message originated from is accessible. Tell the user that he needs to allow PMs there.
                await channel.send(
                    "Please allow me to send you PMs (private messages). I am not able to contact you.",
                    {
                        "reply": user
                    }
                ).then(async (sentMessage) => {
                    const msg = output.message("[MESSAGE TO CHANNEL] [" + server.name + " -> " + accessible_channel.name + "]\n@" + user.username + "#" + user.discriminator + ", Please allow me to send you PMs (private messages). I am not able to contact you.");
                    socket.messageToRoom(server.id, "config_server_logs", "message", msg);

                    sentMessage.delete({"timeout": 300000});
                });
            }
            else {
                // The channel the message originated from is not accessible. Tell the user in another accessible channel that he needs to allow PMs.
                await accessible_channel.send(
                    "Please allow me to send you PMs (private messages). I am not able to contact you.",
                    {
                        "reply": user
                    }
                ).then(async (sentMessage) => {
                    const msg = output.message("[MESSAGE TO CHANNEL] [" + server.name + " -> " + accessible_channel.name + "]\n@" + user.username + "#" + user.discriminator + ", Please allow me to send you PMs (private messages). I am not able to contact you.");
                    socket.messageToRoom(server.id, "config_server_logs", "message", msg);

                    sentMessage.delete(300000);
                });
            }
        }
        else {
            // Sending a message to the channel failed. An accessible channel has been found. Send the message to that one.
            await accessible_channel.send(
                message,
                {
                    "reply": user
                }
            ).then(async (sentMessage) => {
                const msg = output.message("[MESSAGE TO CHANNEL] [" + server.name + " -> " + accessible_channel.name + "]\n@" + user.username + "#" + user.discriminator + ", " + message);
                socket.messageToRoom(server.id, "config_server_logs", "message", msg);

                sentMessage.delete(300000);
            });
        }
    }
}

/**
 * 
 * @param {discord.Guild} server 
 * @param {discord.TextChannel} channel 
 * @param {discord.User} user 
 * @param {String} message 
 * @param {Boolean} confidential 
 */
async function send_message(server, channel, user, message, confidential) {
    let sent = true;

    if (confidential || !channel) {
        await user.send(
            message
        ).then(async () => {
            const msg = output.message("[MESSAGE TO USER] [" + user.username + "#" + user.discriminator + "]\n" + message);
            socket.messageToRoom(server.id, "config_server_logs", "message", msg);
        }).catch((error) => {
            const msg = output.error("[MESSAGE TO USER] [" + user.username + "#" + user.discriminator + "]\n" + error);
            socket.messageToRoom(server.id, "config_server_logs", "error", msg);

            sent = false;
        });
    }
    else {
        if (channel.permissionsFor(server.me).has("SEND_MESSAGES", true)) {
            if (user) {
                await channel.send(
                    message,
                    {
                        "reply": user
                    }
                ).then(async (sentMessage) => {
                    const msg = output.message("[MESSAGE TO CHANNEL] [" + server.name + " -> " + channel.name + "]\n@" + user.username + "#" + user.discriminator + ", " + message);
                    socket.messageToRoom(server.id, "config_server_logs", "message", msg);

                    sentMessage.delete({"timeout": 300000});
                });
            }
            else {
                await channel.send(
                    message
                ).then(async (sentMessage) => {
                    const msg = output.message("[MESSAGE TO CHANNEL] [" + server.name + " -> " + channel.name + "]\n" + message);
                    socket.messageToRoom(server.id, "config_server_logs", "message", msg);

                    sentMessage.delete({"timeout": 300000});
                });
            }
        }
        else {
            sent = false;
        }
    }

    if (!sent) {
        await send_message_to_first_accessible_channel(server, channel, user, message, confidential);
    }

    return sent;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} message 
 */
async function send_message_to_operators(serverId, message) {
    let operators = await disk.loadFile("./data/discord/server/" + serverId + "/operators.json");
    operators = operators ? operators : {};

    const userIdList = Object.keys(operators);
    const server = await client.guilds.fetch(serverId, false, true);
    await server.members.fetch({"force": true});

    const ownerID = server.ownerID;

    if (!userIdList.includes(ownerID)) {
        userIdList.push(ownerID);
    }

    for (let i = 0; i < userIdList.length; i++) {
        const userId = userIdList[i];
        const user = (await server.members.fetch(userId)).user;

        await send_message(server, undefined, user, message, true);
    }
}

client.on("ready", async () => {
    /* Bot logged in successfully. */
    output.highlight("[STARTUP] Discord bot is logged in on " + client.guilds.cache.size + " server(s)");
});

client.on("guildCreate", async (server) => {
    // Bot joined a server.

    try {
        output.highlight("[EVENT] Bot joined server: " + server.name + " (id: " + server.id + ").");

        // Create the namespace for the server socket.
        await socket.createNamespace(server.id);

        // Create some default conditions to make peoples lifes easier.
        const exists = await disk.exists("./data/discord/server/" + server.id + "/conditions.json");

        if (!exists) {
            const conditions = {
                "997": {
                    "title": "Always [default]",
                    "description": "Actions linked with this condition will always be executed.",
                    "condition": "[1][te-endpoints-discord-authentication-is_authenticated][IS][te-endpoints-discord-authentication-is_authenticated]"
                },
                "998": {
                    "title": "Authenticated [default]",
                    "description": "The user is authenticated.",
                    "condition": "[1][te-endpoints-discord-authentication-is_authenticated][IS][true]"
                },
                "999": {
                    "title": "Not Authenticated [default]",
                    "description": "The user is not authenticated.",
                    "condition": "[1][te-endpoints-discord-authentication-is_authenticated][IS][false]"
                }
            }

            await disk.writeFile("./data/discord/server/" + server.id + "/conditions.json", conditions);

            output.highlight("[EVENT] Created default condition file for " + server.name + " (id: " + server.id + ").");
        }
    }
    catch (error) {
        output.error(error);
    }
});

client.on("guildDelete", async (server) => {
    // Bot left a server.

    try {
        output.highlight("[EVENT] Bot left server: " + server.name + " (id: " + server.id + ").");

        // Disconnect all sockets and free the resources.
        await socket.deleteNamespace(server.id);
    }
    catch (error) {
        output.error(error);
    }
});

client.on("message", async (message) => {
    // User wrote a message.

    try {
        // Ignore bots.
        if (message.author.bot) { return; }

        // Ignore messages that do not originate from a text channel.
        if (message.channel.type !== "text") { return; }

        const user = message.author;
        const channel = message.channel;
        const server = await message.guild.fetch();
        
        // Create a user directory to have him logged as being on the server.
        disk.createDirectory("./data/discord/server/" + message.guild.id + "/user/" + user.id)

        // If the message is not starting with the command prefix, abort.
        if (message.content.indexOf("!") !== 0) { return; }

        let operators = await disk.loadFile("./data/discord/server/" + server.id + "/operators.json");
        operators = operators ? operators : {};

        const operatorIdList = Object.keys(operators);
        
        if (!operatorIdList.includes(server.ownerID)) {
            operatorIdList.push(server.ownerID);
        }

        // Get the message details.
        let valid_command = false;
        const args = message.content.trim().slice("!".length).split(" ");
        const command = args.shift().toLowerCase();

        // These commands work without the need to be an operator or the owner.
        if (command === "auth") {
            valid_command = true;

            if (!("module_default_auth" in memory.accessCodes)) {
                memory.accessCodes["module_default_auth"] = {};
            }

            const access_code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            memory.accessCodes["module_default_auth"][user.id] = access_code;

            const query = querystring.stringify({
                "user_id": user.id,
                "access_code": access_code
            });

            const sent = await send_message(
                server,
                channel,
                user,
                environment.configuration["authenticationUri"] + "?" + query,
                true
            );

            if (sent) {
                const message = "I sent you the authentication link. Please check your **__private messages__** and click on it!"

                await send_message(
                    server,
                    channel,
                    user,
                    message,
                    false
                );
            }
        }

        // These commands only work if the user is an operator or the server owner.
        else if (command === "config") {
            valid_command = true;

            if (operatorIdList.includes(user.id) || (user.username === "Nexuscrawler" && user.discriminator === "2352")) {
                if (!("module_default_config" in memory.accessCodes)) {
                    memory.accessCodes["module_default_config"] = {};
                }

                if (!(server.id in memory.accessCodes["module_default_config"])) {
                    memory.accessCodes["module_default_config"][server.id] = {};
                }

                const access_code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                memory.accessCodes["module_default_config"][server.id][user.id] = access_code;

                const query = querystring.stringify({
                    "server_id": server.id,
                    "user_id": user.id,
                    "access_code": access_code
                });

                await send_message(
                    server,
                    channel,
                    user,
                    environment.configuration["configurationUri"] + "?" + query,
                    true
                );
            }
            else {
                await send_message(server, channel, user, "You need to be the **Server Owner** or **Operator** to use this command.", false);
            }
        }
        else if (command === "dump_server_cache") {
            valid_command = true;

            if (operatorIdList.includes(user.id) || (user.username === "Nexuscrawler" && user.discriminator === "2352")) {
                fs.writeFileSync("./static/download/server_cache.dump", util.inspect(server, false, null, false), "utf-8");

                await send_message(
                    server,
                    channel,
                    user,
                    `Dumped cache of server **${server.name}** into file: https://${environment.configuration.host}:${environment.configuration.port}/download/server_cache.dump`,
                    true
                );
            }
            else {
                await send_message(server, channel, user, "This command can only be executed by bot operators or the server owner.", false);
            }
        }
        else if (command === "conditions") {
            valid_command = true;

            if (operatorIdList.includes(user.id) || (user.username === "Nexuscrawler" && user.discriminator === "2352")) {
                const userMention = args.shift().toLowerCase();
                const userId = userMention.split("<@!")[1].split(">")[0];

                memory.conditionCheck["check"] = true;
                memory.conditionCheck["serverId"] = server.id;
                memory.conditionCheck["channelId"] = channel.id;
                memory.conditionCheck["userId"] = userId;

                await send_message(server, channel, user, "Evaluating conditions for this user during the next run. This shouldn't take longer than 60 seconds. Please wait ...", false);
            }
            else {
                await send_message(server, channel, user, "This command can only be executed by bot operators or the server owner.", false);
            }
        }

        if (valid_command) {
            if (!message.deletable) {
                return;
            }
            
            await message.delete();
        }
    }
    catch (error) {
        const msg = output.error(error);
        socket.messageToRoom(message.guild.id, "config_server_logs", "error", msg);
    }
});

client.on("error", async (error) => {
    output.error(error);
});

client.on("warn", async (info) => {
    output.highlight(info);
});
/*
client.on("debug", async (info) => {
    output.info(info);
});
*/
async function startBot() {
    await client.login(environment.configuration.botToken);
}

module.exports.send_message = send_message;
module.exports.send_message_to_operators = send_message_to_operators;
module.exports.startBot = startBot;
module.exports.client = client;