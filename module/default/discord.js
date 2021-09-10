//@ts-check

"use strict";

const discord = require("discord.js");

const disk = require("../../disk.js");
const bot = require("../../bot.js");
const socket = require("../../socket.js");
const output = require("../../output.js");

const data = require("./data.js");

const discordQueue = require("../queue.js");

function fetchServer(bot, serverId) {
    return bot.client.guilds.fetch(serverId);
}

function fetchRole(server, roleId) {
    return server.roles.fetch(roleId);
}

function fetchMember(server, userId) {
    return server.members.fetch(userId);
}

function setRolePosition(server, role, highestBotRolePosition, offset, socket, output) {
    return role.setPosition(
        highestBotRolePosition - offset
    ).then(() => {
        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Move role '" + role.name + "' to position '" + (highestBotRolePosition - offset) + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);
    });
}

function dCreateRole(server, data, cleanup, ruleId, status, rawRoleName, socket, output) {
    return server.roles.create({
        data
    }).then((createdRole) => {
        if (!cleanup[ruleId].includes(createdRole.id)) {
            cleanup[ruleId].push(createdRole.id);
        }

        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Created role '" + createdRole.name + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);

        if (data["name"] !== createdRole.name) {
            status["discordError"] = true;
            status["discordErrorMessage"] = "The name '" + rawRoleName + "' is not a valid role name. Discord changed it to '" + createdRole.name + "' instead.\nChange the rule that is creating this role and enter a role name that conforms with Discord's naming policy for role names.";
            status["break"] = true;
        }
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);
    });
}

function deleteRole(server, role, socket, output) {
    return role.delete(
    ).then((deletedRole) => {
        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Deleted role '" + deletedRole.name + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);
    });
}

function dAddRoleToUser(server, member, role, socket, output) {
    return member.roles.add(
        role
    ).then((updatedMember) => {
        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Added role '" + role.name + "' to user '" + updatedMember.displayName + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);

        member.fetch(true);
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);

        // User is not on server.
        if (error.message === "Unknown Member") {
            console.log("Removing user id " + member.id + " from server id " + server.id);
            disk.removeDirectory("./data/discord/server/" + server.id + "/user/" + member.id);
        }
    });
}

function removeRoleFromUser(server, member, role, socket, output) {
    return member.roles.remove(
        role
    ).then((updatedMember) => {
        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Removed role '" + role.name + "' from user '" + updatedMember.displayName + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);

        member.fetch(true);
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);

        // User is not on server.
        if (error.message === "Unknown Member") {
            console.log("Removing user id " + member.id + " from server id " + server.id);
            disk.removeDirectory("./data/discord/server/" + server.id + "/user/" + member.id);
        }
    });
}

function dCreateChannel(server, channelName, data, rawChannelName, cleanup, ruleId, socket, output) {
    return server.channels.create(
        channelName,
        data
    ).then((createdChannel) => {
        if (!cleanup[ruleId].includes(createdChannel.id)) {
            cleanup[ruleId].push(createdChannel.id);
        }

        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Created channel '" + createdChannel.name + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);

        if (channelName !== createdChannel.name) {
            status["discordError"] = true;
            status["discordErrorMessage"] = "The name '" + rawChannelName + "' is not a valid channel name. Discord changed it to '" + createdChannel.name + "' instead.\nChange the rule that is creating this channel and enter a channel name that conforms with Discord's naming policy for " + data["type"] + " channel names.";
            status["break"] = true;
        }
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);
    });
}

function deleteChannel(server, channel, socket, output) {
    return channel.delete(
    ).then((deletedChannel) => {
        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Deleted channel '" + deletedChannel.id + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);
    });
}

function dAddRoleToChannel(server, channel, role, data, socket, output) {
    return channel.createOverwrite(
        role.id,
        data
    ).then(() => {
        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Added role '" + role.name + "' to channel '" + channel.name + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);
    });
}

function removeRoleFromChannel(server, channel, role, socket, output) {
    return channel.permissionOverwrites.get(role.id).delete(
        role.id
    ).then(() => {
        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Removed role '" + role.name + "' from channel '" + channel.name + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);
    });
}

function dCreateCategory(server, categoryName, data, rawCategoryName, cleanup, ruleId, socket, output) {
    return server.channels.create(
        categoryName,
        data
    ).then((createdCategory) => {
        if (!cleanup[ruleId].includes(createdCategory.id)) {
            cleanup[ruleId].push(createdCategory.id);
        }

        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Created category '" + createdCategory.name + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);

        if (categoryName !== createdCategory.name) {
            status["discordError"] = true;
            status["discordErrorMessage"] = "The name '" + rawCategoryName + "' is not a valid category name. Discord changed it to '" + createdCategory.name + "' instead.\nChange the rule that is creating this category and enter a category name that conforms with Discord's naming policy for category names.";
            status["break"] = true;
        }
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);
    });
}

function deleteCategory(server, category, socket, output) {
    return category.delete(
    ).then((deletedCategory) => {
        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Deleted category '" + deletedCategory.id + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);
    });
}

function dAddChannelToCategory(server, category, channel, socket, output) {
    return channel.setParent(
        category.id
    ).then(() => {
        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Added channel '" + channel.name + "' to category '" + category.name + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);
    });
}

function removeChannelFromCategory(server, category, channel, socket, output) {
    return channel.setParent(
        null
    ).then(() => {
        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Removed channel '" + channel.name + "' from category '" + category.name + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);
    });
}

