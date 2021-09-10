//@ts-check

"use strict";

const memory = require("./memory.js");
const environment = require("./environment.js");
const esi = require("./esi.js");
const disk = require("./disk.js");
const output = require("./output.js");

/**
 * 
 * @param {Request} request 
 * @param {Response} response 
 */
async function authentication(request, response) {
    const code = request["query"]["code"];

    if (code) {
        const state = request["query"]["state"];

        if (state === undefined) {
            return false;
        }

        const parameters = state.split(";");

        if (parameters.length !== 3) {
            return false;
        }

        const serverId = parameters[0];
        const userId = parameters[1];
        const accessCode = parameters[2];

        if (!("module_default_auth" in memory.accessCodes) || !(memory.accessCodes["module_default_auth"][userId] === accessCode)) {
            output.error("Authentication codes do not match. Try requesting a new link in Discord.");

            return false;
        }

        const token = await esi.requestToken(
            code,
            environment.configuration["uid"],
            environment.configuration["secret"],
            serverId
        );

        if (!token) {
            return false;
        }

        if (Number(token["status_code"]) !== 200) {
            output.error(token);
        }

        const tokenDetail = await esi.verifyToken(
            token,
            serverId
        );

        if (!tokenDetail) {
            return false;
        }

        if (Number(tokenDetail["status_code"]) !== 200) {
            output.error(tokenDetail);
        }

        if (tokenDetail["body"]["TokenType"] !== "Character") {
            return false;
        }

        token["registered_on"] = new Date();
        tokenDetail["validity"] = "valid";
        tokenDetail["main"] = true;

        const characterId = tokenDetail["body"]["CharacterID"];

        let jsonFileTokens = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token.json");
        jsonFileTokens = jsonFileTokens ? jsonFileTokens : [];

        let jsonFileTokenDetails = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");
        jsonFileTokenDetails = jsonFileTokenDetails ? jsonFileTokenDetails : {};

        for (let i = 0; i < jsonFileTokens.length; i++) {
            const jsonFileToken = jsonFileTokens[i];
            const refreshToken = jsonFileToken["body"]["refresh_token"];

            const jsonFileTokenDetail = jsonFileTokenDetails[refreshToken];

            if (jsonFileTokenDetail["main"]) {
                if (jsonFileTokenDetail["body"]["CharacterID"] !== characterId) {
                    tokenDetail["main"] = false;
                }
                
                break;
            }
        }

        let deleteIndex = undefined;
        let deleteKey = undefined;

        for (let i = 0; i < jsonFileTokens.length; i++) {
            const jsonFileToken = jsonFileTokens[i];
            const refreshToken = jsonFileToken["body"]["refresh_token"];

            const jsonFileTokenDetail = jsonFileTokenDetails[refreshToken];

            if (jsonFileTokenDetail["body"]["CharacterID"] === characterId) {
                deleteIndex = i;
                deleteKey = refreshToken;

                break;
            }
        }

        if (deleteIndex !== undefined) {
            jsonFileTokens.splice(deleteIndex, 1);
        }

        if (deleteKey !== undefined) {
            delete jsonFileTokenDetails[deleteKey];
        }

        jsonFileTokens.push(token);
        jsonFileTokenDetails[token["body"]["refresh_token"]] = tokenDetail;

        await disk.writeFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json", jsonFileTokenDetails);
        await disk.writeFile("./data/discord/server/" + serverId + "/user/" + userId + "/token.json", jsonFileTokens);

        return true;
    }

    const userId = request["query"]["user_id"];
    const accessCode = request["query"]["access_code"];

    //const userId = "336219014097403924";
    //const accessCode = "456";

    if (userId === undefined) {
        return false;
    }

    if (accessCode === undefined) {
        return false;
    }

    if (!("module_default_auth" in memory.accessCodes) || !(memory.accessCodes["module_default_auth"][userId] === accessCode)) {
        output.error("Authentication codes do not match. Try requesting a new link in Discord.");

        return false;
    }
    
    const cookie = request.cookies["spectrum_module_default_auth"];

    if (!cookie || cookie["access_code"] !== accessCode) {
        response.cookie(
            "spectrum_module_default_auth",
            {
                "host": environment.configuration["host"],
                "port": environment.configuration["port"],
                "user_id": userId,
                "access_code": accessCode
            },
            {
                "maxAge": 2592000000,
                "httpOnly": false
            }
        );
    }

    return true;
}

/**
 * 
 * @param {Request} request 
 * @param {Response} response 
 */
async function configuration(request, response) {
    const serverId = request["query"]["server_id"];
    const userId = request["query"]["user_id"];
    const accessCode = request["query"]["access_code"];

    //const serverId = "349569703481442317";
    //const userId = "336219014097403924";
    //const accessCode = "123";

    if (serverId === undefined) {
        return false;
    }

    if (userId === undefined) {
        return false;
    }

    if (accessCode === undefined) {
        return false;
    }

    if (!("module_default_config" in memory.accessCodes) || !(serverId in memory.accessCodes["module_default_config"]) || !(memory.accessCodes["module_default_config"][serverId][userId] === accessCode)) {
        output.error("Authentication codes do not match. Try requesting a new link in Discord.");

        return false;
    }

    const cookie = request.cookies["spectrum_module_default_config"];

    if (!cookie || cookie["access_code"] !== accessCode) {
        response.cookie(
            "spectrum_module_default_config",
            {
                "host": environment.configuration["host"],
                "port": environment.configuration["port"],
                "server_id": serverId, 
                "user_id": userId,
                "access_code": accessCode
            },
            {
                "maxAge": 2592000000,
                "httpOnly": false
            }
        );
    }
    
    return true;
}

module.exports.authentication = authentication;
module.exports.configuration = configuration;