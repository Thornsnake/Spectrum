"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;
//#endregion

function initialize_notification(data) {
    const notification_id = get_url_parameter("id");

    const available_notifications = data["available_notifications"];
    const notification = data["notification"];

    if (notification_id !== "new") {
        document.getElementById("input-channel-name").value = notification["channel"];

        const factions = notification["filter"]["factions"];

        for (let i = 0; i < factions.length; i++) {
            const faction = factions[i];

            add_faction_filter(faction);
        }

        const alliances = notification["filter"]["alliances"];
        
        for (let i = 0; i < alliances.length; i++) {
            const alliance = alliances[i];

            add_alliance_filter(alliance);
        }

        const corporations = notification["filter"]["corporations"];

        for (let i = 0; i < corporations.length; i++) {
            const corporation = corporations[i];

            add_corporation_filter(corporation);
        }

        const message_options = notification["options"];

        if (message_options) {
            const message_option_keys = Object.keys(message_options);

            for (let i = 0; i < message_option_keys.length; i++) {
                const option_key = message_option_keys[i];
                const checked = message_options[option_key];

                const message_option_element = document.getElementById(option_key);
                const selection_option = message_option_element.getElementsByClassName("selection-option")[0];

                if (checked === "yes") {
                    message_option_element.setAttribute("data-checked", "yes");
    
                    selection_option.style.color = "#00FF00";
                    selection_option.style.borderColor = "#00FF00";
    
                    selection_option.innerHTML = "Yes";
                }
                else {
                    message_option_element.setAttribute("data-checked", "no");
    
                    selection_option.style.color = "#FF0000";
                    selection_option.style.borderColor = "#FF0000";
    
                    selection_option.innerHTML = "No";
                }
            }
        }
    }

    const message_option_list = document.getElementById("message-option-list");

    for (let i = 0; i < message_option_list.childNodes.length; i++) {
        const message_option_element = message_option_list.childNodes[i];
        message_option_element.addEventListener(
            "click",
            function () {
                const selection_option = this.getElementsByClassName("selection-option")[0];

                if (this.getAttribute("data-checked") === "no") {
                    this.setAttribute("data-checked", "yes");

                    selection_option.style.color = "#00FF00";
                    selection_option.style.borderColor = "#00FF00";

                    selection_option.innerHTML = "Yes";
                }
                else if (this.getAttribute("data-checked") === "yes") {
                    this.setAttribute("data-checked", "no");

                    selection_option.style.color = "#FF0000";
                    selection_option.style.borderColor = "#FF0000";

                    selection_option.innerHTML = "No";
                }
            },
            false
        );
    }

    const available_notification_keys = Object.keys(available_notifications);

    for (let i = 0; i < available_notification_keys.length; i++) {
        const notification_key = available_notification_keys[i];
        const notification_data = available_notifications[notification_key];

        const title = notification_data["title"];
        const description = notification_data["description"];
        const group = notification_data["group"];

        let notification_list = undefined;

        if (group === "Alliance") {
            notification_list = document.getElementById("alliance-notification-list");
        }
        else if (group === "Corporation") {
            notification_list = document.getElementById("corporation-notification-list");
        }
        else if (group === "Factional Warfare") {
            notification_list = document.getElementById("faction-notification-list");
        }
        else if (group === "Moonmining") {
            notification_list = document.getElementById("moonmining-notification-list");
        }
        else if (group === "Sovereignty") {
            notification_list = document.getElementById("sovereignty-notification-list");
        }
        else if (group === "Structure") {
            notification_list = document.getElementById("structure-notification-list");
        }
        else if (group === "War") {
            notification_list = document.getElementById("war-notification-list");
        }

        const notification_element = document.createElement("div");
        notification_element.id = notification_key;
        notification_element.className = "flex-row flex-static area";
        notification_element.style.marginBottom = "5px";
        notification_element.style.background = "#222222";
        notification_element.style.cursor = "pointer";
        notification_element.addEventListener(
            "click",
            function (event) {
                if (event.target.tagName.toLowerCase() === "input") {
                    return;
                }

                if (this.getAttribute("data-checked") === "no") {
                    this.setAttribute("data-checked", "yes");

                    this.childNodes[2].style.color = "#00FF00";
                    this.childNodes[2].style.borderColor = "#00FF00";

                    this.childNodes[2].innerHTML = "Forward";
                }
                else if (this.getAttribute("data-checked") === "yes") {
                    this.setAttribute("data-checked", "no");

                    this.childNodes[2].style.color = "#FF0000";
                    this.childNodes[2].style.borderColor = "#FF0000";

                    this.childNodes[2].innerHTML = "Ignore";
                }
            },
            false
        );
        notification_list.appendChild(notification_element);

        const notification_area_element = document.createElement("div");
        notification_area_element.className = "flex-column flex-dynamic area";
        notification_element.appendChild(notification_area_element);

        const notification_header_element = document.createElement("div");
        notification_header_element.className = "selection-header";
        notification_header_element.innerHTML = title;
        notification_area_element.appendChild(notification_header_element);

        const notification_description_element = document.createElement("div");
        notification_description_element.className = "selection-description";
        notification_description_element.innerHTML = description;
        notification_area_element.appendChild(notification_description_element);

        const notification_color_element = document.createElement("input");
        notification_color_element.type = "color";
        notification_color_element.style.width = "100px";
        notification_color_element.style.height = "30px";
        notification_color_element.style.marginTop = "auto";
        notification_color_element.style.marginBottom = "auto";
        notification_color_element.style.marginLeft = "5px";
        notification_color_element.style.marginRight = "5px";
        notification_color_element.style.padding = "3px";
        notification_element.appendChild(notification_color_element);

        if (notification_id !== "new") {
            if ("colors" in notification) {
                notification_element.childNodes[1].value = notification["colors"][notification_key];
            }
            else {
                notification_element.childNodes[1].value = "#000000";
            }
        }
        else {
            notification_element.childNodes[1].value = "#000000";
        }

        const notification_option_element = document.createElement("div");
        notification_option_element.className = "selection-option";
        notification_option_element.style.width = "80px";
        notification_option_element.style.textAlign = "center";
        notification_option_element.style.color = "#FF0000";
        notification_option_element.style.borderColor = "#FF0000";
        notification_option_element.innerHTML = "Ignore";
        notification_element.appendChild(notification_option_element);

        if (notification_id !== "new") {
            if ("notifications" in notification && notification["notifications"][notification_key] === "yes") {
                notification_element.setAttribute("data-checked", "yes");

                notification_element.childNodes[2].style.color = "#00FF00";
                notification_element.childNodes[2].style.borderColor = "#00FF00";

                notification_element.childNodes[2].innerHTML = "Forward";
            }
            else {
                notification_element.setAttribute("data-checked", "no");

                notification_element.childNodes[2].style.color = "#FF0000";
                notification_element.childNodes[2].style.borderColor = "#FF0000";

                notification_element.childNodes[2].innerHTML = "Ignore";
            }
        }
        else {
            notification_element.setAttribute("data-checked", "no");

            notification_element.childNodes[2].style.color = "#FF0000";
            notification_element.childNodes[2].style.borderColor = "#FF0000";

            notification_element.childNodes[2].innerHTML = "Ignore";
        }
    }
}

