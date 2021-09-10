//@ts-check

"use strict";

const disk = require("../../disk.js");

const endpoints = require("./endpoints.js");
const data = require("./data.js");
const memory = require("../../memory.js");
const bot = require("../../bot.js");

async function checkNesting(conditions, condition_id, condition) {
    const baseCondition = "[te-endpoints-my_conditions-" + condition_id + "]";

    if (condition.includes(baseCondition)) {
        throw "You are trying to create a circular condition chain.\n\nOne of the conditions in the chain is pointing back to the one you are currently trying to create. That would cause an infinite loop."
    }

    const customConditionParts = condition.split("[te-endpoints-my_conditions-");

    for (let i = 1; i < customConditionParts.length; i++) {
        const customConditionId = customConditionParts[i].split("]")[0];
        const customCondition = conditions[customConditionId]["condition"];

        await checkNesting(conditions, condition_id, customCondition);
    }
}

/**
 * 
 * @param {any[][]} endpointValues 
 * @param {String} comparator 
 * @param {any[][]} comparisonValues 
 */
async function compare(endpointValues, comparator, comparisonValues) {
    if (comparator === "IS") {
        for (let i = 0; i < endpointValues.length; i++) {
            for (let j = 0; j < comparisonValues.length; j++) {
                if (endpointValues[i][0] === undefined || comparisonValues[j][0] === undefined) {
                    continue;
                }

                if (endpointValues[i][1] === "number") {
                    if (Number(endpointValues[i][0]) === Number(comparisonValues[j][0])) {
                        return true;
                    }
                }
                else if (endpointValues[i][1] === "string") {
                    if (String(endpointValues[i][0]) === String(comparisonValues[j][0])) {
                        return true;
                    }
                }
                else if (endpointValues[i][1] === "boolean") {
                    if (String(endpointValues[i][0]) === String(comparisonValues[j][0])) {
                        return true;
                    }
                }
            }
        }
    }
    else if (comparator === "IS NOT") {
        for (let i = 0; i < endpointValues.length; i++) {
            for (let j = 0; j < comparisonValues.length; j++) {
                if (endpointValues[i][0] === undefined || comparisonValues[j][0] === undefined) {
                    continue;
                }

                if (endpointValues[i][1] === "number") {
                    if (Number(endpointValues[i][0]) === Number(comparisonValues[j][0])) {
                        return false;
                    }
                }
                else if (endpointValues[i][1] === "string") {
                    if (String(endpointValues[i][0]) === String(comparisonValues[j][0])) {
                        return false;
                    }
                }
                else if (endpointValues[i][1] === "boolean") {
                    if (String(endpointValues[i][0]) === String(comparisonValues[j][0])) {
                        return false;
                    }
                }
            }
        }

        return true;
    }
    else if (comparator === "CONTAINS") {
        for (let i = 0; i < endpointValues.length; i++) {
            for (let j = 0; j < comparisonValues.length; j++) {
                if (endpointValues[i][0] === undefined || comparisonValues[j][0] === undefined) {
                    continue;
                }

                if (endpointValues[i][1] === "string") {
                    if (String(endpointValues[i][0]).includes(String(comparisonValues[j][0]))) {
                        return true;
                    }
                }
            }
        }
    }
    else if (comparator === "CONTAINS NOT") {
        for (let i = 0; i < endpointValues.length; i++) {
            for (let j = 0; j < comparisonValues.length; j++) {
                if (endpointValues[i][0] === undefined || comparisonValues[j][0] === undefined) {
                    continue;
                }

                if (endpointValues[i][1] === "string") {
                    if (String(endpointValues[i][0]).includes(String(comparisonValues[j][0]))) {
                        return false;
                    }
                }
            }
        }

        return true;
    }
    else if (comparator === "GREATER") {
        for (let i = 0; i < endpointValues.length; i++) {
            for (let j = 0; j < comparisonValues.length; j++) {
                if (endpointValues[i][0] === undefined || comparisonValues[j][0] === undefined) {
                    continue;
                }

                if (endpointValues[i][1] === "number") {
                    if (Number(endpointValues[i][0]) > Number(comparisonValues[j][0])) {
                        return true;
                    }
                }
            }
        }
    }
    else if (comparator === "GREATER OR EQUAL") {
        for (let i = 0; i < endpointValues.length; i++) {
            for (let j = 0; j < comparisonValues.length; j++) {
                if (endpointValues[i][0] === undefined || comparisonValues[j][0] === undefined) {
                    continue;
                }

                if (endpointValues[i][1] === "number") {
                    if (Number(endpointValues[i][0]) >= Number(comparisonValues[j][0])) {
                        return true;
                    }
                }
            }
        }
    }
    else if (comparator === "LESS OR EQUAL") {
        for (let i = 0; i < endpointValues.length; i++) {
            for (let j = 0; j < comparisonValues.length; j++) {
                if (endpointValues[i][0] === undefined || comparisonValues[j][0] === undefined) {
                    continue;
                }

                if (endpointValues[i][1] === "number") {
                    if (Number(endpointValues[i][0]) <= Number(comparisonValues[j][0])) {
                        return true;
                    }
                }
            }
        }
    }
    else if (comparator === "LESS") {
        for (let i = 0; i < endpointValues.length; i++) {
            for (let j = 0; j < comparisonValues.length; j++) {
                if (endpointValues[i][0] === undefined || comparisonValues[j][0] === undefined) {
                    continue;
                }

                if (endpointValues[i][1] === "number") {
                    if (Number(endpointValues[i][0]) < Number(comparisonValues[j][0])) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Object} token 
 * @param {Number} parsingType 
 * @param {Object} parameters 
 */
async function getResult(serverId, userId, token, parsingType, parameters) {
    let conditionResult = false;

    if (parsingType === 1) {
        if (parameters["endpoint"].startsWith("te-endpoints-my_conditions-")) {
            const conditions = await disk.loadFile("./data/discord/server/" + serverId + "/conditions.json");

            const conditionId = parameters["endpoint"].substring(27);
            const condition = conditions[conditionId]["condition"];

            const valueIsEndpoint = await endpoints.isEndpoint(parameters["value"]);

            let comparisonList = [[parameters["value"], undefined]];

            if (valueIsEndpoint) {
                const endpointHolder = parameters["endpoint"];
                const valueHolder = parameters["value"];

                parameters["endpoint"] = valueHolder;

                const value = await data.getP1(serverId, userId, token, parameters);

                if (value === "TOKEN REQUIRED") {
                    return value;
                }

                comparisonList = value;

                parameters["endpoint"] = endpointHolder;
            }

            const value = await parseCondition(serverId, userId, token, condition, 0);

            if (value === "TOKEN REQUIRED") {
                return value;
            }

            const endpointList = [[value, "boolean"]];

            conditionResult = await compare(endpointList, parameters["comparator"], comparisonList);

            if (memory.conditionCheck["check"] && memory.conditionCheck["serverId"] === serverId && memory.conditionCheck["userId"] === userId) {
                memory.conditionCheck["expressionSolved"] += ("=[" + JSON.stringify(value[0][0]) + "]<" + JSON.stringify(conditionResult) + ">");
            }
        }
        else {
            const valueIsEndpoint = await endpoints.isEndpoint(parameters["value"]);

            let comparisonList = [[parameters["value"], undefined]];

            if (valueIsEndpoint) {
                const endpointHolder = parameters["endpoint"];
                const valueHolder = parameters["value"];

                parameters["endpoint"] = valueHolder;

                const value = await data.getP1(serverId, userId, token, parameters);

                if (value === "TOKEN REQUIRED") {
                    return value;
                }

                comparisonList = value;

                parameters["endpoint"] = endpointHolder;
            }

            const value = await data.getP1(serverId, userId, token, parameters);

            if (value === "TOKEN REQUIRED") {
                return value;
            }

            const endpointList = value;

            conditionResult = await compare(endpointList, parameters["comparator"], comparisonList);

            if (memory.conditionCheck["check"] && memory.conditionCheck["serverId"] === serverId && memory.conditionCheck["userId"] === userId) {
                memory.conditionCheck["expressionSolved"] += ("=[" + JSON.stringify(value[0][0]) + "]<" + JSON.stringify(conditionResult) + ">");
            }
        }
    }
    else if (parsingType === 2) {
        const value = await data.getP2(serverId, userId, token, parameters);

        if (value === "TOKEN REQUIRED") {
            return value;
        }

        const endpointList = value;

        const comparisonList = [[parameters["value"], undefined]];

        conditionResult = await compare(endpointList, parameters["comparator"], comparisonList);

        if (memory.conditionCheck["check"] && memory.conditionCheck["serverId"] === serverId && memory.conditionCheck["userId"] === userId) {
            memory.conditionCheck["expressionSolved"] += ("=[" + JSON.stringify(value[0][0]) + "]<" + JSON.stringify(conditionResult) + ">");
        }
    }
    else if (parsingType === 3) {
        const value = await data.getP3(serverId, userId, token, parameters);

        if (value === "TOKEN REQUIRED") {
            return value;
        }

        const endpointList = value;

        const comparisonList = [[parameters["value"], undefined]];

        conditionResult = await compare(endpointList, parameters["comparator"], comparisonList);

        if (memory.conditionCheck["check"] && memory.conditionCheck["serverId"] === serverId && memory.conditionCheck["userId"] === userId) {
            memory.conditionCheck["expressionSolved"] += ("=[" + JSON.stringify(value[0][0]) + "]<" + JSON.stringify(conditionResult) + ">");
        }
    }

    return conditionResult;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Object} token 
 * @param {String} conditionString 
 * @param {Number} index 
 */
async function parseCondition(serverId, userId, token, conditionString, index) {
    let condition = undefined;
    
    let parsing = false;
    let parsed = false;
    let parsingStep = "parsingType";
    let nesting = 0;
    let conditionElement = "";

    let parsingType = 0;
    let logicGate = undefined;

    const parameters = {};

    for (let i = 0; i < conditionString.length; i++) {
        const char = conditionString.charAt(i);

        if (memory.conditionCheck["check"] && memory.conditionCheck["serverId"] === serverId && memory.conditionCheck["userId"] === userId) {
            memory.conditionCheck["expressionSolved"] += char;
        }

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
            let investigate = false;

            if (parsingStep === "parsingType") {
                parsingType = Number(conditionElement);

                parsingStep = "endpoint";
            }
            else if (parsingStep === "endpoint") {
                parameters["endpoint"] = conditionElement;

                if (parsingType === 1) {
                    parsingStep = "comparator";
                }
                else if (parsingType === 2) {
                    parsingStep = "direction";
                }
                else if (parsingType === 3) {
                    parsingStep = "indicator";
                }
            }
            else if (parsingStep === "indicator") {
                parameters["indicator"] = conditionElement;

                parsingStep = "target";
            }
            else if (parsingStep === "target") {
                parameters["target"] = conditionElement;

                parsingStep = "comparator";
            }
            else if (parsingStep === "direction") {
                parameters["direction"] = conditionElement;

                parsingStep = "entityType";
            }
            else if (parsingStep === "entityType") {
                parameters["entityType"] = conditionElement;

                parsingStep = "entity";
            }
            else if (parsingStep === "entity") {
                parameters["entity"] = conditionElement;

                parsingStep = "comparator";
            }
            else if (parsingStep === "comparator") {
                parameters["comparator"] = conditionElement;

                parsingStep = "value";
            }
            else if (parsingStep === "value") {
                parameters["value"] = conditionElement;

                investigate = true;

                parsingStep = "parsingType";
            }

            if (investigate) {
                const nextCondition = await getResult(serverId, userId, token, parsingType, parameters);

                if (nextCondition === "TOKEN REQUIRED") {
                    return nextCondition;
                }

                if (logicGate) {
                    if (logicGate === "AND") {
                        condition = condition && nextCondition;
                    }
                    else if (logicGate === "OR") {
                        condition = condition || nextCondition;
                    }
                    else if (logicGate === "NAND") {
                        condition = !(condition && nextCondition);
                    }
                    else if (logicGate === "NOR") {
                        condition = !(condition || nextCondition);
                    }
                    else if (logicGate === "XOR") {
                        condition = (condition || nextCondition) && !(condition && nextCondition);
                    }
                    else if (logicGate === "XNOR") {
                        condition = (condition && nextCondition) || (!condition && !nextCondition);
                    }
                }
                else {
                    condition = nextCondition;
                }
            }

            conditionElement = "";
            parsed = false;

            continue;
        }

        if ((char === "(" || char === ")" || char === "[") && conditionElement.length > 0) {
            logicGate = conditionElement;

            conditionElement = "";
        }

        if (char === "(") {
            const [nextCondition, newIndex] = await parseCondition(serverId, userId, token, conditionString.substring(i + 1), i);

            if (nextCondition === "TOKEN REQUIRED") {
                return nextCondition;
            }

            if (logicGate) {
                if (logicGate === "AND") {
                    condition = condition && nextCondition;
                }
                else if (logicGate === "OR") {
                    condition = condition || nextCondition;
                }
                else if (logicGate === "NAND") {
                    condition = !(condition && nextCondition);
                }
                else if (logicGate === "NOR") {
                    condition = !(condition || nextCondition);
                }
                else if (logicGate === "XOR") {
                    condition = (condition || nextCondition) && !(condition && nextCondition);
                }
                else if (logicGate === "XNOR") {
                    condition = (condition && nextCondition) || (!condition && !nextCondition);
                }
            }
            else {
                condition = nextCondition;
            }

            i = newIndex;
        }
        else if (char === ")") {
            if (memory.conditionCheck["check"] && memory.conditionCheck["serverId"] === serverId && memory.conditionCheck["userId"] === userId) {
                memory.conditionCheck["expressionSolved"] += ("<" + JSON.stringify(condition) + ">");
            }
            
            return [condition, index + i + 1];
        }
        else if (char === "[") {
            nesting++;

            parsing = true;
        }
        else {
            conditionElement += char;
        }
    }

    return condition;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Object} rule 
 * @param {Object} token 
 */
async function check(serverId, userId, rule, token) {
    const conditions = await disk.loadFile("./data/discord/server/" + serverId + "/conditions.json");

    const conditionId = rule["condition"];
    const condition = conditions[conditionId];

    if (memory.conditionCheck["check"] && memory.conditionCheck["serverId"] === serverId && memory.conditionCheck["userId"] === userId) {
        memory.conditionCheck["expressionSolved"] = "";
    }

    const result = await parseCondition(serverId, userId, token, condition["condition"], 0);

    if (memory.conditionCheck["check"] && memory.conditionCheck["serverId"] === serverId && memory.conditionCheck["userId"] === userId) {
        const server = await bot.client.guilds.fetch(memory.conditionCheck["serverId"]);
        const channel = server.channels.cache.get(memory.conditionCheck["channelId"]);
        const user = (await server.members.fetch(memory.conditionCheck["userId"])).user;


        await bot.send_message(
            server,
            channel,
            user,
            `\`\`\`Rule: ${rule["title"]}\nCondition: ${condition["title"]}\n\nExpression: ${condition["condition"]}\n\nSolved Expression: ${memory.conditionCheck["expressionSolved"]}\n\nResult: ${result}\`\`\``,
            false
        );
    }

    return result;
}

module.exports.checkNesting = checkNesting;
module.exports.check = check;