//@ts-check

"use strict";

const Helper = require("discord.js");

const bot = require("../../bot.js");
const socket = require("../../socket.js");
const disk = require("../../disk.js");
const memory = require("../../memory.js");
const esi = require("../../esi.js");
const output = require("../../output.js");

const conditions = require("./conditions.js");
const endpoints = require("./endpoints.js");
const discord = require("./discord.js");

const discordQueue = require("../queue.js");

/**
 * 
 * @param {String} serverId 
 */
async function botIsActive(serverId) {

    let data = await disk.loadFile("./data/discord/server/" + serverId + "/bot_control.json");
    data = data ? data : {};

    if (data["is_active"] === "yes") {
        return true;
    }

    return false;

}

/**
 * 
 * @param {Helper.Guild} server 
 */
async function getUserIdList(server) {
    const members = await server.members.fetch();

    //const userIdList = server.members.cache.keyArray();
    //const userIdList = await disk.getDirectories("./data/discord/server/" + server.id + "/user/");
    const cleanUserIdList = [];

    //if (!userIdList) {
    //    return cleanUserIdList;
    //}

    for (const member of members) {
        // Filter out bots.
        if (member[1].user.bot) {
            continue;
        }

        cleanUserIdList.push(member[1].id);
    }

    return cleanUserIdList;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} conditionString 
 * @param {Number} index 
 */
