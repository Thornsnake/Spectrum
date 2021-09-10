//@ts-check

"use strict";

const https = require("https");
const url = require("url");
const querystring = require("querystring");

const environment = require("./environment.js");
const output = require("./output.js");
const socket = require("./socket.js");
const disk = require("./disk.js");
const bot = require("./bot.js");

// The response count will reset every 60 seconds.
// If there are more errors than the error threshhold allows within 60 seconds, the bot assumes downtime.
const errors = {
    errorResponseCount: 0,
    errorThreshold: 10
};

/**
 * 
 * @param {Number} count 
 */
function setErrorResponseCount(count) {
    errors.errorResponseCount = count;
}

function getErrorResponseCount() {
    return errors.errorResponseCount;
}

function getErrorThreshold() {
    return errors.errorThreshold;
}

//#region Request handling
/**
 * 
 * @param {Object} result 
 */
async function parse_result(result) {
    /* If status code is 304, there is no body to parse. */
    if (Number(result["status_code"]) === 304) { return result; }

    let parsed_result = result;

    try {
        parsed_result["body"] = JSON.parse(parsed_result["body"]);
    }
    catch (error) {
        /* Do nothing. */
    }

    return parsed_result;
}

/**
 * 
 * @param {Object} options 
 * @param {String} server_id 
 */
