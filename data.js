//@ts-check

"use strict";

const environment = require("./environment.js");
const memory = require("./memory.js");
const modules = require("./modules.js");
const disk = require("./disk.js");
const bot = require("./bot.js");

const actions = require("./module/default/actions.js");
const conditions = require("./module/default/conditions.js");
const endpoints = require("./module/default/endpoints.js");
const job = require("./module/default/job.js");
const queue = require("./module/default/queue.js");

const notifications = require("./module/notification/notifications.js");

/**
 * 
 * @param {String} userId 
 */
async function getAuthTokens(userId) {
    const servers = [];
    const serverKeys = bot.client.guilds.cache.keyArray();

    for (let i = 0; i < serverKeys.length; i++) {
        const serverKey = serverKeys[i];

        const server = await bot.client.guilds.fetch(serverKey);
        const userIsServerMember = server.members.cache.some((member) => {
            return member.id === userId;
        });

        if (!userIsServerMember) {
            continue;
        }

        let tokens = await disk.loadFile("./data/discord/server/" + server.id + "/user/" + userId + "/token.json");
        tokens = tokens ? tokens : [];

        let tokenDetails = await disk.loadFile("./data/discord/server/" + server.id + "/user/" + userId + "/token_detail.json");
        tokenDetails = tokenDetails ? tokenDetails : {};

        memory.requiredScopes[server.id] = await job.getRequiredScopes(server.id);

        servers.push({
            "server_id": server.id,
            "server_icon": server.iconURL(),
            "server_name": server.name,
            "tokens": tokens,
            "token_details": tokenDetails,
            "client_id": environment.configuration["uid"],
            "required_scopes": memory.requiredScopes[server.id].join("%20"),
            "authenticationUri": environment.configuration["authenticationUri"]
        });
    }

    return servers;
};

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {String} refreshToken 
 */
async function postAuthToken(serverId, userId, refreshToken) {
    let jsonFileTokens = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token.json");
    jsonFileTokens = jsonFileTokens ? jsonFileTokens : [];

    let jsonFileTokenDetails = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");
    jsonFileTokenDetails = jsonFileTokenDetails ? jsonFileTokenDetails : {};

    for (let i = 0; i < jsonFileTokens.length; i++) {
        const jsonFileToken = jsonFileTokens[i];
        const jsonFileTokenDetail = jsonFileTokenDetails[jsonFileToken["body"]["refresh_token"]];

        if (jsonFileTokenDetail["main"]) {
            jsonFileTokenDetail["main"] = false;

            break;
        }
    }

    const jsonFileTokenDetail = jsonFileTokenDetails[refreshToken];
    jsonFileTokenDetail["main"] = true;

    await disk.writeFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json", jsonFileTokenDetails);
};

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {String} refreshToken 
 */
async function deleteAuthToken(serverId, userId, refreshToken) {
    let jsonFileTokens = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token.json");
    jsonFileTokens = jsonFileTokens ? jsonFileTokens : [];

    let jsonFileTokenDetails = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");
    jsonFileTokenDetails = jsonFileTokenDetails ? jsonFileTokenDetails : {};

    let deleteIndex = undefined;

    for (let i = 0; i < jsonFileTokens.length; i++) {
        const jsonFileToken = jsonFileTokens[i];

        if (jsonFileToken["body"]["refresh_token"] === refreshToken) {
            deleteIndex = i;

            break;
        }
    }

    if (deleteIndex === undefined) {
        return;
    }

    const isMain = jsonFileTokenDetails[refreshToken]["main"];
    let newMainIndex = 0;

    if (isMain && jsonFileTokens.length > 1) {
        if (deleteIndex === 0) {
            newMainIndex = 1;
        }

        jsonFileTokenDetails[jsonFileTokens[newMainIndex]["body"]["refresh_token"]]["main"] = true;
    }

    jsonFileTokens.splice(deleteIndex, 1);
    delete jsonFileTokenDetails[refreshToken];

    await disk.writeFile("./data/discord/server/" + serverId + "/user/" + userId + "/token.json", jsonFileTokens);
    await disk.writeFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json", jsonFileTokenDetails);
};

/**
 * 
 * @param {String} server_id 
 */