async function extractEndpoints(serverId, conditionString, index) {
    const endpointList = [];

    let parsing = false;
    let parsed = false;
    let parsingStep = "parsingType";
    let nesting = 0;
    let conditionElement = "";

    let parsingType = 0;

    /* For parsingType = 2 */
    let direction = undefined;
    let entityType = undefined;

    /* For parsingType = 2, 3 */
    let baseEndpoint = undefined;

    for (let i = 0; i < conditionString.length; i++) {
        const char = conditionString.charAt(i);

        if (parsing) {
            if (char === "[") {
                nesting++;
            }
            else if (char === "]") {
                nesting--;
            }

            if (nesting === 0) {
                parsing = false;
                parsed = true;
            }
            else {
                conditionElement += char;

                continue;
            }
        }

        if (parsed) {
            if (parsingStep === "parsingType") {
                parsingType = Number(conditionElement);

                parsingStep = "endpoint";
            }
            else if (parsingStep === "endpoint") {
                baseEndpoint = conditionElement;

                if (parsingType !== 2 && !conditionElement.startsWith("te-endpoints-my_conditions-")) {
                    if (!endpointList.includes(baseEndpoint)) {
                        endpointList.push(baseEndpoint);
                    }
                }
                else if (conditionElement.startsWith("te-endpoints-my_conditions-")) {
                    const conditions = await disk.loadFile("./data/discord/server/" + serverId + "/conditions.json");

                    const conditionId = conditionElement.substring(27);
                    const condition = conditions[conditionId];

                    const newEndpoints = await extractEndpoints(serverId, condition["condition"], 0);

                    for (let j = 0; j < newEndpoints.length; j++) {
                        const newEndpoint = newEndpoints[j];

                        if (!endpointList.includes(newEndpoint)) {
                            endpointList.push(newEndpoint);
                        }
                    }
                }

                if (parsingType === 1) {
                    parsingStep = "comparator";
                }
                else if (parsingType === 2) {
                    parsingStep = "direction";
                }
                else if (parsingType === 3) {
                    parsingStep = "target";
                }
            }
            else if (parsingStep === "target") {
                parsingStep = "targetName";
            }
            else if (parsingStep === "targetName") {
                parsingStep = "comparator";
            }
            else if (parsingStep === "direction") {
                direction = conditionElement;

                parsingStep = "entityType";
            }
            else if (parsingStep === "entityType") {
                entityType = conditionElement;;

                if (direction === "TOWARDS") {
                    if (!endpointList.includes(baseEndpoint)) {
                        endpointList.push(baseEndpoint);
                    }
                }
                else if (direction === "FROM") {
                    let endpoint = undefined;

                    if (baseEndpoint === "te-endpoints-eve_online-alliance-standing-has_standing") {
                        if (entityType === "ALLIANCE") {
                            endpoint = "te-endpoints-eve_online-alliance-standing-has_standing";
                        }
                        else if (entityType === "CORPORATION") {
                            endpoint = "te-endpoints-eve_online-corporation-standing-has_standing";
                        }
                        else if (entityType === "CHARACTER") {
                            endpoint = "te-endpoints-eve_online-character-standing-has_standing";
                        }
                    }
                    else if (baseEndpoint === "te-endpoints-eve_online-alliance-standing-id") {
                        if (entityType === "ALLIANCE") {
                            endpoint = "te-endpoints-eve_online-alliance-standing-id";
                        }
                        else if (entityType === "CORPORATION") {
                            endpoint = "te-endpoints-eve_online-corporation-standing-id";
                        }
                        else if (entityType === "CHARACTER") {
                            endpoint = "te-endpoints-eve_online-character-standing-id";
                        }
                    }
                    else if (baseEndpoint === "te-endpoints-eve_online-alliance-standing-name") {
                        if (entityType === "ALLIANCE") {
                            endpoint = "te-endpoints-eve_online-alliance-standing-name";
                        }
                        else if (entityType === "CORPORATION") {
                            endpoint = "te-endpoints-eve_online-corporation-standing-name";
                        }
                        else if (entityType === "CHARACTER") {
                            endpoint = "te-endpoints-eve_online-character-standing-name";
                        }
                    }
                    else if (baseEndpoint === "te-endpoints-eve_online-alliance-standing-ticker") {
                        if (entityType === "ALLIANCE") {
                            endpoint = "te-endpoints-eve_online-alliance-standing-ticker";
                        }
                        else if (entityType === "CORPORATION") {
                            endpoint = "te-endpoints-eve_online-corporation-standing-ticker";
                        }
                    }
                    else if (baseEndpoint === "te-endpoints-eve_online-corporation-standing-has_standing") {
                        if (entityType === "ALLIANCE") {
                            endpoint = "te-endpoints-eve_online-alliance-standing-has_standing";
                        }
                        else if (entityType === "CORPORATION") {
                            endpoint = "te-endpoints-eve_online-corporation-standing-has_standing";
                        }
                        else if (entityType === "CHARACTER") {
                            endpoint = "te-endpoints-eve_online-character-standing-has_standing";
                        }
                    }
                    else if (baseEndpoint === "te-endpoints-eve_online-corporation-standing-id") {
                        if (entityType === "ALLIANCE") {
                            endpoint = "te-endpoints-eve_online-alliance-standing-id";
                        }
                        else if (entityType === "CORPORATION") {
                            endpoint = "te-endpoints-eve_online-corporation-standing-id";
                        }
                        else if (entityType === "CHARACTER") {
                            endpoint = "te-endpoints-eve_online-character-standing-id";
                        }
                    }
                    else if (baseEndpoint === "te-endpoints-eve_online-corporation-standing-name") {
                        if (entityType === "ALLIANCE") {
                            endpoint = "te-endpoints-eve_online-alliance-standing-name";
                        }
                        else if (entityType === "CORPORATION") {
                            endpoint = "te-endpoints-eve_online-corporation-standing-name";
                        }
                        else if (entityType === "CHARACTER") {
                            endpoint = "te-endpoints-eve_online-character-standing-name";
                        }
                    }
                    else if (baseEndpoint === "te-endpoints-eve_online-corporation-standing-ticker") {
                        if (entityType === "ALLIANCE") {
                            endpoint = "te-endpoints-eve_online-alliance-standing-ticker";
                        }
                        else if (entityType === "CORPORATION") {
                            endpoint = "te-endpoints-eve_online-corporation-standing-ticker";
                        }
                    }
                    else if (baseEndpoint === "te-endpoints-eve_online-character-standing-has_standing") {
                        if (entityType === "ALLIANCE") {
                            endpoint = "te-endpoints-eve_online-alliance-standing-has_standing";
                        }
                        else if (entityType === "CORPORATION") {
                            endpoint = "te-endpoints-eve_online-corporation-standing-has_standing";
                        }
                        else if (entityType === "CHARACTER") {
                            endpoint = "te-endpoints-eve_online-character-standing-has_standing";
                        }
                    }
                    else if (baseEndpoint === "te-endpoints-eve_online-character-standing-id") {
                        if (entityType === "ALLIANCE") {
                            endpoint = "te-endpoints-eve_online-alliance-standing-id";
                        }
                        else if (entityType === "CORPORATION") {
                            endpoint = "te-endpoints-eve_online-corporation-standing-id";
                        }
                        else if (entityType === "CHARACTER") {
                            endpoint = "te-endpoints-eve_online-character-standing-id";
                        }
                    }
                    else if (baseEndpoint === "te-endpoints-eve_online-character-standing-name") {
                        if (entityType === "ALLIANCE") {
                            endpoint = "te-endpoints-eve_online-alliance-standing-name";
                        }
                        else if (entityType === "CORPORATION") {
                            endpoint = "te-endpoints-eve_online-corporation-standing-name";
                        }
                        else if (entityType === "CHARACTER") {
                            endpoint = "te-endpoints-eve_online-character-standing-name";
                        }
                    }

                    if (endpoint && !endpointList.includes(endpoint)) {
                        endpointList.push(endpoint);
                    }
                }

                parsingStep = "entity";
            }
            else if (parsingStep === "entity") {
                parsingStep = "comparator";
            }
            else if (parsingStep === "comparator") {
                parsingStep = "value";
            }
            else if (parsingStep === "value") {
                const valueIsEndpoint = await endpoints.isEndpoint(conditionElement);

                if (valueIsEndpoint) {
                    if (!endpointList.includes(conditionElement)) {
                        endpointList.push(conditionElement);
                    }
                }

                parsingStep = "parsingType";
            }

            conditionElement = "";
            parsed = false;

            continue;
        }

        if ((char === "(" || char === ")" || char === "[") && conditionElement.length > 0) {
            conditionElement = "";
        }

        if (char === "(") {
            const [newEndpoints, newIndex] = await extractEndpoints(serverId, conditionString.substring(i + 1), i);

            for (let j = 0; j < newEndpoints.length; j++) {
                const newEndpoint = newEndpoints[j];

                if (!endpointList.includes(newEndpoint)) {
                    endpointList.push(newEndpoint);
                }
            }

            i = newIndex;
        }
        else if (char === ")") {
            return [endpointList, index + i + 1];
        }
        else if (char === "[") {
            nesting++;

            parsing = true;
        }
        else {
            conditionElement += char;
        }
    }

    return endpointList;
}

