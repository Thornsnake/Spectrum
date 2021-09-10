"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;
//#endregion

async function initialize_conditions(data) {
    const condition_area = document.getElementById("condition-area");
    const condition_keys = Object.keys(data);

    while (condition_area.lastChild) {
        condition_area.removeChild(condition_area.lastChild);
    }

    for (let i = 0; i < condition_keys.length; i++) {
        const condition_id = condition_keys[i];
        const data_row = data[condition_id];

        const area = document.createElement("div");
        area.className = "flex-column flex-static area with-border";
        area.style.marginBottom = "5px";
        area.style.background = "#222222";

        const condition_header = document.createElement("div");
        condition_header.className = "condition-header";
        condition_header.innerHTML = data_row["title"];
        
        const operation_area = document.createElement("div");
        operation_area.className = "flex-row flex-dynamic area";
        operation_area.style.background = "#222222";

        const condition_description = document.createElement("span");
        condition_description.className = "condition-description";
        condition_description.innerHTML = data_row["description"];

        const condition_edit = document.createElement("button");
        condition_edit.setAttribute("edit", true);
        condition_edit.style.marginLeft = "auto";
        condition_edit.style.marginTop = "auto";
        condition_edit.style.marginBottom = "auto";
        condition_edit.innerHTML = "Edit";
        condition_edit.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                window.location = "/module/default/html/config/condition.html?id=" + condition_id;
            },
            false
        );

        const condition_delete = document.createElement("button");
        condition_delete.setAttribute("delete", true);
        condition_delete.style.marginLeft = "10px";
        condition_delete.style.marginTop = "auto";
        condition_delete.style.marginBottom = "auto";
        condition_delete.innerHTML = "Delete";
        condition_delete.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                delete_data(condition_id)
            },
            false
        );
        
        area.appendChild(condition_header);

        operation_area.appendChild(condition_description);
        operation_area.appendChild(condition_edit);
        operation_area.appendChild(condition_delete);
        area.appendChild(operation_area);

        condition_area.appendChild(area);
    }
};

function get_data() {
    socket.emit(
        "config_conditions",
        {
            "method": "get"
        }
    );
}

function delete_data(data_id) {
    socket.emit(
        "config_conditions",
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
        initialize_conditions(data);
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