function dChangeNickname(server, member, nickname, socket, output) {
    return member.setNickname(
        nickname
    ).then((updatedMember) => {
        const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Changed nickname of '" + updatedMember.user.username + "#" + updatedMember.user.discriminator + "' to '" + nickname + "'.");
        socket.messageToRoom(server.id, "config_server_logs", "highlight", message);

        member.fetch(true);
    }).catch((error) => {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
        socket.messageToRoom(server.id, "config_server_logs", "error", message);

        // User is not on server.
        if (error.message === "Unknown Member") {
            console.log("Removing user id " + member.id + " from server id " + server.id);
            disk.removeDirectory("./data/discord/server/" + server.id + "/user/" + member.id);
        }
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Object} token 
 * @param {String} message 
 */
async function replaceKeywords(serverId, userId, token, message) {
    let replacedMessage = message;

    const keywords = await disk.loadFile("./data/discord/server/" + serverId + "/keywords.json");
    const keywordKeys = Object.keys(keywords);

    for (let i = 0; i < keywordKeys.length; i++) {
        const keywordId = keywordKeys[i];

        const keyword = keywords[keywordId]["keyword"];
        const endpointString = keywords[keywordId]["endpoint"];

        if (replacedMessage.includes(keyword)) {
            const parsingType = endpointString.split("[")[1].split("]")[0];
            const endpoint = endpointString.split("[")[2].split("]")[0];

            let value = undefined;

            if (Number(parsingType) === 1) {
                value = await data.getP1(
                    serverId,
                    userId,
                    token,
                    {
                        "endpoint": endpoint
                    }
                );
            }
            else if (Number(parsingType) === 2) {
                const direction = endpointString.split("[")[3].split("]")[0];
                const entityType = endpointString.split("[")[4].split("]")[0];
                const entity = endpointString.split("[")[5].split("]")[0];

                value = await data.getP2(
                    serverId,
                    userId,
                    token,
                    {
                        "endpoint": endpoint,
                        "direction": direction,
                        "entityType": entityType,
                        "entity": entity
                    }
                );
            }
            else if (Number(parsingType) === 3) {
                const target = endpointString.split("[")[4].split("]")[0];

                value = await data.getP3(
                    serverId,
                    userId,
                    token,
                    {
                        "endpoint": endpoint,
                        "target": target
                    }
                );
            }

            if (value === "TOKEN REQUIRED") {
                value = "";
            }

            if (!value || !value[0] || (!value[0][0] && isNaN(value[0][0]))) {
                value = "";
            }
            else {
                if (value[0][1] === "string") {
                    value = value[0][0];
                }
                else if (value[0][1] === "number") {
                    if (Number.isInteger(Number(value[0][0]))) {
                        value = String(value[0][0]);
                    }
                    else {
                        value = String(Number(value[0][0]).toFixed(1));
                    }
                }
                else if (value[0][1] === "boolean") {
                    if (String(value[0][0]) === "true") {
                        value = "true";
                    }
                    else if (String(value[0][0]) === "false") {
                        value = "false";
                    }
                }
            }

            replacedMessage = replacedMessage.replace(new RegExp(keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "g"), value);
        }
    }

    return replacedMessage;
}

/**
 * 
 * @param {String} serverId 
 */
async function sortRoles(serverId) {
    let cleanupRules = await disk.loadFile("./data/discord/server/" + serverId + "/cleanup/createRole.json");
    cleanupRules = cleanupRules ? cleanupRules : {};

    let rules = await disk.loadFile("./data/discord/server/" + serverId + "/rules.json");
    rules = rules ? rules : {};

    const server = await discordQueue.add(
        fetchServer,
        [
            bot,
            serverId
        ]
    );

    const ruleIdList = Object.keys(cleanupRules);

    const priorityList = {};
    const priorityIdList = [];

    for (let i = 0; i < ruleIdList.length; i++) {
        const ruleId = ruleIdList[i];

        let roleIdList = cleanupRules[ruleId];
        roleIdList = roleIdList ? roleIdList : [];

        for (let j = 0; j < roleIdList.length; j++) {
            const roleId = roleIdList[j];

            const role = await discordQueue.add(
                fetchRole,
                [
                    server,
                    roleId
                ]
            );

            if (!role) {
                continue;
            }

            let priority = rules[ruleId]["details"]["role_priority"];
            priority = priority ? Number(priority) : 0;

            if (!(priority in priorityList)) {
                priorityList[priority] = [];
                priorityIdList.push(priority);
            }

            if (!priorityList[priority].includes(role.name)) {
                priorityList[priority].push(role.name);
            }
        }
    }

    const sortedPriorityIdList = priorityIdList.sort().reverse();

    const highestBotRole = server.me.roles.highest;
    const highestBotRolePosition = highestBotRole.position

    let offset = 1;

    for (let i = 0; i < sortedPriorityIdList.length; i++) {
        const priority = sortedPriorityIdList[i];
        const sortedRoleNames = priorityList[priority].sort();

        for (let j = 0; j < sortedRoleNames.length; j++) {
            const roleName = sortedRoleNames[j];
            const role = server.roles.cache.find(val => val.name === roleName);

            if (!role) {
                continue;
            }

            if (highestBotRole.comparePositionTo(role) <= 0) {
                continue;
            }

            if (role.position !== highestBotRolePosition - offset) {
                await discordQueue.add(
                    setRolePosition,
                    [
                        server,
                        role,
                        highestBotRolePosition,
                        offset,
                        socket,
                        output
                    ]
                );
            }

            offset++;
        }
    }
}

/**
 * 
 * @param {Object} actionParameters 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {String} ruleId 
 * @param {Object} token 
 * @param {Boolean} conditionOk 
 * @param {Object} cleanup 
 */
async function createRole(actionParameters, serverId, userId, ruleId, token, conditionOk, cleanup) {
    if (!(ruleId in cleanup)) {
        cleanup[ruleId] = [];
    }

    const status = {
        "discordError": false,
        "discordErrorMessage": undefined,
        "break": false
    };

    // If the condition is not ok, abort.
    if (!conditionOk) {
        return status;
    }

    // Get the role name and the role itself.
    const rawRoleName = await replaceKeywords(serverId, userId, token, actionParameters["role_name"]);
    const roleName = rawRoleName.replace(/\s+/g, " ").trim();

    // If the role name is empty, abort.
    if (roleName.length === 0) {
        return status;
    }

    // Get the server.
    const server = await discordQueue.add(
        fetchServer,
        [
            bot,
            serverId
        ]
    );

    // Get the role.
    let role = server.roles.cache.find((val) => {
        return val.name === roleName;
    });

    // If the role already exists, abort.
    if (role) {
        if (!cleanup[ruleId].includes(role.id)) {
            cleanup[ruleId].push(role.id);
        }

        return status;
    }

    // Check if the maximum number of roles on the server is reached.
    if (server.roles.cache.size >= 250) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Server reached maximum role limit of 250 roles.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Get the action parameters.
    const roleSetting1 = actionParameters["role_setting_1"] === "yes";
    const roleSetting2 = actionParameters["role_setting_2"] === "yes";
    const roleSetting3 = actionParameters["role_setting_3"];
    const generalPermission1 = actionParameters["general_permission_1"] === "yes";
    const generalPermission2 = actionParameters["general_permission_2"] === "yes";
    const generalPermission3 = actionParameters["general_permission_3"] === "yes";
    const generalPermission4 = actionParameters["general_permission_4"] === "yes";
    const generalPermission5 = actionParameters["general_permission_5"] === "yes";
    const generalPermission6 = actionParameters["general_permission_6"] === "yes";
    const generalPermission7 = actionParameters["general_permission_7"] === "yes";
    const generalPermission8 = actionParameters["general_permission_8"] === "yes";
    const generalPermission9 = actionParameters["general_permission_9"] === "yes";
    const generalPermission10 = actionParameters["general_permission_10"] === "yes";
    const generalPermission11 = actionParameters["general_permission_11"] === "yes";
    const generalPermission12 = actionParameters["general_permission_12"] === "yes";
    const generalPermission13 = actionParameters["general_permission_13"] === "yes";
    const textPermission1 = actionParameters["text_permission_1"] === "yes";
    const textPermission2 = actionParameters["text_permission_2"] === "yes";
    const textPermission3 = actionParameters["text_permission_3"] === "yes";
    const textPermission4 = actionParameters["text_permission_4"] === "yes";
    const textPermission5 = actionParameters["text_permission_5"] === "yes";
    const textPermission6 = actionParameters["text_permission_6"] === "yes";
    const textPermission7 = actionParameters["text_permission_7"] === "yes";
    const textPermission8 = actionParameters["text_permission_8"] === "yes";
    const textPermission9 = actionParameters["text_permission_9"] === "yes";
    const voicePermission1 = actionParameters["voice_permission_1"] === "yes";
    const voicePermission2 = actionParameters["voice_permission_2"] === "yes";
    const voicePermission3 = actionParameters["voice_permission_3"] === "yes";
    const voicePermission4 = actionParameters["voice_permission_4"] === "yes";
    const voicePermission5 = actionParameters["voice_permission_5"] === "yes";
    const voicePermission6 = actionParameters["voice_permission_6"] === "yes";
    const voicePermission7 = actionParameters["voice_permission_7"] === "yes";

    // Get the required permissions.
    const requiredPermissions = new discord.BitField();
    
    if (generalPermission1) { requiredPermissions.add(discord.Permissions.FLAGS.ADMINISTRATOR); }
    if (generalPermission2) { requiredPermissions.add(discord.Permissions.FLAGS.VIEW_AUDIT_LOG); }
    if (generalPermission3) { requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_GUILD); }
    if (generalPermission4) { requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_ROLES); }
    if (generalPermission5) { requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_CHANNELS); }
    if (generalPermission6) { requiredPermissions.add(discord.Permissions.FLAGS.KICK_MEMBERS); }
    if (generalPermission7) { requiredPermissions.add(discord.Permissions.FLAGS.BAN_MEMBERS); }
    if (generalPermission8) { requiredPermissions.add(discord.Permissions.FLAGS.CREATE_INSTANT_INVITE); }
    if (generalPermission9) { requiredPermissions.add(discord.Permissions.FLAGS.CHANGE_NICKNAME); }
    if (generalPermission10) { requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_NICKNAMES); }
    if (generalPermission11) { requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_EMOJIS); }
    if (generalPermission12) { requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_WEBHOOKS); }
    if (generalPermission13) { requiredPermissions.add(discord.Permissions.FLAGS.VIEW_CHANNEL); }
    if (textPermission1) { requiredPermissions.add(discord.Permissions.FLAGS.SEND_MESSAGES); }
    if (textPermission2) { requiredPermissions.add(discord.Permissions.FLAGS.SEND_TTS_MESSAGES); }
    if (textPermission3) { requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_MESSAGES); }
    if (textPermission4) { requiredPermissions.add(discord.Permissions.FLAGS.EMBED_LINKS); }
    if (textPermission5) { requiredPermissions.add(discord.Permissions.FLAGS.ATTACH_FILES); }
    if (textPermission6) { requiredPermissions.add(discord.Permissions.FLAGS.READ_MESSAGE_HISTORY); }
    if (textPermission7) { requiredPermissions.add(discord.Permissions.FLAGS.MENTION_EVERYONE); }
    if (textPermission8) { requiredPermissions.add(discord.Permissions.FLAGS.USE_EXTERNAL_EMOJIS); }
    if (textPermission9) { requiredPermissions.add(discord.Permissions.FLAGS.ADD_REACTIONS); }
    if (voicePermission1) { requiredPermissions.add(discord.Permissions.FLAGS.CONNECT); }
    if (voicePermission2) { requiredPermissions.add(discord.Permissions.FLAGS.SPEAK); }
    if (voicePermission3) { requiredPermissions.add(discord.Permissions.FLAGS.MUTE_MEMBERS); }
    if (voicePermission4) { requiredPermissions.add(discord.Permissions.FLAGS.DEAFEN_MEMBERS); }
    if (voicePermission5) { requiredPermissions.add(discord.Permissions.FLAGS.MOVE_MEMBERS); }
    if (voicePermission6) { requiredPermissions.add(discord.Permissions.FLAGS.USE_VAD); }
    if (voicePermission7) { requiredPermissions.add(discord.Permissions.FLAGS.PRIORITY_SPEAKER); }

    // Check for missing permissions and abort if the bot is missing one or more.
    if (!requiredPermissions.has(discord.Permissions.FLAGS.MANAGE_ROLES)) {
        requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_ROLES);
    }

    const missingPermissions = server.me.permissions.missing(requiredPermissions.bitfield, true);

    if (!generalPermission4) {
        requiredPermissions.remove(discord.Permissions.FLAGS.MANAGE_ROLES);
    }

    if (missingPermissions.length > 0) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Bot is missing permissions to create the role '" + roleName + "'.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Create the role.
    await discordQueue.add(
        dCreateRole,
        [
            server,
            {
                "name": roleName,
                "hoist": roleSetting1,
                "mentionable": roleSetting2,
                "color": roleSetting3,
                "permissions": requiredPermissions.bitfield
            },
            cleanup,
            ruleId,
            status,
            rawRoleName,
            socket,
            output
        ]
    );

    return status;
}

/**
 * 
 * @param {String} serverId 
 * @param {Object} cleanup 
 */
