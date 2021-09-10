//@ts-check

"use strict";

const templates = {};

const accessCodes = {};
/*const accessCodes = {
    "module_default_config": {
        "349569703481442317": {
            "336219014097403924": "123"
        }
    },
    "module_default_auth": {
        "336219014097403924": "456"
    }
};*/

let requiredEndpoints = {};
/*
{
    serverId: ["te-abc-id", "te-abc-name"]
}
*/

let requiredScopes = {};

const memoryData = {};

const cachedUsers = {};

const conditionCheck = {};

module.exports.templates = templates;

module.exports.accessCodes = accessCodes;

module.exports.requiredEndpoints = requiredEndpoints;
module.exports.requiredScopes = requiredScopes;

module.exports.memoryData = memoryData;
module.exports.cachedUsers = cachedUsers;
module.exports.conditionCheck = conditionCheck;