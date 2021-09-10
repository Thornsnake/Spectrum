//@ts-check

"use strict";

const fs = require("fs");
const memory = require("./memory.js");

/**
 * 
 * @param {String} filePath 
 */
async function exists(filePath) {
    return new Promise((resolve) => {
        fs.access(filePath, fs.constants.F_OK, (error) => {
            if (error) { resolve(false); }
            else { resolve(true); }
        });
    });
}

/**
 * 
 * @param {String} filePath 
 * @param {BufferEncoding} encoding 
 */
async function loadFile(filePath, encoding = "utf-8") {
    try {
        let diskPath = "";
        let memoryPath = memory.memoryData;

        const pathList = filePath.split("/");

        for (let i = 0; i < pathList.length; i++) {
            const pathPart = pathList[i];

            if (pathPart.length === 0) {
                continue;
            }

            if (i + 1 < pathList.length) {
                diskPath += pathPart + "/";

                if ([".", "..", "~"].includes(pathPart)) {
                    continue;
                }

                if (pathPart in memoryPath) {
                    memoryPath = memoryPath[pathPart];

                    continue;
                }

                const fileExists = await exists(diskPath);

                if (!fileExists) {
                    return false;
                }

                memoryPath[pathPart] = {};
                memoryPath = memoryPath[pathPart];
            }
            else {
                const alreadyLoaded = pathPart in memoryPath;

                if (alreadyLoaded) {
                    return memoryPath[pathPart];
                }

                const fileExists = await exists(filePath);

                if (!fileExists) {
                    return false;
                }

                const fileData = await new Promise((resolve, reject) => {
                    let data = "";
        
                    const stream = fs.createReadStream(
                        filePath,
                        {
                            encoding: encoding,
                            flags: "r"
                        }
                    );
        
                    stream.on("data", (chunk) => {
                        data += chunk;
                    });
        
                    stream.on("end", () => {
                        resolve(data);
                    });
        
                    stream.on("error", (error) => {
                        reject(error);
                    });
                }).catch((error) => {
                    console.log(error);
                    
                    return false;
                });

                memoryPath[pathPart] = JSON.parse(fileData);

                return memoryPath[pathPart];
            }
        }
    }
    catch(error) {
        console.log("Unable to load file: " + filePath);

        const fileExists = await exists(filePath);

        if (fileExists) {
            await removeFile(filePath);
        }
        
        throw(error);
    }
}

/**
 * 
 * @param {String} filePath 
 * @param {Object} fileData 
 * @param {BufferEncoding} encoding 
 */
async function writeFile(filePath, fileData, encoding = "utf-8") {
    let diskPath = "";
    let memoryPath = memory.memoryData;

    const pathList = filePath.split("/");

    for (let i = 0; i < pathList.length; i++) {
        const pathPart = pathList[i];

        if (pathPart.length === 0) {
            continue;
        }

        diskPath += pathPart + "/";

        if ([".", "..", "~"].includes(pathPart)) {
            continue;
        }

        if (i + 1 < pathList.length) {
            if (pathPart in memoryPath) {
                memoryPath = memoryPath[pathPart];

                continue;
            }

            await createDirectory(diskPath);
        }
        else {
            await new Promise((resolve, reject) => {
                const stream = fs.createWriteStream(
                    filePath,
                    {
                        encoding: encoding,
                        mode: 0o666,
                        flags: "w"
                    }
                );
    
                stream.write(JSON.stringify(fileData), (error) => {
                    if (error) { reject(error); }
                });
    
                stream.end();
    
                resolve(true);
            }).catch((error) => {
                console.log(error);

                return false;
            });

            memoryPath[pathPart] = fileData;

            return memoryPath[pathPart];
        }

        memoryPath[pathPart] = {};
        memoryPath = memoryPath[pathPart];
    }
}

/**
 * 
 * @param {String} filePath 
 */
async function removeFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (error) => {
            if (error) { resolve(false); }
            else { resolve(true); }
        });
    });
}

/**
 * 
 * @param {String} directoryPath 
 */
async function createDirectory(directoryPath) {
    const directoryExists = await exists(directoryPath);

    if (directoryExists) {
        return true;
    }

    return new Promise((resolve, reject) => {
        try {
            fs.mkdirSync(directoryPath, {
                recursive: true
            });

            resolve(true);
        }
        catch(error) {
            console.log(error);

            return resolve(false);
        }
    });
}

/**
 * 
 * @param {String} directoryRoot 
 */
async function getDirectories(directoryRoot) {
    const directoryExists = await exists(directoryRoot);

    if (!directoryExists) {
        return false;
    }

    const elements = await new Promise((resolve, reject) => {
        fs.readdir(directoryRoot, (error, files) => {
            if (error) { reject(error); }
            else { resolve(files); }
        });
    });

    const directories = [];

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const elementPath = directoryRoot + element;

        const elementStats = await new Promise((resolve, reject) => {
            fs.stat(elementPath, (error, stats) => {
                if (error) { reject(error); }
                else { resolve(stats); }
            });
        });

        if (elementStats.isDirectory()) {
            directories.push(element);
        }
    }

    return directories;
}

async function removeDirectory(directoryPath) {
    const directoryExists = await exists(directoryPath);

    if (!directoryExists) {
        return true;
    }

    return new Promise((resolve, reject) => {
        try {
            fs.rmdir(directoryPath, { recursive: true }, (error) => {
                if (error) { reject(error); }
                else { resolve(true); }
            });
        }
        catch(error) {
            console.log(error);

            return resolve(false);
        }
    });
}

module.exports.exists = exists;
module.exports.loadFile = loadFile;
module.exports.writeFile = writeFile;
module.exports.removeFile = removeFile;
module.exports.createDirectory = createDirectory;
module.exports.getDirectories = getDirectories;
module.exports.removeDirectory = removeDirectory;