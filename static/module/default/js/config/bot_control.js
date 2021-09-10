"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;

let server_console = undefined;
//#endregion

async function add_log_entry(log_type, log_entry) {
    while (server_console.childNodes.length > 1000) {
        server_console.removeChild(server_console.firstChild);
    }

    const server_log_entry = document.createElement("span");
    server_log_entry.style.marginBottom = "1px";
    server_log_entry.style.fontSize = "14px";
    server_log_entry.style.fontWeight = "bold";

    if (log_type === "info") {
        server_log_entry.style.color = "#FFFFFF";
    }
    else if (log_type === "error") {
        server_log_entry.style.color = "#FF5555";
    }
    else if (log_type === "success") {
        server_log_entry.style.color = "#55FF55";
    }
    else if (log_type === "highlight") {
        server_log_entry.style.color = "#FFFF55";
    }
    else if (log_type === "message") {
        server_log_entry.style.color = "#5555FF";
    }

    server_log_entry.innerHTML = log_entry;

    server_console.appendChild(server_log_entry);

    server_console.scrollTop = server_console.scrollHeight;
}

function initialize_bot_control_area(data) {
    const bot_control_area = document.getElementById("bot-control-area");

    while (bot_control_area.lastChild) {
        bot_control_area.removeChild(bot_control_area.lastChild);
    }
    
    // #region Bot is active
    const is_active = document.createElement("div");
    is_active.id = "is-active";
    is_active.className = "flex-row flex-static action-option";
    is_active.title = "Activate and deactivate the bot on your server. If you are about to change the configuration, you should deactivate the bot in the meantime, so it does not apply a half-finished setup.";

    if (data["is_active"] === "yes") {
        is_active.setAttribute("data-checked", "yes");
    }
    else {
        is_active.setAttribute("data-checked", "no");
    }

    is_active.addEventListener(
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

            post_data();
        },
        false
    );

    const is_active_description = document.createElement("span");
    is_active_description.className = "action-option-description";
    is_active_description.innerHTML = "Bot is active";

    const is_active_checkbox = document.createElement("div");
    is_active_checkbox.className = "action-option-checkbox";

    if (data["is_active"] === "yes") {
        is_active_checkbox.style.color = "#00FF00";
        is_active_checkbox.style.borderColor = "#00FF00";
        is_active_checkbox.innerHTML = "YES";
    }
    else {
        is_active_checkbox.style.color = "#FF0000";
        is_active_checkbox.style.borderColor = "#FF0000";
        is_active_checkbox.innerHTML = "NO";
    }

    is_active.appendChild(is_active_description);
    is_active.appendChild(is_active_checkbox);

    bot_control_area.appendChild(is_active);
    // #endregion

    // #region Server Console
    server_console = document.createElement("div");
    server_console.id = "server_console";
    server_console.className = "flex-column flex-dynamic area with-border";
    server_console.style.background = "#000000";
    server_console.style.overflow = "auto";
    
    bot_control_area.appendChild(server_console);
    // #endregion

    join_room();
}

function get_data() {
    socket.emit(
        "config_bot_control",
        {
            "method": "get"
        }
    );
}

function post_data() {
    const is_active = document.getElementById("is-active").getAttribute("data-checked");

    const data = {
        "is_active": is_active
    };

    socket.emit(
        "config_bot_control",
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

function join_room() {
    add_log_entry("info", "Connecting to Spectrum server ...");
    socket.emit("join_room", "config_server_logs");

    socket.on("joined_room", function (room_name) {
        add_log_entry("info", "Logger connected!");
        
        if (room_name === "config_server_logs") {
            socket.on("log_ready", function (log_type, log_entry) {
                add_log_entry(log_type, log_entry);
            });
        }
    });
}

function open_socket() {
    socket = io(
        "https://" + cookie["host"] + ":" + cookie["port"] + "/" + cookie["server_id"],
        {
            query: "user_id=" + cookie["user_id"] + "&access_code=" + cookie["access_code"]
        }
    );
    
    socket.on("data_ready", function (data) {
        initialize_bot_control_area(data);
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