async function make_request(options, server_id = undefined) {
    let retries = 0;
    const max_retries = 3;
    const retry_delay = 3000;

    let data = undefined;

    if (!("headers" in options)) {
        options["headers"] = {};
    }

    if (!("path" in options)) {
        options["path"] = "";
    }

    if (options["method"] === "POST") {
        options["headers"]["Content-Type"] = "application/x-www-form-urlencoded";
        options["headers"]["Content-Length"] = 0;

        if ("data" in options) {
            data = JSON.stringify(options["data"]);
            //data = querystring.stringify(options["data"]);
            options["headers"]["Content-Length"] = Buffer.byteLength(data);

            delete options["data"];
        }
    }

	/*
		If the etag attribute is defined, but its value is undefined, change the value to an empty string.
		We can not send an undefined value.
	*/
    if ("If-None-Match" in options["headers"]) {
        if (!options["headers"]["If-None-Match"]) {
            options["headers"]["If-None-Match"] = "";
        }
    }

    let result = undefined;
    let stop_retry = false;

    try {
        for (retries = 0; retries < max_retries + 1; retries++) {
            if (retries !== 0) {
                await new Promise((resolve) => setTimeout(resolve, retry_delay));
            }
            
            await new Promise(function (resolve, reject) {
                const request = https.request(options, (response) => {
                    const body = [];

                    response.on("data", (chunk) => {
                        body.push(chunk);
                    });

                    response.on("end", () => {
                        result = {
                            "status_code": response["statusCode"],
                            "headers": response["headers"]
                        };

                        /*
                            If the status code is 304, the data on the server did not change and our cached data is still valid.
                            Set the body to undefined.
                        */
                        if (Number(result["status_code"]) === 304) {
                            if (retries !== 0) {
                                const message = output.success("[REQUEST] [" + result["status_code"] + "] " + options["host"] + options["path"] + " [RETRY " + retries + " / " + max_retries + "]", false).split("&refresh_token=")[0];

                                if (server_id) {
                                    socket.messageToRoom(server_id, "config_server_logs", "success", message);
                                }
                            }
                            else {
                                const message = output.success("[REQUEST] [" + result["status_code"] + "] " + options["host"] + options["path"], false).split("&refresh_token=")[0];

                                if (server_id) {
                                    socket.messageToRoom(server_id, "config_server_logs", "success", message);
                                }
                            }

                            stop_retry = true;
                            result["body"] = undefined;
                        }

                        /*
                            If the status code is not 304, investigate further.
                        */
                        else {
                            /*
                                If the status code is not 200, investigate further.
                            */
                            if (Number(result["status_code"]) !== 200) {
                                /*
                                    Error with the server or service we are trying to use.
                                    We can"t do anything about it, just retry until it works.
                                */
                                if (Number(result["status_code"]) >= 500) {
                                    if (retries !== 0) {
                                        const message = output.error("[REQUEST] [" + result["status_code"] + "] " + options["host"] + options["path"] + " [RETRY " + retries + " / " + max_retries + "]").split("&refresh_token=")[0];
                                        
                                        if (server_id) {
                                            socket.messageToRoom(server_id, "config_server_logs", "error", message);
                                        }
                                    }
                                    else {
                                        const message = output.error("[REQUEST] [" + result["status_code"] + "] " + options["host"] + options["path"]).split("&refresh_token=")[0];
                                        
                                        if (server_id) {
                                            socket.messageToRoom(server_id, "config_server_logs", "error", message);
                                        }
                                    }

                                    result["body"] = body.join("");
                                }

                                /*
                                    There was a valid error response and the server gave us a reason.
                                    Do not retry.
                                */
                                else if (Number(result["status_code"]) >= 400) {
                                    if (retries !== 0) {
                                        const message = output.error("[REQUEST] [" + result["status_code"] + "] " + options["host"] + options["path"] + " [RETRY " + retries + " / " + max_retries + "]").split("&refresh_token=")[0];
                                        
                                        if (server_id) {
                                            socket.messageToRoom(server_id, "config_server_logs", "error", message);
                                        }
                                    }
                                    else {
                                        const message = output.error("[REQUEST] [" + result["status_code"] + "] " + options["host"] + options["path"]).split("&refresh_token=")[0];
                                        
                                        if (server_id) {
                                            socket.messageToRoom(server_id, "config_server_logs", "error", message);
                                        }
                                    }

                                    stop_retry = true;
                                    result["body"] = body.join("");
                                }

                                /*
                                    A redirect happened, so follow it.
                                    Do not retry.
                                */
                                else if (Number(result["status_code"]) >= 300) {
                                    if (retries !== 0) {
                                        const message = output.highlight("[REQUEST] [" + result["status_code"] + "] " + options["host"] + options["path"] + " [RETRY " + retries + " / " + max_retries + "]").split("&refresh_token=")[0];

                                        if (server_id) {
                                            socket.messageToRoom(server_id, "config_server_logs", "highlight", message);
                                        }
                                    }
                                    else {
                                        const message = output.highlight("[REQUEST] [" + result["status_code"] + "] " + options["host"] + options["path"]).split("&refresh_token=")[0];

                                        if (server_id) {
                                            socket.messageToRoom(server_id, "config_server_logs", "highlight", message);
                                        }
                                    }

                                    stop_retry = true;

                                    options["host"] = url.parse(result["headers"]["location"]).hostname;
                                    options["port"] = url.parse(result["headers"]["location"]).port;
                                    options["path"] = url.parse(result["headers"]["location"]).pathname;

                                    if (url.parse(result["headers"]["location"]).port) {
                                        options["port"] = url.parse(result["headers"]["location"]).port;
                                    }

                                    if (url.parse(result["headers"]["location"]).search) {
                                        options["path"] += url.parse(result["headers"]["location"]).search;
                                    }

                                    result = make_request(
                                        options,
                                        server_id
                                    );
                                }

                                /*
                                    No clue what this means.
                                    Do not retry.
                                */
                                else {
                                    if (retries !== 0) {
                                        const message = output.error("[REQUEST] [" + result["status_code"] + "] " + options["host"] + options["path"] + " [RETRY " + retries + " / " + max_retries + "]").split("&refresh_token=")[0];
                                        
                                        if (server_id) {
                                            socket.messageToRoom(server_id, "config_server_logs", "error", message);
                                        }
                                    }
                                    else {
                                        const message = output.error("[REQUEST] [" + result["status_code"] + "] " + options["host"] + options["path"]).split("&refresh_token=")[0];
                                        
                                        if (server_id) {
                                            socket.messageToRoom(server_id, "config_server_logs", "error", message);
                                        }
                                    }

                                    stop_retry = true;
                                    result["body"] = body.join("");
                                }
                            }

                            /*
                                The status code is ok.
                                Do not retry.
                            */
                            else {
                                if (retries !== 0) {
                                    const message = output.success("[REQUEST] [" + result["status_code"] + "] " + options["host"] + options["path"] + " [RETRY " + retries + " / " + max_retries + "]", false).split("&refresh_token=")[0];

                                    if (server_id) {
                                        socket.messageToRoom(server_id, "config_server_logs", "success", message);
                                    }
                                }
                                else {
                                    const message = output.success("[REQUEST] [" + result["status_code"] + "] " + options["host"] + options["path"], false).split("&refresh_token=")[0];

                                    if (server_id) {
                                        socket.messageToRoom(server_id, "config_server_logs", "success", message);
                                    }
                                }

                                stop_retry = true;
                                result["body"] = body.join("");
                            }
                        }

                        resolve(result);
                        return;
                    });
                });

                request.on("error", (error) => {
                    try {
                        const message = output.error(error);

                        if (server_id) {
                            socket.messageToRoom(server_id, "config_server_logs", "error", message);
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }

                    result = {
                        "status_code": 9999,
                        "body": undefined,
                        "error": error,
                        "error_type": "request_error"
                    };

                    resolve(result);
                    return;
                });

                if (data) {
                    request.write(data);
                }

                request.end();
            });

            if (Number(result["status_code"]) !== 9999) {
                result = await parse_result(result);
            }

            if (stop_retry) { retries = max_retries + 1; }
        }
    }
    catch (error) {
        try {
            const message = output.error(error);

            if (server_id) {
                socket.messageToRoom(server_id, "config_server_logs", "error", message);
            }
        }
        catch (error) {
            console.log(error);
        }

        result = {
            "status_code": 9999,
            "body": undefined,
            "error": error,
            "error_type": "parsing_error"
        };
    }
    
    return result;
}

async function request({ jsonFile = undefined, esiHost = "esi.evetech.net", esiPort = 443, esiPath = undefined, query = {}, method = "GET", userAgent = undefined, headers = {}, postData = undefined, serverId = undefined, userId = undefined, characterId = undefined, downtime = false } = {}) {
    const data = await disk.loadFile(jsonFile);
    const expired = await cacheExpired(data);

    if (!expired) {
        return data;
    }

    if (!downtime && errors.errorResponseCount >= errors.errorThreshold) {
        return data;
    }

    query["datasource"] = "tranquility";

    const options = {
        "host": esiHost,
        "port": esiPort,
        "path": esiPath + "?" + querystring.stringify(query),
        "method": method,
        "headers": headers
    }

    if (userAgent) {
        options["headers"]["X-User-Agent"] = userAgent;
    }
    else {
        options["headers"]["X-User-Agent"] = environment.configuration["userAgent"];
    }

    const etag = await getEtag(data);

    if (etag) {
        options["headers"]["If-None-Match"] = etag;
    }

    if (serverId && userId && characterId) {
        const accessToken = await refreshToken(serverId, userId, characterId);

        options["headers"]["Authorization"] = "Bearer " + accessToken;
    }

    if (method === "POST" && postData) {
        options["data"] = postData;
    }

    let currentPage = 1;
    let totalPages = 1;

    let combinedResult = undefined;

    while (currentPage <= totalPages) {
        const result = await make_request(options, serverId);

        if (Number(result["status_code"]) === 200) {
            if (currentPage === 1) {
                if (result["headers"]["x-pages"]) {
                    totalPages = Number(result["headers"]["x-pages"]);
                }

                combinedResult = result;

                if (totalPages === 1) {
                    break;
                }

                combinedResult["body"] = []
            }

            result["body"].forEach((element) => {
                combinedResult["body"].push(element);
            });
        }
        else if (Number(result["status_code"]) === 304) {
            data["status_code"] = result["status_code"];
            data["headers"] = result["headers"];

            return data;
        }
        else {
            errors.errorResponseCount++;

            console.log(JSON.stringify(result));

            return result;
        }

        currentPage++;

        query["page"] = currentPage;
        options["path"] = esiPath + "?" + querystring.stringify(query)
    }

    // Remove unnecessary header information.
    const headerKeys = Object.keys(combinedResult["headers"]);

    for (let i = 0; i < headerKeys.length; i++) {
        const headerKey = headerKeys[i];

        if (!["etag", "expires"].includes(headerKey)) {
            delete combinedResult["headers"][headerKey];
        }
    }

    // If it's a POST request, set the expiry date manually for caching.
    if (method === "POST") {
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + 3600);

        combinedResult["headers"]["expires"] = expires;
    }

    return await disk.writeFile(jsonFile, combinedResult);
}
//#endregion

