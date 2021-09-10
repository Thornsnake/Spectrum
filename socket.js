//@ts-check

"use strict";

const web_server = require("./web_server.js");

const httpsServer = web_server.httpsServer;
const io = require("socket.io")(httpsServer);

const memory = require("./memory.js");
const data = require("./data.js");
const bot = require("./bot.js");
const output = require("./output.js");

const validRooms = [
    "config_server_logs"
];

/**
 * 
 * @param {SocketIO.Socket} socket 
 * @param {String} cookieName 
 */
async function getCookie(socket, cookieName) {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(socket.handshake.headers["cookie"]);
    const ca = decodedCookie.split(";");

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];

        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            const cookie = JSON.parse(c.substring(name.length, c.length).substring(2));

            return cookie;
        }
    }

    return undefined;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} roomName 
 * @param {String} messageType 
 * @param {String} message 
 */
async function messageToRoom(serverId, roomName, messageType, message) {
    if (!validRooms.includes(roomName)) {
        return;
    }

    if ("/" + serverId in io.nsps) {
        const nsp = io.nsps["/" + serverId];

        if (roomName in nsp.adapter.rooms) {
            if (nsp.adapter.rooms[roomName].length > 0) {
                nsp.in(roomName).emit("log_ready", messageType, message);
            }
        }
    }
}