async function cleanupCreateRole(serverId, cleanup) {
    let save = false;

    // Get all created roles.
    let cleanupFile = await disk.loadFile("./data/discord/server/" + serverId + "/cleanup/createRole.json");
    cleanupFile = cleanupFile ? cleanupFile : {};

    // Get the rules on this server.
    const rules = await disk.loadFile("./data/discord/server/" + serverId + "/rules.json");

    const ruleIdList = Object.keys(cleanupFile);

    for (let i = 0; i < ruleIdList.length; i++) {
        const ruleId = ruleIdList[i];

        // The rule got deleted.
        if (!(ruleId in rules)) {
            delete cleanupFile[ruleId];
            save = true;

            continue;
        }

        // Get all created role ids for this rule.
        let cleanupFileRoleIdList = cleanupFile[ruleId];
        cleanupFileRoleIdList = cleanupFileRoleIdList ? cleanupFileRoleIdList : [];

        // Get the current role ids for this rule.
        let roleIdList = cleanup[ruleId];
        roleIdList = roleIdList ? roleIdList : [];

        // Include the current role id in the cleanup file.
        for (let j = 0; j < roleIdList.length; j++) {
            const roleId = roleIdList[j];

            if (!cleanupFileRoleIdList.includes(roleId)) {
                cleanupFileRoleIdList.push(roleId);

                save = true;
            }
        }

        // Check if auto delete is set to true.
        const autoDelete = rules[ruleId]["details"]["cleanup_1"] === "yes";
        const deletedRoleIdList = [];

        // Clean up all roles that are no longer needed.
        for (let j = 0; j < cleanupFileRoleIdList.length; j++) {
            const cleanupFileRoleId = cleanupFileRoleIdList[j];

            if (roleIdList.includes(cleanupFileRoleId)) {
                continue;
            }

            if (!autoDelete) {
                continue;
            }

            const server = await discordQueue.add(
                fetchServer,
                [
                    bot,
                    serverId
                ]
            );

            const role = await discordQueue.add(
                fetchRole,
                [
                    server,
                    cleanupFileRoleId
                ]
            );

            if (role) {
                await discordQueue.add(
                    deleteRole,
                    [
                        server,
                        role,
                        socket,
                        output
                    ]
                );
            }

            deletedRoleIdList.push(cleanupFileRoleId);
        }

        // Delete all cleaned up role ids from the list.
        for (let j = 0; j < deletedRoleIdList.length; j++) {
            for (let k = 0; k < cleanupFileRoleIdList.length; k++) {
                if (deletedRoleIdList[j] === cleanupFileRoleIdList[k]) {
                    cleanupFileRoleIdList.splice(k, 1);
                    k--;

                    save = true;
                }
            }
        }

        cleanupFile[ruleId] = cleanupFileRoleIdList;
    }

    const cleanupRuleIdList = Object.keys(cleanup);

    for (let i = 0; i < cleanupRuleIdList.length; i++) {
        const cleanupRuleId = cleanupRuleIdList[i];

        if (!(cleanupRuleId in cleanupFile)) {
            cleanupFile[cleanupRuleId] = cleanup[cleanupRuleId];
            save = true;

            continue;
        }

        for (let j = 0; j < cleanup[cleanupRuleId].length; j++) {
            if (!cleanupFile[cleanupRuleId].includes(cleanup[cleanupRuleId][j])) {
                cleanupFile[cleanupRuleId].push(cleanup[cleanupRuleId][j]);
                save = true;
            }
        }
    }

    // Save the new cleanup file.
    if (save) {
        for (const [key, value] of Object.entries(cleanupFile)) {
            cleanup[key] = Array.from(new Set(value));
        }

        await disk.writeFile("./data/discord/server/" + serverId + "/cleanup/createRole.json", cleanupFile);
    }
}

/**
 * 
 * @param {Object} actionParameters 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {String} ruleId 
 * @param {Object} token 
 * @param {Boolean} conditionOk 
 * @param {Object} cleanup 
 */
async function addRoleToUser(actionParameters, serverId, userId, ruleId, token, conditionOk, cleanup) {
    const status = {
        "discordError": false,
        "discordErrorMessage": undefined
    };

    // If the condition is not ok, abort.
    if (!conditionOk) {
        return status;
    }

    if (!(userId in cleanup)) {
        cleanup[userId] = {};
    }

    if (!(ruleId in cleanup[userId])) {
        cleanup[userId][ruleId] = [];
    }

    // Get the role name and the role itself.
    const rawRoleName = await replaceKeywords(serverId, userId, token, actionParameters["role_name"]);
    const roleName = rawRoleName.replace(/\s+/g, " ").trim();

    // If the role name is empty, abort.
    if (roleName.length === 0) {
        return status;
    }

    // Get the server.
    const server = await discordQueue.add(
        fetchServer,
        [
            bot,
            serverId
        ]
    );

    // Get the role.
    let role = server.roles.cache.find(val => val.name === roleName);

    // If the role does not exist, abort.
    if (!role) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Can not add role '" + roleName + "' to user, because the role does not exist.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    if (!cleanup[userId][ruleId].includes(role.id)) {
        cleanup[userId][ruleId].push(role.id);
    }

    // Check if the user already has the role and if he does, abort.
    const member = await discordQueue.add(
        fetchMember,
        [
            server,
            userId
        ]
    );

    if (member.roles.cache.has(role.id)) {
        return status;
    }

    // Check if the bot role is higher than this role, otherwise abort.
    const position = server.me.roles.highest.comparePositionTo(role);

    if (position <= 0) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Can not add role '" + roleName + "' to user, because the highest role of the bot is lower than this one.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Get the required permissions.
    const requiredPermissions = new discord.BitField();
    requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_ROLES);

    const missingPermissions = server.me.permissions.missing(requiredPermissions.bitfield, true);

    if (missingPermissions.length > 0) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Bot is missing permissions to add the role '" + roleName + "' to user.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Add the role.
    await discordQueue.add(
        dAddRoleToUser,
        [
            server,
            member,
            role,
            socket,
            output
        ]
    );

    return status;
}

/**
 * 
 * @param {String} serverId 
 * @param {String[]} userIdList 
 * @param {Object} cleanup 
 */
async function cleanupAddRoleToUser(serverId, userIdList, cleanup) {
    for (let i = 0; i < userIdList.length; i++) {
        const userId = userIdList[i];

        let save = false;

        // Get the cleanup file.
        let cleanupFile = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/cleanup/assignRole.json");
        cleanupFile = cleanupFile ? cleanupFile : {};

        // Get the rules on this server.
        let rules = await disk.loadFile("./data/discord/server/" + serverId + "/rules.json");
        rules = rules ? rules : {};

        const ruleIdList = Object.keys(cleanupFile);

        for (let j = 0; j < ruleIdList.length; j++) {
            const ruleId = ruleIdList[j];

            // The rule got deleted.
            if (!(ruleId in rules)) {
                delete cleanupFile[ruleId];
                save = true;

                continue;
            }

            // Get all assigned role ids for this rule.
            let cleanupFileRoleIdList = cleanupFile[ruleId];
            cleanupFileRoleIdList = cleanupFileRoleIdList ? cleanupFileRoleIdList : [];

            // Get the current role ids for this rule.
            let roleIdList = cleanup[userId] ? cleanup[userId] : {};
            roleIdList = roleIdList[ruleId] ? roleIdList[ruleId] : [];

            // Include the current role id in the cleanup file.
            for (let k = 0; k < roleIdList.length; k++) {
                const roleId = roleIdList[k];

                if (!cleanupFileRoleIdList.includes(roleId)) {
                    cleanupFileRoleIdList.push(roleId);

                    save = true;
                }
            }

            // Get the rule parameters.
            const autoRemove = rules[ruleId]["details"]["cleanup_1"] === "yes";
            const unassignedRoleIdList = [];

            // Clean up all roles that are no longer needed.
            for (let k = 0; k < cleanupFileRoleIdList.length; k++) {
                const cleanupFileRoleId = cleanupFileRoleIdList[k];

                if (roleIdList.includes(cleanupFileRoleId)) {
                    continue;
                }

                if (!autoRemove) {
                    continue;
                }

                const server = await discordQueue.add(
                    fetchServer,
                    [
                        bot,
                        serverId
                    ]
                );

                const role = await discordQueue.add(
                    fetchRole,
                    [
                        server,
                        cleanupFileRoleId
                    ]
                );

                if (role) {
                    const member = await discordQueue.add(
                        fetchMember,
                        [
                            server,
                            userId
                        ]
                    );

                    if (member.roles.cache.has(role.id)) {
                        await discordQueue.add(
                            removeRoleFromUser,
                            [
                                server,
                                member,
                                role,
                                socket,
                                output
                            ]
                        );
                    }
                }

                unassignedRoleIdList.push(cleanupFileRoleId);
            }

            // Delete all cleaned up role ids from the list.
            for (let k = 0; k < unassignedRoleIdList.length; k++) {
                for (let l = 0; l < cleanupFileRoleIdList.length; l++) {
                    if (unassignedRoleIdList[k] === cleanupFileRoleIdList[l]) {
                        cleanupFileRoleIdList.splice(l, 1);
                        l--;

                        save = true;
                    }
                }
            }

            cleanupFile[ruleId] = cleanupFileRoleIdList;
        }

        if (userId in cleanup) {
            const cleanupRuleIdList = Object.keys(cleanup[userId]);

            for (let i = 0; i < cleanupRuleIdList.length; i++) {
                const cleanupRuleId = cleanupRuleIdList[i];

                if (!(cleanupRuleId in cleanupFile)) {
                    cleanupFile[cleanupRuleId] = cleanup[userId][cleanupRuleId];
                    save = true;

                    continue;
                }

                for (let j = 0; j < cleanup[userId][cleanupRuleId].length; j++) {
                    if (!cleanupFile[cleanupRuleId].includes(cleanup[userId][cleanupRuleId][j])) {
                        cleanupFile[cleanupRuleId].push(cleanup[userId][cleanupRuleId][j]);
                        save = true;
                    }
                }
            }
        }

        // Save the new cleanup file.
        if (save) {
            for (const [key, value] of Object.entries(cleanupFile)) {
                cleanup[key] = Array.from(new Set(value));
            }

            await disk.writeFile("./data/discord/server/" + serverId + "/user/" + userId + "/cleanup/assignRole.json", cleanupFile);
        }
    }
}

/**
 * 
 * @param {Object} actionParameters 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {String} ruleId 
 * @param {Object} token 
 * @param {Boolean} conditionOk 
 * @param {Object} cleanup 
 */