//#region Authentication
/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {String} refreshToken 
 * @param {String} validity 
 */
async function setTokenValidity(serverId, userId, refreshToken, validity) {
    const tokenDetailList = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");
    let tokenDetails = tokenDetailList[refreshToken];

    const tokenValidity = tokenDetails ? tokenDetails["validity"] : undefined;

    if (!tokenValidity) {
        return;
    }

    if (tokenValidity === validity) {
        return;
    }

    if (tokenValidity) {
        tokenDetails["validity"] = validity;
    }

    await disk.writeFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json", tokenDetailList);

    const server = await bot.client.guilds.fetch(serverId);
    const user = (await server.members.fetch(userId)).user;
    const characterName = tokenDetails ? tokenDetails["body"]["CharacterName"] : "Unknown";

    let message = undefined;

    if (validity === "incomplete") {
        message = "The token of **" + characterName + "** on the server **" + server.name + "** is missing some scopes!\nThis was probably caused by a new bot configuration that requires more access rights from your character.\n\nPlease visit the authentication page and consider re-authenticating.\nIf you do not re-authenticate your character, some of the Discord roles that require the new scopes will not be applied.";
    }
    else if (validity === "invalid") {
        message = "The token of **" + characterName + "** on the server **" + server.name + "** is invalid!\nThe token either expired, was removed from the account management page or invalidated for a different reason.\n\nPlease visit the authentication page and consider re-authenticating.\nIf you do not re-authenticate your character, it will be ignored for Discord roles.";
    }

    bot.send_message(server, undefined, user, message, false);
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 */
async function getRefreshToken(serverId, userId, characterId) {
    let tokens = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token.json");
    tokens = tokens ? tokens : [];

    let tokenDetails = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");
    tokenDetails = tokenDetails ? tokenDetails : {};

    let accessToken = undefined;
    let refreshToken = undefined;
    let expired = false;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        accessToken = token["body"]["access_token"];
        refreshToken = token["body"]["refresh_token"];

        const tokenDetail = tokenDetails[refreshToken];

        if (Number(tokenDetail["body"]["CharacterID"]) === Number(characterId)) {
            expired = await cacheExpired(token);

            break;
        }
    }

    return [expired, accessToken, refreshToken];
}

