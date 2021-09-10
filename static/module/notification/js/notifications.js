"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;
//#endregion

async function initialize_notifications(data) {
    const notification_area = document.getElementById("notification-area");
    const notification_keys = Object.keys(data);

    while (notification_area.lastChild) {
        notification_area.removeChild(notification_area.lastChild);
    }

    for (let i = 0; i < notification_keys.length; i++) {
        const notification_id = notification_keys[i];
        const data_row = data[notification_id];

        const area = document.createElement("div");
        area.className = "flex-column flex-static area with-border";
        area.style.marginBottom = "5px";
        area.style.background = "#222222";
        notification_area.appendChild(area);

        const notification_header_area = document.createElement("div");
        notification_header_area.className = "flex-row flex-dynamic area";
        notification_header_area.style.background = "#222222";
        area.appendChild(notification_header_area);

        const notification_header = document.createElement("div");
        notification_header.className = "notification-header";
        notification_header.style.color = "#FFFFFF";
        notification_header.innerHTML = data_row["channel"];
        notification_header_area.appendChild(notification_header);

        const notification_edit = document.createElement("button");
        notification_edit.setAttribute("edit", true);
        notification_edit.style.marginLeft = "auto";
        notification_edit.style.marginTop = "auto";
        notification_edit.style.marginBottom = "auto";
        notification_edit.innerHTML = "Edit";
        notification_edit.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                window.location = "/module/notification/html/notification.html?id=" + notification_id;
            },
            false
        );
        notification_header_area.appendChild(notification_edit);

        const notification_delete = document.createElement("button");
        notification_delete.setAttribute("delete", true);
        notification_delete.style.marginLeft = "10px";
        notification_delete.style.marginTop = "auto";
        notification_delete.style.marginBottom = "auto";
        notification_delete.innerHTML = "Delete";
        notification_delete.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                delete_data(notification_id)
            },
            false
        );
        notification_header_area.appendChild(notification_delete);

        const notification_header_line = document.createElement("hr");
        notification_header_line.style.width = "calc(100% - 10px)";
        notification_header_line.style.marginLeft = "5px";
        area.appendChild(notification_header_line);

        if (data_row["filter"]["factions"].length > 0) {
            const notification_factions_header = document.createElement("div");
            notification_factions_header.className = "notification-header";
            notification_factions_header.style.fontSize = "20px";
            notification_factions_header.style.marginLeft = "5px";
            notification_factions_header.innerHTML = "Factions";
            area.appendChild(notification_factions_header);

            const notification_factions = document.createElement("span");
            notification_factions.className = "notification-description";
            notification_factions.innerHTML = data_row["filter"]["factions"].join(", ");
            area.appendChild(notification_factions);

            const notification_factions_line = document.createElement("hr");
            notification_factions_line.style.width = "calc(100% - 10px)";
            notification_factions_line.style.marginLeft = "5px";
            area.appendChild(notification_factions_line);
        }

        if (data_row["filter"]["alliances"].length > 0) {
            const notification_alliances_header = document.createElement("div");
            notification_alliances_header.className = "notification-header";
            notification_alliances_header.style.fontSize = "20px";
            notification_alliances_header.style.marginLeft = "5px";
            notification_alliances_header.innerHTML = "Alliances";
            area.appendChild(notification_alliances_header);

            const notification_alliances = document.createElement("span");
            notification_alliances.className = "notification-description";
            notification_alliances.innerHTML = data_row["filter"]["alliances"].join(", ");
            area.appendChild(notification_alliances);

            const notification_alliances_line = document.createElement("hr");
            notification_alliances_line.style.width = "calc(100% - 10px)";
            notification_alliances_line.style.marginLeft = "5px";
            area.appendChild(notification_alliances_line);
        }

        if (data_row["filter"]["corporations"].length > 0) {
            const notification_corporations_header = document.createElement("div");
            notification_corporations_header.className = "notification-header";
            notification_corporations_header.style.fontSize = "20px";
            notification_corporations_header.style.marginLeft = "5px";
            notification_corporations_header.innerHTML = "Corporations";
            area.appendChild(notification_corporations_header);

            const notification_corporations = document.createElement("span");
            notification_corporations.className = "notification-description";
            notification_corporations.innerHTML = data_row["filter"]["corporations"].join(", ");
            area.appendChild(notification_corporations);

            const notification_corporations_line = document.createElement("hr");
            notification_corporations_line.style.width = "calc(100% - 10px)";
            notification_corporations_line.style.marginLeft = "5px";
            area.appendChild(notification_corporations_line);
        }

        const notification_forwarded_notifications_header = document.createElement("div");
        notification_forwarded_notifications_header.className = "notification-header";
        notification_forwarded_notifications_header.style.fontSize = "20px";
        notification_forwarded_notifications_header.style.marginLeft = "5px";
        notification_forwarded_notifications_header.innerHTML = "Forwarded Notifications";
        area.appendChild(notification_forwarded_notifications_header);

        const forwarded_notifications = [];

        const sub_notification_keys = Object.keys(data_row["notifications"]);

        for (let j = 0; j < sub_notification_keys.length; j++) {
            const sub_notification_key = sub_notification_keys[j];
            const sub_notification = data_row["notifications"][sub_notification_key];

            if (sub_notification === "yes") {
                forwarded_notifications.push(sub_notification_key);
            }
        }

        const notification_forwarded_notifications = document.createElement("span");
        notification_forwarded_notifications.className = "notification-description";
        notification_forwarded_notifications.innerHTML = forwarded_notifications.join(", ");
        area.appendChild(notification_forwarded_notifications);
    }
};

function get_data() {
    socket.emit(
        "module_notification_notifications",
        {
            "method": "get"
        }
    );
}

function delete_data(data_id) {
    socket.emit(
        "module_notification_notifications",
        {
            "method": "delete",
            "data_id": data_id
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
        initialize_notifications(data);
    });

    socket.on("data_deleted", function () {
        get_data();
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