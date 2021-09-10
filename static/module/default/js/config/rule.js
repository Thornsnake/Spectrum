"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;

let conditions = undefined;
let actions = undefined;
//#endregion

function showOrHidePermissionOverwrites() {
    const permissionOverwrites = document.getElementById("permission-overwrites");

    if (document.getElementById("overwrite-permissions").getAttribute("data-checked") === "yes") {
        permissionOverwrites.style.display = null;
    }
    else if (document.getElementById("overwrite-permissions").getAttribute("data-checked") === "no") {
        permissionOverwrites.style.display = "none";
    }
}

function createActionHeader(parent, headerName) {
    const actionHeader = document.createElement("div");
    actionHeader.className = "action-header";
    actionHeader.style.marginTop = "10px";
    actionHeader.style.marginBottom = "5px";
    actionHeader.style.background = "#333333";
    actionHeader.innerHTML = headerName;

    parent.appendChild(actionHeader);
}

function createCheckboxOption(parent, elementId, objectName, title, tooltip, defaultStatus, details, callback = undefined) {
    const checkboxElement = document.createElement("div");
    checkboxElement.id = elementId;
    checkboxElement.className = "flex-row flex-dynamic action-option";

    if (tooltip) {
        checkboxElement.title = tooltip;
    }

    if (details) {
        checkboxElement.setAttribute("data-checked", details[objectName]);
    }
    else {
        if (defaultStatus) {
            checkboxElement.setAttribute("data-checked", "yes");
        }
        else {
            checkboxElement.setAttribute("data-checked", "no");
        }
    }

    checkboxElement.addEventListener(
        "click",
        function () {
            if (this.getAttribute("data-checked") === "no") {
                this.setAttribute("data-checked", "yes");

                this.childNodes[1].style.color = "#00FF00";
                this.childNodes[1].style.borderColor = "#00FF00";

                this.childNodes[1].innerHTML = "YES";
            }
            else if (this.getAttribute("data-checked") === "yes") {
                this.setAttribute("data-checked", "no");

                this.childNodes[1].style.color = "#FF0000";
                this.childNodes[1].style.borderColor = "#FF0000";

                this.childNodes[1].innerHTML = "NO";
            }

            if (callback) {
                callback();
            }
        },
        false
    );

    const checkboxElementTitle = document.createElement("span");
    checkboxElementTitle.className = "action-option-description";
    checkboxElementTitle.innerHTML = title;

    checkboxElement.appendChild(checkboxElementTitle);

    const checkboxElementCheckbox = document.createElement("div");
    checkboxElementCheckbox.className = "action-option-checkbox";

    if (checkboxElement.getAttribute("data-checked") === "no") {
        checkboxElementCheckbox.style.color = "#FF0000";
        checkboxElementCheckbox.style.borderColor = "#FF0000";
        checkboxElementCheckbox.innerHTML = "NO";
    }
    else if (checkboxElement.getAttribute("data-checked") === "yes") {
        checkboxElementCheckbox.style.color = "#00FF00";
        checkboxElementCheckbox.style.borderColor = "#00FF00";
        checkboxElementCheckbox.innerHTML = "YES";
    }

    checkboxElement.appendChild(checkboxElementCheckbox);

    parent.appendChild(checkboxElement);
}

function createMultichoiceCheckboxOption(parent, elementId, objectName, title, tooltip, defaultStatus, details, callback = undefined) {
    const checkboxElement = document.createElement("div");
    checkboxElement.id = elementId;
    checkboxElement.className = "flex-row flex-dynamic action-option";

    if (tooltip) {
        checkboxElement.title = tooltip;
    }

    if (details) {
        checkboxElement.setAttribute("data-checked", details[objectName]);
    }
    else {
        if (defaultStatus) {
            checkboxElement.setAttribute("data-checked", "yes");
        }
        else if (defaultStatus === undefined) {
            checkboxElement.setAttribute("data-checked", "inherit");
        }
        else {
            checkboxElement.setAttribute("data-checked", "no");
        }
    }

    checkboxElement.addEventListener(
        "click",
        function () {
            if (this.getAttribute("data-checked") === "no") {
                this.setAttribute("data-checked", "inherit");

                this.childNodes[1].style.color = "#AAAAFF";
                this.childNodes[1].style.borderColor = "#AAAAFF";

                this.childNodes[1].innerHTML = "INHERIT";
            }
            else if (this.getAttribute("data-checked") === "yes") {
                this.setAttribute("data-checked", "no");

                this.childNodes[1].style.color = "#FF0000";
                this.childNodes[1].style.borderColor = "#FF0000";

                this.childNodes[1].innerHTML = "NO";
            }
            else if (this.getAttribute("data-checked") === "inherit") {
                this.setAttribute("data-checked", "yes");

                this.childNodes[1].style.color = "#00FF00";
                this.childNodes[1].style.borderColor = "#00FF00";

                this.childNodes[1].innerHTML = "YES";
            }

            if (callback) {
                callback();
            }
        },
        false
    );

    const checkboxElementTitle = document.createElement("span");
    checkboxElementTitle.className = "action-option-description";
    checkboxElementTitle.innerHTML = title;

    checkboxElement.appendChild(checkboxElementTitle);

    const checkboxElementCheckbox = document.createElement("div");
    checkboxElementCheckbox.className = "action-option-checkbox";

    if (checkboxElement.getAttribute("data-checked") === "no") {
        checkboxElementCheckbox.style.color = "#FF0000";
        checkboxElementCheckbox.style.borderColor = "#FF0000";
        checkboxElementCheckbox.innerHTML = "NO";
    }
    else if (checkboxElement.getAttribute("data-checked") === "yes") {
        checkboxElementCheckbox.style.color = "#00FF00";
        checkboxElementCheckbox.style.borderColor = "#00FF00";
        checkboxElementCheckbox.innerHTML = "YES";
    }
    else if (checkboxElement.getAttribute("data-checked") === "inherit") {
        checkboxElementCheckbox.style.color = "#AAAAFF";
        checkboxElementCheckbox.style.borderColor = "#AAAAFF";
        checkboxElementCheckbox.innerHTML = "INHERIT";
    }

    checkboxElement.appendChild(checkboxElementCheckbox);

    parent.appendChild(checkboxElement);
}