/**
 * 
 * @param {String} code 
 * @param {String} uid 
 * @param {String} secret 
 * @param {String} serverId 
 */
async function requestToken(code, uid, secret, serverId) {
    const options = {
        "host": "login.eveonline.com",
        "port": 443,
        "path": "/oauth/token/",
        "method": "POST",
        "headers": {
            "X-User-Agent": environment.configuration["userAgent"],
            "Authorization": "Basic " + Buffer.from(uid + ":" + secret).toString("base64")
        }
    };

    const query = querystring.stringify({
        "grant_type": "authorization_code",
        "code": code
    });

    options["path"] += "?" + query;

    const result = await make_request(options, serverId);

    if (result && Number(result["status_code"]) === 200) {
        const tokenDate = new Date();
        tokenDate.setSeconds(tokenDate.getSeconds() + (Number(result["body"]["expires_in"]) - 100));

        result["headers"]["expires"] = tokenDate;
    }

    //#region Remove unneeded data from the result to save resources.
    const header_keys = Object.keys(result["headers"]);

    for (let i = 0; i < header_keys.length; i++) {
        const header_key = header_keys[i];

        if (!["expires"].includes(header_key)) {
            delete result["headers"][header_key];
        }
    }
    //#endregion

    return result;
}

/**
 * 
 * @param {Object} token 
 * @param {String} serverId 
 */