function save_notification() {
    const channel = document.getElementById("input-channel-name");

    if (!channel.validity.valid || channel.value.trim().length === 0) {
        channel.style.border = "solid 3px #FF0000";

        channel.scrollIntoView({ behavior: "smooth" });

        return;
    }
    else {
        channel.style.border = "1px solid #FFFFFF";
    }

    const faction_filter_list = document.getElementById("faction-filter-list");
    const alliance_filter_list = document.getElementById("alliance-filter-list");
    const corporation_filter_list = document.getElementById("corporation-filter-list");

    if (!faction_filter_list.hasChildNodes() && !alliance_filter_list.hasChildNodes() && !corporation_filter_list.hasChildNodes()) {
        document.getElementById("filter-factions-area").scrollIntoView({ behavior: "smooth" });

        return;
    }

    const channel_name = channel.value;

    const filter = {
        "factions": [],
        "alliances": [],
        "corporations": []
    };

    for (let i = 0; i < faction_filter_list.childNodes.length; i++) {
        const faction_name = faction_filter_list.childNodes[i].childNodes[0].innerHTML;

        filter["factions"].push(faction_name);
    }

    for (let i = 0; i < alliance_filter_list.childNodes.length; i++) {
        const alliance_name = alliance_filter_list.childNodes[i].childNodes[0].innerHTML;

        filter["alliances"].push(alliance_name);
    }

    for (let i = 0; i < corporation_filter_list.childNodes.length; i++) {
        const corporation_name = corporation_filter_list.childNodes[i].childNodes[0].innerHTML;

        filter["corporations"].push(corporation_name);
    }

    filter["factions"].sort();
    filter["alliances"].sort();
    filter["corporations"].sort();

    const message_options = {};
    const message_option_list = document.getElementById("message-option-list");

    for (let i = 0; i < message_option_list.childNodes.length; i++) {
        const option = message_option_list.childNodes[i];

        if (option.nodeType !== Node.ELEMENT_NODE) {
            continue;
        }

        const option_key = message_option_list.childNodes[i].id;
        const checked = message_option_list.childNodes[i].getAttribute("data-checked");

        message_options[option_key] = checked;
    }

    const notifications = {};
    const colors = {};

    const alliance_notification_list = document.getElementById("alliance-notification-list");
    const corporation_notification_list = document.getElementById("corporation-notification-list");
    const faction_notification_list = document.getElementById("faction-notification-list");
    const moonmining_notification_list = document.getElementById("moonmining-notification-list");
    const sovereignty_notification_list = document.getElementById("sovereignty-notification-list");
    const structure_notification_list = document.getElementById("structure-notification-list");
    const war_notification_list = document.getElementById("war-notification-list");

    for (let i = 0; i < alliance_notification_list.childNodes.length; i++) {
        const notification_key = alliance_notification_list.childNodes[i].id;
        const checked = alliance_notification_list.childNodes[i].getAttribute("data-checked");
        const color = alliance_notification_list.childNodes[i].childNodes[1].value;

        notifications[notification_key] = checked;
        colors[notification_key] = color;
    }

    for (let i = 0; i < corporation_notification_list.childNodes.length; i++) {
        const notification_key = corporation_notification_list.childNodes[i].id;
        const checked = corporation_notification_list.childNodes[i].getAttribute("data-checked");
        const color = corporation_notification_list.childNodes[i].childNodes[1].value;

        notifications[notification_key] = checked;
        colors[notification_key] = color;
    }

    for (let i = 0; i < faction_notification_list.childNodes.length; i++) {
        const notification_key = faction_notification_list.childNodes[i].id;
        const checked = faction_notification_list.childNodes[i].getAttribute("data-checked");
        const color = faction_notification_list.childNodes[i].childNodes[1].value;

        notifications[notification_key] = checked;
        colors[notification_key] = color;
    }

    for (let i = 0; i < moonmining_notification_list.childNodes.length; i++) {
        const notification_key = moonmining_notification_list.childNodes[i].id;
        const checked = moonmining_notification_list.childNodes[i].getAttribute("data-checked");
        const color = moonmining_notification_list.childNodes[i].childNodes[1].value;

        notifications[notification_key] = checked;
        colors[notification_key] = color;
    }

    for (let i = 0; i < sovereignty_notification_list.childNodes.length; i++) {
        const notification_key = sovereignty_notification_list.childNodes[i].id;
        const checked = sovereignty_notification_list.childNodes[i].getAttribute("data-checked");
        const color = sovereignty_notification_list.childNodes[i].childNodes[1].value;

        notifications[notification_key] = checked;
        colors[notification_key] = color;
    }

    for (let i = 0; i < structure_notification_list.childNodes.length; i++) {
        const notification_key = structure_notification_list.childNodes[i].id;
        const checked = structure_notification_list.childNodes[i].getAttribute("data-checked");
        const color = structure_notification_list.childNodes[i].childNodes[1].value;

        notifications[notification_key] = checked;
        colors[notification_key] = color;
    }

    for (let i = 0; i < war_notification_list.childNodes.length; i++) {
        const notification_key = war_notification_list.childNodes[i].id;
        const checked = war_notification_list.childNodes[i].getAttribute("data-checked");
        const color = war_notification_list.childNodes[i].childNodes[1].value;

        notifications[notification_key] = checked;
        colors[notification_key] = color;
    }

    post_data({
        "id": get_url_parameter("id"),
        "channel": channel_name,
        "filter": filter,
        "options": message_options,
        "notifications": notifications,
        "colors": colors
    });
}