/**
 * 
 * @param {String} serverId 
 */
async function getRequiredEndpoints(serverId) {
    const endpointList = [];

    const rules = await disk.loadFile("./data/discord/server/" + serverId + "/rules.json");

    if (rules) {
        const ruleIdList = Object.keys(rules);

        const conditions = await disk.loadFile("./data/discord/server/" + serverId + "/conditions.json");

        for (let i = 0; i < ruleIdList.length; i++) {
            const ruleId = ruleIdList[i];
            const rule = rules[ruleId];

            const conditionId = rule["condition"];
            const condition = conditions[conditionId];

            const newEndpoints = await extractEndpoints(serverId, condition["condition"], 0);

            for (let j = 0; j < newEndpoints.length; j++) {
                const newEndpoint = newEndpoints[j];

                if (!endpointList.includes(newEndpoint)) {
                    endpointList.push(newEndpoint);
                }
            }
        }

        for (let i = 0; i < ruleIdList.length; i++) {
            const ruleId = ruleIdList[i];
            const rule = rules[ruleId];

            const actionId = rule["action"];

            if (Number(actionId) === 3) {
                if (!endpointList.includes("te-endpoints-eve_online-character-name")) {
                    endpointList.push("te-endpoints-eve_online-character-name");
                }

                if (!endpointList.includes("te-endpoints-eve_online-alliance-ticker")) {
                    endpointList.push("te-endpoints-eve_online-alliance-ticker");
                }

                if (!endpointList.includes("te-endpoints-eve_online-corporation-ticker")) {
                    endpointList.push("te-endpoints-eve_online-corporation-ticker");
                }
            }
        }
    }

    const keywords = await disk.loadFile("./data/discord/server/" + serverId + "/keywords.json");

    if (keywords) {
        const keywordIdList = Object.keys(keywords);

        for (let i = 0; i < keywordIdList.length; i++) {
            const keywordId = keywordIdList[i];
            const endpointString = keywords[keywordId]["endpoint"];

            const endpoint = endpointString.split("[")[2].split("]")[0];

            if (!endpointList.includes(endpoint)) {
                endpointList.push(endpoint);
            }
        }
    }

    const moduleNotification = await disk.loadFile("./data/discord/server/" + serverId + "/modules/notification/module.json");

    if (moduleNotification) {
        if (moduleNotification["is_active"] === "yes") {
            if (!endpointList.includes("module_notification")) {
                endpointList.push("module_notification");
            }
        }
    }
    
    return endpointList;
}

/**
 * 
 * @param {String} serverId 
 */