async function createChannel(actionParameters, serverId, userId, ruleId, token, conditionOk, cleanup) {
    if (!(ruleId in cleanup)) {
        cleanup[ruleId] = [];
    }

    const status = {
        "discordError": false,
        "discordErrorMessage": undefined,
        "break": false
    };

    // If the condition is not ok, abort.
    if (!conditionOk) {
        return status;
    }

    // Get the channel name and the channel itself.
    const rawChannelName = await replaceKeywords(serverId, userId, token, actionParameters["channel_name"]);
    let channelName = rawChannelName.replace(/-/g, "").replace(/'/g, "").replace(/\s+/g, " ").trim();

    // If the channel name is empty, abort.
    if (channelName.length === 0) {
        return status;
    }

    const channelType = actionParameters["channel_type"];

    if (channelType === "text") {
        channelName = channelName.toLowerCase().replace(new RegExp(" ", "g"), "-").replace(new RegExp("\\.", "g"), "");
    }

    // Get the server.
    const server = await discordQueue.add(
        fetchServer,
        [
            bot,
            serverId
        ]
    );

    // Get the channel.
    let channel = server.channels.cache.find((val) => {
        return val.name === channelName;
    });

    // If the channel already exists, abort.
    if (channel) {
        if (!cleanup[ruleId].includes(channel.id)) {
            cleanup[ruleId].push(channel.id);
        }

        return status;
    }

    // Check if the maximum number of channels on the server is reached.
    if (server.channels.cache.size >= 500) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Server reached maximum channel limit of 500 channels.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Get the action parameters.
    const nsfw = actionParameters["nsfw"] === "yes";
    const rateLimit = Number(actionParameters["rate_limit"]);
    const topic = actionParameters["topic"];
    const bitrate = Number(actionParameters["bitrate"]) * 1000; // [8 - 96 kbps] * 1000
    const userLimit = Number(actionParameters["user_limit"]);

    // Check for missing permissions and abort if the bot is missing one or more.
    const requiredPermissions = new discord.BitField();
    requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_CHANNELS);

    const missingPermissions = server.me.permissions.missing(requiredPermissions.bitfield, true);

    if (missingPermissions.length > 0) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Bot is missing permissions to create the channel '" + channelName + "'.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Create the channel.
    // server, channelName, data, rawChannelName, cleanup, ruleId, socket, output
    await discordQueue.add(
        dCreateChannel,
        [
            server,
            channelName,
            {
                "type": channelType,
                "nsfw": nsfw,
                "rateLimitPerUser": rateLimit,
                "topic": topic,
                "bitrate": bitrate,
                "userLimit": userLimit
            },
            rawChannelName,
            cleanup,
            ruleId,
            socket,
            output
        ]
    );

    return status;
}

/**
 * 
 * @param {String} serverId 
 * @param {Object} cleanup 
 */
async function cleanupCreateChannel(serverId, cleanup) {
    let save = false;

    // Get all created channels.
    let cleanupFile = await disk.loadFile("./data/discord/server/" + serverId + "/cleanup/createChannel.json");
    cleanupFile = cleanupFile ? cleanupFile : {};

    // Get the rules on this server.
    const rules = await disk.loadFile("./data/discord/server/" + serverId + "/rules.json");

    const ruleIdList = Object.keys(cleanupFile);

    for (let i = 0; i < ruleIdList.length; i++) {
        const ruleId = ruleIdList[i];

        // The rule got deleted.
        if (!(ruleId in rules)) {
            delete cleanupFile[ruleId];
            save = true;

            continue;
        }

        // Get all created channel ids for this rule.
        let cleanupFileChannelIdList = cleanupFile[ruleId];
        cleanupFileChannelIdList = cleanupFileChannelIdList ? cleanupFileChannelIdList : [];

        // Get the current channel ids for this rule.
        let channelIdList = cleanup[ruleId];
        channelIdList = channelIdList ? channelIdList : [];

        // Include the current channel id in the cleanup file.
        for (let j = 0; j < channelIdList.length; j++) {
            const channelId = channelIdList[j];

            if (!cleanupFileChannelIdList.includes(channelId)) {
                cleanupFileChannelIdList.push(channelId);

                save = true;
            }
        }

        // Check if auto delete is set to true.
        const autoDelete = rules[ruleId]["details"]["auto_delete"] === "yes";
        const deletedChannelIdList = [];

        // Clean up all channels that are no longer needed.
        for (let j = 0; j < cleanupFileChannelIdList.length; j++) {
            const cleanupFileChannelId = cleanupFileChannelIdList[j];

            if (channelIdList.includes(cleanupFileChannelId)) {
                continue;
            }

            if (!autoDelete) {
                continue;
            }

            const server = await discordQueue.add(
                fetchServer,
                [
                    bot,
                    serverId
                ]
            );

            const channel = server.channels.cache.get(cleanupFileChannelId);

            if (channel) {
                await discordQueue.add(
                    deleteChannel,
                    [
                        server,
                        channel,
                        socket,
                        output
                    ]
                );
            }

            deletedChannelIdList.push(cleanupFileChannelId);
        }

        // Delete all cleaned up channel ids from the list.
        for (let j = 0; j < deletedChannelIdList.length; j++) {
            for (let k = 0; k < cleanupFileChannelIdList.length; k++) {
                if (deletedChannelIdList[j] === cleanupFileChannelIdList[k]) {
                    cleanupFileChannelIdList.splice(k, 1);
                    k--;

                    save = true;
                }
            }
        }

        cleanupFile[ruleId] = cleanupFileChannelIdList;
    }

    const cleanupRuleIdList = Object.keys(cleanup);

    for (let i = 0; i < cleanupRuleIdList.length; i++) {
        const cleanupRuleId = cleanupRuleIdList[i];

        if (!(cleanupRuleId in cleanupFile)) {
            cleanupFile[cleanupRuleId] = cleanup[cleanupRuleId];
            save = true;

            continue;
        }

        for (let j = 0; j < cleanup[cleanupRuleId].length; j++) {
            if (!cleanupFile[cleanupRuleId].includes(cleanup[cleanupRuleId][j])) {
                cleanupFile[cleanupRuleId].push(cleanup[cleanupRuleId][j]);
                save = true;
            }
        }
    }

    // Save the new cleanup file.
    if (save) {
        for (const [key, value] of Object.entries(cleanupFile)) {
            cleanup[key] = Array.from(new Set(value));
        }

        await disk.writeFile("./data/discord/server/" + serverId + "/cleanup/createChannel.json", cleanupFile);
    }
}

/**
 * 
 * @param {Object} actionParameters 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {String} ruleId 
 * @param {Object} token 
 * @param {Boolean} conditionOk 
 * @param {Object} cleanup 
 */
