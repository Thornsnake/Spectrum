//@ts-check

"use strict";

const esi = require("../../esi.js");
const disk = require("../../disk.js");
const bot = require("../../bot.js");
const socket = require("../../socket.js");
const output = require("../../output.js");

const endpoints = require("./endpoints.js");

/**
 * 
 * @param {String} serverId 
 * @param {String} characterId 
 */
async function getCharacter(serverId, characterId) {
    return await esi.getCharacter(serverId, characterId);
}

/**
 * 
 * @param {String} serverId 
 * @param {String} corporationId 
 */
async function getCorporation(serverId, corporationId) {
    return await esi.getCorporation(serverId, corporationId);
}

/**
 * 
 * @param {String} serverId 
 * @param {String} allianceId 
 */
async function getAlliance(serverId, allianceId) {
    if (!allianceId) {
        return;
    }

    return await esi.getAlliance(serverId, allianceId);
}

/**
 * 
 * @param {String} serverId 
 * @param {String} characterId 
 */
async function getCorporationOfCharacter(serverId, characterId) {
    const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
    //const character = await esi.getCharacter(serverId, characterId);
    //const corporationId = character["body"]["corporation_id"];

    return await getCorporation(serverId, affiliation["body"][0]["corporation_id"]);
}

/**
 * 
 * @param {String} serverId 
 * @param {String} characterId 
 */
async function getAllianceOfCharacter(serverId, characterId) {
    const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
    //const character = await esi.getCharacter(serverId, characterId);
    //const corporation = await getCorporation(serverId, character["body"]["corporation_id"]);
    //const allianceId = corporation["body"]["alliance_id"];
    
    return await getAlliance(serverId, affiliation["body"][0]["alliance_id"]);
}

/**
 * 
 * @param {String} serverId 
 * @param {String} entityType 
 * @param {String} entityName 
 */
