//@ts-check

"use strict";

const fs = require("fs");
const https = require("https");
const helmet = require("helmet");
const express = require("express");
const cookieParser = require("cookie-parser");

const environment = require("./environment.js");
const views = require("./views.js");
const output = require("./output.js");

const app = express();

const httpsServer = https.createServer({
    "key": fs.readFileSync(environment.configuration["ssl"]["keyPath"]),
    "cert": fs.readFileSync(environment.configuration["ssl"]["certPath"]),
    "passphrase": environment.configuration["ssl"]["passphrase"]
}, app);

app.set("trust proxy", 1); // If we have secure cookies and are behind a proxy, we need this.

app.use(helmet());
app.use(cookieParser());
app.use([
    express.static("./static/")
]);

app.get("/spectrum/authentication/", async (request, response) => {
    const success = await views.authentication(
        request,
        response
    ).catch((error) => {
        output.error(error);
    });

    if (success) {
        let serverId = "";

        if ("state" in request["query"]) {
            serverId = "?server=" + String(request["query"]["state"]).split(";")[0];
        }

        response.writeHead(
            302,
            {
                "Location": "/module/default/html/auth/tokens.html" + serverId
            }
        );
    }
    else {
        response.writeHead(
            302,
            {
                "Location": "/module/default/html/auth/fail.html"
            }
        );
    }

    response.end();
});

/*app.get("/spectrum/authentication/", async (request, response) => {
    const success = await views.authentication(
        request
    ).catch((error) => {
        output.error(error);
    });

    if (success) {
        response.writeHead(
            302,
            {
                "Location": "/html/auth/ok.html"
            }
        );
    }
    else {
        response.writeHead(
            302,
            {
                "Location": "/html/auth/fail.html"
            }
        );
    }

    response.end();
});*/

app.get(["/spectrum/configuration/"], async (request, response) => {
    const success = await views.configuration(
        request,
        response
    ).catch((error) => {
        output.error(error);
    });

    if (success) {
        response.writeHead(
            302,
            {
                "Location": "/module/default/html/config/dashboard.html"
            }
        );
    }
    else {
        response.writeHead(
            302,
            {
                "Location": "/module/default/html/config/fail.html"
            }
        );
    }

    response.end();
});

async function startWebserver() {
    if (!httpsServer.listening) {
        httpsServer.listen(environment.configuration["port"], async () => {
            output.highlight("[STARTUP] Listen on port " + environment.configuration["port"]);
        });
    }
}

module.exports.startWebserver = startWebserver;
module.exports.httpsServer = httpsServer;