function load_action_discord_create_role(rule_body, details) {
    createActionHeader(rule_body, "Role Name");

    // #region Role Name Input
    const role_name = document.createElement("div");
    role_name.id = "role-name";
    role_name.className = "flex-row flex-dynamic action-input";

    const role_name_input = document.createElement("input");
    role_name_input.type = "text";
    role_name_input.maxLength = 100;
    role_name_input.required = true;
    role_name_input.style.width = "500px";
    role_name_input.style.height = "30px";
    role_name_input.style.padding = "3px";
    role_name_input.style.fontSize = "18px";
    role_name_input.style.fontWeight = "bold";

    if (details) {
        role_name_input.value = details["role_name"];
    }
    
    role_name.appendChild(role_name_input);

    rule_body.appendChild(role_name);
    // #endregion

    createActionHeader(rule_body, "Role Priority");

    // #region Role Priority Input
    const role_priority = document.createElement("div");
    role_priority.id = "role-priority";
    role_priority.className = "flex-row flex-dynamic action-input";
    role_priority.title = "A higher number means a higher priority.\n\nThis number will affect the order of the created roles on the Discord role management page. Roles with a higher priority will be above roles with a lower priority. If roles have the same priority, they will be ordered alphabetically.";

    const role_priority_input = document.createElement("input");
    role_priority_input.type = "number";
    role_priority_input.min = 0;
    role_priority_input.max = 10000
    role_priority_input.required = true;
    role_priority_input.style.width = "500px";
    role_priority_input.style.height = "30px";
    role_priority_input.style.padding = "3px";
    role_priority_input.style.fontSize = "18px";
    role_priority_input.style.fontWeight = "bold";

    if (details) {
        role_priority_input.value = details["role_priority"];
    }
    else {
        role_priority_input.value = "0";
    }

    role_priority.appendChild(role_priority_input);

    rule_body.appendChild(role_priority);
    // #endregion

    createActionHeader(rule_body, "Role Cleanup");

    createCheckboxOption(
        rule_body,
        "cleanup-1",
        "cleanup_1",
        "Auto-Delete Role",
        "If the condition is no longer met by any user, this role will be deleted. It will be recreated, should the condition be met again. Prevents roles from slowly piling up over time and should be left on, unless you have a special use case.",
        true,
        details
    );

    createActionHeader(rule_body, "Role Settings");

    createCheckboxOption(
        rule_body,
        "role-setting-1",
        "role_setting_1",
        "Display role members separately from online members",
        undefined,
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "role-setting-2",
        "role_setting_2",
        "Allow annyone to @mention this role",
        undefined,
        false,
        details
    );

    // #region Role Color
    const role_setting_3 = document.createElement("div");
    role_setting_3.id = "role-setting-3";
    role_setting_3.className = "flex-row flex-dynamic action-option";
    
    const role_setting_3_description = document.createElement("span");
    role_setting_3_description.className = "action-option-description";
    role_setting_3_description.innerHTML = "Role Color";

    const role_setting_3_text = document.createElement("input");
    role_setting_3_text.type = "text";
    role_setting_3_text.style.width = "100px";
    role_setting_3_text.style.height = "30px";
    role_setting_3_text.style.marginLeft = "auto";
    role_setting_3_text.style.padding = "3px";
    role_setting_3_text.style.fontSize = "18px";
    role_setting_3_text.style.fontWeight = "bold";

    if (!details) {
        role_setting_3_text.value = "#000000";
    }
    else {
        role_setting_3_text.value = details["role_setting_3"];
    }

    const role_setting_3_input = document.createElement("input");
    role_setting_3_input.type = "color";
    role_setting_3_input.style.width = "100px";
    role_setting_3_input.style.height = "30px";
    role_setting_3_input.style.marginLeft = "5px";
    role_setting_3_input.style.padding = "3px";

    if (!details) {
        role_setting_3_input.value = "#000000";
    }
    else {
        role_setting_3_input.value = details["role_setting_3"];
    }

    role_setting_3_text.addEventListener(
        "change",
        function () {
            role_setting_3_input.value = this.value;
        },
        false
    );

    role_setting_3_input.addEventListener(
        "change",
        function () {
            role_setting_3_text.value = this.value;
        },
        false
    );

    role_setting_3.appendChild(role_setting_3_description);
    role_setting_3.appendChild(role_setting_3_text);
    role_setting_3.appendChild(role_setting_3_input);

    rule_body.appendChild(role_setting_3);
    // #endregion

    createActionHeader(rule_body, "General Permissions");

    createCheckboxOption(
        rule_body,
        "general-permission-1",
        "general_permission_1",
        "Administrator",
        "Members with this permission have every permission and also bypass channel specific permissions. This is a dangerous permission to grant.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "general-permission-2",
        "general_permission_2",
        "View Audit Log",
        "Members with this permission have access to view the server's audit logs.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "general-permission-3",
        "general_permission_3",
        "Manage Server",
        "Members with this permission can change the server's name or move regions.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "general-permission-4",
        "general_permission_4",
        "Manage Roles",
        "Members with this permission can create new roles and edit/delete roles lower than this one.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "general-permission-5",
        "general_permission_5",
        "Manage Channels",
        "Members with this permission can create new channels and edit or delete existing ones.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "general-permission-6",
        "general_permission_6",
        "Kick Members",
        undefined,
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "general-permission-7",
        "general_permission_7",
        "Ban Members",
        undefined,
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "general-permission-8",
        "general_permission_8",
        "Create Instant Invite",
        undefined,
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "general-permission-9",
        "general_permission_9",
        "Change Nickname",
        "Members with this permission can change their own nickname.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "general-permission-10",
        "general_permission_10",
        "Manage Nicknames",
        "Members with this permission can change nicknames of other members.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "general-permission-11",
        "general_permission_11",
        "Manage Emojis",
        undefined,
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "general-permission-12",
        "general_permission_12",
        "Manage Webhooks",
        "Members with this permission can create, edit and delete webhooks.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "general-permission-13",
        "general_permission_13",
        "Read Text Channels & See Voice Channels",
        undefined,
        false,
        details
    );

    createActionHeader(rule_body, "Text Permissions");

    createCheckboxOption(
        rule_body,
        "text-permission-1",
        "text_permission_1",
        "Send Message",
        undefined,
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "text-permission-2",
        "text_permission_2",
        "Send TTS Message",
        "Members with this permission can send text-to-speech messages by starting a message with /tts. These messages can be heard by everyone focused on the channel.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "text-permission-3",
        "text_permission_3",
        "Manage Messages",
        "Members with this permission can delete messages from other members and pin messages.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "text-permission-4",
        "text_permission_4",
        "Embed Links",
        undefined,
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "text-permission-5",
        "text_permission_5",
        "Attach Files",
        undefined,
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "text-permission-6",
        "text_permission_6",
        "Read Message History",
        undefined,
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "text-permission-7",
        "text_permission_7",
        "Mention Everyone",
        "Members with this permission can trigger push notifications for all members by starting a message with @everyone or @here.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "text-permission-8",
        "text_permission_8",
        "Use External Emojis",
        "Members with this permission can use emojis from other servers on this server.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "text-permission-9",
        "text_permission_9",
        "Add Reactions",
        "Members with this permission can add new reactions to a message. Members can still react using reactions already added to messages without this permission.",
        false,
        details
    );

    createActionHeader(rule_body, "Voice Permissions");

    createCheckboxOption(
        rule_body,
        "voice-permission-1",
        "voice_permission_1",
        "Connect",
        undefined,
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "voice-permission-2",
        "voice_permission_2",
        "Speak",
        undefined,
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "voice-permission-3",
        "voice_permission_3",
        "Mute Members",
        undefined,
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "voice-permission-4",
        "voice_permission_4",
        "Deafen Members",
        undefined,
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "voice-permission-5",
        "voice_permission_5",
        "Move Members",
        "Members with this permission can drag other members out of a channel. They can only move members between channels both they and the member they are moving have access to.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "voice-permission-6",
        "voice_permission_6",
        "Use Voice Activity",
        "Members must use push-to-talk if this permission is disallowed.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "voice-permission-7",
        "voice_permission_7",
        "Priority Speaker",
        "Users with this permission have the ability to be more easily heard when talking. When activated, the volume of others without this permission will be automatically lowered. Priority Speaker is activated by using the Push to Talk (Priority) keybind.",
        false,
        details
    );
}

function load_action_discord_add_role_to_user(rule_body, details) {
    createActionHeader(rule_body, "Role Name");

    // #region Role Name Input
    const role_name = document.createElement("div");
    role_name.id = "role-name";
    role_name.className = "flex-row flex-dynamic action-input";

    const role_name_input = document.createElement("input");
    role_name_input.type = "text";
    role_name_input.maxLength = 100;
    role_name_input.required = true;
    role_name_input.style.width = "500px";
    role_name_input.style.height = "30px";
    role_name_input.style.padding = "3px";
    role_name_input.style.fontSize = "18px";
    role_name_input.style.fontWeight = "bold";

    if (details) {
        role_name_input.value = details["role_name"];
    }
    
    role_name.appendChild(role_name_input);

    rule_body.appendChild(role_name);
    // #endregion

    createActionHeader(rule_body, "Role Cleanup");

    createCheckboxOption(
        rule_body,
        "cleanup-1",
        "cleanup_1",
        "Auto-Remove Role From User",
        "If the condition is no longer met, this role will be taken from the user. Should be left on, unless you have a special use case where the condition only needs to be met once at any given time for the role assignment to be permanent.",
        true,
        details
    );
}