async function entityNameToId(serverId, entityType, entityName) {
    // Valid entityTypes: agents, alliances, characters, constellations, corporations, factions, inventory_types, regions, stations, systems.

    const entityDetails = await esi.getUniverseIds(serverId, entityName);

    if (Object.keys(entityDetails["body"]).length === 0) {
        return;
    }

    if (!(entityType in entityDetails["body"])) {
        return;
    }

    return entityDetails["body"][entityType][0]["id"];
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {String} characterId 
 * @param {String} endpoint 
 */
async function getValueP1(serverId, userId, characterId, endpoint) {
    const value = []; // [Value, Data Type ("string", "number", "boolean")]

    if (endpoint === "te-endpoints-discord-authentication-is_authenticated") {
        let tokens = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token.json");
        tokens = tokens ? tokens : [];

        if (tokens.length > 0) {
            for (let i = 0; i < tokens.length; i++) {
                const refreshToken = tokens[i]["body"]["refresh_token"];

                let tokenDetails = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");
                tokenDetails = tokenDetails ? tokenDetails : {};

                const tokenDetail = tokenDetails[refreshToken];

                if (tokenDetail["validity"] !== "invalid") {
                    value.push([true, "boolean"]);
                    break;
                }
            }

            if (value.length === 0) {
                value.push([false, "boolean"]);
            }
        }
        else {
            value.push([false, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-discord-roles-role_name") {
        const server = await bot.client.guilds.fetch(serverId);
        const member = await server.members.fetch(userId);
        const roles = member.roles;

        const roleKeys = roles.cache.keyArray();

        for (let i = 0; i < roleKeys.length; i++) {
            const roleKey = roleKeys[i];
            const role = roles.cache.get(roleKey);

            value.push([role.name, "string"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-in_alliance") {
        const corporation = await getCorporationOfCharacter(serverId, characterId);
        const allianceId = corporation["body"]["alliance_id"];

        if (allianceId) {
            value.push([true, "boolean"]);
        }
        else {
            value.push([false, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-id") {
        const corporation = await getCorporationOfCharacter(serverId, characterId);
        const allianceId = corporation["body"]["alliance_id"];

        if (allianceId) {
            value.push([allianceId, "number"]);
        }
        else {
            value.push([undefined, "number"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-name") {
        const alliance = await getAllianceOfCharacter(serverId, characterId);

        if (alliance) {
            const allianceName = alliance["body"]["name"];

            value.push([allianceName, "string"]);
        }
        else {
            value.push([undefined, "string"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-ticker") {
        const alliance = await getAllianceOfCharacter(serverId, characterId);

        if (alliance) {
            const allianceTicker = alliance["body"]["ticker"];

            value.push([allianceTicker, "string"]);
        }
        else {
            value.push([undefined, "string"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-creator-id") {
        const alliance = await getAllianceOfCharacter(serverId, characterId);

        if (alliance) {
            const allianceCreatorId = alliance["body"]["creator_id"];

            value.push([allianceCreatorId, "number"]);
        }
        else {
            value.push([undefined, "number"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-creator-name") {
        const alliance = await getAllianceOfCharacter(serverId, characterId);

        if (alliance) {
            const allianceCreatorId = alliance["body"]["creator_id"];
            const allianceCreator = await getCharacter(serverId, allianceCreatorId);
            const allianceCreatorName = allianceCreator["body"]["name"];

            value.push([allianceCreatorName, "string"]);
        }
        else {
            value.push([undefined, "string"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-creator-corporation_id") {
        const alliance = await getAllianceOfCharacter(serverId, characterId);

        if (alliance) {
            const allianceCreatorCorporationId = alliance["body"]["creator_corporation_id"];

            value.push([allianceCreatorCorporationId, "number"]);
        }
        else {
            value.push([undefined, "number"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-creator-corporation_name") {
        const alliance = await getAllianceOfCharacter(serverId, characterId);

        if (alliance) {
            const allianceCreatorCorporationId = alliance["body"]["creator_corporation_id"];
            const allianceCreatorCorporation = await getCorporation(serverId, allianceCreatorCorporationId);
            const allianceCreatorCorporationName = allianceCreatorCorporation["body"]["name"];

            value.push([allianceCreatorCorporationName, "string"]);
        }
        else {
            value.push([undefined, "string"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-creator-corporation_ticker") {
        const alliance = await getAllianceOfCharacter(serverId, characterId);

        if (alliance) {
            const allianceCreatorCorporationId = alliance["body"]["creator_corporation_id"];
            const allianceCreatorCorporation = await getCorporation(serverId, allianceCreatorCorporationId);
            const allianceCreatorCorporationTicker = allianceCreatorCorporation["body"]["ticker"];

            value.push([allianceCreatorCorporationTicker, "string"]);
        }
        else {
            value.push([undefined, "string"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-executor-corporation_id") {
        const alliance = await getAllianceOfCharacter(serverId, characterId);

        if (alliance) {
            const allianceExecutorCorporationId = alliance["body"]["executor_corporation_id"];

            value.push([allianceExecutorCorporationId, "number"]);
        }
        else {
            value.push([undefined, "number"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-executor-corporation_name") {
        const alliance = await getAllianceOfCharacter(serverId, characterId);

        if (alliance) {
            const allianceExecutorCorporationId = alliance["body"]["creator_corporation_id"];
            const allianceExecutorCorporation = await getCorporation(serverId, allianceExecutorCorporationId);
            const allianceExecutorCorporationName = allianceExecutorCorporation["body"]["name"];

            value.push([allianceExecutorCorporationName, "string"]);
        }
        else {
            value.push([undefined, "string"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-executor-corporation_ticker") {
        const alliance = await getAllianceOfCharacter(serverId, characterId);

        if (alliance) {
            const allianceExecutorCorporationId = alliance["body"]["executor_corporation_id"];
            const allianceExecutorCorporation = await getCorporation(serverId, allianceExecutorCorporationId);
            const allianceExecutorCorporationTicker = allianceExecutorCorporation["body"]["ticker"];

            value.push([allianceExecutorCorporationTicker, "string"]);
        }
        else {
            value.push([undefined, "string"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-faction-enlisted") {
        const alliance = await getAllianceOfCharacter(serverId, characterId);

        if (alliance) {
            const enlisted = "faction_id" in alliance["body"];

            value.push([enlisted, "boolean"]);
        }
        else {
            value.push([false, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-faction-id") {
        const alliance = await getAllianceOfCharacter(serverId, characterId);

        if (alliance) {
            const factionId = alliance["faction_id"];

            value.push([factionId, "number"]);
        }
        else {
            value.push([undefined, "number"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-alliance-faction-name") {
        const alliance = await getAllianceOfCharacter(serverId, characterId);

        if (alliance) {
            const factionId = alliance["body"]["faction_id"];

            if (factionId) {
                const factions = await esi.getUniverseFactions(serverId);

                for (let i = 0; i < factions["body"].length; i++) {
                    const faction = factions["body"][i];

                    if (Number(faction["faction_id"]) === Number(factionId)) {
                        value.push([faction["name"], "string"]);

                        break;
                    }
                }
            }
        }
        else {
            value.push([undefined, "string"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-id") {
        const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
        const corporationId = affiliation["body"][0]["corporation_id"];

        value.push([corporationId, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-name") {
        const corporation = await getCorporationOfCharacter(serverId, characterId);
        const corporationName = corporation["body"]["name"];

        value.push([corporationName, "string"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-ticker") {
        const corporation = await getCorporationOfCharacter(serverId, characterId);
        const corporationTicker = corporation["body"]["ticker"];

        value.push([corporationTicker, "string"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-member_count") {
        const corporation = await getCorporationOfCharacter(serverId, characterId);
        const corporationMemberCount = corporation["body"]["member_count"];

        value.push([corporationMemberCount, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-tax_rate") {
        const corporation = await getCorporationOfCharacter(serverId, characterId);
        let corporationTaxRate = corporation["body"]["tax_rate"];

        corporationTaxRate = Number(corporationTaxRate) * 100;

        value.push([corporationTaxRate, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-war_eligible") {
        const corporation = await getCorporationOfCharacter(serverId, characterId);
        const corporationWarEligible = corporation["body"]["war_eligible"];

        value.push([corporationWarEligible, "boolean"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-ceo-id") {
        const corporation = await getCorporationOfCharacter(serverId, characterId);
        const corporationCeoId = corporation["body"]["ceo_id"];

        value.push([corporationCeoId, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-ceo-name") {
        const corporation = await getCorporationOfCharacter(serverId, characterId);
        const corporationCeoId = corporation["body"]["ceo_id"];

        const ceo = await getCharacter(serverId, corporationCeoId);
        const ceoName = ceo["body"]["name"];

        value.push([ceoName, "string"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-ceo-is_ceo") {
        const corporation = await getCorporationOfCharacter(serverId, characterId);
        const corporationCeoId = corporation["body"]["ceo_id"];

        if (Number(characterId) === Number(corporationCeoId)) {
            value.push([true, "boolean"]);
        }
        else {
            value.push([false, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-faction-enlisted") {
        const corporation = await getCorporationOfCharacter(serverId, characterId);
        const enlisted = "faction_id" in corporation["body"];

        value.push([enlisted, "boolean"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-faction-id") {
        const corporation = await getCorporationOfCharacter(serverId, characterId);
        const factionId = corporation["body"]["faction_id"];

        value.push([factionId, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-faction-name") {
        const corporation = await getCorporationOfCharacter(serverId, characterId);
        const factionId = corporation["body"]["faction_id"];

        if (factionId) {
            const factions = await esi.getUniverseFactions(serverId);

            for (let i = 0; i < factions["body"].length; i++) {
                const faction = factions["body"][i];

                if (Number(faction["faction_id"]) === Number(factionId)) {
                    value.push([faction["name"], "string"]);

                    break;
                }
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-faction-kills-yesterday") {
        const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
        const corporationId = affiliation["body"][0]["corporation_id"];
        const fwStats = await esi.getCorporationFwStats(serverId, corporationId);

        const killsYesterday = fwStats["body"]["kills"]["yesterday"];

        value.push([killsYesterday, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-faction-kills-last_week") {
        const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
        const corporationId = affiliation["body"][0]["corporation_id"];
        const fwStats = await esi.getCorporationFwStats(serverId, corporationId);

        const killsLastWeek = fwStats["body"]["kills"]["last_week"];

        value.push([killsLastWeek, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-faction-kills-total") {
        const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
        const corporationId = affiliation["body"][0]["corporation_id"];
        const fwStats = await esi.getCorporationFwStats(serverId, corporationId);

        const killsTotal = fwStats["body"]["kills"]["total"];

        value.push([killsTotal, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-faction-victory_points-yesterday") {
        const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
        const corporationId = affiliation["body"][0]["corporation_id"];
        const fwStats = await esi.getCorporationFwStats(serverId, corporationId);

        const victoryPointsYesterday = fwStats["body"]["victory_points"]["yesterday"];

        value.push([victoryPointsYesterday, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-faction-victory_points-last_week") {
        const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
        const corporationId = affiliation["body"][0]["corporation_id"];
        const fwStats = await esi.getCorporationFwStats(serverId, corporationId);

        const victoryPointsLastWeek = fwStats["body"]["victory_points"]["last_week"];

        value.push([victoryPointsLastWeek, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-corporation-faction-victory_points-total") {
        const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
        const corporationId = affiliation["body"][0]["corporation_id"];
        const fwStats = await esi.getCorporationFwStats(serverId, corporationId);

        const victoryPointsTotal = fwStats["body"]["victory_points"]["total"];

        value.push([victoryPointsTotal, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-id") {
        value.push([characterId, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-name") {
        const character = await getCharacter(serverId, characterId);
        const characterName = character["body"]["name"];

        value.push([characterName, "string"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-security_status") {
        const character = await getCharacter(serverId, characterId);
        const characterSecurityStatus = character["body"]["security_status"];

        value.push([characterSecurityStatus, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-age") {
        const character = await getCharacter(serverId, characterId);
        const characterBirthday = new Date(character["body"]["birthday"]);
        const dateNow = new Date();

        const diffTime = Math.abs(dateNow.getTime() - characterBirthday.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        value.push([diffDays, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-faction-enlisted") {
        const character = await getCharacter(serverId, characterId);
        const enlisted = "faction_id" in character["body"];

        value.push([enlisted, "boolean"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-faction-id") {
        const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
        const factionId = affiliation["body"][0]["faction_id"];

        value.push([factionId, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-faction-name") {
        const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
        const factionId = affiliation["body"][0]["faction_id"];

        if (factionId) {
            const factions = await esi.getUniverseFactions(serverId);

            for (let i = 0; i < factions["body"].length; i++) {
                const faction = factions["body"][i];

                if (Number(faction["faction_id"]) === Number(factionId)) {
                    value.push([faction["name"], "string"]);

                    break;
                }
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-faction-kills-yesterday") {
        const fwStats = await esi.getCharacterFwStats(serverId, userId, characterId);
        const killsYesterday = fwStats["body"]["kills"]["yesterday"];

        value.push([killsYesterday, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-faction-kills-last_week") {
        const fwStats = await esi.getCharacterFwStats(serverId, userId, characterId);
        const killsLastWeek = fwStats["body"]["kills"]["last_week"];

        value.push([killsLastWeek, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-faction-kills-total") {
        const fwStats = await esi.getCharacterFwStats(serverId, userId, characterId);
        const killsTotal = fwStats["body"]["kills"]["total"];

        value.push([killsTotal, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-faction-victory_points-yesterday") {
        const fwStats = await esi.getCharacterFwStats(serverId, userId, characterId);
        const victoryPointsYesterday = fwStats["body"]["victory_points"]["yesterday"];

        value.push([victoryPointsYesterday, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-faction-victory_points-last_week") {
        const fwStats = await esi.getCharacterFwStats(serverId, userId, characterId);
        const victoryPointsLastWeek = fwStats["body"]["victory_points"]["last_week"];

        value.push([victoryPointsLastWeek, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-faction-victory_points-total") {
        const fwStats = await esi.getCharacterFwStats(serverId, userId, characterId);
        const victoryPointsTotal = fwStats["body"]["victory_points"]["total"];

        value.push([victoryPointsTotal, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-fatigue-jump_fatigue") {
        const fatigue = await esi.getCharacterFatigue(serverId, userId, characterId);
        const jumpFatigueExpireDate = fatigue["body"]["jump_fatigue_expire_date"];

        const currentDate = new Date();
        const expiryDate = new Date(jumpFatigueExpireDate);

        if (currentDate > expiryDate) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-lineage-ancestry_id") {
        const character = await getCharacter(serverId, characterId);
        const ancestryId = character["body"]["ancestry_id"];

        value.push([ancestryId, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-lineage-ancestry_name") {
        const character = await getCharacter(serverId, characterId);
        const ancestryId = character["body"]["ancestry_id"];

        if (ancestryId) {
            const ancestries = await esi.getUniverseAncestries(serverId);

            for (let i = 0; i < ancestries["body"].length; i++) {
                const ancestry = ancestries["body"][i];

                if (Number(ancestryId) === Number(ancestry["id"])) {
                    value.push([ancestry["name"], "string"]);
                    break;
                }
            }
        }
        else {
            value.push([undefined, "string"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-lineage-bloodline_id") {
        const character = await getCharacter(serverId, characterId);
        const bloodlineId = character["body"]["bloodline_id"];

        value.push([bloodlineId, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-lineage-bloodline_name") {
        const character = await getCharacter(serverId, characterId);
        const bloodlineId = character["body"]["bloodline_id"];

        const bloodlines = await esi.getUniverseBloodlines(serverId);

        for (let i = 0; i < bloodlines["body"].length; i++) {
            const bloodline = bloodlines["body"][i];

            if (Number(bloodlineId) === Number(bloodline["bloodline_id"])) {
                value.push([bloodline["name"], "string"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-lineage-race_id") {
        const character = await getCharacter(serverId, characterId);
        const raceId = character["body"]["race_id"];

        value.push([raceId, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-lineage-race_name") {
        const character = await getCharacter(serverId, characterId);
        const raceId = character["body"]["race_id"];

        const races = await esi.getUniverseRaces(serverId);

        for (let i = 0; i < races["body"].length; i++) {
            const race = races["body"][i];

            if (Number(raceId) === Number(race["race_id"])) {
                value.push([race["name"], "string"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-lineage-gender_name") {
        const character = await getCharacter(serverId, characterId);
        const genderName = character["body"]["gender"];

        value.push([genderName, "string"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-location-system_id") {
        const location = await esi.getCharacterLocation(serverId, userId, characterId);
        const solarSystemId = location["body"]["solar_system_id"];

        value.push([solarSystemId, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-location-constellation_id") {
        const location = await esi.getCharacterLocation(serverId, userId, characterId);
        const solarSystemId = location["body"]["solar_system_id"];
        const solarSystem = await esi.getUniverseSystem(serverId, solarSystemId);
        const constellationId = solarSystem["body"]["constellation_id"];

        value.push([constellationId, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-location-region_id") {
        const location = await esi.getCharacterLocation(serverId, userId, characterId);
        const solarSystemId = location["body"]["solar_system_id"];
        const solarSystem = await esi.getUniverseSystem(serverId, solarSystemId);
        const constellationId = solarSystem["body"]["constellation_id"];
        const constellation = await esi.getUniverseConstellation(serverId, constellationId);
        const regionId = constellation["body"]["region_id"];

        value.push([regionId, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-location-system_name") {
        const location = await esi.getCharacterLocation(serverId, userId, characterId);
        const solarSystemId = location["body"]["solar_system_id"];
        const solarSystem = await esi.getUniverseSystem(serverId, solarSystemId);
        const solarSystemName = solarSystem["body"]["name"];

        value.push([solarSystemName, "string"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-location-constellation_name") {
        const location = await esi.getCharacterLocation(serverId, userId, characterId);
        const solarSystemId = location["body"]["solar_system_id"];
        const solarSystem = await esi.getUniverseSystem(serverId, solarSystemId);
        const constellationId = solarSystem["body"]["constellation_id"];
        const constellation = await esi.getUniverseConstellation(serverId, constellationId);
        const constellationName = constellation["body"]["name"];

        value.push([constellationName, "string"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-location-region_name") {
        const location = await esi.getCharacterLocation(serverId, userId, characterId);
        const solarSystemId = location["body"]["solar_system_id"];
        const solarSystem = await esi.getUniverseSystem(serverId, solarSystemId);
        const constellationId = solarSystem["body"]["constellation_id"];
        const constellation = await esi.getUniverseConstellation(serverId, constellationId);
        const regionId = constellation["body"]["region_id"];
        const region = await esi.getUniverseRegion(serverId, regionId);
        const regionName = region["body"]["name"];

        value.push([regionName, "string"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-medal-id") {
        const medals = await esi.getCharacterMedals(serverId, userId, characterId);

        for (let i = 0; i < medals["body"].length; i++) {
            const medal = medals["body"][i];
            const medalId = medal["medal_id"];

            value.push([medalId, "number"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-medal-title") {
        const medals = await esi.getCharacterMedals(serverId, userId, characterId);

        for (let i = 0; i < medals["body"].length; i++) {
            const medal = medals["body"][i];
            const medalTitle = medal["title"];

            value.push([medalTitle, "string"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-has_roles") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"]) && !("roles_at_base" in roles["body"]) && !("roles_at_hq" in roles["body"]) && !("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (roles["body"]["roles"].length === 0 && roles["body"]["roles_at_base"].length === 0 && roles["body"]["roles_at_hq"].length === 0 && roles["body"]["roles_at_other"].length === 0) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-accountant") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Accountant"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-auditor") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Auditor"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-communications_officer") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Communications_Officer"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-config_equipment") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Config_Equipment"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-config_starbase_equipment") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Config_Starbase_Equipment"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-contract_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Contract_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-diplomat") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Diplomat"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-director") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Director"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-factory_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Factory_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-fitting_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Fitting_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-junior_accountant") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Junior_Accountant"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-personnel_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Personnel_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-rent_factory_facility") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Rent_Factory_Facility"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-rent_office") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Rent_Office"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-rent_research_facility") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Rent_Research_Facility"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-security_officer") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Security_Officer"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-starbase_defense_operator") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Starbase_Defense_Operator"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-starbase_fuel_technician") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Starbase_Fuel_Technician"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-station_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Station_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-trader") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Trader"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-account_take_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Account_Take_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-account_take_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Account_Take_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-account_take_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Account_Take_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-account_take_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Account_Take_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-account_take_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Account_Take_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-account_take_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Account_Take_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-account_take_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Account_Take_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-container_take_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Container_Take_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-container_take_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Container_Take_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-container_take_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Container_Take_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-container_take_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Container_Take_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-container_take_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Container_Take_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-container_take_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Container_Take_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-container_take_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Container_Take_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_query_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Query_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_query_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Query_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_query_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Query_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_query_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Query_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_query_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Query_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_query_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Query_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_query_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Query_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_take_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Take_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_take_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Take_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_take_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Take_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_take_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Take_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_take_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Take_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_take_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Take_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-general-hangar_take_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles"].includes("Hangar_Take_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-accountant") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Accountant"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-auditor") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Auditor"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-communications_officer") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Communications_Officer"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-config_equipment") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Config_Equipment"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-config_starbase_equipment") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Config_Starbase_Equipment"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-contract_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Contract_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-diplomat") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Diplomat"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-director") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Director"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-factory_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Factory_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-fitting_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Fitting_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-junior_accountant") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Junior_Accountant"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-personnel_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Personnel_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-rent_factory_facility") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Rent_Factory_Facility"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-rent_office") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Rent_Office"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-rent_research_facility") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Rent_Research_Facility"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-security_officer") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Security_Officer"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-starbase_defense_operator") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Starbase_Defense_Operator"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-starbase_fuel_technician") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Starbase_Fuel_Technician"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-station_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Station_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-trader") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Trader"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-account_take_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Account_Take_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-account_take_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Account_Take_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-account_take_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Account_Take_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-account_take_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Account_Take_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-account_take_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Account_Take_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-account_take_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Account_Take_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-account_take_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Account_Take_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-container_take_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Container_Take_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-container_take_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Container_Take_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-container_take_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Container_Take_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-container_take_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Container_Take_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-container_take_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Container_Take_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-container_take_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Container_Take_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-container_take_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Container_Take_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_query_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Query_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_query_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Query_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_query_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Query_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_query_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Query_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_query_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Query_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_query_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Query_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_query_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Query_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_take_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Take_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_take_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Take_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_take_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Take_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_take_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Take_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_take_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Take_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_take_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Take_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_base-hangar_take_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_base" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_base"].includes("Hangar_Take_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-accountant") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Accountant"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-auditor") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Auditor"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-communications_officer") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Communications_Officer"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-config_equipment") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Config_Equipment"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-config_starbase_equipment") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Config_Starbase_Equipment"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-contract_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Contract_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-diplomat") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Diplomat"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-director") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Director"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-factory_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Factory_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-fitting_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Fitting_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-junior_accountant") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Junior_Accountant"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-personnel_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Personnel_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-rent_factory_facility") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Rent_Factory_Facility"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-rent_office") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Rent_Office"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-rent_research_facility") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Rent_Research_Facility"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-security_officer") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Security_Officer"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-starbase_defense_operator") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Starbase_Defense_Operator"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-starbase_fuel_technician") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Starbase_Fuel_Technician"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-station_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Station_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-trader") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Trader"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-account_take_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Account_Take_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-account_take_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Account_Take_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-account_take_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Account_Take_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-account_take_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Account_Take_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-account_take_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Account_Take_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-account_take_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Account_Take_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-account_take_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Account_Take_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-container_take_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Container_Take_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-container_take_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Container_Take_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-container_take_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Container_Take_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-container_take_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Container_Take_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-container_take_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Container_Take_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-container_take_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Container_Take_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-container_take_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Container_Take_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_query_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Query_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_query_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Query_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_query_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Query_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_query_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Query_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_query_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Query_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_query_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Query_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_query_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Query_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_take_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Take_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_take_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Take_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_take_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Take_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_take_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Take_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_take_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Take_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_take_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Take_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_hq-hangar_take_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_hq" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_hq"].includes("Hangar_Take_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-accountant") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Accountant"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-auditor") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Auditor"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-communications_officer") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Communications_Officer"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-config_equipment") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Config_Equipment"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-config_starbase_equipment") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Config_Starbase_Equipment"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-contract_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Contract_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-diplomat") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Diplomat"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-director") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Director"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-factory_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Factory_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-fitting_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Fitting_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-junior_accountant") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Junior_Accountant"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-personnel_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Personnel_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-rent_factory_facility") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Rent_Factory_Facility"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-rent_office") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Rent_Office"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-rent_research_facility") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Rent_Research_Facility"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-security_officer") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Security_Officer"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-starbase_defense_operator") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Starbase_Defense_Operator"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-starbase_fuel_technician") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Starbase_Fuel_Technician"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-station_manager") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Station_Manager"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-trader") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Trader"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-account_take_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Account_Take_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-account_take_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Account_Take_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-account_take_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Account_Take_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-account_take_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Account_Take_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-account_take_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Account_Take_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-account_take_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Account_Take_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-account_take_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Account_Take_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-container_take_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Container_Take_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-container_take_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Container_Take_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-container_take_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Container_Take_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-container_take_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Container_Take_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-container_take_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Container_Take_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-container_take_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Container_Take_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-container_take_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Container_Take_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_query_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Query_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_query_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Query_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_query_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Query_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_query_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Query_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_query_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Query_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_query_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Query_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_query_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Query_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_take_1") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Take_1"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_take_2") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Take_2"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_take_3") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Take_3"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_take_4") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Take_4"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_take_5") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Take_5"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_take_6") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Take_6"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-role-at_other-hangar_take_7") {
        const roles = await esi.getCharacterRoles(serverId, userId, characterId);

        if (!("roles_at_other" in roles["body"])) {
            value.push([false, "boolean"]);
        }
        else if (!(roles["body"]["roles_at_other"].includes("Hangar_Take_7"))) {
            value.push([false, "boolean"]);
        }
        else {
            value.push([true, "boolean"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-ship-ship_name") {
        const ship = await esi.getCharacterShip(serverId, userId, characterId);
        const shipName = ship["body"]["ship_name"];

        value.push([shipName, "string"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-ship-ship_type_id") {
        const ship = await esi.getCharacterShip(serverId, userId, characterId);
        const shipTypeId = ship["body"]["ship_type_id"];

        value.push([shipTypeId, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-ship-ship_type_name") {
        const ship = await esi.getCharacterShip(serverId, userId, characterId);
        const shipTypeId = ship["body"]["ship_type_id"];
        const type = await esi.getUniverseType(serverId, shipTypeId);
        const shipTypeName = type["body"]["name"];

        value.push([shipTypeName, "string"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-ship-ship_group_id") {
        const ship = await esi.getCharacterShip(serverId, userId, characterId);
        const shipTypeId = ship["body"]["ship_type_id"];
        const type = await esi.getUniverseType(serverId, shipTypeId);
        const shipGroupId = type["body"]["group_id"];

        value.push([shipGroupId, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-ship-ship_group_name") {
        const ship = await esi.getCharacterShip(serverId, userId, characterId);
        const shipTypeId = ship["body"]["ship_type_id"];
        const type = await esi.getUniverseType(serverId, shipTypeId);
        const shipGroupId = type["body"]["group_id"];
        const group = await esi.getUniverseGroup(serverId, shipGroupId);
        const shipGroupName = group["body"]["name"];

        value.push([shipGroupName, "string"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-total_skillpoints") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);
        const totalSkillpoints = skills["body"]["total_sp"];

        value.push([totalSkillpoints, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-unallocated_skillpoints") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);
        let unallocatedSkillpoints = skills["body"]["unallocated_sp"];

        if (!unallocatedSkillpoints) {
            unallocatedSkillpoints = 0;
        }

        value.push([unallocatedSkillpoints, "number"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-armor-armor_layering") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33078) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-armor-capital_remote_armor_repair_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24568) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-armor-capital_remote_hull_repair_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 27936) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-armor-capital_repair_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21803) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-armor-em_armor_compensation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 22806) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-armor-explosive_armor_compensation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 22807) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-armor-hull_upgrades") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3394) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-armor-kinetic_armor_compensation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 22808) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-armor-mechanics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3392) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-armor-remote_armor_repair_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 16069) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-armor-remote_hull_repair_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 27902) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-armor-repair_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3393) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-armor-thermal_armor_compensation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 22809) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-corporation_management-corporation_management") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3363) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-corporation_management-diplomatic_relations") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3368) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-corporation_management-empire_control") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3732) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-corporation_management-megacorp_management") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3731) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-corporation_management-sovereignty") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12241) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-advanced_drone_avionics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 23566) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-amarr_drone_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12484) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-caldari_drone_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12487) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-drone_avionics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3437) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-drone_durability") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 23618) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-drone_interfacing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3442) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-drone_navigation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12305) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-drone_sharpshooting") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 23606) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-drones") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3436) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-fighter_hangar_management") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24613) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-fighters") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 23069) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-gallente_drone_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12486) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-heavy_drone_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3441) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-heavy_fighters") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 32339) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-ice_harvesting_drone_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 43702) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-ice_harvesting_drone_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 43703) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-light_drone_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24241) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-light_fighters") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 40572) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-medium_drone_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33699) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-mining_drone_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3438) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-mining_drone_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 22541) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-minmatar_drone_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12485) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-repair_drone_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3439) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-salvage_drone_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3440) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-sentry_drone_interfacing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 23594) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-drones-support_fighters") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 40573) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-burst_projector_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 27911) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-cloaking") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11579) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-electronic_warfare") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3427) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-frequency_modulation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 19760) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-long_distance_jamming") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 19759) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-propulsion_jamming") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3435) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-sensor_linking") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3433) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-signal_dispersion") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 19761) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-signal_suppression") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 19766) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-signature_focusing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 19922) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-tactical_logistics_reconfiguration") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 27906) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-target_breaker_amplification") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 4411) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-target_painting") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 19921) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-weapon_destabilization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 19767) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-electronic_systems-weapon_disruption") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3434) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-advanced_weapon_upgrades") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11207) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-cpu_management") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3426) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-capacitor_emission_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3423) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-capacitor_management") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3418) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-capacitor_systems_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3417) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-capital_capacitor_emission_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24572) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-electronics_upgrades") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3432) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-energy_grid_upgrades") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3424) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-energy_pulse_weapons") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3421) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-nanite_interfacing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 28880) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-nanite_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 28879) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-power_grid_management") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3413) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-resistance_phasing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 32797) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-thermodynamics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 28164) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-engineering-weapon_upgrades") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3318) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-armored_command") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20494) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-armored_command_specialist") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11569) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-command_burst_specialist") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3354) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-fleet_command") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24764) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-information_command") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20495) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-information_command_specialist") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3352) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-leadership") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3348) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-mining_director") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 22552) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-mining_foreman") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 22536) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-shield_command") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3350) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-shield_command_specialist") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3351) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-skirmish_command") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3349) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-skirmish_command_specialist") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11572) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-spatial_phenomena_generation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 43728) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-fleet_support-wing_command") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11574) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-capital_artillery_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 41404) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-capital_autocannon_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 41403) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-capital_beam_laser_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 41408) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-capital_blaster_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 41405) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-capital_energy_turret") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20327) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-capital_hybrid_turret") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21666) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-capital_projectile_turret") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21667) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-capital_pulse_laser_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 41407) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-capital_railgun_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 41406) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-controlled_bursts") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3316) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-doomsday_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24563) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-doomsday_rapid_firing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 41537) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-gunnery") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3300) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-large_artillery_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12203) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-large_autocannon_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12209) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-large_beam_laser_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12205) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-large_blaster_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12212) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-large_disintegrator_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 47875) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-large_energy_turret") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3309) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-large_hybrid_turret") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3307) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-large_precursor_weapon") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 47872) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-large_projectile_turret") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3308) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-large_pulse_laser_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12215) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-large_railgun_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12207) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-medium_artillery_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12202) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-medium_autocannon_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12208) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-medium_beam_laser_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12204) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-medium_blaster_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12211) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-medium_disintegrator_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 47874) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-medium_energy_turret") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3306) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-medium_hybrid_turret") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3304) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-medium_precursor_weapon") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 47871) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-medium_projectile_turret") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3305) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-medium_pulse_laser_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12214) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-medium_railgun_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12206) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-motion_prediction") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3312) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-rapid_firing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3310) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-sharpshooter") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3311) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-small_artillery_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12201) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-small_autocannon_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11084) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-small_beam_laser_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11083) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-small_blaster_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12210) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-small_disintegrator_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 47873) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-small_energy_turret") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3303) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-small_hybrid_turret") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3301) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-small_precursor_weapon") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 47870) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-small_projectile_turret") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3302) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-small_pulse_laser_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12213) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-small_railgun_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11082) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-surgical_strike") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3315) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-tactical_weapon_reconfiguration") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 22043) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-gunnery-trajectory_analysis") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3317) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-auto_targeting_missiles") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3322) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-bomb_deployment") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 28073) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-cruise_missile_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20212) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-cruise_missiles") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3326) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-defender_missiles") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3323) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-guided_missile_precision") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20312) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-heavy_assault_missile_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 25718) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-heavy_assault_missiles") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 25719) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-heavy_missile_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20211) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-heavy_missiles") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3324) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-light_missile_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20210) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-light_missiles") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3321) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-missile_bombardment") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12441) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-missile_launcher_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3319) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-missile_projection") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12442) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-rapid_launch") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21071) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-rocket_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20209) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-rockets") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3320) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-target_navigation_prediction") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20314) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-torpedo_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20213) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-torpedoes") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3325) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-warhead_upgrades") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20315) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-xl_cruise_missile_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 41410) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-xl_cruise_missiles") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 32435) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-xl_torpedo_specialization") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 41409) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-missiles-xl_torpedoes") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21668) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-navigation-acceleration_control") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3452) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-navigation-afterburner") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3450) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-navigation-cynosural_field_theory") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21603) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-navigation-evasive_maneuvering") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3453) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-navigation-fuel_conservation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3451) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-navigation-high_speed_maneuvering") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3454) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-navigation-jump_drive_calibration") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21611) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-navigation-jump_drive_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3456) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-navigation-jump_fuel_conservation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21610) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-navigation-jump_portal_generation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24562) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-navigation-micro_jump_drive_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 4385) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-navigation-navigation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3449) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-navigation-warp_drive_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3455) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-neural_enhancement-advanced_infomorph_psychology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33407) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-neural_enhancement-biology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3405) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-neural_enhancement-cloning_facility_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24606) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-neural_enhancement-cybernetics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3411) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-neural_enhancement-infomorph_psychology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24242) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-neural_enhancement-infomorph_synchronizing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33399) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-neural_enhancement-neurotoxin_control") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 25538) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-neural_enhancement-neurotoxin_recovery") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 25530) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-planet_management-advanced_planetology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 2403) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-planet_management-command_center_upgrades") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 2505) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-planet_management-interplanetary_consolidation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 2495) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-planet_management-planetology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 2406) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-planet_management-remote_sensing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 13279) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-production-advanced_industrial_ship_construction") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3396) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-production-advanced_industry") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3388) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-production-advanced_large_ship_construction") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3398) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-production-advanced_mass_production") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24625) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-production-advanced_medium_ship_construction") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3397) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-production-advanced_small_ship_construction") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3395) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-production-capital_ship_construction") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 22242) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-production-drug_manufacturing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 26224) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-production-industry") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3380) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-production-mass_production") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3387) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-production-outpost_construction") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3400) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-production-supply_chain_management") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24268) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-advanced_mass_reactions") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 45749) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-arkonor_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12180) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-astrogeology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3410) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-bistot_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12181) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-common_moon_ore_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 46153) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-crokite_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12182) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-dark_ochre_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12183) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-deep_core_mining") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11395) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-exceptional_moon_ore_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 46156) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-gas_cloud_harvesting") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 25544) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-gneiss_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12184) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-hedbergite_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12185) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-hemorphite_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12186) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-ice_harvesting") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 16281) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-ice_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 18025) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-industrial_reconfiguration") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 28585) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-jaspet_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12187) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-kernite_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12188) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-mass_reactions") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 45748) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-mercoxit_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12189) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-mining") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3386) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-mining_upgrades") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 22578) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-omber_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12190) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-plagioclase_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12191) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-pyroxeres_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12192) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-rare_moon_ore_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 46155) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-reactions") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 45746) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-remote_reactions") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 45750) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-reprocessing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3385) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-reprocessing_efficiency") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3389) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-salvaging") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 25863) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-scordite_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12193) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-scrapmetal_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12196) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-spodumain_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12194) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-ubiquitous_moon_ore_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 46152) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-uncommon_moon_ore_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 46154) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-resource_processing-veldspar_processing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12195) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-rigging-armor_rigging") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 26253) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-rigging-astronautics_rigging") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 26254) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-rigging-drones_rigging") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 26255) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-rigging-electronic_superiority_rigging") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 26256) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-rigging-energy_weapon_rigging") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 26258) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-rigging-hybrid_weapon_rigging") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 26259) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-rigging-jury_rigging") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 26252) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-rigging-launcher_rigging") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 26260) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-rigging-projectile_weapon_rigging") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 26257) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-rigging-shield_rigging") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 26261) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-scanning-archaeology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 13278) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-scanning-astrometric_acquisition") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 25811) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-scanning-astrometric_pinpointing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 25810) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-scanning-astrometric_rangefinding") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 25739) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-scanning-astrometrics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3412) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-scanning-hacking") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21718) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-scanning-survey") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3551) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-advanced_laboratory_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24624) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-amarr_encryption_methods") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 23087) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-amarr_starship_engineering") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11444) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-astronautic_engineering") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11487) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-caldari_encryption_methods") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21790) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-caldari_starship_engineering") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11454) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-core_subsystem_technology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30325) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-defensive_subsystem_technology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30324) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-electromagnetic_physics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11448) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-electronic_engineering") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11453) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-gallente_encryption_methods") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 23121) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-gallente_starship_engineering") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11450) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-graviton_physics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11446) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-high_energy_physics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11433) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-hydromagnetic_physics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11443) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-laboratory_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3406) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-laser_physics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11447) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-mechanical_engineering") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11452) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-metallurgy") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3409) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-minmatar_encryption_methods") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21791) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-minmatar_starship_engineering") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11445) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-molecular_engineering") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11529) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-nanite_engineering") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11442) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-nuclear_physics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11451) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-offensive_subsystem_technology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30327) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-plasma_physics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11441) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-propulsion_subsystem_technology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30788) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-quantum_physics") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11455) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-research") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3403) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-research_project_management") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12179) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-rocket_science") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11449) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-science") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3402) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-scientific_networking") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24270) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-sleeper_encryption_methods") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3408) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-sleeper_technology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21789) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-takmahl_technology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 23123) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-talocan_technology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20433) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-science-yan_jung_technology") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 23124) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-shields-capital_shield_emission_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24571) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-shields-capital_shield_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21802) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-shields-em_shield_compensation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12365) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-shields-explosive_shield_compensation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12367) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-shields-invulnerability_core_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 44067) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-shields-kinetic_shield_compensation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12366) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-shields-shield_compensation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 21059) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-shields-shield_emission_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3422) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-shields-shield_management") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3419) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-shields-shield_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3416) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-shields-shield_upgrades") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3425) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-shields-tactical_shield_manipulation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3420) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-shields-thermal_shield_compensation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11566) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-social-connections") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3359) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-social-criminal_connections") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3361) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-social-diplomacy") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3357) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-social-distribution_connections") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3894) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-social-fast_talk") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3358) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-social-mining_connections") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3893) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-social-negotiation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3356) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-social-security_connections") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3895) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-social-social") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3355) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-advanced_spaceship_command") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20342) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-amarr_battlecruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33095) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-amarr_battleship") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3339) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-amarr_carrier") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24311) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-amarr_cruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3335) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-amarr_destroyer") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33091) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-amarr_dreadnought") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20525) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-amarr_force_auxiliary") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 40535) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-amarr_freighter") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20524) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-amarr_frigate") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3331) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-amarr_industrial") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3343) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-amarr_strategic_cruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30650) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-amarr_tactical_destroyer") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 34390) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-amarr_titan") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3347) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-assault_frigates") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12095) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-black_ops") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 28656) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-caldari_battlecruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33096) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-caldari_battleship") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3338) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-caldari_carrier") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24312) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-caldari_cruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3334) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-caldari_destroyer") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33092) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-caldari_dreadnought") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20530) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-caldari_force_auxiliary") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 40536) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-caldari_freighter") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20526) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-caldari_frigate") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3330) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-caldari_industrial") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3342) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-caldari_strategic_cruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30651) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-caldari_tactical_destroyer") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 35680) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-caldari_titan") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3346) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-capital_industrial_ships") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 28374) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-capital_ships") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20533) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-command_destroyers") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 37615) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-command_ships") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 23950) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-covert_ops") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12093) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-electronic_attack_ships") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 28615) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-exhumers") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 22551) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-expedition_frigates") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33856) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-flag_cruisers") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 47445) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-gallente_battlecruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33097) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-gallente_battleship") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3336) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-gallente_carrier") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24313) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-gallente_cruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3332) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-gallente_destroyer") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33093) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-gallente_dreadnought") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20531) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-gallente_force_auxiliary") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 40537) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-gallente_freighter") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20527) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-gallente_frigate") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3328) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-gallente_industrial") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3340) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-gallente_strategic_cruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30652) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-gallente_tactical_destroyer") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 35685) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-gallente_titan") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3344) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-heavy_assault_cruisers") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 16591) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-heavy_interdiction_cruisers") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 28609) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-industrial_command_ships") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 29637) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-interceptors") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12092) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-interdictors") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12098) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-jump_freighters") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 29029) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-logistics_cruisers") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 12096) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-logistics_frigates") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 40328) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-marauders") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 28667) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-mining_barge") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 17940) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-mining_frigate") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 32918) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-minmatar_battlecruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33098) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-minmatar_battleship") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3337) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-minmatar_carrier") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 24314) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-minmatar_cruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3333) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-minmatar_destroyer") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33094) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-minmatar_dreadnought") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20532) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-minmatar_force_auxiliary") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 40538) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-minmatar_freighter") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 20528) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-minmatar_frigate") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3329) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-minmatar_industrial") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3341) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-minmatar_strategic_cruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30653) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-minmatar_tactical_destroyer") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 34533) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-minmatar_titan") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3345) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-ore_freighter") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 34327) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-ore_industrial") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3184) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-precursor_battlecruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 49743) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-precursor_battleship") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 47869) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-precursor_cruiser") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 47868) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-precursor_destroyer") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 49742) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-precursor_frigate") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 47867) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-recon_ships") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 22761) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-spaceship_command") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3327) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-spaceship_command-transport_ships") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 19719) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-structure_management-anchoring") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 11584) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-structure_management-starbase_defense_management") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3373) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-structure_management-structure_doomsday_operation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 37797) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-structure_management-structure_electronic_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 37798) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-structure_management-structure_engineering_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 37799) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-structure_management-structure_missile_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 37796) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-amarr_core_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30539) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-amarr_defensive_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30532) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-amarr_offensive_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30537) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-amarr_propulsion_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30538) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-caldari_core_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30548) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-caldari_defensive_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30544) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-caldari_offensive_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30549) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-caldari_propulsion_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30552) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-gallente_core_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30546) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-gallente_defensive_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30540) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-gallente_offensive_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30550) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-gallente_propulsion_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30553) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-minmatar_core_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30547) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-minmatar_defensive_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30545) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-minmatar_offensive_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30551) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-subsystems-minmatar_propulsion_systems") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 30554) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-targeting-advanced_target_management") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3430) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-targeting-gravimetric_sensor_compensation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33000) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-targeting-ladar_sensor_compensation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33001) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-targeting-long_range_targeting") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3428) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-targeting-magnetometric_sensor_compensation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 32999) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-targeting-radar_sensor_compensation") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33002) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-targeting-signature_analysis") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3431) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-targeting-target_management") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3429) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-accounting") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 16622) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-broker_relations") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3446) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-contracting") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 25235) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-corporation_contracting") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 25233) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-customs_code_expertise") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 33467) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-daytrading") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 16595) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-margin_trading") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 16597) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-marketing") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 16598) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-procurement") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 16594) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-retail") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3444) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-trade") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3443) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-tycoon") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 18580) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-visibility") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 3447) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-skill-trade-wholesale") {
        const skills = await esi.getCharacterSkills(serverId, userId, characterId);

        for (let i = 0; i < skills["body"]["skills"].length; i++) {
            const skill = skills["body"]["skills"][i];

            if (Number(skill["skill_id"]) === 16596) {
                value.push([skill["trained_skill_level"], "number"]);
                break;
            }
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-status-is_online") {
        const online = await esi.getCharacterOnline(serverId, userId, characterId);
        const isOnline = online["body"]["online"];

        value.push([isOnline, "boolean"]);
    }
    else if (endpoint === "te-endpoints-eve_online-character-title-id") {
        const titles = await esi.getCharacterTitles(serverId, userId, characterId);

        for (let i = 0; i < titles["body"].length; i++) {
            const title = titles["body"][i];
            const titleId = title["title_id"];

            value.push([titleId, "number"]);
        }
    }
    else if (endpoint === "te-endpoints-eve_online-character-title-name") {
        const titles = await esi.getCharacterTitles(serverId, userId, characterId);

        for (let i = 0; i < titles["body"].length; i++) {
            const title = titles["body"][i];
            const titleName = title["name"];

            value.push([titleName, "string"]);
        }
    }

    return value;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {String} characterId 
 * @param {String} endpoint 
 * @param {String} direction 
 * @param {String} entityType 
 * @param {String} entity 
 */
async function getValueP2(serverId, userId, characterId, endpoint, direction, entityType, entity) {
    const value = [];

    try {
        let entity_id = undefined;

        if (endpoint.endsWith("has_standing") || endpoint.endsWith("name") || endpoint.endsWith("ticker")) {
            if (entityType === "ALLIANCE") {
                entity_id = await entityNameToId(serverId, "alliances", entity);
            }
            else if (entityType === "CORPORATION") {
                entity_id = await entityNameToId(serverId, "corporations", entity);
            }
            else if (entityType === "CHARACTER") {
                entity_id = await entityNameToId(serverId, "characters", entity);
            }

            if (!entity_id) {
                return [value];
            }
        }
        else if (endpoint.endsWith("id")) {
            entity_id = entity;
        }

        if (endpoint === "te-endpoints-eve_online-alliance-standing-has_standing") {
            const corporation = await getCorporationOfCharacter(serverId, characterId);
            const allianceId = corporation["body"]["alliance_id"];

            if (!allianceId) {
                return [value];
            }

            if (direction === "TOWARDS") {
                const contacts = await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(entity_id)) {
                        if (entityType === "ALLIANCE" && contact["contact_type"] === "alliance") {
                            value.push([true, "boolean"]);
                            break;
                        }
                        else if (entityType === "CORPORATION" && contact["contact_type"] === "corporation") {
                            value.push([true, "boolean"]);
                            break;
                        }
                        else if (entityType === "CHARACTER" && contact["contact_type"] === "character") {
                            value.push([true, "boolean"]);
                            break;
                        }
                    }
                }
            }
            else if (direction === "FROM") {
                let contacts = undefined;

                if (entityType === "ALLIANCE") {
                    await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                    contacts = await disk.loadFile("./data/esi/alliance/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CORPORATION") {
                    const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
                    const corporationId = affiliation["body"][0]["corporation_id"];
                    await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                    contacts = await disk.loadFile("./data/esi/corporation/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CHARACTER") {
                    await esi.getCharacterContacts(serverId, userId, characterId);

                    contacts = await disk.loadFile("./data/esi/character/" + entity_id + "/contacts.json");
                }

                if (!contacts) {
                    return [value];
                }

                const currentDate = new Date();
                const expireDate = new Date(contacts["headers"]["expires"]);

                if (currentDate.getTime() > expireDate.setSeconds(expireDate.getSeconds() + 3600)) {
                    return [value];
                }

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(allianceId)) {
                        if (contact["contact_type"] === "alliance") {
                            value.push([true, "boolean"]);
                            break;
                        }
                    }
                }
            }
        }
        else if (endpoint === "te-endpoints-eve_online-alliance-standing-id") {
            const corporation = await getCorporationOfCharacter(serverId, characterId);
            const allianceId = corporation["body"]["alliance_id"];

            if (!allianceId) {
                return [value];
            }

            if (direction === "TOWARDS") {
                const contacts = await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(entity_id)) {
                        if (entityType === "ALLIANCE" && contact["contact_type"] === "alliance") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CORPORATION" && contact["contact_type"] === "corporation") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CHARACTER" && contact["contact_type"] === "character") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
            else if (direction === "FROM") {
                let contacts = undefined;

                if (entityType === "ALLIANCE") {
                    await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                    contacts = await disk.loadFile("./data/esi/alliance/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CORPORATION") {
                    const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
                    const corporationId = affiliation["body"][0]["corporation_id"];
                    await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                    contacts = await disk.loadFile("./data/esi/corporation/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CHARACTER") {
                    await esi.getCharacterContacts(serverId, userId, characterId);

                    contacts = await disk.loadFile("./data/esi/character/" + entity_id + "/contacts.json");
                }

                if (!contacts) {
                    return [value];
                }

                const currentDate = new Date();
                const expireDate = new Date(contacts["headers"]["expires"]);

                if (currentDate.getTime() > expireDate.setSeconds(expireDate.getSeconds() + 3600)) {
                    return [value];
                }

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(allianceId)) {
                        if (contact["contact_type"] === "alliance") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
        }
        else if (endpoint === "te-endpoints-eve_online-alliance-standing-name") {
            const corporation = await getCorporationOfCharacter(serverId, characterId);
            const allianceId = corporation["body"]["alliance_id"];

            if (!allianceId) {
                return [value];
            }

            if (direction === "TOWARDS") {
                const contacts = await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(entity_id)) {
                        if (entityType === "ALLIANCE" && contact["contact_type"] === "alliance") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CORPORATION" && contact["contact_type"] === "corporation") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CHARACTER" && contact["contact_type"] === "character") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
            else if (direction === "FROM") {
                let contacts = undefined;

                if (entityType === "ALLIANCE") {
                    await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                    contacts = await disk.loadFile("./data/esi/alliance/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CORPORATION") {
                    const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
                    const corporationId = affiliation["body"][0]["corporation_id"];
                    await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                    contacts = await disk.loadFile("./data/esi/corporation/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CHARACTER") {
                    await esi.getCharacterContacts(serverId, userId, characterId);

                    contacts = await disk.loadFile("./data/esi/character/" + entity_id + "/contacts.json");
                }

                if (!contacts) {
                    return [value];
                }

                const currentDate = new Date();
                const expireDate = new Date(contacts["headers"]["expires"]);

                if (currentDate.getTime() > expireDate.setSeconds(expireDate.getSeconds() + 3600)) {
                    return [value];
                }

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(allianceId)) {
                        if (contact["contact_type"] === "alliance") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
        }
        else if (endpoint === "te-endpoints-eve_online-alliance-standing-ticker") {
            const corporation = await getCorporationOfCharacter(serverId, characterId);
            const allianceId = corporation["body"]["alliance_id"];

            if (!allianceId) {
                return [value];
            }

            if (direction === "TOWARDS") {
                const contacts = await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(entity_id)) {
                        if (entityType === "ALLIANCE" && contact["contact_type"] === "alliance") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CORPORATION" && contact["contact_type"] === "corporation") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CHARACTER" && contact["contact_type"] === "character") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
            else if (direction === "FROM") {
                let contacts = undefined;

                if (entityType === "ALLIANCE") {
                    await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                    contacts = await disk.loadFile("./data/esi/alliance/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CORPORATION") {
                    const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
                    const corporationId = affiliation["body"][0]["corporation_id"];
                    await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                    contacts = await disk.loadFile("./data/esi/corporation/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CHARACTER") {
                    await esi.getCharacterContacts(serverId, userId, characterId);

                    contacts = await disk.loadFile("./data/esi/character/" + entity_id + "/contacts.json");
                }

                if (!contacts) {
                    return [value];
                }

                const currentDate = new Date();
                const expireDate = new Date(contacts["headers"]["expires"]);

                if (currentDate.getTime() > expireDate.setSeconds(expireDate.getSeconds() + 3600)) {
                    return [value];
                }

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(allianceId)) {
                        if (contact["contact_type"] === "alliance") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
        }
        else if (endpoint === "te-endpoints-eve_online-corporation-standing-has_standing") {
            const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
            const corporationId = affiliation["body"][0]["corporation_id"];

            if (direction === "TOWARDS") {
                const contacts = await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(entity_id)) {
                        if (entityType === "ALLIANCE" && contact["contact_type"] === "alliance") {
                            value.push([true, "boolean"]);
                            break;
                        }
                        else if (entityType === "CORPORATION" && contact["contact_type"] === "corporation") {
                            value.push([true, "boolean"]);
                            break;
                        }
                        else if (entityType === "CHARACTER" && contact["contact_type"] === "character") {
                            value.push([true, "boolean"]);
                            break;
                        }
                    }
                }
            }
            else if (direction === "FROM") {
                let contacts = undefined;

                if (entityType === "ALLIANCE") {
                    const corporation = await getCorporationOfCharacter(serverId, characterId);
                    const allianceId = corporation["body"]["alliance_id"];

                    if (!allianceId) {
                        return [value];
                    }

                    await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                    contacts = await disk.loadFile("./data/esi/alliance/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CORPORATION") {
                    await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                    contacts = await disk.loadFile("./data/esi/corporation/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CHARACTER") {
                    await esi.getCharacterContacts(serverId, userId, characterId);

                    contacts = await disk.loadFile("./data/esi/character/" + entity_id + "/contacts.json");
                }

                if (!contacts) {
                    return [value];
                }

                const currentDate = new Date();
                const expireDate = new Date(contacts["headers"]["expires"]);

                if (currentDate.getTime() > expireDate.setSeconds(expireDate.getSeconds() + 3600)) {
                    return [value];
                }

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(corporationId)) {
                        if (contact["contact_type"] === "corporation") {
                            value.push([true, "boolean"]);
                            break;
                        }
                    }
                }
            }
        }
        else if (endpoint === "te-endpoints-eve_online-corporation-standing-id") {
            const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
            const corporationId = affiliation["body"][0]["corporation_id"];

            if (direction === "TOWARDS") {
                const contacts = await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(entity_id)) {
                        if (entityType === "ALLIANCE" && contact["contact_type"] === "alliance") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CORPORATION" && contact["contact_type"] === "corporation") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CHARACTER" && contact["contact_type"] === "character") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
            else if (direction === "FROM") {
                let contacts = undefined;

                if (entityType === "ALLIANCE") {
                    const corporation = await getCorporationOfCharacter(serverId, characterId);
                    const allianceId = corporation["body"]["alliance_id"];

                    if (!allianceId) {
                        return [value];
                    }

                    await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                    contacts = await disk.loadFile("./data/esi/alliance/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CORPORATION") {
                    await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                    contacts = await disk.loadFile("./data/esi/corporation/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CHARACTER") {
                    await esi.getCharacterContacts(serverId, userId, characterId);

                    contacts = await disk.loadFile("./data/esi/character/" + entity_id + "/contacts.json");
                }

                if (!contacts) {
                    return [value];
                }

                const currentDate = new Date();
                const expireDate = new Date(contacts["headers"]["expires"]);

                if (currentDate.getTime() > expireDate.setSeconds(expireDate.getSeconds() + 3600)) {
                    return [value];
                }

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(corporationId)) {
                        if (contact["contact_type"] === "corporation") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
        }
        else if (endpoint === "te-endpoints-eve_online-corporation-standing-name") {
            const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
            const corporationId = affiliation["body"][0]["corporation_id"];

            if (direction === "TOWARDS") {
                const contacts = await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(entity_id)) {
                        if (entityType === "ALLIANCE" && contact["contact_type"] === "alliance") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CORPORATION" && contact["contact_type"] === "corporation") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CHARACTER" && contact["contact_type"] === "character") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
            else if (direction === "FROM") {
                let contacts = undefined;

                if (entityType === "ALLIANCE") {
                    const corporation = await getCorporationOfCharacter(serverId, characterId);
                    const allianceId = corporation["body"]["alliance_id"];

                    if (!allianceId) {
                        return [value];
                    }

                    await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                    contacts = await disk.loadFile("./data/esi/alliance/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CORPORATION") {
                    await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                    contacts = await disk.loadFile("./data/esi/corporation/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CHARACTER") {
                    await esi.getCharacterContacts(serverId, userId, characterId);

                    contacts = await disk.loadFile("./data/esi/character/" + entity_id + "/contacts.json");
                }

                if (!contacts) {
                    return [value];
                }

                const currentDate = new Date();
                const expireDate = new Date(contacts["headers"]["expires"]);

                if (currentDate.getTime() > expireDate.setSeconds(expireDate.getSeconds() + 3600)) {
                    return [value];
                }

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(corporationId)) {
                        if (contact["contact_type"] === "corporation") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
        }
        else if (endpoint === "te-endpoints-eve_online-corporation-standing-ticker") {
            const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
            const corporationId = affiliation["body"][0]["corporation_id"];

            if (direction === "TOWARDS") {
                const contacts = await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(entity_id)) {
                        if (entityType === "ALLIANCE" && contact["contact_type"] === "alliance") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CORPORATION" && contact["contact_type"] === "corporation") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CHARACTER" && contact["contact_type"] === "character") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
            else if (direction === "FROM") {
                let contacts = undefined;

                if (entityType === "ALLIANCE") {
                    const corporation = await getCorporationOfCharacter(serverId, characterId);
                    const allianceId = corporation["body"]["alliance_id"];

                    if (!allianceId) {
                        return [value];
                    }

                    await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                    contacts = await disk.loadFile("./data/esi/alliance/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CORPORATION") {
                    await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                    contacts = await disk.loadFile("./data/esi/corporation/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CHARACTER") {
                    await esi.getCharacterContacts(serverId, userId, characterId);

                    contacts = await disk.loadFile("./data/esi/character/" + entity_id + "/contacts.json");
                }

                if (!contacts) {
                    return [value];
                }

                const currentDate = new Date();
                const expireDate = new Date(contacts["headers"]["expires"]);

                if (currentDate.getTime() > expireDate.setSeconds(expireDate.getSeconds() + 3600)) {
                    return [value];
                }

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(corporationId)) {
                        if (contact["contact_type"] === "corporation") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
        }
        else if (endpoint === "te-endpoints-eve_online-character-standing-has_standing") {
            if (direction === "TOWARDS") {
                const contacts = await esi.getCharacterContacts(serverId, userId, characterId);

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(entity_id)) {
                        if (entityType === "ALLIANCE" && contact["contact_type"] === "alliance") {
                            value.push([true, "boolean"]);
                            break;
                        }
                        else if (entityType === "CORPORATION" && contact["contact_type"] === "corporation") {
                            value.push([true, "boolean"]);
                            break;
                        }
                        else if (entityType === "CHARACTER" && contact["contact_type"] === "character") {
                            value.push([true, "boolean"]);
                            break;
                        }
                    }
                }
            }
            else if (direction === "FROM") {
                let contacts = undefined;

                if (entityType === "ALLIANCE") {
                    const corporation = await getCorporationOfCharacter(serverId, characterId);
                    const allianceId = corporation["body"]["alliance_id"];

                    if (!allianceId) {
                        return [value];
                    }

                    await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                    contacts = await disk.loadFile("./data/esi/alliance/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CORPORATION") {
                    const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
                    const corporationId = affiliation["body"][0]["corporation_id"];
                    await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                    contacts = await disk.loadFile("./data/esi/corporation/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CHARACTER") {
                    await esi.getCharacterContacts(serverId, userId, characterId);

                    contacts = await disk.loadFile("./data/esi/character/" + entity_id + "/contacts.json");
                }

                if (!contacts) {
                    return [value];
                }

                const currentDate = new Date();
                const expireDate = new Date(contacts["headers"]["expires"]);

                if (currentDate.getTime() > expireDate.setSeconds(expireDate.getSeconds() + 3600)) {
                    return [value];
                }

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(characterId)) {
                        if (contact["contact_type"] === "character") {
                            value.push([true, "boolean"]);
                            break;
                        }
                    }
                }
            }
        }
        else if (endpoint === "te-endpoints-eve_online-character-standing-id") {
            if (direction === "TOWARDS") {
                const contacts = await esi.getCharacterContacts(serverId, userId, characterId);

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(entity_id)) {
                        if (entityType === "ALLIANCE" && contact["contact_type"] === "alliance") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CORPORATION" && contact["contact_type"] === "corporation") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CHARACTER" && contact["contact_type"] === "character") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
            else if (direction === "FROM") {
                let contacts = undefined;

                if (entityType === "ALLIANCE") {
                    const corporation = await getCorporationOfCharacter(serverId, characterId);
                    const allianceId = corporation["body"]["alliance_id"];

                    if (!allianceId) {
                        return [value];
                    }

                    await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                    contacts = await disk.loadFile("./data/esi/alliance/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CORPORATION") {
                    const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
                    const corporationId = affiliation["body"][0]["corporation_id"];
                    await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                    contacts = await disk.loadFile("./data/esi/corporation/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CHARACTER") {
                    await esi.getCharacterContacts(serverId, userId, characterId);

                    contacts = await disk.loadFile("./data/esi/character/" + entity_id + "/contacts.json");
                }

                if (!contacts) {
                    return [value];
                }

                const currentDate = new Date();
                const expireDate = new Date(contacts["headers"]["expires"]);

                if (currentDate.getTime() > expireDate.setSeconds(expireDate.getSeconds() + 3600)) {
                    return [value];
                }

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(characterId)) {
                        if (contact["contact_type"] === "character") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
        }
        else if (endpoint === "te-endpoints-eve_online-character-standing-name") {
            if (direction === "TOWARDS") {
                const contacts = await esi.getCharacterContacts(serverId, userId, characterId);

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(entity_id)) {
                        if (entityType === "ALLIANCE" && contact["contact_type"] === "alliance") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CORPORATION" && contact["contact_type"] === "corporation") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                        else if (entityType === "CHARACTER" && contact["contact_type"] === "character") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
            else if (direction === "FROM") {
                let contacts = undefined;

                if (entityType === "ALLIANCE") {
                    const corporation = await getCorporationOfCharacter(serverId, characterId);
                    const allianceId = corporation["body"]["alliance_id"];

                    if (!allianceId) {
                        return [value];
                    }

                    await esi.getAllianceContacts(serverId, userId, characterId, allianceId);

                    contacts = await disk.loadFile("./data/esi/alliance/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CORPORATION") {
                    const affiliation = await esi.getCharacterAffiliation(serverId, characterId);
                    const corporationId = affiliation["body"][0]["corporation_id"];
                    await esi.getCorporationContacts(serverId, userId, characterId, corporationId);

                    contacts = await disk.loadFile("./data/esi/corporation/" + entity_id + "/contacts.json");
                }
                else if (entityType === "CHARACTER") {
                    await esi.getCharacterContacts(serverId, userId, characterId);

                    contacts = await disk.loadFile("./data/esi/character/" + entity_id + "/contacts.json");
                }

                if (!contacts) {
                    return [value];
                }

                const currentDate = new Date();
                const expireDate = new Date(contacts["headers"]["expires"]);

                if (currentDate.getTime() > expireDate.setSeconds(expireDate.getSeconds() + 3600)) {
                    return [value];
                }

                for (let i = 0; i < contacts["body"].length; i++) {
                    const contact = contacts["body"][i];

                    if (Number(contact["contact_id"]) === Number(characterId)) {
                        if (contact["contact_type"] === "character") {
                            value.push([contact["standing"], "number"]);
                            break;
                        }
                    }
                }
            }
        }
    }
    catch (error) {
        const message = output.error(error);
        socket.messageToRoom(serverId, "config_server_logs", "error", message);
    }

    return value;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} endpoint 
 * @param {String} target 
 */
async function getValueP3(serverId, endpoint, target) {
    const value = [];

    try {
        if (endpoint === "te-endpoints-eve_online-public-faction-size_factor") {
            const factions = await esi.getUniverseFactions(serverId);

            for (let i = 0; i < factions["body"].length; i++) {
                const faction = factions["body"][i];

                if (faction["name"] === target) {
                    value.push([faction["size_factor"], "number"]);

                    break;
                }
            }
        }
        else if (endpoint === "te-endpoints-eve_online-public-faction-station_count") {
            const factions = await esi.getUniverseFactions(serverId);

            for (let i = 0; i < factions["body"].length; i++) {
                const faction = factions["body"][i];

                if (faction["name"] === target) {
                    value.push([faction["station_count"], "number"]);

                    break;
                }
            }
        }
        else if (endpoint === "te-endpoints-eve_online-public-faction-system_count") {
            const factions = await esi.getUniverseFactions(serverId);

            for (let i = 0; i < factions["body"].length; i++) {
                const faction = factions["body"][i];

                if (faction["name"] === target) {
                    value.push([faction["station_system_count"], "number"]);

                    break;
                }
            }
        }
    }
    catch (error) {
        const message = output.error(error);
        socket.messageToRoom(serverId, "config_server_logs", "error", message);
    }

    return value;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Object} token 
 * @param {Object} parameters 
 */
async function getP1(serverId, userId, token, parameters) {
    const endpoint = parameters["endpoint"];

    // Check if the user must be authenticated on Discord to check this endpoint.
    const requiresAuthentication = await endpoints.requiresAuthentication(endpoint);

    if (!requiresAuthentication) {
        // Get the value and data type.
        const value = await getValueP1(serverId, userId, undefined, endpoint);

        return value;
    }
    else {
        // If authentication is required but we have no token, abort.
        if (!token) {
            return "TOKEN REQUIRED";
        }
    }

    // Get the token details.
    const tokenDetailList = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");

    if (!tokenDetailList) {
        return "TOKEN REQUIRED";
    }

    const refreshToken = token["body"]["refresh_token"];
    const tokenDetails = tokenDetailList[refreshToken];

    // Check if the token is valid.
    const tokenValidity = tokenDetails["validity"];

    if (tokenValidity === "invalid") {
        return "TOKEN REQUIRED";
    }

    // Check if the token has the necessary scope to get the value.
    const scopes = tokenDetails["body"]["Scopes"];
    const hasScope = await endpoints.hasScopeP1(endpoint, scopes)

    if (!hasScope) {
        await esi.setTokenValidity(serverId, userId, refreshToken, "incomplete");

        return "TOKEN REQUIRED";
    }

    const characterId = tokenDetails["body"]["CharacterID"];
    const value = await getValueP1(serverId, userId, characterId, endpoint);

    return value;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Object} token 
 * @param {Object} parameters 
 */
async function getP2(serverId, userId, token, parameters) {
    const endpoint = parameters["endpoint"];
    const direction = parameters["direction"];
    const entityType = parameters["entityType"];
    const entity = parameters["entity"];

    // Check if the user must be authenticated on Discord to check this endpoint.
    const requiresAuthentication = await endpoints.requiresAuthentication(endpoint);

    if (!requiresAuthentication) {
        // Get the value and data type.
        const value = await getValueP2(serverId, userId, undefined, endpoint, direction, entityType, entity);

        return value;
    }
    else {
        // If authentication is required but we have no token, abort.
        if (!token) {
            return "TOKEN REQUIRED";
        }
    }

    // Get the token details.
    const tokenDetailList = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");

    if (!tokenDetailList) {
        return "TOKEN REQUIRED";
    }

    const refreshToken = token["body"]["refresh_token"];
    const tokenDetails = tokenDetailList[refreshToken];

    // Check if the token is valid.
    const tokenValidity = tokenDetails["validity"];

    if (tokenValidity === "invalid") {
        return "TOKEN REQUIRED";
    }

    // Check if the token has the necessary scope to get the value.
    const scopes = tokenDetails["body"]["Scopes"];
    const hasScope = await endpoints.hasScopeP2(endpoint, scopes, direction, entityType);

    if (!hasScope) {
        await esi.setTokenValidity(serverId, userId, refreshToken, "incomplete");

        return "TOKEN REQUIRED";
    }

    const characterId = tokenDetails["body"]["CharacterID"];
    const value = await getValueP2(serverId, userId, characterId, endpoint, direction, entityType, entity);

    return value;
}

/**
 * 
 * @param {String} serverId 
 * @param {String} userId 
 * @param {Object} token 
 * @param {Object} parameters 
 */
async function getP3(serverId, userId, token, parameters) {
    const endpoint = parameters["endpoint"];
    const target = parameters["target"];

    // Check if the user must be authenticated on Discord to check this endpoint.
    const requiresAuthentication = await endpoints.requiresAuthentication(endpoint);

    if (!requiresAuthentication) {
        // Get the value and data type.
        const value = await getValueP3(serverId, endpoint, target);

        return value;
    }
    else {
        // If authentication is required but we have no token, abort.
        if (!token) {
            return "TOKEN REQUIRED";
        }
    }

    // Get the token details.
    const tokenDetailList = await disk.loadFile("./data/discord/server/" + serverId + "/user/" + userId + "/token_detail.json");

    if (!tokenDetailList) {
        return "TOKEN REQUIRED";
    }

    const refreshToken = token["body"]["refresh_token"];
    const tokenDetails = tokenDetailList[refreshToken];

    // Check if the token is valid.
    const tokenValidity = tokenDetails["validity"];

    if (tokenValidity === "invalid") {
        return "TOKEN REQUIRED";
    }

    // Check if the token has the necessary scope to get the value.
    const scopes = tokenDetails["body"]["Scopes"];
    const hasScope = await endpoints.hasScopeP3(endpoint, scopes)

    if (!hasScope) {
        await esi.setTokenValidity(serverId, userId, refreshToken, "incomplete");

        return "TOKEN REQUIRED";
    }

    const value = await getValueP3(serverId, endpoint, target);

    return value;
}

module.exports.getP1 = getP1;
module.exports.getP2 = getP2;
module.exports.getP3 = getP3;