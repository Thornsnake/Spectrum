"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;
//#endregion

async function initialize_keywords(data) {
    const keyword_area = document.getElementById("keyword-area");
    const keyword_keys = Object.keys(data);

    while (keyword_area.lastChild) {
        keyword_area.removeChild(keyword_area.lastChild);
    }

    for (let i = 0; i < keyword_keys.length; i++) {
        const keyword_id = keyword_keys[i];
        const data_row = data[keyword_id];

        const area = document.createElement("div");
        area.className = "flex-column flex-static area with-border";
        area.style.marginBottom = "5px";
        area.style.background = "#222222";

        const keyword_header = document.createElement("div");
        keyword_header.className = "keyword-header";
        keyword_header.innerHTML = data_row["keyword"];

        const operation_area = document.createElement("div");
        operation_area.className = "flex-row flex-dynamic area";
        operation_area.style.background = "#222222";

        const keyword_description = document.createElement("span");
        keyword_description.className = "keyword-description";
        keyword_description.innerHTML = data_row["description"];

        const keyword_edit = document.createElement("button");
        keyword_edit.setAttribute("edit", true);
        keyword_edit.style.marginLeft = "auto";
        keyword_edit.style.marginTop = "auto";
        keyword_edit.style.marginBottom = "auto";
        keyword_edit.innerHTML = "Edit";
        keyword_edit.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                window.location = "/module/default/html/config/keyword.html?id=" + keyword_id;
            },
            false
        );

        const keyword_delete = document.createElement("button");
        keyword_delete.setAttribute("delete", true);
        keyword_delete.style.marginLeft = "10px";
        keyword_delete.style.marginTop = "auto";
        keyword_delete.style.marginBottom = "auto";
        keyword_delete.innerHTML = "Delete";
        keyword_delete.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                delete_data(keyword_id)
            },
            false
        );

        area.appendChild(keyword_header);

        operation_area.appendChild(keyword_description);
        operation_area.appendChild(keyword_edit);
        operation_area.appendChild(keyword_delete);
        area.appendChild(operation_area);

        keyword_area.appendChild(area);
    }
};

function get_data() {
    socket.emit(
        "config_keywords",
        {
            "method": "get"
        }
    );
}

function delete_data(data_id) {
    socket.emit(
        "config_keywords",
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
        initialize_keywords(data);
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