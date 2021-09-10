"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;

let servers = undefined;
let selectedServerId = undefined;

let redirect = true;
//#endregion

function selectServer(serverId) {
    selectedServerId = serverId;

    initialize_tokens();
}

function initialize_tokens() {
    const urlServerId = get_url_parameter("server");

    if (urlServerId) {
        if (redirect) {
            selectedServerId = urlServerId;
            redirect = false;
        }
    }
    
    const navigationPanel = document.getElementById("navigation-panel");

    // Remove all menu buttons.
    while (navigationPanel.lastChild) {
        navigationPanel.removeChild(navigationPanel.lastChild);
    }

    // Create the menu.
    for (let i = 0; i < servers.length; i++) {
        const server = servers[i];
        const serverId = server["server_id"];
        const serverIcon = server["server_icon"];
        const serverName = server["server_name"];

        // Add the menu button.
        const menuButton = document.createElement("div");
        menuButton.id = serverId;
        menuButton.className = "flex-row flex-static navigation-item";
        menuButton.style.height = "auto";

        if (!selectedServerId && i === 0) {
            selectedServerId = serverId;

            menuButton.setAttribute("selected", true);
        }
        else if (serverId === selectedServerId) {
            menuButton.setAttribute("selected", true);
        }

        menuButton.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();
                
                selectServer(serverId);
            },
            false
        );

        navigationPanel.appendChild(menuButton);

        // Add the menu button icon.
        const menuButtonIcon = document.createElement("img");
        menuButtonIcon.className = "navigation-image";
        menuButtonIcon.src = serverIcon;

        menuButton.appendChild(menuButtonIcon);

        // Add the menu button name.
        const menuButtonName = document.createElement("span");
        menuButtonName.className = "flex-dynamic navigation-title";
        menuButtonName.innerHTML = serverName;

        menuButton.appendChild(menuButtonName);
    }

    const tokenArea = document.getElementById("token-area");

    // Remove all tokens.
    while (tokenArea.lastChild) {
        tokenArea.removeChild(tokenArea.lastChild);
    }

    // Load the tokens of the selected server.
    let server = undefined;

    for (let i = 0; i < servers.length; i++) {
        server = servers[i];

        if (server["server_id"] === selectedServerId) {
            break;
        }
    }

    const tokens = server["tokens"];
    const tokenDetails = server["token_details"];
    const clientId = server["client_id"];
    const requiredScopes = server["required_scopes"];
    const authenticationUri = server["authenticationUri"];

    const authUrl = "https://login.eveonline.com/oauth/authorize/?response_type=code&client_id=" + clientId + "&scope=" + requiredScopes + "&redirect_uri=" + authenticationUri + "&state=" + selectedServerId + ";" + cookie["user_id"] + ";" + cookie["access_code"];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const refreshToken = token["body"]["refresh_token"];
        const registeredOn = token["registered_on"];

        const tokenDetail = tokenDetails[refreshToken];
        const characterId = tokenDetail["body"]["CharacterID"];
        const characterName = tokenDetail["body"]["CharacterName"];
        const tokenValidity = tokenDetail["validity"];
        const isMainCharacter = tokenDetail["main"];

        // -----------------------------------------------------------------
        const tokenElement = document.createElement("div");

        if (detectMobile()) {
            tokenElement.className = "flex-column flex-static area with-border";
        }
        else {
            tokenElement.className = "flex-row flex-static area with-border";
        }

        tokenElement.style.marginBottom = "5px";

        if (isMainCharacter) {
            tokenElement.style.background = "#224422";
        }
        else {
            tokenElement.style.background = "#222222";
        }

        tokenArea.appendChild(tokenElement);

        // -----------------------------------------------------------------
        const descriptionElement = document.createElement("div");
        descriptionElement.className = "flex-row flex-static";

        tokenElement.appendChild(descriptionElement);

        // -----------------------------------------------------------------
        const portraitElement = document.createElement("img");
        portraitElement.src = "https://imageserver.eveonline.com/Character/" + characterId + "_128.jpg";
        portraitElement.style.width = "128px";
        portraitElement.style.height = "128px";
        portraitElement.style.marginRight = "5px";
        portraitElement.style.border = "solid 2px #AAAAAA";
        portraitElement.style.borderRadius = "5px";

        descriptionElement.appendChild(portraitElement);

        // -----------------------------------------------------------------
        const textElement = document.createElement("div");

        if (detectMobile()) {
            textElement.className = "flex-column flex-dynamic area";
            textElement.style.width = "auto";
        }
        else {
            textElement.className = "flex-column flex-static area";
            textElement.style.width = "700px";
        }

        textElement.style.border = "solid 2px #AAAAAA";
        textElement.style.borderRadius = "5px";

        descriptionElement.appendChild(textElement);

        // -----------------------------------------------------------------
        const characterNameElement = document.createElement("span");
        characterNameElement.className = "token-description";
        characterNameElement.style.color = "#AAAA00";
        characterNameElement.style.fontSize = "20px";
        characterNameElement.style.fontWeight = "bold";
        characterNameElement.innerHTML = characterName;

        textElement.appendChild(characterNameElement);

        // -----------------------------------------------------------------
        const hr1Element = document.createElement("hr");
        hr1Element.style.width = "100%";

        textElement.appendChild(hr1Element);

        // -----------------------------------------------------------------
        const refreshTokenElement = document.createElement("span");
        refreshTokenElement.className = "token-description";
        refreshTokenElement.style.wordBreak = "break-all";
        refreshTokenElement.innerHTML = "<span style=\"font-weight: bold;\">Refresh Token</span><br><br>" + refreshToken;

        textElement.appendChild(refreshTokenElement);

        // -----------------------------------------------------------------
        const hr2Element = document.createElement("hr");
        hr2Element.style.width = "100%";

        textElement.appendChild(hr2Element);

        // -----------------------------------------------------------------
        const registeredOnElement = document.createElement("span");
        registeredOnElement.className = "token-description";
        registeredOnElement.innerHTML = "<span style=\"font-weight: bold;\">Registered on</span><br><br>" + registeredOn;

        textElement.appendChild(registeredOnElement);

        // -----------------------------------------------------------------
        if (tokenValidity === "incomplete") {
            // -----------------------------------------------------------------
            const hr3Element = document.createElement("hr");
            hr3Element.style.width = "100%";

            textElement.appendChild(hr3Element);

            // -----------------------------------------------------------------
            const tokenWarningElement = document.createElement("span");
            tokenWarningElement.className = "token-description";
            tokenWarningElement.style.fontWeight = "bold";
            tokenWarningElement.style.color = "#FFFF55";
            tokenWarningElement.innerHTML = "Token is missing scopes! You should Re-Authenticate, or you could miss out on Discord roles with this Character.";

            textElement.appendChild(tokenWarningElement);
        }
        else if (tokenValidity === "invalid") {
            // -----------------------------------------------------------------
            const hr3Element = document.createElement("hr");
            hr3Element.style.width = "100%";

            textElement.appendChild(hr3Element);

            // -----------------------------------------------------------------
            const tokenErrorElement = document.createElement("span");
            tokenErrorElement.className = "token-description";
            tokenErrorElement.style.fontWeight = "bold";
            tokenErrorElement.style.color = "#FF5555";
            tokenErrorElement.innerHTML = "Token is invalid! You must Re-Authenticate, or this Character will be ignored for Discord roles.";

            textElement.appendChild(tokenErrorElement);
        }

        // -----------------------------------------------------------------
        const optionElement = document.createElement("div");
        optionElement.className = "flex-column flex-static";

        if (detectMobile()) {
            optionElement.style.marginLeft = "133px";
            optionElement.style.marginTop = "15px";
        }
        else {
            optionElement.style.marginLeft = "auto";
            optionElement.style.marginTop = "0px";
        }

        tokenElement.appendChild(optionElement);

        if (!isMainCharacter) {
            // -----------------------------------------------------------------
            const makeMainButtonElement = document.createElement("button");
            makeMainButtonElement.setAttribute("new", true);
            makeMainButtonElement.innerHTML = "Make Main";
            makeMainButtonElement.addEventListener(
                "click",
                function (event) {
                    event.stopPropagation();

                    post_data(refreshToken);
                },
                false
            );

            optionElement.appendChild(makeMainButtonElement);
        }

        // -----------------------------------------------------------------
        const reAuthenticateButtonElement = document.createElement("button");
        reAuthenticateButtonElement.setAttribute("edit", true);
        reAuthenticateButtonElement.style.marginTop = "auto";
        reAuthenticateButtonElement.innerHTML = "Re-Authenticate";
        reAuthenticateButtonElement.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                window.location = authUrl;
            },
            false
        );

        optionElement.appendChild(reAuthenticateButtonElement);

        // -----------------------------------------------------------------
        const deleteCharacterButtonElement = document.createElement("button");
        deleteCharacterButtonElement.setAttribute("delete", true);
        deleteCharacterButtonElement.style.marginTop = "5px";
        deleteCharacterButtonElement.innerHTML = "Delete Character";
        deleteCharacterButtonElement.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                delete_data(refreshToken)
            },
            false
        );

        optionElement.appendChild(deleteCharacterButtonElement);
    }

    const addCharacterButtonElement = document.getElementById("btn-add-character");
    const addCharacterButtonElementClone = addCharacterButtonElement.cloneNode(true);

    addCharacterButtonElement.parentNode.replaceChild(addCharacterButtonElementClone, addCharacterButtonElement);

    addCharacterButtonElementClone.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();

            window.location = authUrl;
        },
        false
    );
}