async function addRoleToChannel(actionParameters, serverId, userId, ruleId, token, conditionOk, cleanup) {
    const status = {
        "discordError": false,
        "discordErrorMessage": undefined
    };

    // If the condition is not ok, abort.
    if (!conditionOk) {
        return status;
    }

    // Get the channel name and the channel itself.
    const rawChannelName = await replaceKeywords(serverId, userId, token, actionParameters["channel_name"]);
    let channelName = rawChannelName.replace(/-/g, "").replace(/'/g, "").replace(/\s+/g, " ").trim();

    // If the channel name is empty, abort.
    if (channelName.length === 0) {
        return status;
    }

    const channelType = actionParameters["channel_type"];

    if (channelType === "text") {
        channelName = channelName.toLowerCase().replace(new RegExp(" ", "g"), "-").replace(new RegExp("\\.", "g"), "");
    }

    // Get the role name and the role itself.
    const rawRoleName = await replaceKeywords(serverId, userId, token, actionParameters["role_name"]);
    const roleName = rawRoleName.replace(/\s+/g, " ").trim();

    // If the role name is empty, abort.
    if (roleName.length === 0) {
        return status;
    }

    // Get the server.
    const server = await discordQueue.add(
        fetchServer,
        [
            bot,
            serverId
        ]
    );

    let channel = server.channels.cache.find((val) => {
        return val.name === channelName;
    });

    // If the channel does not exist, abort.
    if (!channel) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Can not add role '" + roleName + "' to channel '" + channelName + "', because the channel does not exist.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Get the role.
    let role = server.roles.cache.find(val => val.name === roleName);

    // If the role does not exist, abort.
    if (!role) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Can not add role '" + roleName + "' to channel '" + channelName + "', because the role does not exist.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    if (!(channel.id in cleanup)) {
        cleanup[channel.id] = {};
    }

    if (!(ruleId in cleanup[channel.id])) {
        cleanup[channel.id][ruleId] = [];
    }

    if (!cleanup[channel.id][ruleId].includes(role.id)) {
        cleanup[channel.id][ruleId].push(role.id);
    }

    // Check if the channel already has the role and if it does, abort.
    if (channel.permissionOverwrites.has(role.id)) {
        return status;
    }

    // Check if the bot role is higher than this role, otherwise abort.
    const position = server.me.roles.highest.comparePositionTo(role);

    if (position <= 0) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Can not add role '" + roleName + "' to channel '" + channelName + "', because the highest role of the bot is lower than this one.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Get the required permissions.
    const requiredPermissions = new discord.BitField();
    requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_CHANNELS);
    requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_ROLES);

    const missingPermissions = server.me.permissions.missing(requiredPermissions.bitfield, true);

    if (missingPermissions.length > 0) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Bot is missing permissions to add the role '" + roleName + "' to channel '" + channelName + "'.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Check if permissions for this role are overwritten.
    const overwriteRolePermissions = actionParameters["overwrite_permissions"] === "yes";

    if (overwriteRolePermissions) {
        //const allow = new discord.BitField();
        //const deny = new discord.BitField();

        // Get the permission overwrites.
        /*if (actionParameters["create_instant_invite"] === "yes") { allow.add(discord.Permissions.FLAGS.CREATE_INSTANT_INVITE); }
        else if (actionParameters["create_instant_invite"] === "no") { deny.add(discord.Permissions.FLAGS.CREATE_INSTANT_INVITE); }

        if (actionParameters["manage_channel"] === "yes") { allow.add(discord.Permissions.FLAGS.MANAGE_CHANNELS); }
        else if (actionParameters["manage_channel"] === "no") { deny.add(discord.Permissions.FLAGS.MANAGE_CHANNELS); }

        if (actionParameters["manage_permissions"] === "yes") { allow.add(discord.Permissions.FLAGS.MANAGE_ROLES); }
        else if (actionParameters["manage_permissions"] === "no") { deny.add(discord.Permissions.FLAGS.MANAGE_ROLES); }

        if (actionParameters["manage_webhooks"] === "yes") { allow.add(discord.Permissions.FLAGS.MANAGE_WEBHOOKS); }
        else if (actionParameters["manage_webhooks"] === "no") { deny.add(discord.Permissions.FLAGS.MANAGE_WEBHOOKS); }

        if (actionParameters["read_text_channels_see_voice_channels"] === "yes") { allow.add(discord.Permissions.FLAGS.VIEW_CHANNEL); }
        else if (actionParameters["read_text_channels_see_voice_channels"] === "no") { deny.add(discord.Permissions.FLAGS.VIEW_CHANNEL); }

        if (actionParameters["send_messages"] === "yes") { allow.add(discord.Permissions.FLAGS.SEND_MESSAGES); }
        else if (actionParameters["send_messages"] === "no") { deny.add(discord.Permissions.FLAGS.SEND_MESSAGES); }

        if (actionParameters["send_tts_messages"] === "yes") { allow.add(discord.Permissions.FLAGS.SEND_TTS_MESSAGES); }
        else if (actionParameters["send_tts_messages"] === "no") { deny.add(discord.Permissions.FLAGS.SEND_TTS_MESSAGES); }

        if (actionParameters["manage_messages"] === "yes") { allow.add(discord.Permissions.FLAGS.MANAGE_MESSAGES); }
        else if (actionParameters["manage_messages"] === "no") { deny.add(discord.Permissions.FLAGS.MANAGE_MESSAGES); }

        if (actionParameters["embed_links"] === "yes") { allow.add(discord.Permissions.FLAGS.EMBED_LINKS); }
        else if (actionParameters["embed_links"] === "no") { deny.add(discord.Permissions.FLAGS.EMBED_LINKS); }

        if (actionParameters["attach_files"] === "yes") { allow.add(discord.Permissions.FLAGS.ATTACH_FILES); }
        else if (actionParameters["attach_files"] === "no") { deny.add(discord.Permissions.FLAGS.ATTACH_FILES); }

        if (actionParameters["read_message_history"] === "yes") { allow.add(discord.Permissions.FLAGS.READ_MESSAGE_HISTORY); }
        else if (actionParameters["read_message_history"] === "no") { deny.add(discord.Permissions.FLAGS.READ_MESSAGE_HISTORY); }

        if (actionParameters["mention_everyone"] === "yes") { allow.add(discord.Permissions.FLAGS.MENTION_EVERYONE); }
        else if (actionParameters["mention_everyone"] === "no") { deny.add(discord.Permissions.FLAGS.MENTION_EVERYONE); }

        if (actionParameters["use_external_emojis"] === "yes") { allow.add(discord.Permissions.FLAGS.USE_EXTERNAL_EMOJIS); }
        else if (actionParameters["use_external_emojis"] === "no") { deny.add(discord.Permissions.FLAGS.USE_EXTERNAL_EMOJIS); }

        if (actionParameters["add_reactions"] === "yes") { allow.add(discord.Permissions.FLAGS.ADD_REACTIONS); }
        else if (actionParameters["add_reactions"] === "no") { deny.add(discord.Permissions.FLAGS.ADD_REACTIONS); }

        if (actionParameters["connect"] === "yes") { allow.add(discord.Permissions.FLAGS.CONNECT); }
        else if (actionParameters["connect"] === "no") { deny.add(discord.Permissions.FLAGS.CONNECT); }

        if (actionParameters["speak"] === "yes") { allow.add(discord.Permissions.FLAGS.SPEAK); }
        else if (actionParameters["speak"] === "no") { deny.add(discord.Permissions.FLAGS.SPEAK); }

        if (actionParameters["mute_members"] === "yes") { allow.add(discord.Permissions.FLAGS.MUTE_MEMBERS); }
        else if (actionParameters["mute_members"] === "no") { deny.add(discord.Permissions.FLAGS.MUTE_MEMBERS); }

        if (actionParameters["deafen_members"] === "yes") { allow.add(discord.Permissions.FLAGS.DEAFEN_MEMBERS); }
        else if (actionParameters["deafen_members"] === "no") { deny.add(discord.Permissions.FLAGS.DEAFEN_MEMBERS); }

        if (actionParameters["move_members"] === "yes") { allow.add(discord.Permissions.FLAGS.MOVE_MEMBERS); }
        else if (actionParameters["move_members"] === "no") { deny.add(discord.Permissions.FLAGS.MOVE_MEMBERS); }

        if (actionParameters["use_voice_activity"] === "yes") { allow.add(discord.Permissions.FLAGS.USE_VAD); }
        else if (actionParameters["use_voice_activity"] === "no") { deny.add(discord.Permissions.FLAGS.USE_VAD); }*/

        // Add the role.
        await discordQueue.add(
            dAddRoleToChannel,
            [
                server,
                channel,
                role,
                {
                    CREATE_INSTANT_INVITE: actionParameters["create_instant_invite"] === "yes" ? true : (actionParameters["create_instant_invite"] === "no" ? false : null),
                    MANAGE_CHANNELS: actionParameters["manage_channel"] === "yes" ? true : (actionParameters["manage_channel"] === "no" ? false : null),
                    MANAGE_ROLES: actionParameters["manage_permissions"] === "yes" ? true : (actionParameters["manage_permissions"] === "no" ? false : null),
                    MANAGE_WEBHOOKS: actionParameters["manage_webhooks"] === "yes" ? true : (actionParameters["manage_webhooks"] === "no" ? false : null),
                    VIEW_CHANNEL: actionParameters["read_text_channels_see_voice_channels"] === "yes" ? true : (actionParameters["read_text_channels_see_voice_channels"] === "no" ? false : null),
                    SEND_MESSAGES: actionParameters["send_messages"] === "yes" ? true : (actionParameters["send_messages"] === "no" ? false : null),
                    SEND_TTS_MESSAGES: actionParameters["send_tts_messages"] === "yes" ? true : (actionParameters["send_tts_messages"] === "no" ? false : null),
                    MANAGE_MESSAGES: actionParameters["manage_messages"] === "yes" ? true : (actionParameters["manage_messages"] === "no" ? false : null),
                    EMBED_LINKS: actionParameters["embed_links"] === "yes" ? true : (actionParameters["embed_links"] === "no" ? false : null),
                    ATTACH_FILES: actionParameters["attach_files"] === "yes" ? true : (actionParameters["attach_files"] === "no" ? false : null),
                    READ_MESSAGE_HISTORY: actionParameters["read_message_history"] === "yes" ? true : (actionParameters["read_message_history"] === "no" ? false : null),
                    MENTION_EVERYONE: actionParameters["mention_everyone"] === "yes" ? true : (actionParameters["mention_everyone"] === "no" ? false : null),
                    USE_EXTERNAL_EMOJIS: actionParameters["use_external_emojis"] === "yes" ? true : (actionParameters["use_external_emojis"] === "no" ? false : null),
                    ADD_REACTIONS: actionParameters["add_reactions"] === "yes" ? true : (actionParameters["add_reactions"] === "no" ? false : null),
                    CONNECT: actionParameters["connect"] === "yes" ? true : (actionParameters["connect"] === "no" ? false : null),
                    SPEAK: actionParameters["speak"] === "yes" ? true : (actionParameters["speak"] === "no" ? false : null),
                    MUTE_MEMBERS: actionParameters["mute_members"] === "yes" ? true : (actionParameters["mute_members"] === "no" ? false : null),
                    DEAFEN_MEMBERS: actionParameters["deafen_members"] === "yes" ? true : (actionParameters["deafen_members"] === "no" ? false : null),
                    MOVE_MEMBERS: actionParameters["move_members"] === "yes" ? true : (actionParameters["move_members"] === "no" ? false : null),
                    USE_VAD: actionParameters["use_voice_activity"] === "yes" ? true : (actionParameters["use_voice_activity"] === "no" ? false : null)
                },
                socket,
                output
            ]
        );

        // Add the role.
        /*await channel.overwritePermissions(
            [
                {
                    "id": role.id,
                    "allow": allow.bitfield,
                    "deny": deny.bitfield,
                    "type": "role"
                }
            ]
        ).then(() => {
            const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Added role '" + roleName + "' to channel '" + channelName + "'.");
            socket.messageToRoom(serverId, "config_server_logs", "highlight", message);
        }).catch((error) => {
            const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
            socket.messageToRoom(serverId, "config_server_logs", "error", message);
        });*/
    }
    else {
        // Add the role.
        await discordQueue.add(
            dAddRoleToChannel,
            [
                server,
                channel,
                role,
                {
                    CREATE_INSTANT_INVITE: null,
                    MANAGE_CHANNELS: null,
                    MANAGE_ROLES: null,
                    MANAGE_WEBHOOKS: null,
                    VIEW_CHANNEL: null,
                    SEND_MESSAGES: null,
                    SEND_TTS_MESSAGES: null,
                    MANAGE_MESSAGES: null,
                    EMBED_LINKS: null,
                    ATTACH_FILES: null,
                    READ_MESSAGE_HISTORY: null,
                    MENTION_EVERYONE: null,
                    USE_EXTERNAL_EMOJIS: null,
                    ADD_REACTIONS: null,
                    CONNECT: null,
                    SPEAK: null,
                    MUTE_MEMBERS: null,
                    DEAFEN_MEMBERS: null,
                    MOVE_MEMBERS: null,
                    USE_VAD: null
                },
                socket,
                output
            ]
        );

        // Add the role.
        /*await channel.overwritePermissions(
            [
                {
                    "id": role.id,
                    "allow": new discord.BitField(),
                    "deny": new discord.BitField(),
                    "type": "role"
                }
            ]
        ).then(() => {
            const message = output.highlight("[SERVER = " + server.name + " (" + server.id + ")] Added role '" + roleName + "' to channel '" + channelName + "'.");
            socket.messageToRoom(serverId, "config_server_logs", "highlight", message);
        }).catch((error) => {
            const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] " + error);
            socket.messageToRoom(serverId, "config_server_logs", "error", message);
        });*/
    }

    return status;
}

