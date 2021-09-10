//@ts-check

"use strict";

const disk = require("../../disk.js");
const esi = require("../../esi.js");

const discord = require("./discord.js");

const fs = require("fs");

const data = {
    // Alliance
    "BountyPlacedAlliance": {
        "title": "Bounty Placed On Alliance",
        "description": "Someone placed a bounty on our alliance.",
        "group": "Alliance"
    },

    // Corporation
    "BountyPlacedCorp": {
        "title": "Bounty Placed On Corporation",
        "description": "Someone placed a bounty on our corporation.",
        "group": "Corporation"
    },
    "CorpAppNewMsg": {
        "title": "New Character Application",
        "description": "A pilot applied to join our corporation.",
        "group": "Corporation"
    },
    "CharAppWithdrawMsg": {
        "title": "Character Application Withdrawn",
        "description": "A pilot withdrew his application to join our corporation.",
        "group": "Corporation"
    },
    "CharAppAcceptMsg": {
        "title": "Character Application Accepted",
        "description": "The application of a pilot to join our corporation was accepted.",
        "group": "Corporation"
    },
    "CharAppRejectMsg": {
        "title": "Character Application Rejected",
        "description": "The application of a pilot to join our corporation was rejected.",
        "group": "Corporation"
    },
    "CorpNewCEOMsg": {
        "title": "New CEO",
        "description": "The CEO of our corporation changed.",
        "group": "Corporation"
    },
    "CorpTaxChangeMsg": {
        "title": "Tax Changed",
        "description": "The tax rate of our corporation changed.",
        "group": "Corporation"
    },
    "CharLeftCorpMsg": {
        "title": "Character Left Corporation",
        "description": "A pilot left our corporation.",
        "group": "Corporation"
    },

    // Moonmining
    "MoonminingAutomaticFracture": {
        "title": "Moonmining Automatic Fracture",
        "description": "The lifetime of a moon chunk expired. It fractured automatically.",
        "group": "Moonmining"
    },
    "MoonminingExtractionCancelled": {
        "title": "Moonmining Extraction Cancelled",
        "description": "The extraction of a moon chunk has been cancelled.",
        "group": "Moonmining"
    },
    "MoonminingExtractionFinished": {
        "title": "Moonmining Extraction Finished",
        "description": "The extraction of a moon chunk is complete. It is waiting to be fractured.",
        "group": "Moonmining"
    },
    "MoonminingExtractionStarted": {
        "title": "Moonmining Extraction Started",
        "description": "The extraction of a moon chunk was started.",
        "group": "Moonmining"
    },
    "MoonminingLaserFired": {
        "title": "Moonmining Laser Fired",
        "description": "A moon chunk was fractured by hand. Someone fired the moonmining laser.",
        "group": "Moonmining"
    },

    // Sovereignty
    "AllianceCapitalChanged": {
        "title": "Alliance Capital Changed",
        "description": "The capital system of our alliance changed.",
        "group": "Sovereignty"
    },
    "EntosisCaptureStarted": {
        "title": "Entosis Capture Started",
        "description": "Someone activated an entosis link on one of our sovereignty structures. The warm up cycle is over.",
        "group": "Sovereignty"
    },
    "SovStructureReinforced": {
        "title": "Sovereignty Structure Reinforced",
        "description": "One of our sovereignty structures was reinforced.",
        "group": "Sovereignty"
    },
    "SovCommandNodeEventStarted": {
        "title": "Command Nodes Decloaking",
        "description": "One of our sovereignty structures is out of reinforce. Command Nodes are starting to decloak.",
        "group": "Sovereignty"
    },
    "SovStructureDestroyed": {
        "title": "Sovereignty Structure Destroyed",
        "description": "One of our sovereignty structures was destroyed.",
        "group": "Sovereignty"
    },
    "SovStructureSelfDestructRequested": {
        "title": "Sovereignty Structure Self Destruct Initiated",
        "description": "Someone activated the self-destruct countdown on one of our sovereignty structures.",
        "group": "Sovereignty"
    },
    "SovStructureSelfDestructCancel": {
        "title": "Sovereignty Structure Self Destruct Cancelled",
        "description": "The self-destruct of one of our sovereignty structures was cancelled.",
        "group": "Sovereignty"
    },
    "SovStructureSelfDestructFinished": {
        "title": "Sovereignty Structure Self Destruct Finished",
        "description": "One of our sovereignty structures self-destructed.",
        "group": "Sovereignty"
    },
    "SovAllClaimAquiredMsg": {
        "title": "Sovereignty Claimed",
        "description": "Our alliance claimed sovereignty over a system.",
        "group": "Sovereignty"
    },
    "SovAllClaimLostMsg": {
        "title": "Sovereignty Lost",
        "description": "Our alliance lost sovereignty over a system.",
        "group": "Sovereignty"
    },

    // Structure
    "OwnershipTransferred": {
        "title": "Ownership Transferred",
        "description": "The ownership of one of our structures was transferred to a new corporation.",
        "group": "Structure"
    },
    "StructureUnderAttack": {
        "title": "Structure Under Attack",
        "description": "One of our structures is under attack.",
        "group": "Structure"
    },
    "OrbitalAttacked": {
        "title": "Structure Under Attack [Orbital]",
        "description": "One of our customs offices is under attack.",
        "group": "Structure"
    },
    "TowerAlertMsg": {
        "title": "Structure Under Attack [Tower]",
        "description": "One of our POS towers is under attack.",
        "group": "Structure"
    },
    "OrbitalReinforced": {
        "title": "Structure Reinforced [Orbital]",
        "description": "One of our customs offices was reinforced.",
        "group": "Structure"
    },
    "StructureFuelAlert": {
        "title": "Low On Fuel",
        "description": "One of our structures is low on fuel and will switch to low power mode soon.",
        "group": "Structure"
    },
    "TowerResourceAlertMsg": {
        "title": "Low On Fuel [Tower]",
        "description": "One of our POS towers is low on fuel and will shut down its force field soon.",
        "group": "Structure"
    },
    "StructureAnchoring": {
        "title": "Structure Anchoring",
        "description": "We began anchoring a new structure.",
        "group": "Structure"
    },
    "StructureUnanchoring": {
        "title": "Structure Unanchoring",
        "description": "We began to unanchor one of our structures.",
        "group": "Structure"
    },
    "StructureOnline": {
        "title": "Structure Online",
        "description": "A structure we were anchoring went online.",
        "group": "Structure"
    },
    "StructureWentHighPower": {
        "title": "Structure Went High Power",
        "description": "One of our structures entered high power mode.",
        "group": "Structure"
    },
    "StructureWentLowPower": {
        "title": "Structure Went Low Power",
        "description": "One of our structures entered low power mode. Resistances are reduced and attackers will be able to skip the armor timer.",
        "group": "Structure"
    },
    "StructureServicesOffline": {
        "title": "Structure Services Offline",
        "description": "One of our structures had services turned off. This will also list which ones.",
        "group": "Structure"
    },
    "StructureImpendingAbandonmentAssetsAtRisk": {
        "title": "Structure Becoming Abandoned",
        "description": "One of our structures our members have assets on is about to go abandoned.",
        "group": "Structure"
    },

    // War
    "AllWarDeclaredMsg": {
        "title": "War Declared [Alliance]",
        "description": "Our alliance declared war or had war declared upon.",
        "group": "War"
    },
    "CorpWarDeclaredMsg": {
        "title": "War Declared [Corporation]",
        "description": "Our corporation declared war or had war declared upon.",
        "group": "War"
    },
    "AllWarInvalidatedMsg": {
        "title": "War Invalidated [Alliance]",
        "description": "One of the wars our alliance is involved in was invalidated.",
        "group": "War"
    },
    "CorpWarInvalidatedMsg": {
        "title": "War Invalidated [Corporation]",
        "description": "One of the wars our corporation is involved in was invalidated.",
        "group": "War"
    },
    "AllyJoinedWarAggressorMsg": {
        "title": "Ally Joined War [Aggressor]",
        "description": "An offer for assistance has been accepted in a war we are the aggressor in.",
        "group": "War"
    },
    "AllyJoinedWarAllyMsg": {
        "title": "Ally Joined War [Ally]",
        "description": "An offer for assistance has been accepted in a war we are assisting in.",
        "group": "War"
    },
    "AllyJoinedWarDefenderMsg": {
        "title": "Ally Joined War [Defender]",
        "description": "An offer for assistance has been accepted in a war we are the defender in.",
        "group": "War"
    },

    // FIX
    "FWAllianceKickMsg": {
        "title": "Alliance Kicked",
        "description": "An alliance has been kicked from participation in factional warfare.",
        "group": "Factional Warfare"
    },
    "FWCorpKickMsg": {
        "title": "Corporation Kicked",
        "description": "A corporation has been kicked from participation in factional warfare.",
        "group": "Factional Warfare"
    }
}