async function getRequiredScopes(serverId) {
    const requiredScopes = [];

    memory.requiredEndpoints[serverId] = await getRequiredEndpoints(serverId);

    const requiredEndpoints = memory.requiredEndpoints[serverId];

    for (let i = 0; i < requiredEndpoints.length; i++) {
        const requiredEndpoint = requiredEndpoints[i];

        if (requiredEndpoint === "module_notification") {
            if (!requiredScopes.includes("esi-characters.read_notifications.v1")) {
                requiredScopes.push("esi-characters.read_notifications.v1");
            }

            if (!requiredScopes.includes("esi-universe.read_structures.v1")) {
                requiredScopes.push("esi-universe.read_structures.v1");
            }
        }
        else {
            if ("scope" in endpoints.data[requiredEndpoint]) {
                const requiredScope = endpoints.data[requiredEndpoint]["scope"];

                if (!requiredScopes.includes(requiredScope)) {
                    requiredScopes.push(requiredScope);
                }
            }
        }
    }

    const forcedScopes = await disk.loadFile("./data/discord/server/" + serverId + "/scopes.json");
    const forcedScopeKeys = Object.keys(forcedScopes);

    for (let i = 0; i < forcedScopeKeys.length; i++) {
        const forcedScope = forcedScopeKeys[i];
        const isForced = forcedScopes[forcedScope] === "yes";

        if (isForced) {
            if (!requiredScopes.includes(forcedScope)) {
                requiredScopes.push(forcedScope);
            }
        }
    }

    if (!requiredScopes.includes("publicData")) {
        requiredScopes.push("publicData");
    }

    return requiredScopes;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Object[]} tokens 
 */
async function mainCharacterToken(serverId, userId, tokens) {
    let tokenDetails = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");
    tokenDetails = tokenDetails ? tokenDetails : {};

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const refreshToken = token["body"]["refresh_token"];

        const tokenDetail = tokenDetails[refreshToken];

        if (!tokenDetail) {
            await esi.setTokenValidity(serverId, userId, refreshToken, "invalid");

            continue;
        }

        const isMainCharacter = tokenDetail["main"];

        if (isMainCharacter) {
            return token;
        }
    }
}

function fetchServer(bot, serverId) {
    return bot.client.guilds.fetch(serverId);
}

function fetchMembers(server) {
    return getUserIdList(server);
}

/**
 * 
 * @param {String} serverId 
 */
