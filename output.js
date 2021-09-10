//@ts-check

"use strict";

/**
 * 
 * @param {any} message 
 */
function error(message) {
    let output = "";

    if (typeof (message) === "object") {
        if (message instanceof Error) {
            output = "[" + new Date().toISOString() + "] " + message.stack;
        }
        else {
            output = "[" + new Date().toISOString() + "] " + JSON.stringify(message, null, 4);
        }
	}
    else {
        output = "[" + new Date().toISOString() + "] " + message;
    }

    console.log("\x1b[31m%s\x1b[0m", output);

    return output;
};

/**
 * 
 * @param {any} message 
 */
function success(message, logToConsole) {
    let output = "";

    if (typeof (message) === "object") {
        output = "[" + new Date().toISOString() + "] " + JSON.stringify(message, null, 4);
	}
    else {
        output = "[" + new Date().toISOString() + "] " + message;
    }

    if (logToConsole) {
        console.log("\x1b[32m%s\x1b[0m", output);
    }

    return output;
};

/**
 * 
 * @param {any} message 
 */
function highlight(message) {
    let output = "";

    if (typeof (message) === "object") {
        output = "[" + new Date().toISOString() + "] " + JSON.stringify(message, null, 4);
    }
    else {
        output = "[" + new Date().toISOString() + "] " + message;
    }
    
    console.log("\x1b[33m%s\x1b[0m", output);

    return output;
};

/**
 * 
 * @param {any} message 
 */
function info(message) {
    let output = "";

    if (typeof (message) === "object") {
        output = "[" + new Date().toISOString() + "] " + JSON.stringify(message, null, 4);
    }
    else {
        output = "[" + new Date().toISOString() + "] " + message;
    }

    console.log(output);

    return output;
};

/**
 * 
 * @param {any} message 
 */
function message(message) {
    let output = "";

    if (typeof (message) === "object") {
        output = "[" + new Date().toISOString() + "] " + JSON.stringify(message, null, 4);
    }
    else {
        output = "[" + new Date().toISOString() + "] " + message;
    }

    console.log("\x1b[36m%s\x1b[0m", output);

    return output;
};

/**
 * 
 * @param {any} message 
 */
function socket(message) {
    let output = "";

    if (typeof (message) === "object") {
        output = "[" + new Date().toISOString() + "] " + JSON.stringify(message, null, 4);
    }
    else {
        output = "[" + new Date().toISOString() + "] " + message;
    }

    console.log("\x1b[35m%s\x1b[0m", output);

    return output;
};

module.exports.error = error;
module.exports.success = success;
module.exports.highlight = highlight;
module.exports.info = info;
module.exports.message = message;
module.exports.socket = socket;