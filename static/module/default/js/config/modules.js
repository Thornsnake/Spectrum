"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;
//#endregion

async function initialize_modules(data) {
    const module_area = document.getElementById("module-area");
    const module_keys = Object.keys(data["available_modules"]);

    while (module_area.lastChild) {
        module_area.removeChild(module_area.lastChild);
    }

    for (let i = 0; i < module_keys.length; i++) {
        const module_id = module_keys[i];
        const data_row = data["available_modules"][module_id];
        let meta_data = data["modules"][module_id];

        if (!meta_data) {
            meta_data = {};
        }

        const area = document.createElement("div");
        area.className = "flex-column flex-static area with-border";
        area.style.marginBottom = "5px";
        area.style.background = "#222222";

        if (meta_data["is_active"] === "yes") {
            area.style.border = "solid 3px #00FF00"
        }
        else {
            area.style.border = "solid 3px #FF0000"
        }

        module_area.appendChild(area);

        const module_header_area = document.createElement("div");
        module_header_area.className = "flex-row flex-dynamic area";
        module_header_area.style.background = "#222222";
        area.appendChild(module_header_area);

        const module_header = document.createElement("div");
        module_header.className = "module-header";
        module_header.innerHTML = data_row["title"];
        module_header_area.appendChild(module_header);

        const module_configure = document.createElement("button");
        module_configure.setAttribute("edit", true);
        module_configure.style.marginLeft = "auto";
        module_configure.style.marginTop = "auto";
        module_configure.style.marginBottom = "auto";
        module_configure.innerHTML = "Configure";
        module_configure.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                if (module_id === "notification") {
                    window.location = "/module/notification/html/module.html";
                }
            },
            false
        );
        module_header_area.appendChild(module_configure);

        const module_header_line = document.createElement("hr");
        module_header_line.style.width = "calc(100% - 10px)";
        module_header_line.style.marginLeft = "5px";
        area.appendChild(module_header_line);

        const module_description_header = document.createElement("div");
        module_description_header.className = "module-header";
        module_description_header.style.fontSize = "20px";
        module_description_header.style.marginLeft = "5px";
        module_description_header.innerHTML = "Description";
        area.appendChild(module_description_header);

        const module_description = document.createElement("span");
        module_description.className = "module-description";
        module_description.innerHTML = data_row["description"];
        area.appendChild(module_description);

        const module_description_line = document.createElement("hr");
        module_description_line.style.width = "calc(100% - 10px)";
        module_description_line.style.marginLeft = "5px";
        area.appendChild(module_description_line);

        const module_commands_header = document.createElement("div");
        module_commands_header.className = "module-header";
        module_commands_header.style.fontSize = "20px";
        module_commands_header.style.marginLeft = "5px";
        module_commands_header.innerHTML = "Commands";
        area.appendChild(module_commands_header);

        const module_commands = document.createElement("span");
        module_commands.className = "module-description";

        const command_keys = Object.keys(data_row["commands"]);
        const added_commands = [];

        for (let j = 0; j < command_keys.length; j++) {
            const command_title = command_keys[j];
            const command_description = data_row["commands"][command_title];

            added_commands.push(command_title + " - " + command_description);
        }

        module_commands.innerHTML = added_commands.join("<br>");
        area.appendChild(module_commands);

        const module_commands_line = document.createElement("hr");
        module_commands_line.style.width = "calc(100% - 10px)";
        module_commands_line.style.marginLeft = "5px";
        area.appendChild(module_commands_line);

        const module_scopes_header = document.createElement("div");
        module_scopes_header.className = "module-header";
        module_scopes_header.style.fontSize = "20px";
        module_scopes_header.style.marginLeft = "5px";
        module_scopes_header.innerHTML = "Required Scopes";
        area.appendChild(module_scopes_header);

        const module_scopes = document.createElement("span");
        module_scopes.className = "module-description";
        module_scopes.innerHTML = data_row["scopes"].join("<br>");
        area.appendChild(module_scopes);

        if (meta_data["is_active"] !== "yes") {
            const module_scopes_warning = document.createElement("span");
            module_scopes_warning.className = "module-description";
            module_scopes_warning.style.color = "#FF0000";
            module_scopes_warning.innerHTML = "All authenticated users who are missing one of these scopes will be asked to re-authenticate upon activation of this module!";
            area.appendChild(module_scopes_warning);
        }
    }
};

function get_data() {
    socket.emit(
        "config_modules",
        {
            "method": "get"
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
        initialize_modules(data);
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