function load_action_discord_create_channel(rule_body, details) {
    createActionHeader(rule_body, "Channel Name");

    // #region Channel Name Input
    const channel_name = document.createElement("div");
    channel_name.id = "channel-name";
    channel_name.className = "flex-row flex-dynamic action-input";

    const channel_name_input = document.createElement("input");
    channel_name_input.type = "text";
    channel_name_input.maxLength = 100;
    channel_name_input.required = true;
    channel_name_input.style.width = "500px";
    channel_name_input.style.height = "30px";
    channel_name_input.style.padding = "3px";
    channel_name_input.style.fontSize = "18px";
    channel_name_input.style.fontWeight = "bold";

    if (details) {
        channel_name_input.value = details["channel_name"];
    }

    channel_name.appendChild(channel_name_input);

    rule_body.appendChild(channel_name);
    // #endregion

    createActionHeader(rule_body, "Channel Type");

    // #region Channel Type Select
    const channel_type = document.createElement("div");
    channel_type.id = "channel-type";
    channel_type.className = "flex-row flex-dynamic action-input";

    const channel_type_select = document.createElement("select");
    channel_type_select.required = true;
    channel_type_select.style.width = "500px";
    channel_type_select.style.height = "30px";
    channel_type_select.style.padding = "3px";
    channel_type_select.style.fontSize = "18px";
    channel_type_select.style.fontWeight = "bold";
    channel_type_select.addEventListener("change",
        function () {
            if (channel_type_select.value === "text") {
                textSettings.style.display = null;
                voiceSettings.style.display = "none";
            }
            else if (channel_type_select.value === "voice") {
                textSettings.style.display = "none";
                voiceSettings.style.display = null;
            }
        },
        false
    );

    channel_type.appendChild(channel_type_select);

    const channel_type_option_text = document.createElement("option");
    channel_type_option_text.value = "text";
    channel_type_option_text.innerHTML = "Text";

    channel_type_select.appendChild(channel_type_option_text);

    const channel_type_option_voice = document.createElement("option");
    channel_type_option_voice.value = "voice";
    channel_type_option_voice.innerHTML = "Voice";

    channel_type_select.appendChild(channel_type_option_voice);

    if (details) {
        channel_type_select.value = details["channel_type"];
    }
    else {
        channel_type_select.value = "text";
    }

    rule_body.appendChild(channel_type);
    // #endregion

    createActionHeader(rule_body, "Channel Priority");

    // #region Channel Priority Input
    const channel_priority = document.createElement("div");
    channel_priority.id = "channel-priority";
    channel_priority.className = "flex-row flex-dynamic action-input";
    channel_priority.title = "A higher number means a higher priority.\n\nThis number will affect the order of the created channels on Discord. Channels with a higher priority will be above channels with a lower priority. If channels have the same priority, they will be ordered alphabetically.";

    const channel_priority_input = document.createElement("input");
    channel_priority_input.type = "number";
    channel_priority_input.min = 0;
    channel_priority_input.max = 10000
    channel_priority_input.required = true;
    channel_priority_input.style.width = "500px";
    channel_priority_input.style.height = "30px";
    channel_priority_input.style.padding = "3px";
    channel_priority_input.style.fontSize = "18px";
    channel_priority_input.style.fontWeight = "bold";

    if (details) {
        channel_priority_input.value = details["channel_priority"];
    }
    else {
        channel_priority_input.value = "0";
    }

    channel_priority.appendChild(channel_priority_input);

    rule_body.appendChild(channel_priority);
    // #endregion

    createActionHeader(rule_body, "Channel Cleanup");

    createCheckboxOption(
        rule_body,
        "auto-delete",
        "auto_delete",
        "Auto-Delete Channel",
        "If the condition is no longer met by any user, this channel will be deleted. It will be recreated, should the condition be met again. Prevents channels from slowly piling up over time and should be left on, unless you have a special use case.",
        true,
        details
    );

    const textSettings = document.createElement("div");
    textSettings.id = "text-settings";
    textSettings.className = "flex-column flex-dynamic";

    const voiceSettings = document.createElement("div");
    voiceSettings.id = "voice-settings";
    voiceSettings.className = "flex-column flex-dynamic";

    rule_body.appendChild(textSettings);
    rule_body.appendChild(voiceSettings);
    
    // #region Text
    createActionHeader(textSettings, "Channel Settings");

    createCheckboxOption(
        textSettings,
        "nsfw",
        "nsfw",
        "NSFW",
        "This channel is NSFW (Not Safe For Work) and might contain inappropriate material.",
        false,
        details
    );

    // #region Rate Limit
    const channel_rate_limit = document.createElement("div");
    channel_rate_limit.id = "rate-limit";
    channel_rate_limit.className = "flex-row flex-dynamic action-option";
    channel_rate_limit.title = "Users can send 1 message every '#' seconds.\nA value of '0' means there is no rate limit.";

    const channel_rate_limit_description = document.createElement("span");
    channel_rate_limit_description.className = "action-option-description";
    channel_rate_limit_description.innerHTML = "Rate Limit";

    channel_rate_limit.appendChild(channel_rate_limit_description);

    const channel_rate_limit_input = document.createElement("input");
    channel_rate_limit_input.type = "number";
    channel_rate_limit_input.min = 0;
    channel_rate_limit_input.max = 86400;
    channel_rate_limit_input.required = true;
    channel_rate_limit_input.style.width = "100px";
    channel_rate_limit_input.style.height = "30px";
    channel_rate_limit_input.style.marginLeft = "auto";
    channel_rate_limit_input.style.padding = "3px";
    channel_rate_limit_input.style.fontSize = "18px";
    channel_rate_limit_input.style.fontWeight = "bold";

    if (details) {
        channel_rate_limit_input.value = details["rate_limit"];
    }
    else {
        channel_rate_limit_input.value = "0";
    }

    channel_rate_limit.appendChild(channel_rate_limit_input);

    textSettings.appendChild(channel_rate_limit);
    // #endregion

    // #region Channel Topic
    const channel_topic = document.createElement("div");
    channel_topic.id = "topic";
    channel_topic.className = "flex-row flex-dynamic action-option";
    channel_topic.style.height = "auto";

    const channel_topic_description = document.createElement("span");
    channel_topic_description.className = "action-option-description";
    channel_topic_description.innerHTML = "Channel Topic";

    channel_topic.appendChild(channel_topic_description);

    const channel_topic_textarea = document.createElement("textarea");
    channel_topic_textarea.maxLength = 1000;
    channel_topic_textarea.style.width = "500px";
    channel_topic_textarea.style.height = "150px";
    channel_topic_textarea.style.marginLeft = "auto";
    channel_topic_textarea.style.padding = "3px";
    channel_topic_textarea.style.fontSize = "18px";
    channel_topic_textarea.style.fontWeight = "bold";
    channel_topic_textarea.placeholder = "Enter a short description of the channel, useful links or information that will be shown to users at the top of the channel.\n\nYou can also leave this empty ...";

    if (details) {
        channel_topic_textarea.value = details["topic"];
    }

    channel_topic.appendChild(channel_topic_textarea);

    textSettings.appendChild(channel_topic);
    // #endregion
    // #endregion

    // #region Voice
    createActionHeader(voiceSettings, "Channel Settings");

    // #region Bitrate
    const channel_bitrate = document.createElement("div");
    channel_bitrate.id = "bitrate";
    channel_bitrate.className = "flex-row flex-dynamic action-option";
    channel_bitrate.title = "The bitrate in kbps (kilobits per second).\nA higher bitrate will give you better sound quality, but can negatively affect people with lower bandwith.";

    const channel_bitrate_description = document.createElement("span");
    channel_bitrate_description.className = "action-option-description";
    channel_bitrate_description.innerHTML = "Bitrate";

    channel_bitrate.appendChild(channel_bitrate_description);

    const channel_bitrate_input = document.createElement("input");
    channel_bitrate_input.type = "number";
    channel_bitrate_input.min = 8;
    channel_bitrate_input.max = 96;
    channel_bitrate_input.required = true;
    channel_bitrate_input.style.width = "100px";
    channel_bitrate_input.style.height = "30px";
    channel_bitrate_input.style.marginLeft = "auto";
    channel_bitrate_input.style.padding = "3px";
    channel_bitrate_input.style.fontSize = "18px";
    channel_bitrate_input.style.fontWeight = "bold";

    if (details) {
        channel_bitrate_input.value = details["bitrate"];
    }
    else {
        channel_bitrate_input.value = "64";
    }

    channel_bitrate.appendChild(channel_bitrate_input);

    voiceSettings.appendChild(channel_bitrate);
    // #endregion

    // #region User Limit
    const channel_user_limit = document.createElement("div");
    channel_user_limit.id = "user-limit";
    channel_user_limit.className = "flex-row flex-dynamic action-option";
    channel_user_limit.title = "The maximum number of users allowed in this voice channel.\nA value of '0' means there is no limit.";

    const channel_user_limit_description = document.createElement("span");
    channel_user_limit_description.className = "action-option-description";
    channel_user_limit_description.innerHTML = "User Limit";

    channel_user_limit.appendChild(channel_user_limit_description);

    const channel_user_limit_input = document.createElement("input");
    channel_user_limit_input.type = "number";
    channel_user_limit_input.min = 0;
    channel_user_limit_input.max = 10000;
    channel_user_limit_input.required = true;
    channel_user_limit_input.style.width = "100px";
    channel_user_limit_input.style.height = "30px";
    channel_user_limit_input.style.marginLeft = "auto";
    channel_user_limit_input.style.padding = "3px";
    channel_user_limit_input.style.fontSize = "18px";
    channel_user_limit_input.style.fontWeight = "bold";

    if (details) {
        channel_user_limit_input.value = details["user_limit"];
    }
    else {
        channel_user_limit_input.value = "0";
    }

    channel_user_limit.appendChild(channel_user_limit_input);

    voiceSettings.appendChild(channel_user_limit);
    // #endregion
    // #endregion

    if (channel_type_select.value === "text") {
        textSettings.style.display = null;
        voiceSettings.style.display = "none";
    }
    else if (channel_type_select.value === "voice") {
        textSettings.style.display = "none";
        voiceSettings.style.display = null;
    }
}