async function createDefaultNamespace() {
    const nsp = io.of("/default");

    if (!nsp.eventNames().includes("connect")) {
        output.socket("[SOCKET] Created namespace '" + nsp.name + "'");

        nsp.on("connect", async (socket) => {
            //#region Connect
            const cookie = await getCookie(socket, "spectrum_module_default_auth");

            const userId = cookie["user_id"];
            const accessCode = cookie["access_code"];

            if (!("module_default_auth" in memory.accessCodes) || !(memory.accessCodes["module_default_auth"][userId] === accessCode)) {
                socket.disconnect();
            }
            //#endregion

            //#region Authentication - Tokens
            socket.on("auth_tokens", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const response = await data.getAuthTokens(userId);

                        socket.emit("data_ready", response);
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    const user = await bot.client.users.fetch(userId);

                    output.socket("[SOCKET] [USER = " + user.username + "#" + user.discriminator + " (" + user.id + ")] Got data for 'auth_tokens'");
                }
                else if (request["method"] === "post") {
                    try {
                        const serverId = request["data"]["server_id"];
                        const refreshToken = request["data"]["refresh_token"];

                        await data.postAuthToken(serverId, userId, refreshToken);

                        socket.emit("data_posted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    const user = await bot.client.users.fetch(userId);

                    output.socket("[SOCKET] [USER = " + user.username + "#" + user.discriminator + " (" + user.id + ")] Posted data for 'auth_tokens'");
                }
                else if (request["method"] === "delete") {
                    try {
                        const serverId = request["data"]["server_id"];
                        const refreshToken = request["data"]["refresh_token"];

                        await data.deleteAuthToken(serverId, userId, refreshToken);

                        socket.emit("data_deleted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    const user = await bot.client.users.fetch(userId);

                    output.socket("[SOCKET] [USER = " + user.username + "#" + user.discriminator + " (" + user.id + ")] Deleted data for 'auth_tokens'");
                }
            });
            //#endregion

            //#region Error
            socket.on("error", async (error) => {
                const user = await bot.client.users.fetch(userId);

                output.error("[SOCKET] [USER = " + user.username + "#" + user.discriminator + " (" + user.id + ")] " + error);
            });
            //#endregion
        });
    }
}

/**
 * 
 * @param {String} serverId 
 */
async function createNamespace(serverId) {
    const nsp = io.of("/" + serverId);

    if (!nsp.eventNames().includes("connect")) {
        output.socket("[SOCKET] Created namespace '" + nsp.name + "'");

        nsp.on("connect", async (socket) => {
            //#region Connect
            const cookie = await getCookie(socket, "spectrum_module_default_config");
            const server = await bot.client.guilds.fetch(serverId);

            const userId = cookie["user_id"];
            const accessCode = cookie["access_code"];

            const member = await server.members.fetch(userId);

            if (!("module_default_config" in memory.accessCodes) || !(serverId in memory.accessCodes["module_default_config"]) || !(memory.accessCodes["module_default_config"][serverId][userId] === accessCode)) {
                socket.disconnect();
            }
            //#endregion

            //#region Join Room
            socket.on("join_room", async (roomName) => {
                if (!validRooms.includes(roomName)) {
                    return;
                }

                await socket.join(roomName);

                socket.emit("joined_room", roomName);

                output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Joined room '" + roomName + "'");
            });
            //#endregion

            //#region Configuration - Modules
            socket.on("config_modules", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const response = await data.getModules(serverId);

                        socket.emit("data_ready", response);
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'config_modules'");
                }
            });
            //#endregion

            //#region Configuration - Operators
            socket.on("config_operators", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const response = await data.getOperators(serverId);

                        socket.emit("data_ready", response);
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'config_operators'");
                }
                else if (request["method"] === "delete") {
                    try {
                        await data.deleteOperator(serverId, request["data_id"]);

                        socket.emit("data_deleted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Deleted data for 'config_operators'");
                }
            });
            //#endregion

            //#region Configuration - Operator
            socket.on("config_operator", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const responseOperator = await data.getOperator(serverId, request["data_id"]);
                        const responseDiscordUsers = await data.getDiscordUsers(serverId);

                        socket.emit("data_ready", {
                            "operator": responseOperator,
                            "discord_users": responseDiscordUsers
                        });
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'config_operator'");
                }
                else if (request["method"] === "post") {
                    try {
                        await data.postOperator(serverId, request["data"]);

                        socket.emit("data_posted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Posted data for 'config_operator'");
                }
            });
            //#endregion

            //#region Configuration - Scopes
            socket.on("config_scopes", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const response = await data.getScopes(serverId);

                        socket.emit("data_ready", response);
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'config_scopes'");
                }
                else if (request["method"] === "post") {
                    try {
                        await data.postScopes(serverId, request["data"]);

                        socket.emit("data_posted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Posted data for 'config_scopes'");
                }
            });
            //#endregion

            //#region Configuration - Keywords
            socket.on("config_keywords", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const response = await data.getKeywords(serverId);

                        socket.emit("data_ready", response);
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'config_keywords'");
                }
                else if (request["method"] === "delete") {
                    try {
                        await data.deleteKeyword(serverId, request["data_id"]);

                        socket.emit("data_deleted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Deleted data for 'config_keywords'");
                }
            });
            //#endregion

            //#region Configuration - Keyword
            socket.on("config_keyword", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const responseKeyword = await data.getKeyword(serverId, request["data_id"]);
                        const responseEndpoints = await data.getEndpoints();

                        socket.emit("data_ready", {
                            "keyword": responseKeyword,
                            "endpoints": responseEndpoints
                        });
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'config_keyword'");
                }
                else if (request["method"] === "post") {
                    try {
                        const response = await data.postKeyword(serverId, request["data"]);

                        if (response) {
                            socket.emit("data_error", response["error"])
                        }
                        else {
                            socket.emit("data_posted");
                        }
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Posted data for 'config_keyword'");
                }
            });
            //#endregion

            //#region Configuration - Conditions
            socket.on("config_conditions", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const response = await data.getConditions(serverId);

                        socket.emit("data_ready", response);
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'config_conditions'");
                }
                else if (request["method"] === "delete") {
                    try {
                        await data.deleteCondition(serverId, request["data_id"]);

                        socket.emit("data_deleted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Deleted data for 'config_conditions'");
                }
            });
            //#endregion

            //#region Configuration - Condition
            socket.on("config_condition", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const responseCondition = await data.getCondition(serverId, request["data_id"]);
                        const responseEndpoints = await data.getEndpoints();
                        const responseConditions = await data.getConditions(serverId);

                        socket.emit("data_ready", {
                            "condition": responseCondition,
                            "endpoints": responseEndpoints,
                            "conditions": responseConditions
                        });
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'config_condition'");
                }
                else if (request["method"] === "post") {
                    try {
                        await data.postCondition(serverId, request["data"]);

                        socket.emit("data_posted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Posted data for 'config_condition'");
                }
            });
            //#endregion

            //#region Configuration - Rules
            socket.on("config_rules", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const response = await data.getRules(serverId);

                        socket.emit("data_ready", response);
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'config_rules'");
                }
                else if (request["method"] === "delete") {
                    try {
                        await data.deleteRule(serverId, request["data_id"]);

                        socket.emit("data_deleted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Deleted data for 'config_rules'");
                }
            });
            //#endregion

            //#region Configuration - Rule
            socket.on("config_rule", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const responseRule = await data.getRule(serverId, request["data_id"]);
                        const responseConditions = await data.getConditions(serverId);
                        const responseActions = await data.getActions();

                        socket.emit("data_ready", {
                            "rule": responseRule,
                            "conditions": responseConditions,
                            "actions": responseActions
                        });
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'config_rule'");
                }
                else if (request["method"] === "post") {
                    try {
                        await data.postRule(serverId, request["data"]);

                        socket.emit("data_posted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Posted data for 'config_rule'");
                }
            });
            //#endregion

            //#region Configuration - Bot Control
            socket.on("config_bot_control", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const response = await data.getBotControl(serverId);

                        socket.emit("data_ready", response);
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'config_bot_control'");
                }
                else if (request["method"] === "post") {
                    try {
                        await data.postBotControl(serverId, request["data"]);

                        socket.emit("data_posted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Posted data for 'config_bot_control'");
                }
            });
            //#endregion

            //#region Module - Notification - Module
            socket.on("module_notification_module", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const response = await data.getModuleNotificationModule(serverId);

                        socket.emit("data_ready", response);
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'module_notification_module'");
                }
                else if (request["method"] === "post") {
                    try {
                        await data.postModuleNotificationModule(serverId, request["data"]);

                        socket.emit("data_posted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Posted data for 'module_notification_module'");
                }
            });
            //#endregion

            //#region Module - Notification - Notifications
            socket.on("module_notification_notifications", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const response = await data.getModuleNotificationNotifications(serverId);

                        socket.emit("data_ready", response);
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'module_notification_notifications'");
                }
                else if (request["method"] === "delete") {
                    try {
                        await data.deleteModuleNotificationNotifications(serverId, request["data_id"]);

                        socket.emit("data_deleted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Deleted data for 'module_notification_notifications'");
                }
            });
            //#endregion

            //#region Module - Notification - Notification
            socket.on("module_notification_notification", async (request) => {
                if (request["method"] === "get") {
                    try {
                        const response_available_notifications = await data.getNotifications();
                        const response_notification = await data.getModuleNotificationNotification(serverId, request["data_id"])

                        socket.emit("data_ready", {
                            "available_notifications": response_available_notifications,
                            "notification": response_notification
                        });
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Got data for 'module_notification_notification'");
                }
                else if (request["method"] === "post") {
                    try {
                        await data.postModuleNotificationNotification(serverId, request["data"]);

                        socket.emit("data_posted");
                    }
                    catch (error) {
                        socket.emit("data_error", error)
                    }

                    output.socket("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] Posted data for 'module_notification_notification'");
                }
            });
            //#endregion

            //#region Error
            socket.on("error", async (error) => {
                output.error("[SOCKET] [SERVER = " + server.name + " (" + server.id + ")] [USER = " + member.displayName + " (" + member.id + ")] " + error);
            });
            //#endregion
        });
    }
}

/**
 * 
 * @param {String} serverId 
 */
async function deleteNamespace(serverId) {
    const nsp = io.of("/" + serverId);

    const sockets = nsp.connected
    const socketKeys = Object.keys(sockets);

    for (let i = 0; i < socketKeys.length; i++) {
        const socketId = socketKeys[i];
        const socket = sockets[socketId];

        socket.disconnect();
    }

    nsp.removeAllListeners();

    delete io.nsps["/" + serverId];
}

module.exports.messageToRoom = messageToRoom;
module.exports.createDefaultNamespace = createDefaultNamespace;
module.exports.createNamespace = createNamespace;
module.exports.deleteNamespace = deleteNamespace;