async function getModules(server_id) {
    const availableModules = modules.data;
    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/modules/notification/module.json");

    return {
        "available_modules": availableModules,
        "modules": {
            "notification": jsonFile ? jsonFile : {}
        }
    };
};

/**
 * 
 * @param {String} server_id 
 */
async function getOperators(server_id) {
    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/operators.json");

    return jsonFile ? jsonFile : {};
};

/**
 * 
 * @param {String} server_id 
 * @param {String} operator_id 
 */
async function getOperator(server_id, operator_id) {
    if (operator_id === "new") {
        return {};
    }

    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/operators.json");

    return jsonFile[operator_id];
};

/**
 * 
 * @param {String} server_id 
 * @param {Object} data 
 */
async function postOperator(server_id, data) {
    const operator_id = data["operator"];
    const display_name = data["display_name"];
    const information = data["information"];
    const details = data["details"];
    let description = data["note"];

    if (description.trim().length === 0) {
        description = "No note.";
    }

    let jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/operators.json");
    jsonFile = jsonFile ? jsonFile : {};
    
    jsonFile[operator_id] = {
        "display_name": display_name,
        "information": information,
        "details": details,
        "note": description
    };

    await disk.writeFile("./data/discord/server/" + server_id + "/operators.json", jsonFile);
};

/**
 * 
 * @param {String} server_id 
 * @param {String} operator_id 
 */
async function deleteOperator(server_id, operator_id) {
    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/operators.json");

    delete jsonFile[operator_id];

    await disk.writeFile("./data/discord/server/" + server_id + "/operators.json", jsonFile);
};

async function getEndpoints() {
    return endpoints.data;
};

/**
 * 
 * @param {String} server_id 
 */
async function getScopes(server_id) {
    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/scopes.json");

    return jsonFile ? jsonFile : {};
};

/**
 * 
 * @param {String} server_id 
 * @param {Object} data 
 */
async function postScopes(server_id, data) {
    await disk.writeFile("./data/discord/server/" + server_id + "/scopes.json", data);

    // Since the scopes changed, update the required scopes.
    memory.requiredScopes[server_id] = await job.getRequiredScopes(server_id);
};

/**
 * 
 * @param {String} server_id 
 */
async function getKeywords(server_id) {
    //#region Make sure the ./data/discord/server/{server_id}/keywords.json file is loaded into memory.
    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/keywords.json");

    return jsonFile ? jsonFile : {};
};

/**
 * 
 * @param {String} server_id 
 * @param {String} keyword_id 
 */
async function getKeyword(server_id, keyword_id) {
    if (keyword_id === "new") {
        return {};
    }

    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/keywords.json");

    return jsonFile[keyword_id];
};

/**
 * 
 * @param {String} server_id 
 * @param {Object} data 
 */
async function postKeyword(server_id, data) {
    let keyword_id = data["id"];
    const keyword = data["keyword"];
    let description = data["description"];
    const endpoint = data["endpoint"];

    if (description.trim().length === 0) {
        description = "No description.";
    }

    let jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/keywords.json");
    jsonFile = jsonFile ? jsonFile : {};

    // Check if the new keyword would conflict with existing keywords.
    const keyword_keys = Object.keys(jsonFile);

    const new_keyword_name = data["keyword"];

    for (let i = 0; i < keyword_keys.length; i++) {
        const existing_keyword_id = keyword_keys[i];
        const existing_keyword_name = jsonFile[keyword_keys[i]]["keyword"];

        if (new_keyword_name === existing_keyword_name) {
            if (keyword_id === "new") {
                return {
                    "error": "This keyword would conflict with another keyword! A keyword called '" + new_keyword_name + "' already exists."
                };
            }
            else {
                if (Number(keyword_id) !== Number(existing_keyword_id)) {
                    return {
                        "error": "This keyword would conflict with another keyword! A keyword called '" + new_keyword_name + "' already exists."
                    };
                }
            }
        }
    }

    if (keyword_id === "new") {
        keyword_id = "1";

        const occupied_ids = Object.keys(jsonFile);

        while (occupied_ids.includes(keyword_id)) {
            keyword_id = (Number(keyword_id) + 1).toString();
        }

        jsonFile[keyword_id] = {
            "keyword": keyword,
            "description": description,
            "endpoint": endpoint
        };
    }
    else if (keyword_id) {
        jsonFile[keyword_id]["keyword"] = keyword;
        jsonFile[keyword_id]["description"] = description;
        jsonFile[keyword_id]["endpoint"] = endpoint;
    }

    await disk.writeFile("./data/discord/server/" + server_id + "/keywords.json", jsonFile);

    memory.requiredScopes[server_id] = await job.getRequiredScopes(server_id);
};