async function verifyToken(token, serverId) {
    const options = {
        "host": "login.eveonline.com",
        "port": 443,
        "path": "/oauth/verify/",
        "method": "GET",
        "headers": {
            "X-User-Agent": environment.configuration["userAgent"],
            "Authorization": "Bearer " + token["body"]["access_token"]
        }
    };
    
    const result = await make_request(options, serverId);

    //#region Remove unneeded data from the result to save resources.
    delete result["headers"]
    //#endregion

    return result;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 */
async function refreshToken(serverId, userId, characterId) {
    const [expired, accessToken, savedRefreshToken] = await getRefreshToken(serverId, userId, characterId);

    if (!expired) {
        return accessToken;
    }

    const options = {
        "host": "login.eveonline.com",
        "port": 443,
        "path": "/oauth/token/",
        "method": "POST",
        "headers": {
            "X-User-Agent": environment.configuration["userAgent"],
            "Authorization": "Basic " + Buffer.from(environment.configuration["uid"] + ":" + environment.configuration["secret"]).toString("base64")
        }
    };

    const query = querystring.stringify({
        "grant_type": "refresh_token",
        "refresh_token": savedRefreshToken
    });

    options["path"] += "?" + query;

    const result = await make_request(options, serverId);

    if (Number(result["status_code"]) === 200) {
        const tokenDate = new Date();
        tokenDate.setSeconds(tokenDate.getSeconds() + (Number(result["body"]["expires_in"]) - 100));

        result["headers"]["expires"] = tokenDate;
    }
    else {
        if (result["body"]["error"] === "invalid_token") {
            await setTokenValidity(serverId, userId, savedRefreshToken, "invalid");

            return accessToken;
        }
        else {
            const message = output.error(result);
            socket.messageToRoom(serverId, "config_server_logs", "error", message);

            return accessToken;
        }
    }

    //#region Remove unneeded data from the result to save resources.
    const header_keys = Object.keys(result["headers"]);

    for (let i = 0; i < header_keys.length; i++) {
        const header_key = header_keys[i];

        if (!["expires"].includes(header_key)) {
            delete result["headers"][header_key];
        }
    }
    //#endregion

    let tokens = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token.json");
    tokens = tokens ? tokens : [];

    let tokenDetails = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");
    tokenDetails = tokenDetails ? tokenDetails : {};

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const refreshToken = token["body"]["refresh_token"];

        const tokenDetail = tokenDetails[refreshToken];

        if (Number(tokenDetail["body"]["CharacterID"]) === Number(characterId)) {
            token["headers"]["expires"] = result["headers"]["expires"];
            token["body"] = result["body"];

            if (refreshToken && result["body"]["refresh_token"] && refreshToken !== result["body"]["refresh_token"]) {
                tokenDetails[result["body"]["refresh_token"]] = tokenDetails[refreshToken];

                delete tokenDetails[refreshToken];
            }

            break;
        }
    }

    await disk.writeFile("./data/discord/server/" + serverId + "/user/" + userId + "/token.json", tokens);
    await disk.writeFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json", tokenDetails);

    return result["body"]["access_token"];
};
//#endregion

//#region Caching
/**
 * 
 * @param {Object} jsonFile 
 */
async function cacheExpired(jsonFile) {
    if (!jsonFile) {
        return true;
    }

    const currentDate = new Date();
    const expireDate = new Date(jsonFile["headers"]["expires"]);

    if (currentDate > expireDate) {
        return true;
    }

    return false;
}

/**
 * 
 * @param {Object} jsonFile 
 */
async function getEtag(jsonFile) {
    if (!jsonFile) {
        return;
    }

    return jsonFile["headers"]["etag"]
}
//#endregion

async function getStatus() {
    return await request({
        "jsonFile": "./data/esi/status.json",
        "esiPath": "/v1/status/",
        "downtime": true
    });
}