function add_faction_filter(faction_name = undefined) {
    const name_input = document.getElementById("input-faction-filter");

    let name = undefined;

    if (!faction_name) {
        if (!name_input.validity.valid || name_input.value.trim().length === 0) {
            name_input.style.border = "solid 3px #FF0000";

            name_input.scrollIntoView({ behavior: "smooth" });

            return;
        }
        else {
            name_input.style.border = "1px solid #FFFFFF";
        }

        name = name_input.value;
    }
    else {
        name = faction_name;
    }

    const list = document.getElementById("faction-filter-list");

    const filter = document.createElement("div");
    filter.className = "flex-row flex-dynamic";
    filter.style.marginBottom = "3px";
    list.appendChild(filter);

    const filter_name = document.createElement("div");
    filter_name.className = "filter-faction";
    filter_name.innerHTML = name;
    filter.appendChild(filter_name);

    const filter_remove = document.createElement("button");
    filter_remove.setAttribute("delete", true);
    filter_remove.style.marginLeft = "10px";
    filter_remove.innerHTML = "X";
    filter_remove.addEventListener(
        "click",
        function () {
            this.parentNode.parentNode.removeChild(this.parentNode);
        },
        false
    );
    filter.appendChild(filter_remove);

    name_input.value = "";
    name_input.focus();
}