/**
 * 
 * @param {Number} typeId 
 */
function getCampaignEventType(typeId) {
    if (Number(typeId) === 1) {
        return "Territorial Claim Unit";
    }
    else if (Number(typeId) === 2) {
        return "Infrastructure Hub";
    }
    else if (Number(typeId) === 3) {
        return "Station"; // Deprecated
    }
    else {
        "Unknown Structure";
    }
}

/**
 * 
 * @param {String} hex 
 */
function hexToInt(hex) {
    const r = hex.substring(1, 3);
    const g = hex.substring(3, 5);
    const b = hex.substring(5, 7);

    return parseInt(r, 16) * 65536 + parseInt(g, 16) * 256 + parseInt(b, 16);
}

/**
 * 
 * @param {String} notificationText 
 * @param {String} attributeName 
 * @param {String} restrictor 
 */
function extractAttribute(notificationText, attributeName, restrictor = "\n") {
    if (!notificationText.includes(attributeName + ":")) {
        return;
    }

    const attributeValue = notificationText.split(attributeName + ":")[1].split(restrictor)[0].trim();

    if (attributeValue === "null") {
        return;
    }

    return eval("\"" + attributeValue.replace(/\"/g, '\\"').replace(/\n/g, '\\n').replace(/<br>/g, '\\n') + "\""); // Escape Everything
}

/**
 * 
 * @param {String} isk 
 */
function formatIsk(isk) {
    const fixedIsk = parseFloat(isk).toFixed(2);

    const leftSide = fixedIsk.split(".")[0];
    const rightSide = fixedIsk.split(".")[1];

    const leftSideWithSeparators = leftSide.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    return leftSideWithSeparators + "." + rightSide;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Object} notification 
 * @param {Number} color 
 */
async function extractInformation(serverId, userId, notification, color) {
    const notificationId = notification["notification_id"];
    const senderId = notification["sender_id"];
    const senderType = notification["sender_type"] + "s";
    const text = notification["text"];
    const timestamp = notification["timestamp"];
    const type = notification["type"];
    const characterId = notification["character_id"];
    const characterName = notification["character_name"];
    const corporationId = notification["corporation_id"];
    const corporationName = notification["corporation_name"];
    const allianceId = notification["alliance_id"];
    const allianceName = notification["alliance_name"];

    let imageUrl = "https://images.evetech.net/" + senderType + "/" + senderId + "/logo";

    if (senderType === "characters") {
        imageUrl = "https://images.evetech.net/" + senderType + "/" + senderId + "/portrait";
    }

    try {
        // Alliance
        if (type === "BountyPlacedAlliance") {
            const bounty = extractAttribute(text, "bounty");
            const bountyPlacerId = extractAttribute(text, "bountyPlacerID");

            const bountyPlacer = (await esi.getUniverseNames(serverId, bountyPlacerId))["body"][0];

            const fields = [
                {
                    "name": "Amount",
                    "value": formatIsk(bounty) + " ISK",
                    "inline": true
                }
            ];

            return {
                "embed": {
                    "title": "Bounty Placed",
                    "description": "[" + bountyPlacer["name"] + "](https://zkillboard.com/" + bountyPlacer["category"] + "/" + bountyPlacer["id"] + "/) placed a bounty on [" + allianceName + "](https://zkillboard.com/alliance/" + allianceId + "/).",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": fields
                }
            };
        }

        // Corporation
        else if (type === "BountyPlacedCorp") {
            const bounty = extractAttribute(text, "bounty");
            const bountyPlacerId = extractAttribute(text, "bountyPlacerID");

            const bountyPlacer = (await esi.getUniverseNames(serverId, bountyPlacerId))["body"][0];

            const fields = [];

            fields.push({
                "name": "Amount",
                "value": formatIsk(bounty) + " ISK",
                "inline": true
            });

            return {
                "embed": {
                    "title": "Bounty Placed",
                    "description": "[" + bountyPlacer["name"] + "](https://zkillboard.com/" + bountyPlacer["category"] + "/" + bountyPlacer["id"] + "/) placed a bounty on [" + corporationName + "](https://zkillboard.com/corporation/" + corporationId + "/).",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": fields
                }
            };
        }
        else if (type === "CorpAppNewMsg") {
            const characterId = extractAttribute(text, "charID");
            const corporationId = extractAttribute(text, "corpID");
            let applicationText = extractAttribute(text, "applicationText", "\ncharID:")

            const character = (await esi.getCharacter(serverId, characterId))["body"];
            const corporation = (await esi.getCorporation(serverId, corporationId))["body"];

            const fields = [];

            if (applicationText.trim().length > 2) {
                applicationText = applicationText.replace(/\n/g, "");
                applicationText = applicationText.replace(/  /g, " ");
                applicationText = applicationText.replace(/<br>/g, "\n");
                applicationText = applicationText.replace(/<[^>]*>/g, "");

                fields.push({
                    "name": "Application Text",
                    "value": applicationText,
                    "inline": true
                });
            }

            return {
                "embed": {
                    "title": "New Character Application",
                    "description": "[" + character["name"] + "](https://zkillboard.com/character/" + characterId + "/) applied to join [" + corporation["name"] + "](https://zkillboard.com/corporation/" + corporationId + "/) and is waiting for an answer.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": fields
                }
            };
        }
        else if (type === "CharAppWithdrawMsg") {
            const characterId = extractAttribute(text, "charID");
            const corporationId = extractAttribute(text, "corpID");
            let applicationText = extractAttribute(text, "applicationText", "\ncharID:")

            const character = (await esi.getCharacter(serverId, characterId))["body"];
            const corporation = (await esi.getCorporation(serverId, corporationId))["body"];

            const fields = [];

            if (applicationText.trim().length > 2) {
                applicationText = applicationText.replace(/\n/g, "");
                applicationText = applicationText.replace(/  /g, " ");
                applicationText = applicationText.replace(/<br>/g, "\n");
                applicationText = applicationText.replace(/<[^>]*>/g, "");

                fields.push({
                    "name": "Application Text",
                    "value": applicationText,
                    "inline": true
                });
            }

            return {
                "embed": {
                    "title": "Character Application Withdrawn",
                    "description": "[" + character["name"] + "](https://zkillboard.com/character/" + characterId + "/) withdrew his application to join [" + corporation["name"] + "](https://zkillboard.com/corporation/" + corporationId + "/).",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": fields
                }
            };
        }
        else if (type === "CharAppAcceptMsg") {
            const characterId = extractAttribute(text, "charID");
            const corporationId = extractAttribute(text, "corpID");
            let applicationText = extractAttribute(text, "applicationText", "\ncharID:")

            const character = (await esi.getCharacter(serverId, characterId))["body"];
            const corporation = (await esi.getCorporation(serverId, corporationId))["body"];

            const fields = [];

            if (applicationText.trim().length > 2) {
                applicationText = applicationText.replace(/\n/g, "");
                applicationText = applicationText.replace(/  /g, " ");
                applicationText = applicationText.replace(/<br>/g, "\n");
                applicationText = applicationText.replace(/<[^>]*>/g, "");

                fields.push({
                    "name": "Application Text",
                    "value": applicationText,
                    "inline": true
                });
            }

            return {
                "embed": {
                    "title": "Character Application Accepted",
                    "description": "The application of [" + character["name"] + "](https://zkillboard.com/character/" + characterId + "/) to join [" + corporation["name"] + "](https://zkillboard.com/corporation/" + corporationId + "/) was accepted.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": fields
                }
            };
        }
        else if (type === "CharAppRejectMsg") {
            const characterId = extractAttribute(text, "charID");
            const corporationId = extractAttribute(text, "corpID");
            let applicationText = extractAttribute(text, "applicationText", "\ncharID:")

            const character = (await esi.getCharacter(serverId, characterId))["body"];
            const corporation = (await esi.getCorporation(serverId, corporationId))["body"];

            const fields = [];

            if (applicationText.trim().length > 2) {
                applicationText = applicationText.replace(/\n/g, "");
                applicationText = applicationText.replace(/  /g, " ");
                applicationText = applicationText.replace(/<br>/g, "\n");
                applicationText = applicationText.replace(/<[^>]*>/g, "");

                fields.push({
                    "name": "Application Text",
                    "value": applicationText,
                    "inline": true
                });
            }

            return {
                "embed": {
                    "title": "Character Application Rejected",
                    "description": "The application of [" + character["name"] + "](https://zkillboard.com/character/" + characterId + "/) to join [" + corporation["name"] + "](https://zkillboard.com/corporation/" + corporationId + "/) was rejected.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": fields
                }
            };
        }
        else if (type === "CorpNewCEOMsg") {
            const corporationId = extractAttribute(text, "corpID");
            const newCeoId = extractAttribute(text, "newCeoID");
            const oldCeoId = extractAttribute(text, "oldCeoID");

            const newCeo = (await esi.getCharacter(serverId, newCeoId))["body"];
            const oldCeo = (await esi.getCharacter(serverId, oldCeoId))["body"];
            const corporation = (await esi.getCorporation(serverId, corporationId))["body"];

            const fields = [
                {
                    "name": "Old CEO",
                    "value": "[" + oldCeo["name"] + "](https://zkillboard.com/character/" + oldCeoId + "/)",
                    "inline": true
                },
                {
                    "name": "New CEO",
                    "value": "[" + newCeo["name"] + "](https://zkillboard.com/character/" + newCeoId + "/)",
                    "inline": true
                }
            ];

            return {
                "embed": {
                    "title": "New CEO",
                    "description": "The current CEO of [" + corporation["name"] + "](https://zkillboard.com/corporation/" + corporationId + "/) changed.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": fields
                }
            };
        }
        else if (type === "CorpTaxChangeMsg") {
            const corporationId = extractAttribute(text, "corpID");
            const newTaxRate = extractAttribute(text, "newTaxRate");
            const oldTaxRate = extractAttribute(text, "oldTaxRate");

            const corporation = (await esi.getCorporation(serverId, corporationId))["body"];

            const fields = [
                {
                    "name": "Old Tax Rate",
                    "value": oldTaxRate + " %",
                    "inline": true
                },
                {
                    "name": "New Tax Rate",
                    "value": newTaxRate + " %",
                    "inline": true
                }
            ];

            return {
                "embed": {
                    "title": "Tax Changed",
                    "description": "[" + corporation["name"] + "](https://zkillboard.com/corporation/" + corporationId + "/) changed its tax rate.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": fields
                }
            };
        }
        else if (type === "CharLeftCorpMsg") {
            const characterId = extractAttribute(text, "charID");
            const corporationId = extractAttribute(text, "corpID");

            const character = (await esi.getCharacter(serverId, characterId))["body"];
            const corporation = (await esi.getCorporation(serverId, corporationId))["body"];

            return {
                "embed": {
                    "title": "Character Left Corporation",
                    "description": "[" + character["name"] + "](https://zkillboard.com/character/" + characterId + "/) has left [" + corporation["name"] + "](https://zkillboard.com/corporation/" + corporationId + "/).",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }

        // Moonmining
        else if (type === "MoonminingAutomaticFracture") {
            const systemId = extractAttribute(text, "solarSystemID");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            const structureName = extractAttribute(text, "structureName");
            const oreVolumeByType = {};

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            const oreVolumeTextParts = text.split("  ");

            for (let i = 1; i < oreVolumeTextParts.length; i++) {
                const oreVolumeParts = oreVolumeTextParts[i].split("\n")[0].split(": ");

                if (oreVolumeParts.length != 2) {
                    continue;
                }

                const oreTypeId = oreVolumeParts[0];
                const value = oreVolumeParts[1];

                const oreType = (await esi.getUniverseType(serverId, oreTypeId))["body"];

                oreVolumeByType[oreTypeId] = {
                    "name": oreType["name"],
                    "volume": value
                };
            }

            const fields = [
                {
                    "name": "Structure Name",
                    "value": structureName + " (" + structureType["name"] + ")"
                }
            ];

            const oreTypeIdList = Object.keys(oreVolumeByType);

            for (let i = 0; i < oreTypeIdList.length; i++) {
                const oreTypeId = oreTypeIdList[i];
                const oreType = oreVolumeByType[oreTypeId];

                fields.push({
                    "name": oreType["name"],
                    "value": formatIsk(oreType["volume"]) + " m³",
                    "inline": true
                });
            }

            return {
                "embed": {
                    "title": "Moonmining Automatic Fracture",
                    "description": "A moon chunk in [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/) fractured automatically as it reached the end of its lifetime. The resources are ready to be mined.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": fields
                }
            };
        }
        else if (type === "MoonminingExtractionCancelled") {
            const systemId = extractAttribute(text, "solarSystemID");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            const structureName = extractAttribute(text, "structureName");
            const cancelledById = extractAttribute(text, "cancelledBy");

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            const fields = [];

            fields.push({
                "name": "Structure Name",
                "value": structureName + " (" + structureType["name"] + ")",
                "inline": true
            });

            if (cancelledById) {
                const cancelledBy = (await esi.getCharacter(serverId, cancelledById))["body"];

                fields.push({
                    "name": "Cancelled By",
                    "value": "[" + cancelledBy["name"] + "](https://zkillboard.com/character/" + cancelledById + "/)",
                    "inline": true
                });
            }

            return {
                "embed": {
                    "title": "Moonmining Extraction Cancelled",
                    "description": "The extraction of a moon chunk in [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/) was cancelled.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": fields
                }
            };
        }
        else if (type === "MoonminingExtractionFinished") {
            const autoTime = new Date((Number(extractAttribute(text, "autoTime")) / 10000000 - 11644473600) * 1000).toISOString().replace("T", " ").substring(0, 16);
            const systemId = extractAttribute(text, "solarSystemID");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            const structureName = extractAttribute(text, "structureName");
            const oreVolumeByType = {};

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            const oreVolumeTextParts = text.split("  ");

            for (let i = 1; i < oreVolumeTextParts.length; i++) {
                const oreVolumeParts = oreVolumeTextParts[i].split("\n")[0].split(": ");

                if (oreVolumeParts.length != 2) {
                    continue;
                }

                const oreTypeId = oreVolumeParts[0];
                const value = Number(oreVolumeParts[1]).toFixed(2);

                const oreType = (await esi.getUniverseType(serverId, oreTypeId))["body"];

                oreVolumeByType[oreTypeId] = {
                    "name": oreType["name"],
                    "volume": value
                };
            }

            const fields = [];

            fields.push({
                "name": "Structure Name",
                "value": structureName + " (" + structureType["name"] + ")",
                "inline": true
            });

            fields.push({
                "name": "Automatic Fracture",
                "value": autoTime + " EVE",
                "inline": true
            });

            const oreTypeIdList = Object.keys(oreVolumeByType);

            for (let i = 0; i < oreTypeIdList.length; i++) {
                const oreTypeId = oreTypeIdList[i];
                const oreType = oreVolumeByType[oreTypeId];

                fields.push({
                    "name": oreType["name"],
                    "value": formatIsk(oreType["volume"]) + " m³",
                    "inline": true
                });
            }

            return {
                "embed": {
                    "title": "Moonmining Extraction Finished",
                    "description": "The extraction of a moon chunk in [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/) was finished. The moon chunk is waiting to be fractured.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": fields
                }
            };
        }
        else if (type === "MoonminingExtractionStarted") {
            const autoTime = new Date((Number(extractAttribute(text, "autoTime")) / 10000000 - 11644473600) * 1000).toISOString().replace("T", " ").substring(0, 16);
            const readyTime = new Date((Number(extractAttribute(text, "readyTime")) / 10000000 - 11644473600) * 1000).toISOString().replace("T", " ").substring(0, 16);
            const startedById = extractAttribute(text, "startedBy");
            const systemId = extractAttribute(text, "solarSystemID");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            const structureName = extractAttribute(text, "structureName");
            const oreVolumeByType = {};

            const startedBy = (await esi.getCharacter(serverId, startedById))["body"];
            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            const oreVolumeTextParts = text.split("  ");

            for (let i = 1; i < oreVolumeTextParts.length; i++) {
                const oreVolumeParts = oreVolumeTextParts[i].split("\n")[0].split(": ");

                if (oreVolumeParts.length != 2) {
                    continue;
                }

                const oreTypeId = oreVolumeParts[0];
                const value = Number(oreVolumeParts[1]).toFixed(2);

                const oreType = (await esi.getUniverseType(serverId, oreTypeId))["body"];

                oreVolumeByType[oreTypeId] = {
                    "name": oreType["name"],
                    "volume": value
                };
            }

            const fields = [];

            fields.push({
                "name": "Structure Name",
                "value": structureName + " (" + structureType["name"] + ")",
                "inline": true
            });

            fields.push({
                "name": "Started By",
                "value": "[" + startedBy["name"] + "](https://zkillboard.com/character/" + startedById + "/)",
                "inline": true
            });

            fields.push({
                "name": "Extraction Finished",
                "value": readyTime + " EVE",
                "inline": true
            });

            fields.push({
                "name": "Automatic Fracture",
                "value": autoTime + " EVE",
                "inline": true
            });

            const oreTypeIdList = Object.keys(oreVolumeByType);

            for (let i = 0; i < oreTypeIdList.length; i++) {
                const oreTypeId = oreTypeIdList[i];
                const oreType = oreVolumeByType[oreTypeId];

                fields.push({
                    "name": oreType["name"],
                    "value": formatIsk(oreType["volume"]) + " m³",
                    "inline": true
                });
            }

            return {
                "embed": {
                    "title": "Moonmining Extraction Started",
                    "description": "The extraction of a moon chunk in [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/) was started. The expected fracture time and yield are listed below.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": fields
                }
            };
        }
        else if (type === "MoonminingLaserFired") {
            const firedById = extractAttribute(text, "firedBy");
            const systemId = extractAttribute(text, "solarSystemID");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            const structureName = extractAttribute(text, "structureName");
            const oreVolumeByType = {};

            const firedBy = (await esi.getCharacter(serverId, firedById))["body"];
            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            const oreVolumeTextParts = text.split("  ");

            for (let i = 1; i < oreVolumeTextParts.length; i++) {
                const oreVolumeParts = oreVolumeTextParts[i].split("\n")[0].split(": ");

                if (oreVolumeParts.length != 2) {
                    continue;
                }

                const oreTypeId = oreVolumeParts[0];
                const value = Number(oreVolumeParts[1]).toFixed(2);

                const oreType = (await esi.getUniverseType(serverId, oreTypeId))["body"];

                oreVolumeByType[oreTypeId] = {
                    "name": oreType["name"],
                    "volume": value
                };
            }

            const fields = [];

            fields.push({
                "name": "Structure Name",
                "value": structureName + " (" + structureType["name"] + ")",
                "inline": true
            });

            fields.push({
                "name": "Fired By",
                "value": "[" + firedBy["name"] + "](https://zkillboard.com/character/" + firedById + "/)",
                "inline": true
            });

            const oreTypeIdList = Object.keys(oreVolumeByType);

            for (let i = 0; i < oreTypeIdList.length; i++) {
                const oreTypeId = oreTypeIdList[i];
                const oreType = oreVolumeByType[oreTypeId];

                fields.push({
                    "name": oreType["name"],
                    "value": formatIsk(oreType["volume"]) + " m³",
                    "inline": true
                });
            }

            return {
                "embed": {
                    "title": "Moonmining Laser Fired",
                    "description": "A moon chunk in the system [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/) has been fractured by firing the moonmining laser. The resources are ready to be mined.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": fields
                }
            };
        }

        // Sovereignty
        else if (type === "AllianceCapitalChanged") {
            const allianceId = extractAttribute(text, "allianceID");
            const systemId = extractAttribute(text, "solarSystemID");

            const alliance = (await esi.getAlliance(serverId, allianceId))["body"];
            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];

            return {
                "embed": {
                    "title": "Alliance Capital Changed",
                    "description": "The capital system of [" + alliance["name"] + "](https://zkillboard.com/alliance/" + allianceId + "/) changed to [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/).",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }
        else if (type === "EntosisCaptureStarted") {
            const systemId = extractAttribute(text, "solarSystemID");
            const structureTypeId = extractAttribute(text, "structureTypeID");

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            return {
                "embed": {
                    "title": "Entosis Capture Started",
                    "description": "Entosis Link was activated on the **" + structureType["name"] + "** in [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/).",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }
        else if (type === "SovStructureReinforced") {
            const campaignEventType = getCampaignEventType(extractAttribute(text, "campaignEventType"));
            const decloakTime = new Date((Number(extractAttribute(text, "decloakTime")) / 10000000 - 11644473600) * 1000).toISOString().replace("T", " ").substring(0, 16);
            const systemId = extractAttribute(text, "solarSystemID");

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];

            return {
                "embed": {
                    "title": "Sovereignty Structure Reinforced",
                    "description": "The **" + campaignEventType + "** in [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/) has been reinforced.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "Reinforcement Ending",
                            "value": decloakTime + " EVE",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "SovCommandNodeEventStarted") {
            const campaignEventType = getCampaignEventType(extractAttribute(text, "campaignEventType"));
            const systemId = extractAttribute(text, "solarSystemID");

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];

            return {
                "embed": {
                    "title": "Command Nodes Decloaking",
                    "description": "Command Nodes for the **" + campaignEventType + "** have started to decloak in the [" + constellation["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + constellation["name"].replace(/ /g, "_") + "/) constellation. The structure itself is located in [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/).",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }
        else if (type === "SovStructureDestroyed") {
            const systemId = extractAttribute(text, "solarSystemID");
            const structureTypeId = extractAttribute(text, "structureTypeID");

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            return {
                "embed": {
                    "title": "Sovereignty Structure Destroyed",
                    "description": "The **" + structureType["name"] + "** in [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/) has been destroyed.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }
        else if (type === "SovStructureSelfDestructRequested") {
            const characterId = extractAttribute(text, "charID");
            const destructionTime = extractAttribute(text, "destructTime"); // ???
            const systemId = extractAttribute(text, "solarSystemID");
            const structureTypeId = extractAttribute(text, "structureTypeID");

            const character = (await esi.getCharacter(serverId, characterId))["body"];
            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            return {
                "embed": {
                    "title": "Self Destruct Initiated",
                    "description": "Self Destruct of the **" + structureType["name"] + "** in [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/) has been initiated by [" + character["name"] + "](https://zkillboard.com/character/" + characterId + "/).",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }
        else if (type === "SovStructureSelfDestructCancel") {
            const characterId = extractAttribute(text, "charID");
            const systemId = extractAttribute(text, "solarSystemID");
            const structureTypeId = extractAttribute(text, "structureTypeID");

            const character = (await esi.getCharacter(serverId, characterId))["body"];
            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            return {
                "embed": {
                    "title": "Self Destruct Cancelled",
                    "description": "Self Destruct of the **" + structureType["name"] + "** in [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/) has been cancelled by [" + character["name"] + "](https://zkillboard.com/character/" + characterId + "/).",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }
        else if (type === "SovStructureSelfDestructFinished") {
            const systemId = extractAttribute(text, "solarSystemID");
            const structureTypeId = extractAttribute(text, "structureTypeID");

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            return {
                "embed": {
                    "title": "Structure Self Destructed",
                    "description": "The self destruct of the **" + structureType["name"] + "** in [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/) has been finished.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }
        else if (type === "SovAllClaimAquiredMsg") {
            const allianceId = extractAttribute(text, "allianceID");
            const systemId = extractAttribute(text, "solarSystemID");

            const alliance = (await esi.getAlliance(serverId, allianceId))["body"];
            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];

            return {
                "embed": {
                    "title": "Sovereignty Claimed",
                    "description": "[" + alliance["name"] + "](https://zkillboard.com/alliance/" + allianceId + "/) claimed sovereignty over [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/).",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }
        else if (type === "SovAllClaimLostMsg") {
            const allianceId = extractAttribute(text, "allianceID");
            const systemId = extractAttribute(text, "solarSystemID");

            const alliance = (await esi.getAlliance(serverId, allianceId))["body"];
            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];

            return {
                "embed": {
                    "title": "Sovereignty Lost",
                    "description": "[" + alliance["name"] + "](https://zkillboard.com/alliance/" + allianceId + "/) lost sovereignty over [" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/).",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }

        // Structure
        else if (type === "OwnershipTransferred") {
            const characterId = extractAttribute(text, "charID");
            const newOwnerCorporationId = extractAttribute(text, "newOwnerCorpID");
            const oldOwnerCorporationId = extractAttribute(text, "oldOwnerCorpID");
            const systemId = extractAttribute(text, "solarSystemID");
            const structureName = extractAttribute(text, "structureName");
            const structureTypeId = extractAttribute(text, "structureTypeID");

            const character = (await esi.getCharacter(serverId, characterId))["body"];
            const newOwnerCorporation = (await esi.getCorporation(serverId, newOwnerCorporationId))["body"];
            const oldOwnerCorporation = (await esi.getCorporation(serverId, oldOwnerCorporationId))["body"];
            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            return {
                "embed": {
                    "title": "Ownership Transferred",
                    "description": "[" + character["name"] + "](https://zkillboard.com/character/" + characterId + "/) transferred the ownership of **" + structureName + " (" + structureType["name"] + ")** from [" + oldOwnerCorporation["name"] + "](https://zkillboard.com/corporation/" + oldOwnerCorporationId + "/) to [" + newOwnerCorporation["name"] + "](https://zkillboard.com/corporation/" + newOwnerCorporationId + "/).",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "Structure Location",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "StructureUnderAttack") {
            const aggressor_characterId = extractAttribute(text, "charID");
            const shieldPercentage = (Number(extractAttribute(text, "shieldPercentage"))).toFixed(0);
            const armorPercentage = (Number(extractAttribute(text, "armorPercentage"))).toFixed(0);
            const hullPercentage = (Number(extractAttribute(text, "hullPercentage"))).toFixed(0);
            const systemId = extractAttribute(text, "solarsystemID");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            //const structureName = extractAttribute(text, "structureName");
            let structureId = extractAttribute(text, "structureID");
            structureId = Number(structureId.split(" ")[structureId.split(" ").length - 1]); // Can include "&id001", so we need to do it this way.
            let structureName = (await esi.getUniverseStructure(serverId, userId, characterId, structureId))["body"]["name"];
            structureName = structureName ? structureName : "Unknown Name";

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            // We need to use the names endpoint, because when NPCs attack a structure, the characterId attribute will actually be the corporationId.
            let aggressorCharacter = (await esi.getUniverseNames(serverId, aggressor_characterId))["body"];
            let aggressorCorporation = undefined;

            if (aggressorCharacter["category"] === "corporation") {
                aggressorCorporation = (await esi.getCorporation(serverId, aggressor_characterId))["body"];
                aggressorCharacter = undefined;
            }
            else {
                aggressorCharacter = (await esi.getCharacter(serverId, aggressor_characterId))["body"];
                aggressorCorporation = (await esi.getCorporation(serverId, aggressorCharacter["corporation_id"]))["body"];
            }

            let aggressorAlliance = undefined;

            if (aggressorCorporation["alliance_id"]) {
                aggressorAlliance = (await esi.getAlliance(serverId, aggressorCorporation["alliance_id"]))["body"];
            }

            let aggressorText = "";

            if (aggressorCharacter) {
                aggressorText = "[" + aggressorCharacter["name"] + "](https://zkillboard.com/character/" + aggressorCharacter["id"] + "/)";
            }
            else {
                aggressorText = "[" + aggressorCorporation["name"] + "](https://zkillboard.com/corporation/" + aggressorCorporation["id"] + "/)";
            }


            if (aggressorAlliance) {
                aggressorText += " from [" + aggressorAlliance["name"] + "](https://zkillboard.com/alliance/" + aggressorAlliance["id"] + "/)";
            }
            else {
                aggressorText += " from [" + aggressorCorporation["name"] + "](https://zkillboard.com/corporation/" + aggressorCorporation["id"] + "/)";
            }

            return {
                "embed": {
                    "title": "Structure Under Attack",
                    "description": "**" + structureName + " (" + structureType["name"] + ")** is under attack by " + aggressorText + ".",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "System",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        },
                        {
                            "name": "Structure Health",
                            "value": "Shield               " + shieldPercentage + " %\nArmor              " + armorPercentage + " %\nStructure         " + hullPercentage + " %",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "OrbitalAttacked") {
            const aggressorAllianceId = extractAttribute(text, "aggressorAllianceID");
            const aggressorCorporationId = extractAttribute(text, "aggressorCorpID");
            const aggressorId = extractAttribute(text, "aggressorID");
            const planetId = extractAttribute(text, "planetID");
            const shieldLevel = (Number(extractAttribute(text, "shieldLevel")) * 100).toFixed(0);
            const systemId = extractAttribute(text, "solarSystemID");
            const typeId = extractAttribute(text, "typeID");

            let aggressorAlliance = undefined;

            if (aggressorAllianceId) {
                aggressorAlliance = (await esi.getAlliance(serverId, aggressorAllianceId))["body"];
            }

            const aggressorCorporation = (await esi.getCorporation(serverId, aggressorCorporationId))["body"];
            const aggressorCharacter = (await esi.getCharacter(serverId, aggressorId))["body"];
            const planet = (await esi.getUniversePlanet(serverId, planetId))["body"];
            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, typeId))["body"];

            let aggressorText = "[" + aggressorCharacter["name"] + "](https://zkillboard.com/character/" + aggressorId + "/)";

            if (aggressorAllianceId) {
                aggressorText += " from [" + aggressorAlliance["name"] + "](https://zkillboard.com/alliance/" + aggressorAllianceId + "/)";
            }
            else {
                aggressorText += " from [" + aggressorCorporation["name"] + "](https://zkillboard.com/corporation/" + aggressorCorporationId + "/)";
            }

            return {
                "embed": {
                    "title": "Structure Under Attack",
                    "description": "**" + structureType["name"] + "** is under attack by " + aggressorText + ".",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "System",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        },
                        {
                            "name": "Planet",
                            "value": planet["name"],
                            "inline": true
                        },
                        {
                            "name": "Shield",
                            "value": shieldLevel + "%",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "TowerAlertMsg") {
            const aggressorAllianceId = extractAttribute(text, "aggressorAllianceID");
            const aggressorCorporationId = extractAttribute(text, "aggressorCorpID");
            const aggressorId = extractAttribute(text, "aggressorID");
            const moonId = extractAttribute(text, "moonID");
            const armorValue = (Number(extractAttribute(text, "armorValue")) * 100).toFixed(0);
            const shieldValue = (Number(extractAttribute(text, "shieldValue")) * 100).toFixed(0);
            const hullValue = (Number(extractAttribute(text, "hullValue")) * 100).toFixed(0);
            const systemId = extractAttribute(text, "solarSystemID");
            const typeId = extractAttribute(text, "typeID");

            let aggressorAlliance = undefined;

            if (aggressorAllianceId) {
                aggressorAlliance = (await esi.getAlliance(serverId, aggressorAllianceId))["body"];
            }

            const aggressorCorporation = (await esi.getCorporation(serverId, aggressorCorporationId))["body"];
            const aggressorCharacter = (await esi.getCharacter(serverId, aggressorId))["body"];
            const moon = (await esi.getUniverseMoon(serverId, moonId))["body"];
            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, typeId))["body"];

            let aggressorText = "[" + aggressorCharacter["name"] + "](https://zkillboard.com/character/" + aggressorId + "/)";

            if (aggressorAllianceId) {
                aggressorText += " from [" + aggressorAlliance["name"] + "](https://zkillboard.com/alliance/" + aggressorAllianceId + "/)";
            }
            else {
                aggressorText += " from [" + aggressorCorporation["name"] + "](https://zkillboard.com/corporation/" + aggressorCorporationId + "/)";
            }

            return {
                "embed": {
                    "title": "Tower Under Attack",
                    "description": "**" + structureType["name"] + "** is under attack by " + aggressorText + ".",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "System",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        },
                        {
                            "name": "Moon",
                            "value": moon["name"],
                            "inline": true
                        },
                        {
                            "name": "Structure Health",
                            "value": "Shield               " + shieldValue + " %\nArmor              " + armorValue + " %\nStructure         " + hullValue + " %",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "OrbitalReinforced") {
            const aggressorAllianceId = extractAttribute(text, "aggressorAllianceID");
            const aggressorCorporationId = extractAttribute(text, "aggressorCorpID");
            const aggressorId = extractAttribute(text, "aggressorID");
            const planetId = extractAttribute(text, "planetID");
            const reinforceExitTime = new Date((Number(extractAttribute(text, "reinforceExitTime")) / 10000000 - 11644473600) * 1000).toISOString().replace("T", " ").substring(0, 16);
            const systemId = extractAttribute(text, "solarSystemID");
            const typeId = extractAttribute(text, "typeID");

            let aggressorAlliance = undefined;

            if (aggressorAllianceId) {
                aggressorAlliance = (await esi.getAlliance(serverId, aggressorAllianceId))["body"];
            }

            const aggressorCorporation = (await esi.getCorporation(serverId, aggressorCorporationId))["body"];
            const aggressorCharacter = (await esi.getCharacter(serverId, aggressorId))["body"];
            const planet = (await esi.getUniversePlanet(serverId, planetId))["body"];
            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, typeId))["body"];

            let aggressorText = "[" + aggressorCharacter["name"] + "](https://zkillboard.com/character/" + aggressorId + "/)";

            if (aggressorAllianceId) {
                aggressorText += " from [" + aggressorAlliance["name"] + "](https://zkillboard.com/alliance/" + aggressorAllianceId + "/)";
            }
            else {
                aggressorText += " from [" + aggressorCorporation["name"] + "](https://zkillboard.com/corporation/" + aggressorCorporationId + "/)";
            }

            return {
                "embed": {
                    "title": "Structure Reinforced",
                    "description": "**" + structureType["name"] + "** has been reinforced by " + aggressorText + ".",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "System",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        },
                        {
                            "name": "Planet",
                            "value": planet["name"],
                            "inline": true
                        },
                        {
                            "name": "Reinforce Exit",
                            "value": reinforceExitTime + " EVE",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "StructureFuelAlert") {
            const systemId = extractAttribute(text, "solarsystemID");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            //const structureName = extractAttribute(text, "structureName");
            let structureId = extractAttribute(text, "structureID");
            structureId = Number(structureId.split(" ")[structureId.split(" ").length - 1]); // Can include "&id001", so we need to do it this way.
            let structureName = (await esi.getUniverseStructure(serverId, userId, characterId, structureId))["body"]["name"];
            structureName = structureName ? structureName : "Unknown Name";

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            let listOfRemainingFuel = extractAttribute(text, "listOfTypesAndQty", "\nsolarsystemID:")
            listOfRemainingFuel = listOfRemainingFuel.split("\n");

            let fuelList = "";

            let remainingAmount = undefined;
            let fuelTypeName = undefined;

            for (let i = 0; i < listOfRemainingFuel.length; i++) {
                const fuelPart = listOfRemainingFuel[i];

                if (fuelPart.trim().length === 0) {
                    continue;
                }

                if (fuelPart.startsWith("- - ")) {
                    remainingAmount = fuelPart.substring(4);
                }
                else if (fuelPart.startsWith("  - ")) {
                    const fuelTypeId = fuelPart.substring(4);

                    const fuelType = (await esi.getUniverseType(serverId, fuelTypeId))["body"];
                    fuelTypeName = fuelType["name"];
                }

                if (fuelTypeName && remainingAmount) {
                    fuelList += fuelTypeName + " x " + remainingAmount + "\n";

                    remainingAmount = undefined;
                    fuelTypeName = undefined;
                }
            }

            return {
                "embed": {
                    "title": "Low On Fuel",
                    "description": "**" + structureName + " (" + structureType["name"] + ")** is low on fuel.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "System",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        },
                        {
                            "name": "Remaining Fuel Blocks",
                            "value": fuelList,
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "TowerResourceAlertMsg") {
            const systemId = extractAttribute(text, "solarSystemID");
            const moonId = extractAttribute(text, "moonID");
            const typeId = extractAttribute(text, "typeID");

            const moon = (await esi.getUniverseMoon(serverId, moonId))["body"];
            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, typeId))["body"];

            const remainingFuelParts = text.split("wants:")[1].split("\n");

            let fuelQuantity = undefined;
            let fuelType = undefined;

            for (const part of remainingFuelParts) {
                if (part.includes("quantity:")) {
                    fuelQuantity = part.split(":")[1].trim();
                }
                else if (part.includes("typeID:")) {
                    fuelType = (await esi.getUniverseType(serverId, part.split(":")[1].trim()))["body"];
                }
            }

            return {
                "embed": {
                    "title": "Tower Low On Fuel",
                    "description": "**" + structureType["name"] + "** is low on fuel.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "System",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        },
                        {
                            "name": "Moon",
                            "value": moon["name"],
                            "inline": true
                        },
                        {
                            "name": "Remaining Fuel Blocks",
                            "value": fuelType["name"] + " x " + fuelQuantity,
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "StructureAnchoring") {
            const systemId = extractAttribute(text, "solarsystemID");
            //const structureName = extractAttribute(text, "structureName");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            let structureId = extractAttribute(text, "structureID");
            structureId = Number(structureId.split(" ")[structureId.split(" ").length - 1]); // Can include "&id001", so we need to do it this way.
            let structureName = (await esi.getUniverseStructure(serverId, userId, characterId, structureId))["body"]["name"];
            structureName = structureName ? structureName : "Unknown Name";

            const ownerCorporationLinkData = extractAttribute(text, "ownerCorpLinkData", "\nownerCorpName:");
            const ownerCorporationId = ownerCorporationLinkData.split("\n")[2].substring(2);

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];
            const ownerCorporation = (await esi.getCorporation(serverId, ownerCorporationId))["body"];

            return {
                "embed": {
                    "title": "Structure Anchoring",
                    "description": "**" + structureName + " (" + structureType["name"] + ")** is now anchoring.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "Structure Owner",
                            "value": "[" + ownerCorporation["name"] + "](https://zkillboard.com/corporation/" + ownerCorporationId + "/)",
                            "inline": true
                        },
                        {
                            "name": "Structure Location",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "StructureUnanchoring") {
            const systemId = extractAttribute(text, "solarsystemID");
            //const structureName = extractAttribute(text, "structureName");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            let structureId = extractAttribute(text, "structureID");
            structureId = Number(structureId.split(" ")[structureId.split(" ").length - 1]); // Can include "&id001", so we need to do it this way.
            let structureName = (await esi.getUniverseStructure(serverId, userId, characterId, structureId))["body"]["name"];
            structureName = structureName ? structureName : "Unknown Name";

            const ownerCorporationLinkData = extractAttribute(text, "ownerCorpLinkData", "\nownerCorpName:");
            const ownerCorporationId = ownerCorporationLinkData.split("\n")[2].substring(2);

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];
            const ownerCorporation = (await esi.getCorporation(serverId, ownerCorporationId))["body"];

            return {
                "embed": {
                    "title": "Structure Unanchoring",
                    "description": "**" + structureName + " (" + structureType["name"] + ")** began to unanchor.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "Structure Owner",
                            "value": "[" + ownerCorporation["name"] + "](https://zkillboard.com/corporation/" + ownerCorporationId + "/)",
                            "inline": true
                        },
                        {
                            "name": "Structure Location",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "StructureOnline") {
            const systemId = extractAttribute(text, "solarsystemID");
            //const structureName = extractAttribute(text, "structureName");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            let structureId = extractAttribute(text, "structureID");
            structureId = Number(structureId.split(" ")[structureId.split(" ").length - 1]); // Can include "&id001", so we need to do it this way.
            let structureName = (await esi.getUniverseStructure(serverId, userId, characterId, structureId))["body"]["name"];
            structureName = structureName ? structureName : "Unknown Name";

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            return {
                "embed": {
                    "title": "Structure Online",
                    "description": "**" + structureName + " (" + structureType["name"] + ")** is now online.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "Structure Location",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "StructureWentHighPower") {
            const systemId = extractAttribute(text, "solarsystemID");
            //const structureName = extractAttribute(text, "structureName");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            let structureId = extractAttribute(text, "structureID");
            structureId = Number(structureId.split(" ")[structureId.split(" ").length - 1]); // Can include "&id001", so we need to do it this way.
            let structureName = (await esi.getUniverseStructure(serverId, userId, characterId, structureId))["body"]["name"];
            structureName = structureName ? structureName : "Unknown Name";

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            return {
                "embed": {
                    "title": "Structure Went High Power",
                    "description": "**" + structureName + " (" + structureType["name"] + ")** switched to high power mode.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "Structure Location",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "StructureWentLowPower") {
            const systemId = extractAttribute(text, "solarsystemID");
            //const structureName = extractAttribute(text, "structureName");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            let structureId = extractAttribute(text, "structureID");
            structureId = Number(structureId.split(" ")[structureId.split(" ").length - 1]); // Can include "&id001", so we need to do it this way.
            let structureName = (await esi.getUniverseStructure(serverId, userId, characterId, structureId))["body"]["name"];
            structureName = structureName ? structureName : "Unknown Name";

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            return {
                "embed": {
                    "title": "Structure Went Low Power",
                    "description": "**" + structureName + " (" + structureType["name"] + ")** switched to low power mode.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "Structure Location",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "StructureServicesOffline") {
            const systemId = extractAttribute(text, "solarsystemID");
            //const structureName = extractAttribute(text, "structureName");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            let structureId = extractAttribute(text, "structureID");
            structureId = Number(structureId.split(" ")[structureId.split(" ").length - 1]); // Can include "&id001", so we need to do it this way.
            let structureName = (await esi.getUniverseStructure(serverId, userId, characterId, structureId))["body"]["name"];
            structureName = structureName ? structureName : "Unknown Name";

            const listOfServiceModuleIds = extractAttribute(text, "listOfServiceModuleIDs", "\nsolarsystemID:").split("\n");
            let serviceModuleText = "";

            for (let i = 0; i < listOfServiceModuleIds.length; i++) {
                const serviceModuleId = listOfServiceModuleIds[i].substring(2);

                const serviceModule = (await esi.getUniverseType(serverId, serviceModuleId))["body"];
                serviceModuleText += serviceModule["name"];

                if (i + 1 < listOfServiceModuleIds.length) {
                    serviceModuleText += "\n";
                }
            }

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            return {
                "embed": {
                    "title": "Structure Services Offline",
                    "description": "Services on **" + structureName + " (" + structureType["name"] + ")** are now offline.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "Affected Services",
                            "value": serviceModuleText,
                            "inline": true
                        },
                        {
                            "name": "Structure Location",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "StructureImpendingAbandonmentAssetsAtRisk") {
            const systemId = extractAttribute(text, "solarsystemID");
            const structureTypeId = extractAttribute(text, "structureTypeID");
            const structureLink = extractAttribute(text, "structureLink");
            const structureName = structureLink.split(">")[1].split("<")[0];
            const daysUntilAbandon = extractAttribute(text, "daysUntilAbandon");
            const isCorpOwned = extractAttribute(text, "isCorpOwned");

            if (isCorpOwned === "false") {
                return;
            }

            const system = (await esi.getUniverseSystem(serverId, systemId))["body"];
            const constellation = (await esi.getUniverseConstellation(serverId, system["constellation_id"]))["body"];
            const region = (await esi.getUniverseRegion(serverId, constellation["region_id"]))["body"];
            const structureType = (await esi.getUniverseType(serverId, structureTypeId))["body"];

            return {
                "embed": {
                    "title": "Structure Becoming Abandoned",
                    "description": "The structure **" + structureName + " (" + structureType["name"] + ")** will become abandoned in **" + daysUntilAbandon + " day(s)** and asset safety will no longer work.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "Structure Location",
                            "value": "[" + system["name"] + "](https://evemaps.dotlan.net/map/" + region["name"].replace(/ /g, "_") + "/" + system["name"].replace(/ /g, "_") + "/)",
                            "inline": true
                        }
                    ]
                }
            };
        }

        // War
        else if (type === "AllWarDeclaredMsg") {
            const against_id = extractAttribute(text, "againstID");
            const cost = formatIsk(extractAttribute(text, "cost"));
            const declaredById = extractAttribute(text, "declaredByID");

            const against = (await esi.getUniverseNames(serverId, against_id))["body"][0];
            const declaredBy = (await esi.getUniverseNames(serverId, declaredById))["body"][0];

            return {
                "embed": {
                    "title": "War Declared",
                    "description": "[" + declaredBy["name"] + "](https://zkillboard.com/" + declaredBy["category"] + "/" + declaredById + "/) declared war on [" + against["name"] + "](https://zkillboard.com/" + against["category"] + "/" + against_id + "/). The war cost amounts to **" + cost + " ISK**.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }
        else if (type === "CorpWarDeclaredMsg") {
            const against_id = extractAttribute(text, "againstID");
            const cost = formatIsk(extractAttribute(text, "cost"));
            const declaredById = extractAttribute(text, "declaredByID");

            const against = (await esi.getUniverseNames(serverId, against_id))["body"][0];
            const declaredBy = (await esi.getUniverseNames(serverId, declaredById))["body"][0];

            return {
                "embed": {
                    "title": "War Declared",
                    "description": "[" + declaredBy["name"] + "](https://zkillboard.com/" + declaredBy["category"] + "/" + declaredById + "/) declared war on [" + against["name"] + "](https://zkillboard.com/" + against["category"] + "/" + against_id + "/). The war cost amounts to **" + cost + " ISK**.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }
        else if (type === "AllWarInvalidatedMsg") {
            const against_id = extractAttribute(text, "againstID");
            const declaredById = extractAttribute(text, "declaredByID");

            const against = (await esi.getUniverseNames(serverId, against_id))["body"][0];
            const declaredBy = (await esi.getUniverseNames(serverId, declaredById))["body"][0];

            return {
                "embed": {
                    "title": "War Invalidated",
                    "description": "The war between [" + declaredBy["name"] + "](https://zkillboard.com/" + declaredBy["category"] + "/" + declaredById + "/) and [" + against["name"] + "](https://zkillboard.com/" + against["category"] + "/" + against_id + "/) has been invalidated.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }
        else if (type === "CorpWarInvalidatedMsg") {
            const against_id = extractAttribute(text, "againstID");
            const declaredById = extractAttribute(text, "declaredByID");

            const against = (await esi.getUniverseNames(serverId, against_id))["body"][0];
            const declaredBy = (await esi.getUniverseNames(serverId, declaredById))["body"][0];

            return {
                "embed": {
                    "title": "War Invalidated",
                    "description": "The war between [" + declaredBy["name"] + "](https://zkillboard.com/" + declaredBy["category"] + "/" + declaredById + "/) and [" + against["name"] + "](https://zkillboard.com/" + against["category"] + "/" + against_id + "/) has been invalidated.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    }
                }
            };
        }
        else if (type === "AllyJoinedWarAggressorMsg") {
            const allyId = extractAttribute(text, "allyID");
            const defenderId = extractAttribute(text, "defenderID");
            const startTime = new Date((Number(extractAttribute(text, "startTime")) / 10000000 - 11644473600) * 1000).toISOString().replace("T", " ").substring(0, 16);

            const ally = (await esi.getUniverseNames(serverId, allyId))["body"][0];
            const defender = (await esi.getUniverseNames(serverId, defenderId))["body"][0];

            let aggressorText = undefined;

            if (allianceId) {
                aggressorText = "[" + allianceName + "](https://zkillboard.com/alliance/" + allianceId + "/)";
            }
            else {
                aggressorText = "[" + corporationName + "](https://zkillboard.com/corporation/" + corporationId + "/)";
            }

            return {
                "embed": {
                    "title": "Ally Joined War",
                    "description": "A new ally joined a war " + aggressorText + " is involved in to aid the defending side.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "Aggressor",
                            "value": aggressorText,
                            "inline": true
                        },
                        {
                            "name": "Defender",
                            "value": "[" + defender["name"] + "](https://zkillboard.com/" + defender["category"] + "/" + defenderId + "/)",
                            "inline": true
                        },
                        {
                            "name": "New Ally",
                            "value": "[" + ally["name"] + "](https://zkillboard.com/" + ally["category"] + "/" + allyId + "/)",
                            "inline": true
                        },
                        {
                            "name": "Ally Can Fight",
                            "value": startTime + " EVE",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "AllyJoinedWarAllyMsg") {
            const aggressorId = extractAttribute(text, "aggressorID");
            const allyId = extractAttribute(text, "allyID");
            const defenderId = extractAttribute(text, "defenderID");
            const startTime = new Date((Number(extractAttribute(text, "startTime")) / 10000000 - 11644473600) * 1000).toISOString().replace("T", " ").substring(0, 16);

            const aggressor = (await esi.getUniverseNames(serverId, aggressorId))["body"][0];
            const ally = (await esi.getUniverseNames(serverId, allyId))["body"][0];
            const defender = (await esi.getUniverseNames(serverId, defenderId))["body"][0];

            let allyText = undefined;

            if (allianceId) {
                allyText = "[" + allianceName + "](https://zkillboard.com/alliance/" + allianceId + "/)";
            }
            else {
                allyText = "[" + corporationName + "](https://zkillboard.com/corporation/" + corporationId + "/)";
            }

            return {
                "embed": {
                    "title": "Ally Joined War",
                    "description": "A new ally joined a war " + allyText + " is involved in to aid the defending side.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "Aggressor",
                            "value": "[" + aggressor["name"] + "](https://zkillboard.com/" + aggressor["category"] + "/" + aggressorId + "/)",
                            "inline": true
                        },
                        {
                            "name": "Defender",
                            "value": "[" + defender["name"] + "](https://zkillboard.com/" + defender["category"] + "/" + defenderId + "/)",
                            "inline": true
                        },
                        {
                            "name": "New Ally",
                            "value": "[" + ally["name"] + "](https://zkillboard.com/" + ally["category"] + "/" + allyId + "/)",
                            "inline": true
                        },
                        {
                            "name": "Ally Can Fight",
                            "value": startTime + " EVE",
                            "inline": true
                        }
                    ]
                }
            };
        }
        else if (type === "AllyJoinedWarDefenderMsg") {
            const aggressorId = extractAttribute(text, "aggressorID");
            const allyId = extractAttribute(text, "allyID");
            const startTime = new Date((Number(extractAttribute(text, "startTime")) / 10000000 - 11644473600) * 1000).toISOString().replace("T", " ").substring(0, 16);

            const aggressor = (await esi.getUniverseNames(serverId, aggressorId))["body"][0];
            const ally = (await esi.getUniverseNames(serverId, allyId))["body"][0];

            let defenderText = undefined;

            if (allianceId) {
                defenderText = "[" + allianceName + "](https://zkillboard.com/alliance/" + allianceId + "/)";
            }
            else {
                defenderText = "[" + corporationName + "](https://zkillboard.com/corporation/" + corporationId + "/)";
            }

            return {
                "embed": {
                    "title": "Ally Joined War",
                    "description": "A new ally joined a war " + defenderText + " is involved in to aid the defending side.",
                    "color": color,
                    "timestamp": timestamp,
                    "footer": {
                        "text": "ID " + notificationId
                    },
                    "thumbnail": {
                        "url": imageUrl
                    },
                    "fields": [
                        {
                            "name": "Aggressor",
                            "value": "[" + aggressor["name"] + "](https://zkillboard.com/" + aggressor["category"] + "/" + aggressorId + "/)",
                            "inline": true
                        },
                        {
                            "name": "Defender",
                            "value": defenderText,
                            "inline": true
                        },
                        {
                            "name": "New Ally",
                            "value": "[" + ally["name"] + "](https://zkillboard.com/" + ally["category"] + "/" + allyId + "/)",
                            "inline": true
                        },
                        {
                            "name": "Ally Can Fight",
                            "value": startTime + " EVE",
                            "inline": true
                        }
                    ]
                }
            };
        }
    }
    catch(notificationError) {
        const message = {};

        if (notificationError instanceof Error) {
            message["date"] = new Date().toISOString();
            message["error"] = notificationError.stack;
            message["meta"] = {
                "notification_id": notificationId,
                "sender_id": senderId,
                "sender_type": senderType,
                "text": text,
                "timestamp": timestamp,
                "type": type,
                "character_id": characterId,
                "character_name": characterName,
                "corporation_id": corporationId,
                "corporation_name": corporationName,
                "alliance_id": allianceId,
                "alliance_name": allianceName
            }
        }
        else {
            message["date"] = new Date().toISOString();
            message["error"] = notificationError;
            message["meta"] = {
                "notification_id": notificationId,
                "sender_id": senderId,
                "sender_type": senderType,
                "text": text,
                "timestamp": timestamp,
                "type": type,
                "character_id": characterId,
                "character_name": characterName,
                "corporation_id": corporationId,
                "corporation_name": corporationName,
                "alliance_id": allianceId,
                "alliance_name": allianceName
            }
        }

        await new Promise((resolve, reject) => {
            const stream = fs.createWriteStream(
                "./data/discord/notifications.error",
                {
                    encoding: "utf-8",
                    mode: 0o666,
                    flags: "a"
                }
            );

            stream.write(JSON.stringify(message) + "\n\n", (error) => {
                if (error) { reject(error); }
            });

            stream.end();

            resolve();
        });
    }
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Number} characterId 
 * @param {Object} notifications 
 */
async function post(serverId, userId, characterId, notifications) {
    let save = false;

    const tokens = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token.json");
    const tokenDetails = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");

    // Get the token used with this character.
    let token = undefined;
    const refreshTokenList = Object.keys(tokenDetails);

    for (let i = 0; i < refreshTokenList.length; i++) {
        const refreshToken = refreshTokenList[i];
        const tokenDetail = tokenDetails[refreshToken];

        if (Number(tokenDetail["body"]["CharacterID"]) !== Number(characterId)) {
            continue;
        }

        for (let j = 0; j < tokens.length; j++) {
            token = tokens[j];

            if (token["body"]["refresh_token"] === refreshToken) {
                break;
            }
        }

        break;
    }

    const notificationLog = await disk.loadFile("./data/discord/server/" + serverId + "/modules/notification/notification_log.json");
    const moduleStartTime = new Date(notificationLog["active_since"]);

    const sortedNotificationIdList = [];
    const notificationList = {};

    for (let i = 0; i < notifications["body"].length; i++) {
        const notification = notifications["body"][i];

        // Only consider notifications that happened after the module start.
        let timestamp = new Date(notification["timestamp"]);

        if (timestamp < moduleStartTime) {
            continue;
        }

        // Only consider notifications that happened after the user registered his ESI key.
        timestamp = new Date(notification["timestamp"]);

        let registeredOn = token["registered_on"];
        registeredOn = registeredOn ? new Date(registeredOn) : new Date(0);

        if (timestamp < registeredOn) {
            continue;
        }

        // Get notification details for the character.
        const notificationId = Number(notification["notification_id"]);

        if (!sortedNotificationIdList.includes(notificationId)) {
            sortedNotificationIdList.push(notificationId);
            notificationList[notificationId] = notification;

            const affiliation = await esi.getCharacterAffiliation(serverId, characterId);

            const character = await esi.getCharacter(serverId, characterId);
            const corporationId = affiliation["body"][0]["corporation_id"];

            notificationList[notificationId]["character_id"] = characterId;
            notificationList[notificationId]["character_name"] = character["body"]["name"];

            const corporation = await esi.getCorporation(serverId, corporationId);
            const allianceId = affiliation["body"][0]["alliance_id"];

            notificationList[notificationId]["corporation_id"] = corporationId;
            notificationList[notificationId]["corporation_name"] = corporation["body"]["name"];

            if (allianceId) {
                const alliance = await esi.getAlliance(serverId, allianceId);

                notificationList[notificationId]["alliance_id"] = allianceId;
                notificationList[notificationId]["alliance_name"] = alliance["body"]["name"];
            }

            const factionId = affiliation["body"][0]["faction_id"];

            if (factionId) {
                const factions = await esi.getUniverseFactions(serverId);

                for (let i = 0; i < factions["body"].length; i++) {
                    const faction = factions["body"][i];

                    if (Number(faction["faction_id"]) === Number(factionId)) {
                        notificationList[notificationId]["faction_id"] = factionId;
                        notificationList[notificationId]["faction_name"] = faction["name"];
                    }
                }
            }
        }
    }

    sortedNotificationIdList.sort((a, b) => a - b);

    const notificationConfiguration = await disk.loadFile("./data/discord/server/" + serverId + "/modules/notification/notifications.json");
    const notificationConfigurationIdList = Object.keys(notificationConfiguration);

    const postedNotificationIdList = notificationLog["posted_notifications"].sort((a, b) => a - b);

    for (let i = 0; i < sortedNotificationIdList.length; i++) {
        const notificationId = Number(sortedNotificationIdList[i]);

        // Only consider notifications that have a higher id than the first element in the already posted notifications.
        if (postedNotificationIdList.length > 0) {
            if (Number(postedNotificationIdList[0]) > Number(notificationId)) {
                continue;
            }
        }

        // Only consider notifications that have not been posted already.
        if (postedNotificationIdList.includes(notificationId)) {
            continue;
        }
        else {
            postedNotificationIdList.push(notificationId);

            save = true;
        }

        const notification = notificationList[notificationId];

        for (let j = 0; j < notificationConfigurationIdList.length; j++) {
            const notificationConfigurationId = notificationConfigurationIdList[j];
            const notificationConfigurationData = notificationConfiguration[notificationConfigurationId];

            const postType = notificationConfigurationData["notifications"];

            // If the notification type does not match, skip.
            if (postType[notification["type"]] !== "yes") {
                continue;
            }

            const postFilter = notificationConfigurationData["filter"];

            // If none of the filters fit the character, skip.
            if ((!notification["faction_name"] || !postFilter["factions"].includes(notification["faction_name"])) &&
                (!notification["alliance_name"] || !postFilter["alliances"].includes(notification["alliance_name"])) &&
                (!notification["corporation_name"] || !postFilter["corporations"].includes(notification["corporation_name"]))
            ) {
                continue;
            }

            const postChannel = notificationConfigurationData["channel"];
            const postColor = hexToInt(notificationConfigurationData["colors"][notification["type"]]);

            const notificationMessage = await extractInformation(serverId, userId, notification, postColor);

            if (!notificationMessage) {
                continue;
            }

            const messageOptions = notificationConfigurationData["options"];

            const status = await discord.postNotification(serverId, postChannel, notificationMessage, messageOptions);

            // Notify the operators if there are any problems with notifications.
            // If they do not get fixed within 7 days, the problematic notifications will be deleted.
            await discord.notifyOperators(serverId, notificationConfigurationId, status);
        }
    }

    if (save) {
        postedNotificationIdList.sort((a, b) => a - b);

        while (postedNotificationIdList.length > 1000) {
            postedNotificationIdList.shift();
        }

        await disk.writeFile("./data/discord/server/" + serverId + "/modules/notification/notification_log.json", notificationLog);
    }
}

module.exports.data = data;
module.exports.post = post;