/**
 * 
 * @param {String} serverId 
 */
async function getUniverseFactions(serverId) {
    return await request({
        "jsonFile": "./data/esi/universe/factions.json",
        "esiPath": "/v2/universe/factions/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 */
async function getUniverseRegions(serverId) {
    return await request({
        "jsonFile": "./data/esi/universe/regions.json",
        "esiPath": "/v1/universe/regions/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} regionId 
 */
async function getUniverseRegion(serverId, regionId) {
    return await request({
        "jsonFile": "./data/esi/universe/region/" + regionId + "/region.json",
        "esiPath": "/v1/universe/regions/" + regionId + "/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 */
async function getUniverseConstellations(serverId) {
    return await request({
        "jsonFile": "./data/esi/universe/constellations.json",
        "esiPath": "/v1/universe/constellations/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} constellationId 
 */
async function getUniverseConstellation(serverId, constellationId) {
    return await request({
        "jsonFile": "./data/esi/universe/constellation/" + constellationId + "/constellation.json",
        "esiPath": "/v1/universe/constellations/" + constellationId + "/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} planetId 
 */
async function getUniversePlanet(serverId, planetId) {
    return await request({
        "jsonFile": "./data/esi/universe/planet/" + planetId + "/planet.json",
        "esiPath": "/v1/universe/planets/" + planetId + "/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} moonId 
 */
async function getUniverseMoon(serverId, moonId) {
    return await request({
        "jsonFile": "./data/esi/universe/moon/" + moonId + "/moon.json",
        "esiPath": "/v1/universe/moons/" + moonId + "/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 * @param {Number} structureId 
 */
async function getUniverseStructure(serverId, userId, characterId, structureId) {
    return await request({
        "jsonFile": "./data/esi/universe/structure/" + structureId + "/structure.json",
        "esiPath": "/v2/universe/structures/" + structureId + "/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

/**
 * 
 * @param {String} serverId 
 */
async function getUniverseSystems(serverId) {
    return await request({
        "jsonFile": "./data/esi/universe/systems.json",
        "esiPath": "/v1/universe/systems/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} systemId 
 */
async function getUniverseSystem(serverId, systemId) {
    return await request({
        "jsonFile": "./data/esi/universe/system/" + systemId + "/system.json",
        "esiPath": "/v4/universe/systems/" + systemId + "/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 */
async function getUniverseTypes(serverId) {
    return await request({
        "jsonFile": "./data/esi/universe/types.json",
        "esiPath": "/v1/universe/types/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} typeId 
 */
async function getUniverseType(serverId, typeId) {
    return await request({
        "jsonFile": "./data/esi/universe/type/" + typeId + "/type.json",
        "esiPath": "/v3/universe/types/" + typeId + "/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 */
async function getUniverseGroups(serverId) {
    return await request({
        "jsonFile": "./data/esi/universe/groups.json",
        "esiPath": "/v1/universe/groups/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} groupId 
 */
async function getUniverseGroup(serverId, groupId) {
    return await request({
        "jsonFile": "./data/esi/universe/group/" + groupId + "/group.json",
        "esiPath": "/v1/universe/groups/" + groupId + "/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 */
async function getUniverseCategories(serverId) {
    return await request({
        "jsonFile": "./data/esi/universe/categories.json",
        "esiPath": "/v1/universe/categories/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} categoryId 
 */
async function getUniverseCategory(serverId, categoryId) {
    return await request({
        "jsonFile": "./data/esi/universe/category/" + categoryId + "/category.json",
        "esiPath": "/v1/universe/categories/" + categoryId + "/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 */
async function getUniverseAncestries(serverId) {
    return await request({
        "jsonFile": "./data/esi/universe/ancestries.json",
        "esiPath": "/v1/universe/ancestries/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 */
async function getUniverseBloodlines(serverId) {
    return await request({
        "jsonFile": "./data/esi/universe/bloodlines.json",
        "esiPath": "/v1/universe/bloodlines/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 */
async function getUniverseRaces(serverId) {
    return await request({
        "jsonFile": "./data/esi/universe/races.json",
        "esiPath": "/v1/universe/races/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} id 
 */
async function getUniverseNames(serverId, id) {
    return await request({
        "jsonFile": "./data/esi/universe/names/" + id + ".json",
        "esiPath": "/v3/universe/names/",
        "serverId": serverId,
        "method": "POST",
        "postData": [id]
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} name 
 */
async function getUniverseIds(serverId, name) {
    return await request({
        "jsonFile": "./data/esi/universe/ids/" + name + ".json",
        "esiPath": "/v1/universe/ids/",
        "serverId": serverId,
        "method": "POST",
        "postData": [name]
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} characterId 
 */
async function getCharacter(serverId, characterId) {
    return await request({
        "jsonFile": "./data/esi/character/" + characterId + "/character.json",
        "esiPath": "/v4/characters/" + characterId + "/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} characterId 
 */
async function getCharacterAffiliation(serverId, characterId) {
    return await request({
        "jsonFile": "./data/esi/character/" + characterId + "/affiliation.json",
        "esiPath": "/v1/characters/affiliation/",
        "serverId": serverId,
        "method": "POST",
        "postData": [characterId]
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 */
async function getCharacterContacts(serverId, userId, characterId,) {
    return await request({
        "jsonFile": "./data/esi/character/" + characterId + "/contacts.json",
        "esiPath": "/v2/characters/" + characterId + "/contacts/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 */
async function getCharacterFatigue(serverId, userId, characterId) {
    return await request({
        "jsonFile": "./data/esi/character/" + characterId + "/fatigue.json",
        "esiPath": "/v1/characters/" + characterId + "/fatigue/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 */
async function getCharacterFwStats(serverId, userId, characterId) {
    return await request({
        "jsonFile": "./data/esi/character/" + characterId + "/fw_stats.json",
        "esiPath": "/v1/characters/" + characterId + "/fw/stats/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 */
async function getCharacterLocation(serverId, userId, characterId) {
    return await request({
        "jsonFile": "./data/esi/character/" + characterId + "/location.json",
        "esiPath": "/v1/characters/" + characterId + "/location/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 */
async function getCharacterMedals(serverId, userId, characterId) {
    return await request({
        "jsonFile": "./data/esi/character/" + characterId + "/medals.json",
        "esiPath": "/v1/characters/" + characterId + "/medals/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 */
async function getCharacterNotifications(serverId, userId, characterId) {
    return await request({
        "jsonFile": "./data/esi/character/" + characterId + "/notifications.json",
        "esiPath": "/v5/characters/" + characterId + "/notifications/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 */
async function getCharacterOnline(serverId, userId, characterId) {
    return await request({
        "jsonFile": "./data/esi/character/" + characterId + "/online.json",
        "esiPath": "/v2/characters/" + characterId + "/online/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 */
async function getCharacterRoles(serverId, userId, characterId) {
    return await request({
        "jsonFile": "./data/esi/character/" + characterId + "/roles.json",
        "esiPath": "/v2/characters/" + characterId + "/roles/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 */
async function getCharacterShip(serverId, userId, characterId) {
    return await request({
        "jsonFile": "./data/esi/character/" + characterId + "/ship.json",
        "esiPath": "/v1/characters/" + characterId + "/ship/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 */
async function getCharacterSkills(serverId, userId, characterId) {
    return await request({
        "jsonFile": "./data/esi/character/" + characterId + "/skills.json",
        "esiPath": "/v4/characters/" + characterId + "/skills/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 */
async function getCharacterTitles(serverId, userId, characterId) {
    return await request({
        "jsonFile": "./data/esi/character/" + characterId + "/titles.json",
        "esiPath": "/v1/characters/" + characterId + "/titles/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} corporationId 
 */
async function getCorporation(serverId, corporationId) {
    return await request({
        "jsonFile": "./data/esi/corporation/" + corporationId + "/corporation.json",
        "esiPath": "/v4/corporations/" + corporationId + "/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 * @param {Number} corporationId 
 */
async function getCorporationContacts(serverId, userId, characterId, corporationId) {
    return await request({
        "jsonFile": "./data/esi/corporation/" + corporationId + "/contacts.json",
        "esiPath": "/v2/corporations/" + corporationId + "/contacts/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} corporationId 
 */
async function getCorporationFwStats(serverId, corporationId) {
    return await request({
        "jsonFile": "./data/esi/corporation/" + corporationId + "/fw_stats.json",
        "esiPath": "/v1/corporations/" + corporationId + "/fw/stats/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {Number} allianceId 
 */
async function getAlliance(serverId, allianceId) {
    return await request({
        "jsonFile": "./data/esi/alliance/" + allianceId + "/alliance.json",
        "esiPath": "/v3/alliances/" + allianceId + "/",
        "serverId": serverId
    });
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 * @param {Number} allianceId 
 */
async function getAllianceContacts(serverId, userId, characterId, allianceId) {
    return await request({
        "jsonFile": "./data/esi/alliance/" + allianceId + "/contacts.json",
        "esiPath": "/v2/alliances/" + allianceId + "/contacts/",
        "serverId": serverId,
        "userId": userId,
        "characterId": characterId
    });
}

module.exports.setErrorResponseCount = setErrorResponseCount;
module.exports.getErrorResponseCount = getErrorResponseCount;
module.exports.getErrorThreshold = getErrorThreshold;

module.exports.setTokenValidity = setTokenValidity;
module.exports.requestToken = requestToken;
module.exports.verifyToken = verifyToken;
module.exports.refreshToken = refreshToken;

module.exports.request = request;

module.exports.getStatus = getStatus;

module.exports.getUniverseFactions = getUniverseFactions;
module.exports.getUniverseAncestries = getUniverseAncestries;
module.exports.getUniverseBloodlines = getUniverseBloodlines;
module.exports.getUniverseRaces = getUniverseRaces;
module.exports.getUniverseRegions = getUniverseRegions;
module.exports.getUniverseRegion = getUniverseRegion;
module.exports.getUniverseConstellations = getUniverseConstellations;
module.exports.getUniverseConstellation = getUniverseConstellation;
module.exports.getUniversePlanet = getUniversePlanet;
module.exports.getUniverseMoon = getUniverseMoon;
module.exports.getUniverseStructure = getUniverseStructure;
module.exports.getUniverseSystems = getUniverseSystems;
module.exports.getUniverseSystem = getUniverseSystem;
module.exports.getUniverseTypes = getUniverseTypes;
module.exports.getUniverseType = getUniverseType;
module.exports.getUniverseGroups = getUniverseGroups;
module.exports.getUniverseGroup = getUniverseGroup;
module.exports.getUniverseCategories = getUniverseCategories;
module.exports.getUniverseCategory = getUniverseCategory;
module.exports.getUniverseNames = getUniverseNames;
module.exports.getUniverseIds = getUniverseIds;

module.exports.getCharacter = getCharacter;
module.exports.getCharacterAffiliation = getCharacterAffiliation;
module.exports.getCharacterContacts = getCharacterContacts;
module.exports.getCharacterFatigue = getCharacterFatigue;
module.exports.getCharacterFwStats = getCharacterFwStats;
module.exports.getCharacterLocation = getCharacterLocation;
module.exports.getCharacterMedals = getCharacterMedals;
module.exports.getCharacterNotifications = getCharacterNotifications;
module.exports.getCharacterOnline = getCharacterOnline;
module.exports.getCharacterRoles = getCharacterRoles;
module.exports.getCharacterShip = getCharacterShip;
module.exports.getCharacterSkills = getCharacterSkills;
module.exports.getCharacterTitles = getCharacterTitles;

module.exports.getCorporation = getCorporation;
module.exports.getCorporationContacts = getCorporationContacts;
module.exports.getCorporationFwStats = getCorporationFwStats;

module.exports.getAlliance = getAlliance;
module.exports.getAllianceContacts = getAllianceContacts;