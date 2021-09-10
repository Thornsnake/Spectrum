"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;
//#endregion

async function initialize_operators(data) {
    const operator_area = document.getElementById("operator-area");
    const operator_keys = Object.keys(data);

    while (operator_area.lastChild) {
        operator_area.removeChild(operator_area.lastChild);
    }

    for (let i = 0; i < operator_keys.length; i++) {
        const operator_id = operator_keys[i];
        const data_row = data[operator_id];

        const area = document.createElement("div");
        area.className = "flex-column flex-static area with-border";
        area.style.marginBottom = "5px";
        area.style.background = "#222222";

        const operator_header = document.createElement("div");
        operator_header.className = "operator-header";
        operator_header.innerHTML = data_row["display_name"];

        const operation_area = document.createElement("div");
        operation_area.className = "flex-row flex-dynamic area";
        operation_area.style.background = "#222222";

        const operator_description = document.createElement("span");
        operator_description.className = "operator-description";
        operator_description.innerHTML = data_row["note"];

        const operator_edit = document.createElement("button");
        operator_edit.setAttribute("edit", true);
        operator_edit.style.marginLeft = "auto";
        operator_edit.style.marginTop = "auto";
        operator_edit.style.marginBottom = "auto";
        operator_edit.innerHTML = "Edit";
        operator_edit.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                window.location = "/module/default/html/config/operator.html?id=" + operator_id;
            },
            false
        );

        const operator_delete = document.createElement("button");
        operator_delete.setAttribute("delete", true);
        operator_delete.style.marginLeft = "10px";
        operator_delete.style.marginTop = "auto";
        operator_delete.style.marginBottom = "auto";
        operator_delete.innerHTML = "Delete";
        operator_delete.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                delete_data(operator_id);
            },
            false
        );

        area.appendChild(operator_header);

        operation_area.appendChild(operator_description);
        operation_area.appendChild(operator_edit);
        operation_area.appendChild(operator_delete);
        area.appendChild(operation_area);

        operator_area.appendChild(area);
    }
};

function get_data() {
    socket.emit(
        "config_operators",
        {
            "method": "get"
        }
    );
}

function delete_data(data_id) {
    socket.emit(
        "config_operators",
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
        initialize_operators(data);
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