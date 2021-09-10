"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;

let server_console = undefined;
//#endregion

function initialize_module_area(data) {
    const module_area = document.getElementById("module-area");

    while (module_area.lastChild) {
        module_area.removeChild(module_area.lastChild);
    }

    //#region Notification header
    const module_header = document.createElement("div");
    module_header.className = "action-header";
    module_header.innerHTML = "Notification";

    module_area.appendChild(module_header);
    //#endregion

    //#region Notification header line
    const module_header_line = document.createElement("hr");
    module_header_line.style.width = "calc(100% - 10px)";
    module_header_line.style.marginLeft = "5px";
    module_area.appendChild(module_header_line);
    //#endregion

    //#region Module is active
    const is_active = document.createElement("div");
    is_active.id = "is-active";
    is_active.className = "flex-row flex-static action-option";
    is_active.title = "Activate or deactivate the module.";

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
    is_active_description.innerHTML = "Module is active";

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

    module_area.appendChild(is_active);
    //#endregion
}

function get_data() {
    socket.emit(
        "module_notification_module",
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
        "module_notification_module",
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
        initialize_module_area(data);
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