/**
 * 
 * @param {String} serverId 
 * @param {Object} cleanup 
 */
async function cleanupAddRoleToChannel(serverId, cleanup) {
    const server = await discordQueue.add(
        fetchServer,
        [
            bot,
            serverId
        ]
    );

    const channelIdList = server.channels.cache.keyArray();

    // Get the cleanup file.
    let cleanupFile = undefined;
    
    try {
        cleanupFile = await disk.loadFile("./data/discord/server/" + serverId + "/cleanup/addRoleToChannel.json");
    }
    catch (exception) {
        console.log(exception)

        await disk.writeFile("./data/discord/server/" + serverId + "/cleanup/addRoleToChannel.json", {});
    }
    
    cleanupFile = cleanupFile ? cleanupFile : {};

    // Remove all cleanup rules of deleted channels.
    const cleanupFileIdList = Object.keys(cleanupFile);

    for (let i = 0; i < cleanupFileIdList.length; i++) {
        const cleanupFileId = cleanupFileIdList[i];

        if (!channelIdList.includes(cleanupFileId)) {
            delete cleanupFile[cleanupFileId];

            cleanupFile = await disk.writeFile("./data/discord/server/" + serverId + "/cleanup/addRoleToChannel.json", cleanupFile);
        }
    }

    for (let i = 0; i < channelIdList.length; i++) {
        const channelId = channelIdList[i];

        let save = false;

        // Get all assigned roles.
        const cleanupRule = cleanupFile[channelId] ? cleanupFile[channelId] : {};

        // Get the rules on this server.
        let rules = await disk.loadFile("./data/discord/server/" + serverId + "/rules.json");
        rules = rules ? rules : {};

        const ruleIdList = Object.keys(cleanupRule);

        for (let j = 0; j < ruleIdList.length; j++) {
            const ruleId = ruleIdList[j];

            // The rule got deleted.
            if (!(ruleId in rules)) {
                delete cleanupRule[ruleId];
                save = true;

                continue;
            }

            // Get all assigned role ids for this rule.
            let cleanupRuleRoleIdList = cleanupRule[ruleId];
            cleanupRuleRoleIdList = cleanupRuleRoleIdList ? cleanupRuleRoleIdList : [];

            // Get the current role ids for this rule.
            let roleIdList = cleanup[channelId] ? cleanup[channelId] : {};
            roleIdList = roleIdList[ruleId] ? roleIdList[ruleId] : [];

            // Include the current role id in the cleanup file.
            for (let k = 0; k < roleIdList.length; k++) {
                const roleId = roleIdList[k];

                if (!cleanupRuleRoleIdList.includes(roleId)) {
                    cleanupRuleRoleIdList.push(roleId);

                    save = true;
                }
            }

            // Get the rule parameters.
            const autoRemove = rules[ruleId]["details"]["auto_remove"] === "yes";
            const unassignedRoleIdList = [];

            // Clean up all roles that are no longer needed.
            for (let k = 0; k < cleanupRuleRoleIdList.length; k++) {
                const cleanupRuleRoleId = cleanupRuleRoleIdList[k];

                if (roleIdList.includes(cleanupRuleRoleId)) {
                    continue;
                }

                if (!autoRemove) {
                    continue;
                }

                const role = await discordQueue.add(
                    fetchRole,
                    [
                        server,
                        cleanupRuleRoleId
                    ]
                );

                if (role) {
                    const channel = server.channels.cache.get(channelId);

                    if (channel.permissionOverwrites.has(role.id)) {
                        const roleName = role.name;

                        await discordQueue.add(
                            removeRoleFromChannel,
                            [
                                server,
                                channel,
                                role,
                                socket,
                                output
                            ]
                        );
                    }
                }

                unassignedRoleIdList.push(cleanupRuleRoleId);
            }

            // Delete all cleaned up role ids from the list.
            for (let k = 0; k < unassignedRoleIdList.length; k++) {
                for (let l = 0; l < cleanupRuleRoleIdList.length; l++) {
                    if (unassignedRoleIdList[k] === cleanupRuleRoleIdList[l]) {
                        cleanupRuleRoleIdList.splice(l, 1);
                        l--;

                        save = true;
                    }
                }
            }

            cleanupRule[ruleId] = cleanupRuleRoleIdList;
        }

        if (channelId in cleanup) {
            const cleanupRuleIdList = Object.keys(cleanup[channelId]);

            for (let i = 0; i < cleanupRuleIdList.length; i++) {
                const cleanupRuleId = cleanupRuleIdList[i];

                if (!(cleanupRuleId in cleanupRule)) {
                    cleanupRule[cleanupRuleId] = cleanup[channelId][cleanupRuleId];
                    save = true;

                    continue;
                }

                for (let j = 0; j < cleanup[channelId][cleanupRuleId].length; j++) {
                    if (!cleanupRule[cleanupRuleId].includes(cleanup[channelId][cleanupRuleId][j])) {
                        cleanupRule[cleanupRuleId].push(cleanup[channelId][cleanupRuleId][j]);
                        save = true;
                    }
                }
            }
        }

        // Save the new cleanup file.
        if (save) {
            if (!(channelId in cleanupFile)) {
                cleanupFile[channelId] = {};
            }

            cleanupFile[channelId] = cleanupRule;

            await disk.writeFile("./data/discord/server/" + serverId + "/cleanup/addRoleToChannel.json", cleanupFile);
        }
    }
}

/**
 * 
 * @param {Object} actionParameters 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {String} ruleId 
 * @param {Object} token 
 * @param {Boolean} conditionOk 
 * @param {Object} cleanup 
 */
async function createCategory(actionParameters, serverId, userId, ruleId, token, conditionOk, cleanup) {
    // IMPORTANT - Categories are just another form of channels!

    if (!(ruleId in cleanup)) {
        cleanup[ruleId] = [];
    }

    const status = {
        "discordError": false,
        "discordErrorMessage": undefined,
        "break": false
    };

    // If the condition is not ok, abort.
    if (!conditionOk) {
        return status;
    }

    // Get the category name and the category itself.
    const rawCategoryName = await replaceKeywords(serverId, userId, token, actionParameters["category_name"]);
    const categoryName = rawCategoryName.replace(/-/g, "").replace(/'/g, "").replace(/\s+/g, " ").trim();
    const channelType = "category";

    // If the category name is empty, abort.
    if (categoryName.length === 0) {
        return status;
    }

    // Get the server.
    const server = await discordQueue.add(
        fetchServer,
        [
            bot,
            serverId
        ]
    );

    // Get the category.
    let category = server.channels.cache.find((val) => {
        return val.name === categoryName && val.type === channelType;
    });

    // If the category already exists, abort.
    if (category) {
        if (!cleanup[ruleId].includes(category.id)) {
            cleanup[ruleId].push(category.id);
        }

        return status;
    }

    // Check if the maximum number of categories on the server is reached.
    if (server.channels.cache.size >= 500) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Server reached maximum channel limit of 500 channels.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Check for missing permissions and abort if the bot is missing one or more.
    const requiredPermissions = new discord.BitField();
    requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_CHANNELS);

    const missingPermissions = server.me.permissions.missing(requiredPermissions.bitfield, true);

    if (missingPermissions.length > 0) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Bot is missing permissions to create the category '" + categoryName + "'.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Create the category.
    await discordQueue.add(
        dCreateCategory,
        [
            server,
            categoryName,
            {
                "type": channelType
            },
            rawCategoryName,
            cleanup,
            ruleId,
            socket,
            output
        ]
    );

    return status;
}

/**
 * 
 * @param {String} serverId 
 * @param {Object} cleanup 
 */