function load_action_discord_add_role_to_channel(rule_body, details) {
    createActionHeader(rule_body, "Channel Name");

    // #region Channel Name Input
    const channel_name = document.createElement("div");
    channel_name.id = "channel-name";
    channel_name.className = "flex-row flex-dynamic action-input";

    const channel_name_input = document.createElement("input");
    channel_name_input.type = "text";
    channel_name_input.maxLength = 100;
    channel_name_input.required = true;
    channel_name_input.style.width = "500px";
    channel_name_input.style.height = "30px";
    channel_name_input.style.padding = "3px";
    channel_name_input.style.fontSize = "18px";
    channel_name_input.style.fontWeight = "bold";

    if (details) {
        channel_name_input.value = details["channel_name"];
    }

    channel_name.appendChild(channel_name_input);

    rule_body.appendChild(channel_name);
    // #endregion

    createActionHeader(rule_body, "Channel Type");

    // #region Channel Type Select
    const channel_type = document.createElement("div");
    channel_type.id = "channel-type";
    channel_type.className = "flex-row flex-dynamic action-input";

    const channel_type_select = document.createElement("select");
    channel_type_select.required = true;
    channel_type_select.style.width = "500px";
    channel_type_select.style.height = "30px";
    channel_type_select.style.padding = "3px";
    channel_type_select.style.fontSize = "18px";
    channel_type_select.style.fontWeight = "bold";
    channel_type_select.addEventListener("change",
        function () {
            if (channel_type_select.value === "text") {
                textSettings.style.display = null;
                voiceSettings.style.display = "none";
            }
            else if (channel_type_select.value === "voice") {
                textSettings.style.display = "none";
                voiceSettings.style.display = null;
            }
        },
        false
    );

    channel_type.appendChild(channel_type_select);

    const channel_type_option_text = document.createElement("option");
    channel_type_option_text.value = "text";
    channel_type_option_text.innerHTML = "Text";

    channel_type_select.appendChild(channel_type_option_text);

    const channel_type_option_voice = document.createElement("option");
    channel_type_option_voice.value = "voice";
    channel_type_option_voice.innerHTML = "Voice";

    channel_type_select.appendChild(channel_type_option_voice);

    if (details) {
        channel_type_select.value = details["channel_type"];
    }
    else {
        channel_type_select.value = "text";
    }

    rule_body.appendChild(channel_type);
    // #endregion

    createActionHeader(rule_body, "Role Name");

    // #region Role Name Input
    const role_name = document.createElement("div");
    role_name.id = "role-name";
    role_name.className = "flex-row flex-dynamic action-input";

    const role_name_input = document.createElement("input");
    role_name_input.type = "text";
    role_name_input.maxLength = 100;
    role_name_input.required = true;
    role_name_input.style.width = "500px";
    role_name_input.style.height = "30px";
    role_name_input.style.padding = "3px";
    role_name_input.style.fontSize = "18px";
    role_name_input.style.fontWeight = "bold";

    if (details) {
        role_name_input.value = details["role_name"];
    }

    role_name.appendChild(role_name_input);

    rule_body.appendChild(role_name);
    // #endregion

    createActionHeader(rule_body, "Role Cleanup");

    createCheckboxOption(
        rule_body,
        "auto-remove",
        "auto_remove",
        "Auto-Remove Role From Channel",
        "If the condition is no longer met, this role will be taken from the channel. Should be left on, unless you have a special use case where the condition only needs to be met once at any given time for the role assignment to be permanent.",
        true,
        details
    );

    createActionHeader(rule_body, "Permission Overwrites");

    createCheckboxOption(
        rule_body,
        "overwrite-permissions",
        "overwrite_permissions",
        "Overwrite permissions for this role",
        "If set to 'yes', the role permissions will be overwritten with the permissions you select here.",
        false,
        details,
        showOrHidePermissionOverwrites
    );

    const permissionOverwrites = document.createElement("div");
    permissionOverwrites.id = "permission-overwrites";
    permissionOverwrites.className = "flex-column flex-dynamic";

    rule_body.appendChild(permissionOverwrites);

    createActionHeader(permissionOverwrites, "General Permissions");

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "create-instant-invite",
        "create_instant_invite",
        "Create Instant Invite",
        undefined,
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "manage-channel",
        "manage_channel",
        "Manage Channel",
        "Members with this permission can change the channel's name or delete it.",
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "manage-permissions",
        "manage_permissions",
        "Manage Permissions",
        "Members with this permission can change this channel's permissions.",
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "manage-webhooks",
        "manage_webhooks",
        "Manage Webhooks",
        "Members with this permission can create, edit and delete webhooks.",
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "read-text-channels-see-voice-channels",
        "read_text_channels_see_voice_channels",
        "Read Text Channels & See Voice Channels",
        undefined,
        undefined,
        details
    );


    createActionHeader(permissionOverwrites, "Text Permissions");

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "send-messages",
        "send_messages",
        "Send Messages",
        undefined,
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "send-tts-messages",
        "send_tts_messages",
        "Send TTS Messages",
        "Members with this permission can send text-to-speech messages by starting a message with /tts. These messages can be heard by everyone focused on the channel.",
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "manage-messages",
        "manage_messages",
        "Manage Messages",
        "Members with this permission can delete messages by other members or pin any messages.",
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "embed-links",
        "embed_links",
        "Embed Links",
        undefined,
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "attach-files",
        "attach_files",
        "Attach Files",
        undefined,
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "read-message-history",
        "read_message_history",
        "Read Message History",
        undefined,
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "mention-everyone",
        "mention_everyone",
        "Mention Everyone",
        "Members with this permission can trigger push notifications for all members of this channel by starting a message with @everyone or @here.",
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "use-external-emojis",
        "use_external_emojis",
        "Use External Emojis",
        "Members with this permission can use enojis from other servers in this server.",
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "add-reactions",
        "add_reactions",
        "Add Reactions",
        "Members with this permission can add new reactions to a message. Members can still react using reactions already added to messages without this permission.",
        undefined,
        details
    );

    createActionHeader(permissionOverwrites, "Voice Permissions");

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "connect",
        "connect",
        "Connect",
        undefined,
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "speak",
        "speak",
        "Speak",
        undefined,
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "mute-members",
        "mute_members",
        "Mute Members",
        undefined,
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "deafen-members",
        "deafen_members",
        "Deafen Members",
        undefined,
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "move-members",
        "move_members",
        "Move Members",
        "Members with this permission can drag other members out of this channel. They can only move members between channels both they and the member they are moving have access.",
        undefined,
        details
    );

    createMultichoiceCheckboxOption(
        permissionOverwrites,
        "use-voice-activity",
        "use_voice_activity",
        "Use Voice Activity",
        "Members must use Push-to-talk in this channel if this permission is disallowed.",
        undefined,
        details
    );

    if (document.getElementById("overwrite-permissions").getAttribute("data-checked") === "yes") {
        permissionOverwrites.style.display = null;
    }
    else if (document.getElementById("overwrite-permissions").getAttribute("data-checked") === "no") {
        permissionOverwrites.style.display = "none";
    }
}

