//@ts-check

"use strict";

const disk = require("../../disk.js");

async function run() {

    const servers = await disk.getDirectories("./data/discord/server/");

    for (let i = 0; i < servers.length; i++) {
        const serverId = servers[i];

        // If this is a new server without tokens or assigned roles, this directory might not exist.
        let exists = await disk.exists("./data/discord/server/" + serverId + "/user/");

        if (!exists) {
            continue;
        }

        const users = await disk.getDirectories("./data/discord/server/" + serverId + "/user/");

        for (let j = 0; j < users.length; j++) {
            const userId = users[j];

            let tokens = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token.json");
            tokens = tokens ? tokens : [];

            let tokenDetails = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");
            tokenDetails = tokenDetails ? tokenDetails : {};

            let changed = false;

            for (let k = 0; k < tokens.length; k++) {
                const token = tokens[k];

                const refreshToken = token["body"]["refresh_token"];

                if (!(refreshToken in tokenDetails)) {
                    tokens.splice(k, 1);

                    console.log("Deleted token for " + serverId + " - " + userId);

                    changed = true;

                    k--;
                }
            }

            const tokenDetailsIdList = Object.keys(tokenDetails);

            for (let k = 0; k < tokenDetailsIdList.length; k++) {
                const refreshToken = tokenDetailsIdList[k];

                let hasToken = false;

                for (let l = 0; l < tokens.length; l++) {
                    const token = tokens[l];

                    if (token["body"]["refresh_token"] === refreshToken) {
                        hasToken = true;

                        break;
                    }
                }

                if (hasToken) {
                    continue;
                }

                delete tokenDetails[refreshToken];

                console.log("Deleted token details for " + serverId + " - " + userId);

                changed = true;
            }

            if (!changed) {
                continue;
            }

            await disk.writeFile("./data/discord/server/" + serverId + "/user/" + userId + "/token.json", tokens);
            await disk.writeFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json", tokenDetails);
        }
    }

}

async function start() {

    // Run once immediately after start.
    await run();

    // Run once every 3 hours.
    setInterval(
        async () => { run(); },
        10800000
    );

}

module.exports.start = start;