async function cleanupCreateCategory(serverId, cleanup) {
    // IMPORTANT - Categories are just another form of channels!

    let save = false;

    // Get all created categories.
    let cleanupFile = await disk.loadFile("./data/discord/server/" + serverId + "/cleanup/createCategory.json");
    cleanupFile = cleanupFile ? cleanupFile : {};

    // Get the rules on this server.
    const rules = await disk.loadFile("./data/discord/server/" + serverId + "/rules.json");

    const ruleIdList = Object.keys(cleanupFile);

    for (let i = 0; i < ruleIdList.length; i++) {
        const ruleId = ruleIdList[i];

        // The rule got deleted.
        if (!(ruleId in rules)) {
            delete cleanupFile[ruleId];
            save = true;

            continue;
        }

        // Get all created category ids for this rule.
        let cleanupFileCategoryIdList = cleanupFile[ruleId];
        cleanupFileCategoryIdList = cleanupFileCategoryIdList ? cleanupFileCategoryIdList : [];

        // Get the current category ids for this rule.
        let categoryIdList = cleanup[ruleId];
        categoryIdList = categoryIdList ? categoryIdList : [];

        // Include the current category id in the cleanup file.
        for (let j = 0; j < categoryIdList.length; j++) {
            const categoryId = categoryIdList[j];

            if (!cleanupFileCategoryIdList.includes(categoryId)) {
                cleanupFileCategoryIdList.push(categoryId);

                save = true;
            }
        }

        // Check if auto delete is set to true.
        const autoDelete = rules[ruleId]["details"]["auto_delete"] === "yes";
        const deletedCategoryIdList = [];

        // Clean up all categories that are no longer needed.
        for (let j = 0; j < cleanupFileCategoryIdList.length; j++) {
            const cleanupFileCategoryId = cleanupFileCategoryIdList[j];

            if (categoryIdList.includes(cleanupFileCategoryId)) {
                continue;
            }

            if (!autoDelete) {
                continue;
            }

            const server = await discordQueue.add(
                fetchServer,
                [
                    bot,
                    serverId
                ]
            );

            const category = server.channels.cache.get(cleanupFileCategoryId);

            if (category) {
                await discordQueue.add(
                    deleteCategory,
                    [
                        server,
                        category,
                        socket,
                        output
                    ]
                );
            }

            deletedCategoryIdList.push(cleanupFileCategoryId);
        }

        // Delete all cleaned up category ids from the list.
        for (let j = 0; j < deletedCategoryIdList.length; j++) {
            for (let k = 0; k < cleanupFileCategoryIdList.length; k++) {
                if (deletedCategoryIdList[j] === cleanupFileCategoryIdList[k]) {
                    cleanupFileCategoryIdList.splice(k, 1);
                    k--;

                    save = true;
                }
            }
        }

        cleanupFile[ruleId] = cleanupFileCategoryIdList;
    }

    const cleanupRuleIdList = Object.keys(cleanup);

    for (let i = 0; i < cleanupRuleIdList.length; i++) {
        const cleanupRuleId = cleanupRuleIdList[i];

        if (!(cleanupRuleId in cleanupFile)) {
            cleanupFile[cleanupRuleId] = cleanup[cleanupRuleId];
            save = true;

            continue;
        }

        for (let j = 0; j < cleanup[cleanupRuleId].length; j++) {
            if (!cleanupFile[cleanupRuleId].includes(cleanup[cleanupRuleId][j])) {
                cleanupFile[cleanupRuleId].push(cleanup[cleanupRuleId][j]);
                save = true;
            }
        }
    }

    // Save the new cleanup file.
    if (save) {
        for (const [key, value] of Object.entries(cleanupFile)) {
            cleanup[key] = Array.from(new Set(value));
        }
        
        await disk.writeFile("./data/discord/server/" + serverId + "/cleanup/createCategory.json", cleanupFile);
    }
}

/**
 * 
 * @param {Object} actionParameters 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {String} ruleId 
 * @param {Object} token 
 * @param {Boolean} conditionOk 
 * @param {Object} cleanup 
 */
async function addChannelToCategory(actionParameters, serverId, userId, ruleId, token, conditionOk, cleanup) {
    const status = {
        "discordError": false,
        "discordErrorMessage": undefined
    };

    // If the condition is not ok, abort.
    if (!conditionOk) {
        return status;
    }

    // Get the category name and the category itself.
    const rawCategoryName = await replaceKeywords(serverId, userId, token, actionParameters["category_name"]);
    let categoryName = rawCategoryName.replace(/\s+/g, " ").trim();

    // If the category name is empty, abort.
    if (categoryName.length === 0) {
        return status;
    }

    // Get the channel name and the channel itself.
    const rawChannelName = await replaceKeywords(serverId, userId, token, actionParameters["channel_name"]);
    let channelName = rawChannelName.replace(/-/g, "").replace(/'/g, "").replace(/\s+/g, " ").trim();

    // If the channel name is empty, abort.
    if (channelName.length === 0) {
        return status;
    }

    const channelType = actionParameters["channel_type"];

    if (channelType === "text") {
        channelName = channelName.toLowerCase().replace(new RegExp(" ", "g"), "-").replace(new RegExp("\\.", "g"), "");
    }

    // Get the server.
    const server = await discordQueue.add(
        fetchServer,
        [
            bot,
            serverId
        ]
    );

    let category = server.channels.cache.find((val) => {
        return val.name === categoryName;
    });

    // If the category does not exist, abort.
    if (!category) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Can not add channel '" + channelName + "' to category '" + categoryName + "', because the category does not exist.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Get the channel.
    let channel = server.channels.cache.find((val) => {
        return val.name === channelName;
    });

    // If the channel does not exist, abort.
    if (!channel) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Can not add channel '" + channelName + "' to category '" + categoryName + "', because the channel does not exist.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    if (!(category.id in cleanup)) {
        cleanup[category.id] = {};
    }

    if (!(ruleId in cleanup[category.id])) {
        cleanup[category.id][ruleId] = [];
    }

    if (!cleanup[category.id][ruleId].includes(channel.id)) {
        cleanup[category.id][ruleId].push(channel.id);
    }

    // Check if the category already has the channel and if it does, abort.
    if (channel.parent && channel.parent.id === category.id) {
        return status;
    }

    // Get the required permissions.
    const requiredPermissions = new discord.BitField();
    requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_CHANNELS);
    requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_ROLES);

    const missingPermissions = server.me.permissions.missing(requiredPermissions.bitfield, true);

    if (missingPermissions.length > 0) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Bot is missing permissions to add the channel '" + channelName + "' to category '" + categoryName + "'.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Add the channel.
    await discordQueue.add(
        dAddChannelToCategory,
        [
            server,
            category,
            channel,
            socket,
            output
        ]
    );

    return status;
}

/**
 * 
 * @param {String} serverId 
 * @param {Object} cleanup 
 */
async function cleanupAddChannelToCategory(serverId, cleanup) {
    const server = await discordQueue.add(
        fetchServer,
        [
            bot,
            serverId
        ]
    );

    const categorylIdList = server.channels.cache.keyArray();

    // Get the cleanup file.
    let cleanupFile = await disk.loadFile("./data/discord/server/" + serverId + "/cleanup/addChannelToCategory.json");
    cleanupFile = cleanupFile ? cleanupFile : {};

    // Remove all cleanup rules of deleted categories.
    const cleanupFileIdList = Object.keys(cleanupFile);

    for (let i = 0; i < cleanupFileIdList.length; i++) {
        const cleanupFileId = cleanupFileIdList[i];

        if (!categorylIdList.includes(cleanupFileId)) {
            delete cleanupFile[cleanupFileId];

            cleanupFile = await disk.writeFile("./data/discord/server/" + serverId + "/cleanup/addChannelToCategory.json", cleanupFile);
        }
    }

    for (let i = 0; i < categorylIdList.length; i++) {
        const categoryId = categorylIdList[i];

        let save = false;

        // Get all assigned channels.
        const cleanupRule = cleanupFile[categoryId] ? cleanupFile[categoryId] : {};

        // Get the rules on this server.
        let rules = await disk.loadFile("./data/discord/server/" + serverId + "/rules.json");
        rules = rules ? rules : {};

        const ruleIdList = Object.keys(cleanupRule);

        for (let j = 0; j < ruleIdList.length; j++) {
            const ruleId = ruleIdList[j];

            // The rule got deleted.
            if (!(ruleId in rules)) {
                delete cleanupRule[ruleId];
                save = true;

                continue;
            }

            // Get all assigned channel ids for this rule.
            let cleanupRuleChannelIdList = cleanupRule[ruleId];
            cleanupRuleChannelIdList = cleanupRuleChannelIdList ? cleanupRuleChannelIdList : [];

            // Get the current channel ids for this rule.
            let channelIdList = cleanup[categoryId] ? cleanup[categoryId] : {};
            channelIdList = channelIdList[ruleId] ? channelIdList[ruleId] : [];

            // Include the current channel id in the cleanup file.
            for (let k = 0; k < channelIdList.length; k++) {
                const channelId = channelIdList[k];

                if (!cleanupRuleChannelIdList.includes(channelId)) {
                    cleanupRuleChannelIdList.push(channelId);

                    save = true;
                }
            }

            // Get the rule parameters.
            const autoRemove = rules[ruleId]["details"]["auto_remove"] === "yes";
            const unassignedChannelIdList = [];

            // Clean up all channels that are no longer needed.
            for (let k = 0; k < cleanupRuleChannelIdList.length; k++) {
                const cleanupRuleChannelId = cleanupRuleChannelIdList[k];

                if (channelIdList.includes(cleanupRuleChannelId)) {
                    continue;
                }

                if (!autoRemove) {
                    continue;
                }

                const channel = server.channels.cache.get(cleanupRuleChannelId);

                if (channel) {
                    const category = server.channels.cache.get(categoryId);

                    if (channel.parent && channel.parent.id === category.id) {
                        const channelName = channel.name;

                        await discordQueue.add(
                            removeChannelFromCategory,
                            [
                                server,
                                category,
                                channel,
                                socket,
                                output
                            ]
                        );
                    }
                }

                unassignedChannelIdList.push(cleanupRuleChannelId);
            }

            // Delete all cleaned up channel ids from the list.
            for (let k = 0; k < unassignedChannelIdList.length; k++) {
                for (let l = 0; l < cleanupRuleChannelIdList.length; l++) {
                    if (unassignedChannelIdList[k] === cleanupRuleChannelIdList[l]) {
                        cleanupRuleChannelIdList.splice(l, 1);
                        l--;

                        save = true;
                    }
                }
            }

            cleanupRule[ruleId] = cleanupRuleChannelIdList;
        }

        if (categoryId in cleanup) {
            const cleanupRuleIdList = Object.keys(cleanup[categoryId]);

            for (let i = 0; i < cleanupRuleIdList.length; i++) {
                const cleanupRuleId = cleanupRuleIdList[i];

                if (!(cleanupRuleId in cleanupRule)) {
                    cleanupRule[cleanupRuleId] = cleanup[categoryId][cleanupRuleId];
                    save = true;

                    continue;
                }

                for (let j = 0; j < cleanup[categoryId][cleanupRuleId].length; j++) {
                    if (!cleanupRule[cleanupRuleId].includes(cleanup[categoryId][cleanupRuleId][j])) {
                        cleanupRule[cleanupRuleId].push(cleanup[categoryId][cleanupRuleId][j]);
                        save = true;
                    }
                }
            }
        }

        // Save the new cleanup file.
        if (save) {
            if (!(categoryId in cleanupFile)) {
                cleanupFile[categoryId] = {};
            }

            cleanupFile[categoryId] = cleanupRule;

            await disk.writeFile("./data/discord/server/" + serverId + "/cleanup/addChannelToCategory.json", cleanupFile);
        }
    }
}