function load_action_discord_create_category(rule_body, details) {
    createActionHeader(rule_body, "Category Name");

    // #region Category Name Input
    const category_name = document.createElement("div");
    category_name.id = "category-name";
    category_name.className = "flex-row flex-dynamic action-input";

    const category_name_input = document.createElement("input");
    category_name_input.type = "text";
    category_name_input.maxLength = 100;
    category_name_input.required = true;
    category_name_input.style.width = "500px";
    category_name_input.style.height = "30px";
    category_name_input.style.padding = "3px";
    category_name_input.style.fontSize = "18px";
    category_name_input.style.fontWeight = "bold";

    if (details) {
        category_name_input.value = details["category_name"];
    }

    category_name.appendChild(category_name_input);

    rule_body.appendChild(category_name);
    // #endregion

    createActionHeader(rule_body, "Category Priority");

    // #region Category Priority Input
    const category_priority = document.createElement("div");
    category_priority.id = "category-priority";
    category_priority.className = "flex-row flex-dynamic action-input";
    category_priority.title = "A higher number means a higher priority.\n\nThis number will affect the order of the created categories on Discord. Categories with a higher priority will be above categories with a lower priority. If categories have the same priority, they will be ordered alphabetically.";

    const category_priority_input = document.createElement("input");
    category_priority_input.type = "number";
    category_priority_input.min = 0;
    category_priority_input.max = 10000
    category_priority_input.required = true;
    category_priority_input.style.width = "500px";
    category_priority_input.style.height = "30px";
    category_priority_input.style.padding = "3px";
    category_priority_input.style.fontSize = "18px";
    category_priority_input.style.fontWeight = "bold";

    if (details) {
        category_priority_input.value = details["category_priority"];
    }
    else {
        category_priority_input.value = "0";
    }

    category_priority.appendChild(category_priority_input);

    rule_body.appendChild(category_priority);
    // #endregion

    createActionHeader(rule_body, "Category Cleanup");

    createCheckboxOption(
        rule_body,
        "auto-delete",
        "auto_delete",
        "Auto-Delete Category",
        "If the condition is no longer met by any user, this category will be deleted. It will be recreated, should the condition be met again. Prevents categories from slowly piling up over time and should be left on, unless you have a special use case.",
        true,
        details
    );
}

function load_action_discord_add_channel_to_category(rule_body, details) {
    createActionHeader(rule_body, "Category Name");

    // #region Category Name Input
    const category_name = document.createElement("div");
    category_name.id = "category-name";
    category_name.className = "flex-row flex-dynamic action-input";

    const category_name_input = document.createElement("input");
    category_name_input.type = "text";
    category_name_input.maxLength = 100;
    category_name_input.required = true;
    category_name_input.style.width = "500px";
    category_name_input.style.height = "30px";
    category_name_input.style.padding = "3px";
    category_name_input.style.fontSize = "18px";
    category_name_input.style.fontWeight = "bold";

    if (details) {
        category_name_input.value = details["category_name"];
    }

    category_name.appendChild(category_name_input);

    rule_body.appendChild(category_name);
    // #endregion

    createActionHeader(rule_body, "Channel Name");

    // #region Channel Name Input
    const channel_name = document.createElement("div");
    channel_name.id = "channel-name";
    channel_name.className = "flex-row flex-dynamic action-input";

    const channel_name_input = document.createElement("input");
    channel_name_input.type = "text";
    channel_name_input.maxLength = 100;
    channel_name_input.required = true;
    channel_name_input.style.width = "500px";
    channel_name_input.style.height = "30px";
    channel_name_input.style.padding = "3px";
    channel_name_input.style.fontSize = "18px";
    channel_name_input.style.fontWeight = "bold";

    if (details) {
        channel_name_input.value = details["channel_name"];
    }

    channel_name.appendChild(channel_name_input);

    rule_body.appendChild(channel_name);
    // #endregion

    createActionHeader(rule_body, "Channel Type");

    // #region Channel Type Select
    const channel_type = document.createElement("div");
    channel_type.id = "channel-type";
    channel_type.className = "flex-row flex-dynamic action-input";

    const channel_type_select = document.createElement("select");
    channel_type_select.required = true;
    channel_type_select.style.width = "500px";
    channel_type_select.style.height = "30px";
    channel_type_select.style.padding = "3px";
    channel_type_select.style.fontSize = "18px";
    channel_type_select.style.fontWeight = "bold";
    channel_type_select.addEventListener("change",
        function () {
            if (channel_type_select.value === "text") {
                textSettings.style.display = null;
                voiceSettings.style.display = "none";
            }
            else if (channel_type_select.value === "voice") {
                textSettings.style.display = "none";
                voiceSettings.style.display = null;
            }
        },
        false
    );

    channel_type.appendChild(channel_type_select);

    const channel_type_option_text = document.createElement("option");
    channel_type_option_text.value = "text";
    channel_type_option_text.innerHTML = "Text";

    channel_type_select.appendChild(channel_type_option_text);

    const channel_type_option_voice = document.createElement("option");
    channel_type_option_voice.value = "voice";
    channel_type_option_voice.innerHTML = "Voice";

    channel_type_select.appendChild(channel_type_option_voice);

    if (details) {
        channel_type_select.value = details["channel_type"];
    }
    else {
        channel_type_select.value = "text";
    }

    rule_body.appendChild(channel_type);
    // #endregion

    createActionHeader(rule_body, "Channel Cleanup");

    createCheckboxOption(
        rule_body,
        "auto-remove",
        "auto_remove",
        "Auto-Remove Channel From Category",
        "If the condition is no longer met, this channel will be taken from the category. Should be left on, unless you have a special use case where the condition only needs to be met once at any given time for the channel assignment to be permanent.",
        true,
        details
    );
}

function load_action_discord_change_nickname(rule_body, details) {
    createActionHeader(rule_body, "Character");

    createCheckboxOption(
        rule_body,
        "force-character-name",
        "force_character_name",
        "Force Character Name",
        "Force the nickname on Discord to represent the ingame name of the character.",
        true,
        details
    );

    createActionHeader(rule_body, "Corporation");

    createCheckboxOption(
        rule_body,
        "add-corporation-ticker",
        "add_corporation_ticker",
        "Add Corporation Ticker",
        "Add the ticker of the corporation in front of the nickname.",
        false,
        details
    );

    createActionHeader(rule_body, "Alliance");

    createCheckboxOption(
        rule_body,
        "add-alliance-ticker",
        "add_alliance_ticker",
        "Add Alliance Ticker",
        "Add the ticker of the alliance in front of the nickname.",
        false,
        details
    );

    createCheckboxOption(
        rule_body,
        "fallback-corporation-ticker",
        "fallback_corporation_ticker",
        "Fallback on the Corporation Ticker",
        "If the user is not in an alliance, use the corporation ticker instead.",
        false,
        details
    );
}

function validate_action_discord_create_role() {
    const name = document.getElementById("role-name").childNodes[0];

    if (name.value.trim().length === 0) {
        name.style.border = "solid 3px #FF0000";

        name.scrollIntoView({ behavior: "smooth" });

        return false;
    }
    else {
        name.style.border = "none";
    }

    return true;
}

function validate_action_discord_create_channel() {
    const name = document.getElementById("channel-name").childNodes[0];

    if (name.value.trim().length === 0) {
        name.style.border = "solid 3px #FF0000";

        name.scrollIntoView({ behavior: "smooth" });

        return false;
    }
    else {
        name.style.border = "none";
    }

    return true;
}

function validate_action_discord_create_category() {
    const name = document.getElementById("category-name").childNodes[0];

    if (name.value.trim().length === 0) {
        name.style.border = "solid 3px #FF0000";

        name.scrollIntoView({ behavior: "smooth" });

        return false;
    }
    else {
        name.style.border = "none";
    }

    return true;
}

function validate_action_discord_add_role_to_user() {
    const name = document.getElementById("role-name").childNodes[0];

    if (name.value.trim().length === 0) {
        name.style.border = "solid 3px #FF0000";

        name.scrollIntoView({ behavior: "smooth" });

        return false;
    }
    else {
        name.style.border = "none";
    }

    return true;
}

function validate_action_discord_add_role_to_channel() {
    let name = document.getElementById("channel-name").childNodes[0];

    if (name.value.trim().length === 0) {
        name.style.border = "solid 3px #FF0000";

        name.scrollIntoView({ behavior: "smooth" });

        return false;
    }
    else {
        name.style.border = "none";
    }

    name = document.getElementById("role-name").childNodes[0];

    if (name.value.trim().length === 0) {
        name.style.border = "solid 3px #FF0000";

        name.scrollIntoView({ behavior: "smooth" });

        return false;
    }
    else {
        name.style.border = "none";
    }

    return true;
}