/**
 * 
 * @param {String} server_id 
 * @param {String} keyword_id 
 */
async function deleteKeyword(server_id, keyword_id) {
    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/keywords.json");

    delete jsonFile[keyword_id];

    await disk.writeFile("./data/discord/server/" + server_id + "/keywords.json", jsonFile);

    memory.requiredScopes[server_id] = await job.getRequiredScopes(server_id);
};

/**
 * 
 * @param {String} server_id 
 */
async function getConditions(server_id) {
    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/conditions.json");

    return jsonFile ? jsonFile : {};
};

/**
 * 
 * @param {String} server_id 
 * @param {String} condition_id 
 */
async function getCondition(server_id, condition_id) {
    if (condition_id === "new") {
        return {};
    }

    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/conditions.json");

    return jsonFile[condition_id];
};

/**
 * 
 * @param {String} server_id 
 * @param {Object} data 
 */
async function postCondition(server_id, data) {
    //#region Make sure the ./data/discord/server/{server_id}/ directory is created and loaded into memory.
    let condition_id = data["id"];
    const title = data["title"];
    const condition = data["condition"];
    let description = data["description"];

    if (description.trim().length === 0) {
        description = "No description.";
    }

    let jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/conditions.json");
    jsonFile = jsonFile ? jsonFile : {};

    // Check if the condition has circular nesting.
    await conditions.checkNesting(jsonFile, condition_id, condition);

    if (condition_id === "new") {
        condition_id = "1";

        const occupied_ids = Object.keys(jsonFile);

        while (occupied_ids.includes(condition_id)) {
            condition_id = (Number(condition_id) + 1).toString();
        }

        jsonFile[condition_id] = {
            "title": title,
            "description": description,
            "condition": condition
        };
    }
    else if (condition_id) {
        jsonFile[condition_id]["title"] = title;
        jsonFile[condition_id]["description"] = description;
        jsonFile[condition_id]["condition"] = condition;
    }

    await disk.writeFile("./data/discord/server/" + server_id + "/conditions.json", jsonFile);

    memory.requiredScopes[server_id] = await job.getRequiredScopes(server_id);
};

/**
 * 
 * @param {String} server_id 
 * @param {String} condition_id 
 */
async function deleteCondition(server_id, condition_id) {
    const jsonFileRules = await disk.loadFile("./data/discord/server/" + server_id + "/rules.json");
    const jsonFileConditions = await disk.loadFile("./data/discord/server/" + server_id + "/conditions.json");

    // Delete all rules that are dependent on the condition.
    const rule_keys = Object.keys(jsonFileRules);

    for (let i = 0; i < rule_keys.length; i++) {
        const rule_id = rule_keys[i];
        const rule = jsonFileRules[rule_id];

        if (Number(rule["condition"]) === Number(condition_id)) {
            delete jsonFileRules[rule_id];
        }
    }

    await disk.writeFile("./data/discord/server/" + server_id + "/rules.json", jsonFileRules);

    // Delete all conditions that are dependent on the condition.
    const conditions_to_delete = [];

    const condition_keys = Object.keys(jsonFileConditions);

    for (let i = 0; i < condition_keys.length; i++) {
        const dependent_condition_id = condition_keys[i];
        const dependent_condition = jsonFileConditions[dependent_condition_id];

        const customConditionParts = dependent_condition["condition"].split("[te-endpoints-my_conditions-");

        for (let i = 1; i < customConditionParts.length; i++) {
            const customConditionId = customConditionParts[i].split("]")[0];

            if (Number(condition_id) === Number(customConditionId)) {
                conditions_to_delete.push(dependent_condition_id);
            }
        }
    }

    for (let i = 0; i < conditions_to_delete.length; i++) {
        const condition_to_delete = conditions_to_delete[i];

        await deleteCondition(server_id, condition_to_delete);
    }

    delete jsonFileConditions[condition_id];

    await disk.writeFile("./data/discord/server/" + server_id + "/conditions.json", jsonFileConditions);

    memory.requiredScopes[server_id] = await job.getRequiredScopes(server_id);
};