/**
 * 
 * @param {Object} actionParameters 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Object} token 
 * @param {Boolean} conditionOk 
 */
async function changeNickname(actionParameters, serverId, userId, token, conditionOk) {
    const status = {
        "discordError": false,
        "discordErrorMessage": undefined
    };

    // If the condition is not ok, abort.
    if (!conditionOk) {
        return status;
    }

    // Get the server.
    const server = await discordQueue.add(
        fetchServer,
        [
            bot,
            serverId
        ]
    );

    // Get the user.
    const member = await discordQueue.add(
        fetchMember,
        [
            server,
            userId
        ]
    );

    // If the user is the owner of the server, abort.
    if (member === server.owner) {
        return status;
    }

    // Check if the bot role is higher than the user's highest role, otherwise abort.
    const position = server.me.roles.highest.comparePositionTo(member.roles.highest);

    if (position <= 0) {
        return status;
    }

    // Get the required permissions.
    const requiredPermissions = new discord.BitField();
    requiredPermissions.add(discord.Permissions.FLAGS.MANAGE_NICKNAMES);
    
    // Check for missing permissions.
    const missingPermissions = server.me.permissions.missing(requiredPermissions.bitfield, true);

    if (missingPermissions.length > 0) {
        const message = output.error("[SERVER = " + server.name + " (" + server.id + ")] Bot is missing permissions to change the nickname of '" + member.displayName + "'.");
        socket.messageToRoom(serverId, "config_server_logs", "error", message);

        status["discordError"] = true;
        status["discordErrorMessage"] = message;

        return status;
    }

    // Get the action parameters.
    const forceCharacterName = actionParameters["force_character_name"] === "yes";
    const addAllianceTicker = actionParameters["add_alliance_ticker"] === "yes";
    const fallbackCorporationTicker = actionParameters["fallback_corporation_ticker"] === "yes";
    const addCorporationTicker = actionParameters["add_corporation_ticker"] === "yes";

    // Build the nickname.
    let nickname = undefined;

    if (forceCharacterName) {
        // Get the character name.
        const characterName = await data.getP1(
            serverId,
            userId,
            token,
            {
                "endpoint": "te-endpoints-eve_online-character-name"
            }
        );

        if (characterName === "TOKEN REQUIRED") {
            return status;
        }

        if (characterName.length === 0 || characterName[0][0] === undefined) {
            nickname = member.displayName.split("]").pop().trim();
        }
        else {
            nickname = characterName[0][0];
        }
    }
    else {
        nickname = member.displayName.split("]").pop().trim();
    }

    if (nickname.trim().length === 0) {
        return status;
    }

    if (addCorporationTicker) {
        // Get the corporation ticker.
        const corporationTicker = await data.getP1(
            serverId,
            userId,
            token,
            {
                "endpoint": "te-endpoints-eve_online-corporation-ticker"
            }
        );

        if (corporationTicker === "TOKEN REQUIRED") {
            return status;
        }

        if (corporationTicker.length === 1 && corporationTicker[0][0] !== undefined) {
            nickname = "[" + corporationTicker[0][0] + "] " + nickname;

            if (corporationTicker[0][0].length === 0) {
                // ESI weirdness, just ignore it.
                return status;
            }
        }
    }

    if (addAllianceTicker) {
        // Get the alliance ticker.
        const allianceTicker = await data.getP1(
            serverId,
            userId,
            token,
            {
                "endpoint": "te-endpoints-eve_online-alliance-ticker"
            }
        );

        if (allianceTicker === "TOKEN REQUIRED") {
            return status;
        }

        if (allianceTicker.length === 1 && allianceTicker[0][0] !== undefined) {
            nickname = "[" + allianceTicker[0][0] + "] " + nickname;

            if (allianceTicker[0][0].length === 0) {
                // ESI weirdness, just ignore it.
                return status;
            }
        }
        else if (fallbackCorporationTicker && !addCorporationTicker) {
            // Get the corporation ticker.
            const corporationTicker = await data.getP1(
                serverId,
                userId,
                token,
                {
                    "endpoint": "te-endpoints-eve_online-corporation-ticker"
                }
            );

            if (corporationTicker === "TOKEN REQUIRED") {
                return status;
            }

            if (corporationTicker.length === 1 && corporationTicker[0][0] !== undefined) {
                nickname = "[" + corporationTicker[0][0] + "] " + nickname;

                if (corporationTicker[0][0].length === 0) {
                    // ESI weirdness, just ignore it.
                    return status;
                }
            }
        }
    }

    // Nicknames must be at least 2 characters long.
    if (nickname.length < 2) {
        nickname = "Nickname invalid";
    }

    // Nicknames can not be longer than 32 characters.
    nickname = nickname.substring(0, 32).trim();

    // Check if the user already has this nickname.
    if (member.displayName === nickname) {
        return status;
    }

    // Change the nickname.
    await discordQueue.add(
        dChangeNickname,
        [
            server,
            member,
            nickname,
            socket,
            output
        ]
    );

    return status;
}

/**
 * 
 * @param {Number} actionId 
 * @param {Object} actionParameters 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {String} ruleId 
 * @param {Object} token 
 * @param {Boolean} conditionOk 
 * @param {Object} cleanup 
 */
async function executeAction(actionId, actionParameters, serverId, userId, ruleId, token, conditionOk, cleanup) {
    // Discord - Create Role
    if (Number(actionId) === 1) {
        return await createRole(actionParameters, serverId, userId, ruleId, token, conditionOk, cleanup);
    }

    // Discord - Add Role To User
    else if (Number(actionId) === 2) {
        return await addRoleToUser(actionParameters, serverId, userId, ruleId, token, conditionOk, cleanup);
    }

    // Discord - Create Channel
    else if (Number(actionId) === 4) {
        return await createChannel(actionParameters, serverId, userId, ruleId, token, conditionOk, cleanup);
    }

    // Discord - Add Role To Channel
    else if (Number(actionId) === 5) {
        return await addRoleToChannel(actionParameters, serverId, userId, ruleId, token, conditionOk, cleanup);
    }

    // Discord - Create Category
    else if (Number(actionId) === 6) {
        return await createCategory(actionParameters, serverId, userId, ruleId, token, conditionOk, cleanup);
    }

    // Discord - Add Channel To Category
    else if (Number(actionId) === 7) {
        return await addChannelToCategory(actionParameters, serverId, userId, ruleId, token, conditionOk, cleanup);
    }

    // Discord - Change Nickname
    else if (Number(actionId) === 3) {
        return await changeNickname(actionParameters, serverId, userId, token, conditionOk);
    }
}

/**
 * 
 * @param {Number} actionId 
 * @param {String} serverId 
 * @param {String[]} userIdList 
 * @param {Object} cleanup 
 */
async function executeCleanup(actionId, serverId, userIdList, cleanup) {
    // Discord - Create Role
    if (Number(actionId) === 1) {
        await cleanupCreateRole(serverId, cleanup);
    }

    // Discord - Assign Role
    else if (Number(actionId) === 2) {
        await cleanupAddRoleToUser(serverId, userIdList, cleanup);
    }

    // Discord - Create Channel
    else if (Number(actionId) === 4) {
        return await cleanupCreateChannel(serverId, cleanup);
    }

    // Discord - Add Role To Channel
    else if (Number(actionId) === 5) {
        return await cleanupAddRoleToChannel(serverId, cleanup);
    }

    // Discord - Create Category
    else if (Number(actionId) === 6) {
        return await cleanupCreateCategory(serverId, cleanup);
    }

    // Discord - Add Channel To Category
    else if (Number(actionId) === 7) {
        return await cleanupAddChannelToCategory(serverId, cleanup);
    }

    // Discord - Change Nickname
    else if (Number(actionId) === 3) {
        // No cleanup for this action.
    }
}

/**
 * 
 * @param {String} serverId 
 * @param {String} ruleId 
 * @param {Object} status 
 */
async function notifyOperators(serverId, ruleId, status) {
    let save = false;

    const rules = await disk.loadFile("./data/discord/server/" + serverId + "/rules.json");
    const rule = rules[ruleId];

    if ("failing_since" in rule) {
        if (status["discordError"]) {
            const failingSince = new Date(rule["failing_since"]);
            const currentDate = new Date();

            if (!rule["message_sent"]) {
                const message = "The rule **'" + rule["title"] + "'** is failing with the following error message and will be deleted after **7 days** if not fixed.\n`" + status["discordErrorMessage"] + "`";
                bot.send_message_to_operators(serverId, message);

                rule["message_sent"] = true;

                save = true;
            }

            if (currentDate.getTime() > failingSince.setSeconds(failingSince.getSeconds() + 604800)) {
                delete rules[ruleId];

                save = true;
            }
        }
        else {
            delete rule["failing_since"];
            delete rule["message_sent"];

            save = true;
        }
    }
    else {
        if (!status["discordError"]) {
            return;
        }

        rule["failing_since"] = new Date();
        rule["message_sent"] = false;

        save = true;
    }

    if (save) {
        await disk.writeFile("./data/discord/server/" + serverId + "/rules.json", rules);
    }
}

module.exports.sortRoles = sortRoles;
module.exports.executeAction = executeAction;
module.exports.executeCleanup = executeCleanup;
module.exports.notifyOperators = notifyOperators;