function validate_action_discord_add_channel_to_category() {
    let name = document.getElementById("category-name").childNodes[0];

    if (name.value.trim().length === 0) {
        name.style.border = "solid 3px #FF0000";

        name.scrollIntoView({ behavior: "smooth" });

        return false;
    }
    else {
        name.style.border = "none";
    }

    name = document.getElementById("channel-name").childNodes[0];

    if (name.value.trim().length === 0) {
        name.style.border = "solid 3px #FF0000";

        name.scrollIntoView({ behavior: "smooth" });

        return false;
    }
    else {
        name.style.border = "none";
    }

    return true;
}

function validate_action_discord_change_nickname() {
    return true;
}

function load_action_details(action_id, details = undefined) {
    const rule_area = document.getElementById("rule-area");
    const rule_body = rule_area.getElementsByClassName("rule-body")[0];

    while (rule_body.lastChild) {
        rule_body.removeChild(rule_body.lastChild);
    }

    /* Discord - Change Nickname */
    if (Number(action_id) === 3) {
        load_action_discord_change_nickname(rule_body, details);
    }

    /* Discord - Create Role */
    else if (Number(action_id) === 1) {
        load_action_discord_create_role(rule_body, details);
    }

    /* Discord - Create Channel */
    else if (Number(action_id) === 4) {
        load_action_discord_create_channel(rule_body, details);
    }

    /* Discord - Create Category */
    else if (Number(action_id) === 6) {
        load_action_discord_create_category(rule_body, details);
    }

    /* Discord - Add Role To User <*/
    else if (Number(action_id) === 2) {
        load_action_discord_add_role_to_user(rule_body, details);
    }

    /* Discord - Add Role To Channel */
    else if (Number(action_id) === 5) {
        load_action_discord_add_role_to_channel(rule_body, details);
    }

    /* Discord - Add Channel To Category */
    else if (Number(action_id) === 7) {
        load_action_discord_add_channel_to_category(rule_body, details);
    }

    rule_body.style.display = null;
}

function close_condition_dialog() {
    const condition_dialog = document.getElementById("condition-selection").parentNode;
    condition_dialog.parentNode.removeChild(condition_dialog);
};

function close_action_dialog() {
    const action_dialog = document.getElementById("action-selection").parentNode;
    action_dialog.parentNode.removeChild(action_dialog);
};

function selected_condition(condition_wrapper, condition_element) {
    const condition_id = condition_element.getAttribute("data-id");
    const condition_header = condition_element.getElementsByClassName("condition-header")[0].innerHTML;
    const condition_description = condition_element.getElementsByClassName("condition-description")[0].innerHTML;

    condition_wrapper.setAttribute("data-id", condition_id);
    condition_wrapper.getElementsByClassName("condition-header")[0].innerHTML = condition_header;
    condition_wrapper.getElementsByClassName("condition-description")[0].innerHTML = condition_description;

    condition_wrapper.style.borderColor = "#00FF00";
};

function selected_action(action_wrapper, action_element) {
    const action_id = action_element.getAttribute("data-id");
    const action_header = action_element.getElementsByClassName("action-header")[0].innerHTML;
    const action_description = action_element.getElementsByClassName("action-description")[0].innerHTML;

    action_wrapper.setAttribute("data-id", action_id);
    action_wrapper.getElementsByClassName("action-header")[0].innerHTML = action_header;
    action_wrapper.getElementsByClassName("action-description")[0].innerHTML = action_description;

    action_wrapper.style.borderColor = "#00FF00";

    load_action_details(action_id);
};

async function show_condition_dialog(event) {
    event.stopPropagation();

    if (document.getElementById("condition-selection") || document.getElementById("action-selection")) {
        return;
    }
    
    const condition_wrapper = this.parentNode.parentNode;

    const x_coord = condition_wrapper.offsetLeft + 10;
    const y_coord = condition_wrapper.offsetTop + 10;

    const dialog_width = condition_wrapper.offsetWidth - 20;

    const condition_dialog = document.createElement("div");
    condition_dialog.style.position = "absolute";
    condition_dialog.style.top = y_coord + "px";
    condition_dialog.style.left = x_coord + "px";
    condition_dialog.style.width = dialog_width + "px";
    condition_dialog.style.maxHeight = "500px";
    condition_dialog.style.overflow = "auto";

    const condition_area = document.createElement("div");
    condition_area.id = "condition-selection";
    condition_area.className = "flex-column flex-dynamic area with-border";
    condition_area.style.marginBottom = "10px";
    condition_area.style.background = "#555555";

    const condition_keys = Object.keys(conditions);

    for (let i = 0; i < condition_keys.length; i++) {
        const condition_id = condition_keys[i];
        const data_row = conditions[condition_id];

        const condition_selection = document.createElement("div");
        condition_selection.className = "flex-column flex-static area with-border";
        condition_selection.setAttribute("data-id", condition_id);
        condition_selection.style.marginBottom = "5px";
        condition_selection.style.background = "#222222";
        condition_selection.style.cursor = "pointer";
        condition_selection.addEventListener(
            "click",
            function () {
                selected_condition(condition_wrapper, this);

                close_condition_dialog();
            },
            false
        );

        const condition_header = document.createElement("div");
        condition_header.className = "condition-header";
        condition_header.innerHTML = data_row["title"];
        
        const condition_description = document.createElement("div");
        condition_description.className = "condition-description area";
        condition_description.innerHTML = data_row["description"];

        condition_selection.appendChild(condition_header);

        condition_selection.appendChild(condition_description);

        condition_area.appendChild(condition_selection);
    }
    
    condition_dialog.appendChild(condition_area);
    document.body.appendChild(condition_dialog);
};

async function show_action_dialog(event) {
    event.stopPropagation();

    if (document.getElementById("condition-selection") || document.getElementById("action-selection")) {
        return;
    }
    
    const action_wrapper = this.parentNode.parentNode;

    const x_coord = action_wrapper.offsetLeft + 10;
    const y_coord = action_wrapper.offsetTop + 10;

    const dialog_width = action_wrapper.offsetWidth - 20;

    const action_dialog = document.createElement("div");
    action_dialog.style.position = "absolute";
    action_dialog.style.top = y_coord + "px";
    action_dialog.style.left = x_coord + "px";
    action_dialog.style.width = dialog_width + "px";
    action_dialog.style.maxHeight = "500px";
    action_dialog.style.overflow = "auto";

    const action_area = document.createElement("div");
    action_area.id = "action-selection";
    action_area.className = "flex-column flex-dynamic area with-border";
    action_area.style.marginBottom = "10px";
    action_area.style.background = "#555555";

    const actionOrder = [3, 1, 4, 6, 2, 5, 7];
    const action_keys = Object.keys(actions);

    for (let orderIndex = 0; orderIndex < actionOrder.length; orderIndex++) {
        const orderedActionId = actionOrder[orderIndex];

        for (let i = 0; i < action_keys.length; i++) {
            const action_id = action_keys[i];

            if (Number(action_id) !== Number(orderedActionId)) {
                continue;
            }

            const data_row = actions[action_id];

            const action_selection = document.createElement("div");
            action_selection.className = "flex-column flex-static area with-border";
            action_selection.setAttribute("data-id", action_id);
            action_selection.style.marginBottom = "5px";
            action_selection.style.background = "#222222";
            action_selection.style.cursor = "pointer";
            action_selection.addEventListener(
                "click",
                function () {
                    selected_action(action_wrapper, this);

                    close_action_dialog();
                },
                false
            );

            const action_header = document.createElement("div");
            action_header.className = "action-header";
            action_header.innerHTML = data_row["title"];

            const action_operation_area = document.createElement("div");
            action_operation_area.className = "flex-row flex-dynamic area";
            action_operation_area.style.background = "#222222";

            const action_description = document.createElement("div");
            action_description.className = "action-description area";
            action_description.innerHTML = data_row["description"];

            action_selection.appendChild(action_header);

            action_selection.appendChild(action_description);

            action_area.appendChild(action_selection);
        }
    }

    action_dialog.appendChild(action_area);
    document.body.appendChild(action_dialog);
};

