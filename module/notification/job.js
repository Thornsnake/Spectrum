//@ts-check

"use strict";

const bot = require("../../bot.js");
const disk = require("../../disk.js");
const esi = require("../../esi.js");

const defaultJob = require("../default/job.js");

const notifications = require("./notifications.js");

const discordQueue = require("../queue.js");

/**
 * 
 * @param {String} serverId 
 */
async function moduleIsActive(serverId) {
    let module = await disk.loadFile("./data/discord/server/" + serverId + "/modules/notification/module.json");
    module = module ? module : {};

    if (module["is_active"] !== "yes") {
        return false;
    }

    return true;
}

/**
 * 
 * @param {String} serverId 
 * @param {String[]} userIdList 
 */
async function getValidCharacters(serverId, userIdList) {
    const validCharacters = {};
    let characterCount = 0;

    // For every user.
    for (let i = 0; i < userIdList.length; i++) {
        const userId = userIdList[i];

        if (!(userId in validCharacters)) {
            validCharacters[userId] = [];
        }

        let tokens = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token.json");
        tokens = tokens ? tokens : [];

        let tokenDetails = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");
        tokenDetails = tokenDetails ? tokenDetails : {};

        // For every character.
        for (let j = 0; j < tokens.length; j++) {
            const token = tokens[j];
            const refreshToken = token["body"]["refresh_token"];

            const tokenDetail = tokenDetails[refreshToken];

            if (!tokenDetail) {
                await esi.setTokenValidity(serverId, userId, refreshToken, "invalid");

                continue;
            }

            if (tokenDetail["validity"] === "invalid") {
                continue;
            }

            // Check if the token has the necessary scope to get the value.
            const scopes = tokenDetail["body"]["Scopes"].split(" ");

            if (!scopes.includes("esi-characters.read_notifications.v1") || !scopes.includes("esi-universe.read_structures.v1")) {
                await esi.setTokenValidity(serverId, userId, refreshToken, "incomplete");

                continue;
            }

            validCharacters[userId].push(tokenDetail["body"]["CharacterID"]);
            characterCount++;
        }
    }

    return [validCharacters, characterCount];
}

/**
 * 
 * @param {Number} milliseconds 
 */
async function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * 
 * @param {String} serverId 
 * @param {Object} validCharacters 
 * @param {Number} characterCount 
 */
async function postNotifications(serverId, validCharacters, characterCount) {
    let sleepMilliseconds = -1;
    let characterIndex = 0;

    const userIdList = Object.keys(validCharacters);

    for (let i = 0; i < userIdList.length; i++) {
        const userId = userIdList[i];
        const characterIdList = validCharacters[userId];

        for (let j = 0; j < characterIdList.length; j++) {
            const characterId = characterIdList[j];

            const characterNotifications = await esi.getCharacterNotifications(serverId, userId, characterId);

            if (esi.getErrorResponseCount() >= esi.getErrorThreshold()) {
                return;
            }

            const currentDate = new Date();
            const expiryDate = new Date(characterNotifications["headers"]["expires"]);

            const dateDifference = expiryDate.getTime() - currentDate.getTime(); // This will produce the difference in milliseconds, exactly what we need.
            const buffer = characterCount * 1000; // Buffer in milliseconds to prevent the cycle from slipping into cached calls.

            if (sleepMilliseconds === -1) {
                sleepMilliseconds = Math.floor((dateDifference + buffer) / characterCount);

                if (sleepMilliseconds < 0) {
                    sleepMilliseconds = 0;
                }
            }

            // Post all new notifications.
            // We do not wait for this, because we don't want to delay the sleep timer.
            notifications.post(serverId, userId, characterId, characterNotifications);

            characterIndex++;

            if (characterIndex === characterCount) {
                break;
            }

            await sleep(sleepMilliseconds);
        }

        if (characterIndex === characterCount) {
            break;
        }
    }
}

function fetchServer(bot, serverId) {
    return bot.client.guilds.fetch(serverId);
}

function fetchMembers(server) {
    return defaultJob.getUserIdList(server);
}

/**
 * 
 * @param {String} serverId 
 */
async function run(serverId) {
    try {
        if (esi.getErrorResponseCount() >= esi.getErrorThreshold()) {
            return;
        }
    
        // Abort if the bot is not active.
        const botIsActive = await defaultJob.botIsActive(serverId);
    
        if (!botIsActive) {
            return;
        }
    
        // Abort if the module is not active.
        const isActive = await moduleIsActive(serverId);
    
        if (!isActive) {
            return;
        }
    
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
        
        // Get the list of user ids to iterate over.
        const userIdList = await discordQueue.add(
            fetchMembers,
            [
                server
            ]
        );
    
        // Filter for valid characters.
        const [validCharacters, characterCount] = await getValidCharacters(serverId, userIdList);
    
        // Post new notifications.
        await postNotifications(serverId, validCharacters, characterCount); // TODO
    }
    catch(error) {
        console.log(error);
    }
}

module.exports.run = run;