async function getActions() {
    return actions.data;
};

/**
 * 
 * @param {String} server_id 
 */
async function getRules(server_id) {
    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/rules.json");

    return jsonFile ? jsonFile : {};
}

/**
 * 
 * @param {String} server_id 
 * @param {String} rule_id 
 */
async function getRule(server_id, rule_id) {
    if (rule_id === "new") {
        return {};
    }

    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/rules.json");

    return jsonFile[rule_id];
}

/**
 * 
 * @param {String} server_id 
 * @param {Object} data 
 */
async function postRule(server_id, data) {
    let rule_id = data["id"];
    const title = data["title"];
    let description = data["description"];
    const condition = data["condition"];
    const action = data["action"];
    const details = data["details"];

    if (description.trim().length === 0) {
        description = "No description.";
    }

    let jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/rules.json");
    jsonFile = jsonFile ? jsonFile : {};

    if (rule_id === "new") {
        rule_id = "1";

        const occupied_ids = Object.keys(jsonFile);

        while (occupied_ids.includes(rule_id)) {
            rule_id = (Number(rule_id) + 1).toString();
        }

        jsonFile[rule_id] = {
            "title": title,
            "description": description,
            "condition": condition,
            "action": action,
            "details": details
        };
    }
    else if (rule_id) {
        jsonFile[rule_id]["title"] = title;
        jsonFile[rule_id]["description"] = description;
        jsonFile[rule_id]["condition"] = condition;
        jsonFile[rule_id]["action"] = action;
        jsonFile[rule_id]["details"] = details;
    }

    await disk.writeFile("./data/discord/server/" + server_id + "/rules.json", jsonFile);

    memory.requiredScopes[server_id] = await job.getRequiredScopes(server_id);
};

/**
 * 
 * @param {String} server_id 
 * @param {String} rule_id 
 */
async function deleteRule(server_id, rule_id) {
    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/rules.json");

    delete jsonFile[rule_id];

    await disk.writeFile("./data/discord/server/" + server_id + "/rules.json", jsonFile);

    memory.requiredScopes[server_id] = await job.getRequiredScopes(server_id);
}

/**
 * 
 * @param {String} server_id 
 */
async function getBotControl(server_id) {
    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/bot_control.json");

    return jsonFile ? jsonFile : {};
};

/**
 * 
 * @param {String} server_id 
 * @param {Object} data 
 */
async function postBotControl(server_id, data) {
    await disk.writeFile("./data/discord/server/" + server_id + "/bot_control.json", data);

    // If the job for this server and module is already running, skip it.
    const jobId = server_id + "_default";

    if (queue.inQueue(jobId)) {
        return;
    }

    // Enqueue a new job.
    queue.fireAndForget(
        jobId,
        job.run,
        server_id
    );
};

/**
 * 
 * @param {String} server_id 
 */
async function getDiscordUsers(server_id) {
    const result = {};

    const server = await bot.client.guilds.fetch(server_id);
    const discord_user_keys = server.members.cache.keyArray();

    let jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/operators.json");
    jsonFile = jsonFile ? jsonFile : {};

    for (let i = 0; i < discord_user_keys.length; i++) {
        const userId = discord_user_keys[i];
        const member = await server.members.fetch(userId);
        const user = member.user;

        if (user.bot) {
            continue;
        }

        if (userId in jsonFile) {
            continue;
        }

        result[userId] = {
            "display_name": member.displayName,
            "user_name": user.username + "#" + user.discriminator,
            "joined_at": member.joinedAt
        };
    }

    return result;
};

/**
 * 
 * @param {String} server_id 
 */
async function getModuleNotificationModule(server_id) {
    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/modules/notification/module.json");

    return jsonFile ? jsonFile : {};
};

/**
 * 
 * @param {String} server_id 
 * @param {Object} data 
 */
async function postModuleNotificationModule(server_id, data) {
    let jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/modules/notification/module.json");
    jsonFile = jsonFile ? jsonFile : {};

    if (jsonFile["is_active"] !== "yes" && data["is_active"] === "yes") {
        jsonFile = {
            "active_since": new Date(),
            "posted_notifications": []
        };

        await disk.writeFile("./data/discord/server/" + server_id + "/modules/notification/notification_log.json", jsonFile);
    }

    await disk.writeFile("./data/discord/server/" + server_id + "/modules/notification/module.json", data);

    memory.requiredScopes[server_id] = await job.getRequiredScopes(server_id);
};