function initialize_rule(data) {
    conditions = data["conditions"];
    actions = data["actions"];

    if (get_url_parameter("id") === "new") {
        return;
    }

    const rule = data["rule"];

    const rule_title = document.getElementById("rule-title");
    rule_title.value = rule["title"];

    if (rule["description"] !== "No description.") {
        document.getElementById("rule-description").getElementsByTagName("textarea")[0].value = rule["description"];
    }

    const condition_wrapper = document.getElementById("rule-condition");
    const condition_keys = Object.keys(conditions);

    for (let i = 0; i < condition_keys.length; i++) {
        const condition_id = condition_keys[i];
        const data_row = conditions[condition_id];

        if (Number(condition_id) === Number(rule["condition"])) {
            condition_wrapper.setAttribute("data-id", condition_id);
            condition_wrapper.getElementsByClassName("condition-header")[0].innerHTML = data_row["title"];
            condition_wrapper.getElementsByClassName("condition-description")[0].innerHTML = data_row["description"];

            condition_wrapper.style.borderColor = "#00FF00";

            break;
        }
    }
    
    const action_keys = Object.keys(actions);

    for (let i = 0; i < action_keys.length; i++) {
        const action_id = action_keys[i];
        const data_row = actions[action_id];

        if (Number(action_id) === Number(rule["action"])) {
            const action_wrapper = document.getElementById("rule-action");
            action_wrapper.setAttribute("data-id", action_id);
            action_wrapper.getElementsByClassName("action-header")[0].innerHTML = data_row["title"];
            action_wrapper.getElementsByClassName("action-description")[0].innerHTML = data_row["description"];

            action_wrapper.style.borderColor = "#00FF00";

            break;
        }
    }

    load_action_details(rule["action"], rule["details"])
}

function initialize_rule_area() {
    /* Wrapper */
    const rule_area = document.getElementById("rule-area");

    /* Title */
    const rule_header = document.createElement("input");
    rule_header.id = "rule-title";
    rule_header.type = "text";
    rule_header.className = "rule-header";
    rule_header.placeholder = "New Rule";
    rule_header.required = true;

    /* Condition Selection */
    const condition_selection = document.createElement("div");
    condition_selection.id = "rule-condition";
    condition_selection.className = "flex-column flex-static area with-border";
    condition_selection.style.marginBottom = "5px";
    condition_selection.style.background = "#222222";
    condition_selection.style.borderColor = "#FF0000";

    const condition_header = document.createElement("div");
    condition_header.className = "condition-header";

    const condition_operation_area = document.createElement("div");
    condition_operation_area.className = "flex-row flex-dynamic area";
    condition_operation_area.style.background = "#222222";

    const condition_description = document.createElement("span");
    condition_description.className = "condition-description";

    const condition_select = document.createElement("button");
    condition_select.setAttribute("edit", true);
    condition_select.style.marginLeft = "auto";
    condition_select.style.marginTop = "auto";
    condition_select.style.marginBottom = "auto";
    condition_select.style.whiteSpace = "nowrap";
    condition_select.innerHTML = "Select Condition";
    condition_select.addEventListener("click", show_condition_dialog, false);
    
    condition_selection.appendChild(condition_header);

    condition_operation_area.appendChild(condition_description);
    condition_operation_area.appendChild(condition_select);
    condition_selection.appendChild(condition_operation_area);

    /* Action Selection */
    const action_selection = document.createElement("div");
    action_selection.id = "rule-action";
    action_selection.className = "flex-column flex-static area with-border";
    action_selection.style.marginBottom = "10px";
    action_selection.style.background = "#222222";
    action_selection.style.borderColor = "#FF0000";

    const action_header = document.createElement("div");
    action_header.className = "action-header";

    const action_operation_area = document.createElement("div");
    action_operation_area.className = "flex-row flex-dynamic area";
    action_operation_area.style.background = "#222222";

    const action_description = document.createElement("span");
    action_description.className = "action-description";

    const action_select = document.createElement("button");
    action_select.setAttribute("edit", true);
    action_select.style.marginLeft = "auto";
    action_select.style.marginTop = "auto";
    action_select.style.marginBottom = "auto";
    action_select.style.whiteSpace = "nowrap";
    action_select.innerHTML = "Select Action";
    action_select.addEventListener("click", show_action_dialog, false);

    action_selection.appendChild(action_header);

    action_operation_area.appendChild(action_description);
    action_operation_area.appendChild(action_select);
    action_selection.appendChild(action_operation_area);

    /* Action Details */
    const rule_body = document.createElement("div");
    rule_body.id = "rule-action-details";
    rule_body.className = "flex-row flex-static rule-body with-border";
    rule_body.style.borderColor = "#FFFFFF";
    rule_body.style.display = "none";

    rule_area.appendChild(rule_header);
    rule_area.appendChild(condition_selection);
    rule_area.appendChild(action_selection);
    rule_area.appendChild(rule_body);

    get_data();
};

function validate_rule() {
    let valid = true;

    const rule_title = document.getElementById("rule-title");
    const rule_condition = document.getElementById("rule-condition");
    const rule_action = document.getElementById("rule-action");

    if (!rule_condition.hasAttribute("data-id")) {
        valid = false;

        rule_condition.scrollIntoView({ behavior: "smooth" });

        alert("Please select a condition.");
    }

    if (!valid) {
        return valid;
    }

    if (!rule_action.hasAttribute("data-id")) {
        valid = false;

        rule_action.scrollIntoView({ behavior: "smooth" });

        alert("Please select an action.");
    }

    if (!valid) {
        return valid;
    }
    
    if (!rule_title.validity.valid || rule_title.value.trim().length === 0) {
        rule_title.style.border = "solid 3px #FF0000";

        valid = false;

        rule_title.scrollIntoView({ behavior: "smooth" });
    }
    else {
        rule_title.style.border = "1px solid #FFFFFF";
    }

    if (!valid) {
        return valid;
    }

    const action_id = rule_action.getAttribute("data-id");
    console.log(action_id);
    /* Discord - Create Role */
    if (Number(action_id) === 1) {
        valid = validate_action_discord_create_role();
    }

    /* Discord - Add Role To User */
    else if (Number(action_id) === 2) {
        valid = validate_action_discord_add_role_to_user();
    }

    /* Discord - Change Nickname */
    else if (Number(action_id) === 3) {
        valid = validate_action_discord_change_nickname();
    }

    /* Discord - Create Channel */
    else if (Number(action_id) === 4) {
        valid = validate_action_discord_create_channel();
    }

    /* Discord - Add Role To Channel */
    else if (Number(action_id) === 5) {
        valid = validate_action_discord_add_role_to_channel();
    }

    /* Discord - Create Category */
    else if (Number(action_id) === 6) {
        valid = validate_action_discord_create_category();
    }

    /* Discord - Add Channel To Category */
    else if (Number(action_id) === 7) {
        valid = validate_action_discord_add_channel_to_category();
    }
    
    return valid;
};

