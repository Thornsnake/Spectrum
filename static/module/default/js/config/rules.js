"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;
//#endregion

function initialize_rules(data) {
    const rule_area = document.getElementById("rule-area");
    const rule_keys = Object.keys(data);

    while (rule_area.lastChild) {
        rule_area.removeChild(rule_area.lastChild);
    }

    for (let i = 0; i < rule_keys.length; i++) {
        const rule_id = rule_keys[i];
        const data_row = data[rule_id];

        const area = document.createElement("div");
        area.className = "flex-column flex-static area with-border";
        area.style.marginBottom = "5px";
        area.style.background = "#222222";

        const rule_header = document.createElement("div");
        rule_header.className = "rule-header";
        rule_header.innerHTML = data_row["title"];

        const operation_area = document.createElement("div");
        operation_area.className = "flex-row flex-dynamic area";
        operation_area.style.background = "#222222";

        const rule_description = document.createElement("span");
        rule_description.className = "rule-description";
        rule_description.innerHTML = data_row["description"];

        const rule_edit = document.createElement("button");
        rule_edit.setAttribute("edit", true);
        rule_edit.style.marginLeft = "auto";
        rule_edit.style.marginTop = "auto";
        rule_edit.style.marginBottom = "auto";
        rule_edit.innerHTML = "Edit";
        rule_edit.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                window.location = "/module/default/html/config/rule.html?id=" + rule_id;
            },
            false
        );

        const rule_delete = document.createElement("button");
        rule_delete.setAttribute("delete", true);
        rule_delete.style.marginLeft = "10px";
        rule_delete.style.marginTop = "auto";
        rule_delete.style.marginBottom = "auto";
        rule_delete.innerHTML = "Delete";
        rule_delete.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                delete_data(rule_id)
            },
            false
        );

        area.appendChild(rule_header);

        operation_area.appendChild(rule_description);
        operation_area.appendChild(rule_edit);
        operation_area.appendChild(rule_delete);
        area.appendChild(operation_area);

        rule_area.appendChild(area);
    }
}

function get_data() {
    socket.emit(
        "config_rules",
        {
            "method": "get"
        }
    );
}

function delete_data(data_id) {
    socket.emit(
        "config_rules",
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
        initialize_rules(data);
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