function get_url_parameter(key) {
    key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var results = regex.exec(location.search);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

function get_data() {
    socket.emit(
        "auth_tokens",
        {
            "method": "get"
        }
    );
}

function post_data(refreshToken) {
    socket.emit(
        "auth_tokens",
        {
            "method": "post",
            "data": {
                "server_id": selectedServerId,
                "refresh_token": refreshToken
            }
        }
    );
}

function delete_data(refreshToken) {
    socket.emit(
        "auth_tokens",
        {
            "method": "delete",
            "data": {
                "server_id": selectedServerId,
                "refresh_token": refreshToken
            }
        }
    );
}

function load_cookie() {
    const name = "spectrum_module_default_auth" + "=";
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
        "https://" + cookie["host"] + ":" + cookie["port"] + "/default",
        {
            query: "user_id=" + cookie["user_id"] + "&access_code=" + cookie["access_code"]
        }
    );

    socket.on("data_ready", function (data) {
        servers = data;

        initialize_tokens();
    });

    socket.on("data_posted", function () {
        get_data();
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

    if (detectMobile()) {
        document.getElementById("main").className = "flex-column";
        document.getElementById("navigation-panel").style.width = "auto";
    }
    else {
        document.getElementById("main").className = "flex-row";
        document.getElementById("navigation-panel").style.width = "350px";
    }

    open_socket();
    get_data();
}

function detectMobile() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
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