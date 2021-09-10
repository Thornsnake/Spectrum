//@ts-check

"use strict";

const development = false;

const configurationDevelopment = {
    "ssl": {
        "certPath": "./cert.pem",
        "keyPath": "./key.pem",
        "passphrase": "xxxxxxxxxxxxxxxxxxxxxxx"
    },
    "uid": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "userAgent": "Spectrum - Discord Bot",
    "authenticationUri": "https://127.0.0.1:3003/spectrum/authentication/",
    "configurationUri": "https://127.0.0.1:3003/spectrum/configuration/",
    "botToken": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "host": "127.0.0.1",
    "port": 3003
};

const configurationProduction = {
    "ssl": {
        "certPath": "./cert.pem",
        "keyPath": "./key.pem",
        "passphrase": "xxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    "uid": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "userAgent": "Spectrum - Discord Bot",
    "authenticationUri": "https://nexuscrawler.net:3003/spectrum/authentication/",
    "configurationUri": "https://nexuscrawler.net:3003/spectrum/configuration/",
    "botToken": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "host": "example.com",
    "port": 3003
};

if (development) {
    module.exports.configuration = configurationDevelopment;
}
else {
    module.exports.configuration = configurationProduction;
}