function add_alliance_filter(alliance_name = undefined) {
    const name_input = document.getElementById("input-alliance-filter");

    let name = undefined;

    if (!alliance_name) {
        if (!name_input.validity.valid || name_input.value.trim().length === 0) {
            name_input.style.border = "solid 3px #FF0000";

            name_input.scrollIntoView({ behavior: "smooth" });

            return;
        }
        else {
            name_input.style.border = "1px solid #FFFFFF";
        }

        name = name_input.value;
    }
    else {
        name = alliance_name;
    }

    const list = document.getElementById("alliance-filter-list");

    const filter = document.createElement("div");
    filter.className = "flex-row flex-dynamic";
    filter.style.marginBottom = "3px";
    list.appendChild(filter);

    const filter_name = document.createElement("div");
    filter_name.className = "filter-alliance";
    filter_name.innerHTML = name;
    filter.appendChild(filter_name);

    const filter_remove = document.createElement("button");
    filter_remove.setAttribute("delete", true);
    filter_remove.style.marginLeft = "10px";
    filter_remove.innerHTML = "X";
    filter_remove.addEventListener(
        "click",
        function () {
            this.parentNode.parentNode.removeChild(this.parentNode);
        },
        false
    );
    filter.appendChild(filter_remove);

    name_input.value = "";
    name_input.focus();
}

function add_corporation_filter(corporation_name = undefined) {
    const name_input = document.getElementById("input-corporation-filter");

    let name = undefined;

    if (!corporation_name) {
        if (!name_input.validity.valid || name_input.value.trim().length === 0) {
            name_input.style.border = "solid 3px #FF0000";

            name_input.scrollIntoView({ behavior: "smooth" });

            return;
        }
        else {
            name_input.style.border = "1px solid #FFFFFF";
        }

        name = name_input.value;
    }
    else {
        name = corporation_name;
    }

    const list = document.getElementById("corporation-filter-list");

    const filter = document.createElement("div");
    filter.className = "flex-row flex-dynamic";
    filter.style.marginBottom = "3px";
    list.appendChild(filter);

    const filter_name = document.createElement("div");
    filter_name.className = "filter-corporation";
    filter_name.innerHTML = name;
    filter.appendChild(filter_name);

    const filter_remove = document.createElement("button");
    filter_remove.setAttribute("delete", true);
    filter_remove.style.marginLeft = "10px";
    filter_remove.innerHTML = "X";
    filter_remove.addEventListener(
        "click",
        function () {
            this.parentNode.parentNode.removeChild(this.parentNode);
        },
        false
    );
    filter.appendChild(filter_remove);

    name_input.value = "";
    name_input.focus();
}

function get_url_parameter(key) {
    key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var results = regex.exec(location.search);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function get_data() {
    socket.emit(
        "module_notification_notification",
        {
            "method": "get",
            "data_id": get_url_parameter("id")
        }
    );
}

function post_data(data) {
    socket.emit(
        "module_notification_notification",
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
        initialize_notification(data);
    });

    socket.on("data_posted", function () {
        window.location = "/module/notification/html/notifications.html";
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
    get_data();
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