function save_rule() {
    if (!validate_rule()) {
        return;
    }

    const rule_title = document.getElementById("rule-title").value;
    const rule_description = document.getElementById("rule-description").getElementsByTagName("textarea")[0].value;
    const rule_condition = document.getElementById("rule-condition").getAttribute("data-id");
    const rule_action = document.getElementById("rule-action").getAttribute("data-id");

    let rule_action_details = undefined;

    if (Number(rule_action) === 1) {
        rule_action_details = {
            "role_name": document.getElementById("role-name").getElementsByTagName("input")[0].value,
            "role_priority": document.getElementById("role-priority").getElementsByTagName("input")[0].value,
            "cleanup_1": document.getElementById("cleanup-1").getAttribute("data-checked"),
            "role_setting_1": document.getElementById("role-setting-1").getAttribute("data-checked"),
            "role_setting_2": document.getElementById("role-setting-2").getAttribute("data-checked"),
            "role_setting_3": document.getElementById("role-setting-3").childNodes[2].value,
            "general_permission_1": document.getElementById("general-permission-1").getAttribute("data-checked"),
            "general_permission_2": document.getElementById("general-permission-2").getAttribute("data-checked"),
            "general_permission_3": document.getElementById("general-permission-3").getAttribute("data-checked"),
            "general_permission_4": document.getElementById("general-permission-4").getAttribute("data-checked"),
            "general_permission_5": document.getElementById("general-permission-5").getAttribute("data-checked"),
            "general_permission_6": document.getElementById("general-permission-6").getAttribute("data-checked"),
            "general_permission_7": document.getElementById("general-permission-7").getAttribute("data-checked"),
            "general_permission_8": document.getElementById("general-permission-8").getAttribute("data-checked"),
            "general_permission_9": document.getElementById("general-permission-9").getAttribute("data-checked"),
            "general_permission_10": document.getElementById("general-permission-10").getAttribute("data-checked"),
            "general_permission_11": document.getElementById("general-permission-11").getAttribute("data-checked"),
            "general_permission_12": document.getElementById("general-permission-12").getAttribute("data-checked"),
            "general_permission_13": document.getElementById("general-permission-13").getAttribute("data-checked"),
            "text_permission_1": document.getElementById("text-permission-1").getAttribute("data-checked"),
            "text_permission_2": document.getElementById("text-permission-2").getAttribute("data-checked"),
            "text_permission_3": document.getElementById("text-permission-3").getAttribute("data-checked"),
            "text_permission_4": document.getElementById("text-permission-4").getAttribute("data-checked"),
            "text_permission_5": document.getElementById("text-permission-5").getAttribute("data-checked"),
            "text_permission_6": document.getElementById("text-permission-6").getAttribute("data-checked"),
            "text_permission_7": document.getElementById("text-permission-7").getAttribute("data-checked"),
            "text_permission_8": document.getElementById("text-permission-8").getAttribute("data-checked"),
            "text_permission_9": document.getElementById("text-permission-9").getAttribute("data-checked"),
            "voice_permission_1": document.getElementById("voice-permission-1").getAttribute("data-checked"),
            "voice_permission_2": document.getElementById("voice-permission-2").getAttribute("data-checked"),
            "voice_permission_3": document.getElementById("voice-permission-3").getAttribute("data-checked"),
            "voice_permission_4": document.getElementById("voice-permission-4").getAttribute("data-checked"),
            "voice_permission_5": document.getElementById("voice-permission-5").getAttribute("data-checked"),
            "voice_permission_6": document.getElementById("voice-permission-6").getAttribute("data-checked"),
            "voice_permission_7": document.getElementById("voice-permission-7").getAttribute("data-checked")
        };
    }
    else if (Number(rule_action) === 2) {
        rule_action_details = {
            "role_name": document.getElementById("role-name").getElementsByTagName("input")[0].value,
            "cleanup_1": document.getElementById("cleanup-1").getAttribute("data-checked")
        };
    }
    else if (Number(rule_action) === 3) {
        rule_action_details = {
            "force_character_name": document.getElementById("force-character-name").getAttribute("data-checked"),
            "add_corporation_ticker": document.getElementById("add-corporation-ticker").getAttribute("data-checked"),
            "add_alliance_ticker": document.getElementById("add-alliance-ticker").getAttribute("data-checked"),
            "fallback_corporation_ticker": document.getElementById("fallback-corporation-ticker").getAttribute("data-checked")
        };
    }
    else if (Number(rule_action) === 4) {
        rule_action_details = {
            "channel_name": document.getElementById("channel-name").getElementsByTagName("input")[0].value,
            "channel_type": document.getElementById("channel-type").getElementsByTagName("select")[0].value,
            "channel_priority": document.getElementById("channel-priority").getElementsByTagName("input")[0].value,
            "auto_delete": document.getElementById("auto-delete").getAttribute("data-checked"),
            "nsfw": document.getElementById("nsfw").getAttribute("data-checked"),
            "rate_limit": document.getElementById("rate-limit").getElementsByTagName("input")[0].value,
            "topic": document.getElementById("topic").getElementsByTagName("textarea")[0].value,
            "bitrate": document.getElementById("bitrate").getElementsByTagName("input")[0].value,
            "user_limit": document.getElementById("user-limit").getElementsByTagName("input")[0].value
        };
    }
    else if (Number(rule_action) === 5) {
        rule_action_details = {
            "channel_name": document.getElementById("channel-name").getElementsByTagName("input")[0].value,
            "channel_type": document.getElementById("channel-type").getElementsByTagName("select")[0].value,
            "role_name": document.getElementById("role-name").getElementsByTagName("input")[0].value,
            "auto_remove": document.getElementById("auto-remove").getAttribute("data-checked"),
            "overwrite_permissions": document.getElementById("overwrite-permissions").getAttribute("data-checked"),
            "create_instant_invite": document.getElementById("create-instant-invite").getAttribute("data-checked"),
            "manage_channel": document.getElementById("manage-channel").getAttribute("data-checked"),
            "manage_permissions": document.getElementById("manage-permissions").getAttribute("data-checked"),
            "manage_webhooks": document.getElementById("manage-webhooks").getAttribute("data-checked"),
            "read_text_channels_see_voice_channels": document.getElementById("read-text-channels-see-voice-channels").getAttribute("data-checked"),
            "send_messages": document.getElementById("send-messages").getAttribute("data-checked"),
            "send_tts_messages": document.getElementById("send-tts-messages").getAttribute("data-checked"),
            "manage_messages": document.getElementById("manage-messages").getAttribute("data-checked"),
            "embed_links": document.getElementById("embed-links").getAttribute("data-checked"),
            "attach_files": document.getElementById("attach-files").getAttribute("data-checked"),
            "read_message_history": document.getElementById("read-message-history").getAttribute("data-checked"),
            "mention_everyone": document.getElementById("mention-everyone").getAttribute("data-checked"),
            "use_external_emojis": document.getElementById("use-external-emojis").getAttribute("data-checked"),
            "add_reactions": document.getElementById("add-reactions").getAttribute("data-checked"),
            "connect": document.getElementById("connect").getAttribute("data-checked"),
            "speak": document.getElementById("speak").getAttribute("data-checked"),
            "mute_members": document.getElementById("mute-members").getAttribute("data-checked"),
            "deafen_members": document.getElementById("deafen-members").getAttribute("data-checked"),
            "move_members": document.getElementById("move-members").getAttribute("data-checked"),
            "use_voice_activity": document.getElementById("use-voice-activity").getAttribute("data-checked")
        };
    }
    else if (Number(rule_action) === 6) {
        rule_action_details = {
            "category_name": document.getElementById("category-name").getElementsByTagName("input")[0].value,
            "category_priority": document.getElementById("category-priority").getElementsByTagName("input")[0].value,
            "auto_delete": document.getElementById("auto-delete").getAttribute("data-checked")
        };
    }
    else if (Number(rule_action) === 7) {
        rule_action_details = {
            "category_name": document.getElementById("category-name").getElementsByTagName("input")[0].value,
            "channel_name": document.getElementById("channel-name").getElementsByTagName("input")[0].value,
            "channel_type": document.getElementById("channel-type").getElementsByTagName("select")[0].value,
            "auto_remove": document.getElementById("auto-remove").getAttribute("data-checked")
        };
    }

    post_data({
        "id": get_url_parameter("id"),
        "title": rule_title,
        "description": rule_description,
        "condition": rule_condition,
        "action": rule_action,
        "details": rule_action_details
    });
};

function get_url_parameter(key) {
    key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var results = regex.exec(location.search);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

function get_data() {
    socket.emit(
        "config_rule",
        {
            "method": "get",
            "data_id": get_url_parameter("id")
        }
    );
}

function post_data(data) {
    socket.emit(
        "config_rule",
        {
            "method": "post",
            "data": data
        }
    );
}

function load_cookie() {
    const name = "spectrum_module_default_config" + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];

        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            cookie = JSON.parse(c.substring(name.length, c.length).substring(2));

            return true;
        }
    }

    return false;
}

function open_socket() {
    socket = io(
        "https://" + cookie["host"] + ":" + cookie["port"] + "/" + cookie["server_id"],
        {
            query: "user_id=" + cookie["user_id"] + "&access_code=" + cookie["access_code"]
        }
    );

    socket.on("data_ready", function (data) {
        initialize_rule(data);
    });

    socket.on("data_posted", function () {
        window.location = "/module/default/html/config/rules.html";
    });

    socket.on("data_error", function (error) {
        alert(error);
    });
}

function init() {
    if (!load_cookie()) {
        alert("Session expired!\n\nPlease request a new configuration link in Discord and make sure your browser accepts cookies, in case it doesn't.");

        return;
    }

    open_socket();
    initialize_rule_area();
}

//#region Wait for DOM
const ready = function (callback) {
    if (document.readyState === "complete") {
        return callback();
    }

    document.addEventListener("DOMContentLoaded", callback, false);
};

ready(function () {
    init();
});
//#endregion