/**
 * 
 * @param {String} server_id 
 */
async function getModuleNotificationNotifications(server_id) {
    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/modules/notification/notifications.json");

    return jsonFile ? jsonFile : {};
};

/**
 * 
 * @param {String} server_id 
 * @param {String} notification_id 
 */
async function deleteModuleNotificationNotifications(server_id, notification_id) {
    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/modules/notification/notifications.json");

    delete jsonFile[notification_id];

    await disk.writeFile("./data/discord/server/" + server_id + "/modules/notification/notifications.json", jsonFile);
}

async function getNotifications() {
    return notifications.data;
}

/**
 * 
 * @param {String} server_id 
 * @param {String} notification_id 
 */
async function getModuleNotificationNotification(server_id, notification_id) {
    if (notification_id === "new") {
        return {};
    }

    const jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/modules/notification/notifications.json");

    return jsonFile[notification_id];
}

/**
 * 
 * @param {String} server_id 
 * @param {Object} data 
 */
async function postModuleNotificationNotification(server_id, data) {
    let notification_id = data["id"];
    const channel = data["channel"];
    const filter = data["filter"];
    const message_options = data["options"];
    const notification_list = data["notifications"];
    const notification_colors = data["colors"];

    let jsonFile = await disk.loadFile("./data/discord/server/" + server_id + "/modules/notification/notifications.json");
    jsonFile = jsonFile ? jsonFile : {};

    if (notification_id === "new") {
        notification_id = "1";

        const occupied_ids = Object.keys(jsonFile);

        while (occupied_ids.includes(notification_id)) {
            notification_id = (Number(notification_id) + 1).toString();
        }

        jsonFile[notification_id] = {
            "channel": channel,
            "filter": filter,
            "options": message_options,
            "notifications": notification_list,
            "colors": notification_colors
        };
    }
    else if (notification_id) {
        jsonFile[notification_id]["channel"] = channel;
        jsonFile[notification_id]["filter"] = filter;
        jsonFile[notification_id]["options"] = message_options;
        jsonFile[notification_id]["notifications"] = notification_list;
        jsonFile[notification_id]["colors"] = notification_colors;
    }

    await disk.writeFile("./data/discord/server/" + server_id + "/modules/notification/notifications.json", jsonFile);
}

module.exports.getAuthTokens = getAuthTokens;
module.exports.postAuthToken = postAuthToken;
module.exports.deleteAuthToken = deleteAuthToken;
module.exports.getModules = getModules;
module.exports.getOperators = getOperators;
module.exports.getOperator = getOperator;
module.exports.postOperator = postOperator;
module.exports.deleteOperator = deleteOperator;
module.exports.getEndpoints = getEndpoints;
module.exports.getScopes = getScopes;
module.exports.postScopes = postScopes;
module.exports.getKeywords = getKeywords;
module.exports.getKeyword = getKeyword;
module.exports.postKeyword = postKeyword;
module.exports.deleteKeyword = deleteKeyword;
module.exports.getConditions = getConditions;
module.exports.getCondition = getCondition;
module.exports.postCondition = postCondition;
module.exports.deleteCondition = deleteCondition;
module.exports.getActions = getActions;
module.exports.getRules = getRules;
module.exports.getRule = getRule;
module.exports.postRule = postRule;
module.exports.deleteRule = deleteRule;
module.exports.getBotControl = getBotControl;
module.exports.postBotControl = postBotControl;
module.exports.getDiscordUsers = getDiscordUsers;
module.exports.getModuleNotificationModule = getModuleNotificationModule;
module.exports.postModuleNotificationModule = postModuleNotificationModule;
module.exports.getModuleNotificationNotifications = getModuleNotificationNotifications;
module.exports.deleteModuleNotificationNotifications = deleteModuleNotificationNotifications;
module.exports.getModuleNotificationNotification = getModuleNotificationNotification;
module.exports.postModuleNotificationNotification = postModuleNotificationNotification;
module.exports.getNotifications = getNotifications;