async function run(serverId) {
    try {
        if (!(await disk.exists("./data/discord/server/" + serverId))) {
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

            await disk.writeFile("./data/discord/server/" + serverId + "/conditions.json", conditions);
        }

        await bot.send_message_to_operators(serverId, "Hello server owners and bot operators!\n\nUnfortunately the latest update to the SSO broke the token authentication of Spectrum. I currently can not find the needed free time to fix the issue.\n\nI'm sorry to say, but Spectrum will probably remain offline for the foreseeable future.\n\nI am currently working on open sourcing the code so someone else might be able to pick up where I left.\n\nIt's been great working with you guys and I hope you'll be able to find a good replacement in the meantime. I would have prefered if it did not end so abruptly and gave you some time to switch.\n\nThank you!");
        return;

        // Create the server socket for web communication.
        // This will do nothing if the socket already exists.
        /*await socket.createNamespace(serverId);

        if (esi.getErrorResponseCount() >= esi.getErrorThreshold()) {
            return;
        }*/

        // Abort if the bot is not active.
        /*const isActive = await botIsActive(serverId);

        if (!isActive) {
            return;
        }*/

        // Get the rules on this server.
        /*const rules = await disk.loadFile("./data/discord/server/" + serverId + "/rules.json");

        // If the server has no rules, abort.
        if (!rules) {
            return;
        }*/

        // Get the server.
        const server = await discordQueue.add(
            fetchServer,
            [
                bot,
                serverId
            ]
        );

        // Make sure the server is available.
        if (!server.available) {
            return;
        }

        // Get a list of rule ids for iteration.
        const ruleIdList = Object.keys(rules);

        // Make sure the order of actions is correct and start executing the job.

        // 1 = Discord - Create Role
        // 2 = Discord - Add Role To User
        // 4 = Discord - Create Channel
        // 5 = Discord - Add Role To Channel
        // 6 = Discord - Create Category
        // 7 = Discord - Add Channel To Category
        // 3 = Discord - Change Nickname

        const actionOrderList = [1, 2, 4, 5, 6, 7, 3];

        // Get the list of user ids to iterate over.
        const userIdList = await discordQueue.add(
            fetchMembers,
            [
                server
            ]
        );
        
        // List of user ids which the nickname has been set for, in case there are multiple rules for this.
        const nicknameSetList = [];

        // For every action.
        for (let i = 0; i < actionOrderList.length; i++) {
            const actionId = actionOrderList[i];
            const cleanup = {};

            // For every rule.
            for (let j = 0; j < ruleIdList.length; j++) {
                const ruleId = ruleIdList[j];
                const rule = rules[ruleId];

                const notifyStatus = {
                    "discordError": false,
                    "discordErrorMessage": undefined
                };

                if (Number(actionId) !== Number(rule["action"])) {
                    continue;
                }

                // For every user.
                for (let k = 0; k < userIdList.length; k++) {
                    const currentUserId = userIdList[k];

                    // Nickname for this user has already been set.
                    if (Number(actionId) === 3) {
                        if (nicknameSetList.includes(currentUserId)) {
                            continue;
                        }
                    }

                    let tokens = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + currentUserId + "/token.json");
                    tokens = tokens ? tokens : [];

                    let conditionError = false;
                    let conditionOk = false;
                    let token = undefined;

                    if (tokens.length === 0) {
                        // Check the condition once in case a token is not needed.
                        const checkResult = await conditions.check(
                            serverId, currentUserId, rule, undefined
                        ).catch((error) => {
                            conditionError = true;

                            const message = output.error(error);
                            socket.messageToRoom(serverId, "config_server_logs", "error", message);
                        });

                        if (checkResult === "TOKEN REQUIRED") {
                            conditionOk = false;
                        }
                        else {
                            conditionOk = checkResult;
                        }
                    }
                    else {
                        // Try the condition with the main character first.
                        const mainToken = await mainCharacterToken(serverId, currentUserId, tokens);

                        if (mainToken) {
                            const checkResult = await conditions.check(
                                serverId, currentUserId, rule, mainToken
                            ).catch((error) => {
                                conditionError = true;

                                const message = output.error(error);
                                socket.messageToRoom(serverId, "config_server_logs", "error", message);
                            });
        
                            if (checkResult === "TOKEN REQUIRED") {
                                conditionOk = false;
                            }
                            else {
                                conditionOk = checkResult;
                            }
                        }

                        if (conditionOk) {
                            token = mainToken;
                        }
                        else if (conditionError) {
                            break;
                        }
                        else {
                            // Try the condition with every other character.
                            for (let l = 0; l < tokens.length; l++) {
                                token = tokens[l];

                                // Skip the main character, since we have already checked it.
                                if (mainToken && token["body"]["refresh_token"] === mainToken["body"]["refresh_token"]) {
                                    continue;
                                }

                                const checkResult = await conditions.check(
                                    serverId, currentUserId, rule, token
                                ).catch((error) => {
                                    conditionError = true;

                                    const message = output.error(error);
                                    socket.messageToRoom(serverId, "config_server_logs", "error", message);
                                });
            
                                if (checkResult === "TOKEN REQUIRED") {
                                    conditionOk = false;
                                }
                                else {
                                    conditionOk = checkResult;
                                }

                                if (conditionError) {
                                    break;
                                }

                                if (conditionOk) {
                                    break;
                                }
                            }
                        }
                    }

                    if (esi.getErrorResponseCount() >= esi.getErrorThreshold()) {
                        break;
                    }

                    if (conditionError) {
                        break;
                    }

                    // Execute the action on Discord.
                    const status = await discord.executeAction(actionId, rule["details"], serverId, currentUserId, ruleId, token, conditionOk, cleanup);

                    if (conditionOk) {
                        // Add user id to the list of nicknames that have already been set.
                        if (Number(actionId) === 3) {
                            if (!nicknameSetList.includes(currentUserId)) {
                                nicknameSetList.push(currentUserId);
                            }
                        }
                    }

                    if (conditionOk && status["discordError"]) {
                        if (!notifyStatus["discordError"]) {
                            notifyStatus["discordError"] = status["discordError"];
                            notifyStatus["discordErrorMessage"] = status["discordErrorMessage"];
                        }

                        if (status["break"]) {
                            break;
                        }
                    }
                }

                if (esi.getErrorResponseCount() >= esi.getErrorThreshold()) {
                    break;
                }

                // Notify the operators if there are any problems with the rule.
                // If the problem does not get fixed within 7 days, the rule will be deleted.
                await discord.notifyOperators(serverId, ruleId, notifyStatus);
            }

            if (esi.getErrorResponseCount() >= esi.getErrorThreshold()) {
                break;
            }

            // Execute any required cleanup action of roles and channels.
            await discord.executeCleanup(actionId, serverId, userIdList, cleanup);
        }

        if (esi.getErrorResponseCount() >= esi.getErrorThreshold()) {
            return;
        }

        await discord.sortRoles(serverId);
    }
    catch(error) {
        console.log(error);
    }

    if (memory.conditionCheck["check"] && memory.conditionCheck["serverId"] === serverId) {
        memory.conditionCheck = {};
    }
}

module.exports.botIsActive = botIsActive;
module.exports.getUserIdList = getUserIdList;
module.exports.getRequiredEndpoints = getRequiredEndpoints;
module.exports.getRequiredScopes = getRequiredScopes;
module.exports.run = run;