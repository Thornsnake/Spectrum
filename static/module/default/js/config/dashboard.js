"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;
//#endregion

function get_data() {
    socket.emit(
        "config_dashboard",
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
        initialize_dashboard(data);
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

    /* BETA DISCLAIMER */
    const starting_dialog = document.createElement("div");
    starting_dialog.className = "area with-border";
    starting_dialog.style.position = "absolute";
    starting_dialog.style.top = "0px";
    starting_dialog.style.left = "0px";
    starting_dialog.style.right = "0px";
    starting_dialog.style.bottom = "0px";
    starting_dialog.style.margin = "auto";
    starting_dialog.style.width = "500px";
    starting_dialog.style.height = "200px";
    starting_dialog.style.background = "#FFFFFF";
    starting_dialog.style.fontSize = "16px";
    starting_dialog.style.fontWeight = "bold";
    starting_dialog.innerHTML = "THIS BOT IS STILL IN BETA! NO PAYMENT REQUIRED!<br><br>The bot is feature compatible with the old bot, but additional features are still being developed and will be added over the course of the next weeks/months. During this period, no payment for using this bot will be required.<br><br>Further information on how payment will work will be revealed once this bot is getting close to leaving beta. If you have any questions, make sure you join the Development Discord Server. You can find a link in the menu on the left.";

    document.body.addEventListener(
        "click",
        function listener() {
            starting_dialog.parentNode.removeChild(starting_dialog);

            document.body.removeEventListener(
                "click",
                listener,
                false
            );
        },
        false
    );

    document.body.appendChild(starting_dialog);

    open_socket();
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