"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;
//#endregion

function initialize_scopes_area(data) {
    const scopes_area = document.getElementById("scopes-area");

    while (scopes_area.lastChild) {
        scopes_area.removeChild(scopes_area.lastChild);
    }

    // #region Scopes Description
    const scopes_warning = document.createElement("span");
    scopes_warning.style.marginBottom = "5px";
    scopes_warning.style.padding = "5px";
    scopes_warning.style.fontSize = "18px";
    scopes_warning.style.color = "#DDDDDD";
    scopes_warning.style.background = "#333333";
    scopes_warning.innerHTML = "Scopes are automatically added by the bot depending on your selected conditions, rules, keywords and modules. Manually selecting scopes on this page will force them to always be requested when users authenticate on your server, no matter if they are actually needed or not.<br><br>This can be useful if you know that you will likely extend the bot's functionality at a later time and do not want your users having to re-authenticate.";

    scopes_area.appendChild(scopes_warning);
    // #endregion
    
    // #region publicData
    const public_data = document.createElement("div");
    public_data.id = "publicData";
    public_data.className = "flex-row flex-static action-option";
    public_data.title = "Access to public data.";

    if (data["publicData"] === "yes") {
        public_data.setAttribute("data-checked", "yes");
    }
    else {
        public_data.setAttribute("data-checked", "no");
    }

    public_data.addEventListener(
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

    const public_data_description = document.createElement("span");
    public_data_description.className = "action-option-description";
    public_data_description.innerHTML = "publicData";

    const public_data_checkbox = document.createElement("div");
    public_data_checkbox.className = "action-option-checkbox";

    if (data["publicData"] === "yes") {
        public_data_checkbox.style.color = "#00FF00";
        public_data_checkbox.style.borderColor = "#00FF00";
        public_data_checkbox.innerHTML = "YES";
    }
    else {
        public_data_checkbox.style.color = "#FF0000";
        public_data_checkbox.style.borderColor = "#FF0000";
        public_data_checkbox.innerHTML = "NO";
    }

    public_data.appendChild(public_data_description);
    public_data.appendChild(public_data_checkbox);

    scopes_area.appendChild(public_data);
    // #endregion

    // #region esi-calendar.respond_calendar_events.v1
    const esi_calendar_respond_calendar_events_v1 = document.createElement("div");
    esi_calendar_respond_calendar_events_v1.id = "esi-calendar.respond_calendar_events.v1";
    esi_calendar_respond_calendar_events_v1.className = "flex-row flex-static action-option";

    if (data["esi-calendar.respond_calendar_events.v1"] === "yes") {
        esi_calendar_respond_calendar_events_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_calendar_respond_calendar_events_v1.setAttribute("data-checked", "no");
    }

    esi_calendar_respond_calendar_events_v1.addEventListener(
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

    const esi_calendar_respond_calendar_events_v1_description = document.createElement("span");
    esi_calendar_respond_calendar_events_v1_description.className = "action-option-description";
    esi_calendar_respond_calendar_events_v1_description.innerHTML = "esi-calendar.respond_calendar_events.v1";

    const esi_calendar_respond_calendar_events_v1_checkbox = document.createElement("div");
    esi_calendar_respond_calendar_events_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-calendar.respond_calendar_events.v1"] === "yes") {
        esi_calendar_respond_calendar_events_v1_checkbox.style.color = "#00FF00";
        esi_calendar_respond_calendar_events_v1_checkbox.style.borderColor = "#00FF00";
        esi_calendar_respond_calendar_events_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_calendar_respond_calendar_events_v1_checkbox.style.color = "#FF0000";
        esi_calendar_respond_calendar_events_v1_checkbox.style.borderColor = "#FF0000";
        esi_calendar_respond_calendar_events_v1_checkbox.innerHTML = "NO";
    }

    esi_calendar_respond_calendar_events_v1.appendChild(esi_calendar_respond_calendar_events_v1_description);
    esi_calendar_respond_calendar_events_v1.appendChild(esi_calendar_respond_calendar_events_v1_checkbox);

    scopes_area.appendChild(esi_calendar_respond_calendar_events_v1);
    // #endregion

    // #region esi-calendar.read_calendar_events.v1
    const esi_calendar_read_calendar_events_v1 = document.createElement("div");
    esi_calendar_read_calendar_events_v1.id = "esi-calendar.read_calendar_events.v1";
    esi_calendar_read_calendar_events_v1.className = "flex-row flex-static action-option";

    if (data["esi-calendar.read_calendar_events.v1"] === "yes") {
        esi_calendar_read_calendar_events_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_calendar_read_calendar_events_v1.setAttribute("data-checked", "no");
    }

    esi_calendar_read_calendar_events_v1.addEventListener(
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

    const esi_calendar_read_calendar_events_v1_description = document.createElement("span");
    esi_calendar_read_calendar_events_v1_description.className = "action-option-description";
    esi_calendar_read_calendar_events_v1_description.innerHTML = "esi-calendar.read_calendar_events.v1";

    const esi_calendar_read_calendar_events_v1_checkbox = document.createElement("div");
    esi_calendar_read_calendar_events_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-calendar.read_calendar_events.v1"] === "yes") {
        esi_calendar_read_calendar_events_v1_checkbox.style.color = "#00FF00";
        esi_calendar_read_calendar_events_v1_checkbox.style.borderColor = "#00FF00";
        esi_calendar_read_calendar_events_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_calendar_read_calendar_events_v1_checkbox.style.color = "#FF0000";
        esi_calendar_read_calendar_events_v1_checkbox.style.borderColor = "#FF0000";
        esi_calendar_read_calendar_events_v1_checkbox.innerHTML = "NO";
    }

    esi_calendar_read_calendar_events_v1.appendChild(esi_calendar_read_calendar_events_v1_description);
    esi_calendar_read_calendar_events_v1.appendChild(esi_calendar_read_calendar_events_v1_checkbox);

    scopes_area.appendChild(esi_calendar_read_calendar_events_v1);
    // #endregion

    // #region esi-location.read_location.v1
    const esi_location_read_location_v1 = document.createElement("div");
    esi_location_read_location_v1.id = "esi-location.read_location.v1";
    esi_location_read_location_v1.className = "flex-row flex-static action-option";

    if (data["esi-location.read_location.v1"] === "yes") {
        esi_location_read_location_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_location_read_location_v1.setAttribute("data-checked", "no");
    }

    esi_location_read_location_v1.addEventListener(
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

    const esi_location_read_location_v1_description = document.createElement("span");
    esi_location_read_location_v1_description.className = "action-option-description";
    esi_location_read_location_v1_description.innerHTML = "esi-location.read_location.v1";

    const esi_location_read_location_v1_checkbox = document.createElement("div");
    esi_location_read_location_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-location.read_location.v1"] === "yes") {
        esi_location_read_location_v1_checkbox.style.color = "#00FF00";
        esi_location_read_location_v1_checkbox.style.borderColor = "#00FF00";
        esi_location_read_location_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_location_read_location_v1_checkbox.style.color = "#FF0000";
        esi_location_read_location_v1_checkbox.style.borderColor = "#FF0000";
        esi_location_read_location_v1_checkbox.innerHTML = "NO";
    }

    esi_location_read_location_v1.appendChild(esi_location_read_location_v1_description);
    esi_location_read_location_v1.appendChild(esi_location_read_location_v1_checkbox);

    scopes_area.appendChild(esi_location_read_location_v1);
    // #endregion

    // #region esi-location.read_ship_type.v1
    const esi_location_read_ship_type_v1 = document.createElement("div");
    esi_location_read_ship_type_v1.id = "esi-location.read_ship_type.v1";
    esi_location_read_ship_type_v1.className = "flex-row flex-static action-option";

    if (data["esi-location.read_ship_type.v1"] === "yes") {
        esi_location_read_ship_type_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_location_read_ship_type_v1.setAttribute("data-checked", "no");
    }

    esi_location_read_ship_type_v1.addEventListener(
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

    const esi_location_read_ship_type_v1_description = document.createElement("span");
    esi_location_read_ship_type_v1_description.className = "action-option-description";
    esi_location_read_ship_type_v1_description.innerHTML = "esi-location.read_ship_type.v1";

    const esi_location_read_ship_type_v1_checkbox = document.createElement("div");
    esi_location_read_ship_type_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-location.read_ship_type.v1"] === "yes") {
        esi_location_read_ship_type_v1_checkbox.style.color = "#00FF00";
        esi_location_read_ship_type_v1_checkbox.style.borderColor = "#00FF00";
        esi_location_read_ship_type_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_location_read_ship_type_v1_checkbox.style.color = "#FF0000";
        esi_location_read_ship_type_v1_checkbox.style.borderColor = "#FF0000";
        esi_location_read_ship_type_v1_checkbox.innerHTML = "NO";
    }

    esi_location_read_ship_type_v1.appendChild(esi_location_read_ship_type_v1_description);
    esi_location_read_ship_type_v1.appendChild(esi_location_read_ship_type_v1_checkbox);

    scopes_area.appendChild(esi_location_read_ship_type_v1);
    // #endregion

    // #region esi-mail.organize_mail.v1
    const esi_mail_organize_mail_v1 = document.createElement("div");
    esi_mail_organize_mail_v1.id = "esi-mail.organize_mail.v1";
    esi_mail_organize_mail_v1.className = "flex-row flex-static action-option";

    if (data["esi-mail.organize_mail.v1"] === "yes") {
        esi_mail_organize_mail_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_mail_organize_mail_v1.setAttribute("data-checked", "no");
    }

    esi_mail_organize_mail_v1.addEventListener(
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

    const esi_mail_organize_mail_v1_description = document.createElement("span");
    esi_mail_organize_mail_v1_description.className = "action-option-description";
    esi_mail_organize_mail_v1_description.innerHTML = "esi-mail.organize_mail.v1";

    const esi_mail_organize_mail_v1_checkbox = document.createElement("div");
    esi_mail_organize_mail_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-mail.organize_mail.v1"] === "yes") {
        esi_mail_organize_mail_v1_checkbox.style.color = "#00FF00";
        esi_mail_organize_mail_v1_checkbox.style.borderColor = "#00FF00";
        esi_mail_organize_mail_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_mail_organize_mail_v1_checkbox.style.color = "#FF0000";
        esi_mail_organize_mail_v1_checkbox.style.borderColor = "#FF0000";
        esi_mail_organize_mail_v1_checkbox.innerHTML = "NO";
    }

    esi_mail_organize_mail_v1.appendChild(esi_mail_organize_mail_v1_description);
    esi_mail_organize_mail_v1.appendChild(esi_mail_organize_mail_v1_checkbox);

    scopes_area.appendChild(esi_mail_organize_mail_v1);
    // #endregion

    // #region esi-mail.read_mail.v1
    const esi_mail_read_mail_v1 = document.createElement("div");
    esi_mail_read_mail_v1.id = "esi-mail.read_mail.v1";
    esi_mail_read_mail_v1.className = "flex-row flex-static action-option";

    if (data["esi-mail.read_mail.v1"] === "yes") {
        esi_mail_read_mail_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_mail_read_mail_v1.setAttribute("data-checked", "no");
    }

    esi_mail_read_mail_v1.addEventListener(
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

    const esi_mail_read_mail_v1_description = document.createElement("span");
    esi_mail_read_mail_v1_description.className = "action-option-description";
    esi_mail_read_mail_v1_description.innerHTML = "esi-mail.read_mail.v1";

    const esi_mail_read_mail_v1_checkbox = document.createElement("div");
    esi_mail_read_mail_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-mail.read_mail.v1"] === "yes") {
        esi_mail_read_mail_v1_checkbox.style.color = "#00FF00";
        esi_mail_read_mail_v1_checkbox.style.borderColor = "#00FF00";
        esi_mail_read_mail_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_mail_read_mail_v1_checkbox.style.color = "#FF0000";
        esi_mail_read_mail_v1_checkbox.style.borderColor = "#FF0000";
        esi_mail_read_mail_v1_checkbox.innerHTML = "NO";
    }

    esi_mail_read_mail_v1.appendChild(esi_mail_read_mail_v1_description);
    esi_mail_read_mail_v1.appendChild(esi_mail_read_mail_v1_checkbox);

    scopes_area.appendChild(esi_mail_read_mail_v1);
    // #endregion

    // #region esi-mail.send_mail.v1
    const esi_mail_send_mail_v1 = document.createElement("div");
    esi_mail_send_mail_v1.id = "esi-mail.send_mail.v1";
    esi_mail_send_mail_v1.className = "flex-row flex-static action-option";

    if (data["esi-mail.send_mail.v1"] === "yes") {
        esi_mail_send_mail_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_mail_send_mail_v1.setAttribute("data-checked", "no");
    }

    esi_mail_send_mail_v1.addEventListener(
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

    const esi_mail_send_mail_v1_description = document.createElement("span");
    esi_mail_send_mail_v1_description.className = "action-option-description";
    esi_mail_send_mail_v1_description.innerHTML = "esi-mail.send_mail.v1";

    const esi_mail_send_mail_v1_checkbox = document.createElement("div");
    esi_mail_send_mail_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-mail.send_mail.v1"] === "yes") {
        esi_mail_send_mail_v1_checkbox.style.color = "#00FF00";
        esi_mail_send_mail_v1_checkbox.style.borderColor = "#00FF00";
        esi_mail_send_mail_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_mail_send_mail_v1_checkbox.style.color = "#FF0000";
        esi_mail_send_mail_v1_checkbox.style.borderColor = "#FF0000";
        esi_mail_send_mail_v1_checkbox.innerHTML = "NO";
    }

    esi_mail_send_mail_v1.appendChild(esi_mail_send_mail_v1_description);
    esi_mail_send_mail_v1.appendChild(esi_mail_send_mail_v1_checkbox);

    scopes_area.appendChild(esi_mail_send_mail_v1);
    // #endregion

    // #region esi-skills.read_skills.v1
    const esi_skills_read_skills_v1 = document.createElement("div");
    esi_skills_read_skills_v1.id = "esi-skills.read_skills.v1";
    esi_skills_read_skills_v1.className = "flex-row flex-static action-option";

    if (data["esi-skills.read_skills.v1"] === "yes") {
        esi_skills_read_skills_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_skills_read_skills_v1.setAttribute("data-checked", "no");
    }

    esi_skills_read_skills_v1.addEventListener(
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

    const esi_skills_read_skills_v1_description = document.createElement("span");
    esi_skills_read_skills_v1_description.className = "action-option-description";
    esi_skills_read_skills_v1_description.innerHTML = "esi-skills.read_skills.v1";

    const esi_skills_read_skills_v1_checkbox = document.createElement("div");
    esi_skills_read_skills_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-skills.read_skills.v1"] === "yes") {
        esi_skills_read_skills_v1_checkbox.style.color = "#00FF00";
        esi_skills_read_skills_v1_checkbox.style.borderColor = "#00FF00";
        esi_skills_read_skills_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_skills_read_skills_v1_checkbox.style.color = "#FF0000";
        esi_skills_read_skills_v1_checkbox.style.borderColor = "#FF0000";
        esi_skills_read_skills_v1_checkbox.innerHTML = "NO";
    }

    esi_skills_read_skills_v1.appendChild(esi_skills_read_skills_v1_description);
    esi_skills_read_skills_v1.appendChild(esi_skills_read_skills_v1_checkbox);

    scopes_area.appendChild(esi_skills_read_skills_v1);
    // #endregion

    // #region esi-skills.read_skillqueue.v1
    const esi_skills_read_skillqueue_v1 = document.createElement("div");
    esi_skills_read_skillqueue_v1.id = "esi-skills.read_skillqueue.v1";
    esi_skills_read_skillqueue_v1.className = "flex-row flex-static action-option";

    if (data["esi-skills.read_skillqueue.v1"] === "yes") {
        esi_skills_read_skillqueue_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_skills_read_skillqueue_v1.setAttribute("data-checked", "no");
    }

    esi_skills_read_skillqueue_v1.addEventListener(
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

    const esi_skills_read_skillqueue_v1_description = document.createElement("span");
    esi_skills_read_skillqueue_v1_description.className = "action-option-description";
    esi_skills_read_skillqueue_v1_description.innerHTML = "esi-skills.read_skillqueue.v1";

    const esi_skills_read_skillqueue_v1_checkbox = document.createElement("div");
    esi_skills_read_skillqueue_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-skills.read_skillqueue.v1"] === "yes") {
        esi_skills_read_skillqueue_v1_checkbox.style.color = "#00FF00";
        esi_skills_read_skillqueue_v1_checkbox.style.borderColor = "#00FF00";
        esi_skills_read_skillqueue_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_skills_read_skillqueue_v1_checkbox.style.color = "#FF0000";
        esi_skills_read_skillqueue_v1_checkbox.style.borderColor = "#FF0000";
        esi_skills_read_skillqueue_v1_checkbox.innerHTML = "NO";
    }

    esi_skills_read_skillqueue_v1.appendChild(esi_skills_read_skillqueue_v1_description);
    esi_skills_read_skillqueue_v1.appendChild(esi_skills_read_skillqueue_v1_checkbox);

    scopes_area.appendChild(esi_skills_read_skillqueue_v1);
    // #endregion

    // #region esi-wallet.read_character_wallet.v1
    const esi_wallet_read_character_wallet_v1 = document.createElement("div");
    esi_wallet_read_character_wallet_v1.id = "esi-wallet.read_character_wallet.v1";
    esi_wallet_read_character_wallet_v1.className = "flex-row flex-static action-option";

    if (data["esi-wallet.read_character_wallet.v1"] === "yes") {
        esi_wallet_read_character_wallet_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_wallet_read_character_wallet_v1.setAttribute("data-checked", "no");
    }

    esi_wallet_read_character_wallet_v1.addEventListener(
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

    const esi_wallet_read_character_wallet_v1_description = document.createElement("span");
    esi_wallet_read_character_wallet_v1_description.className = "action-option-description";
    esi_wallet_read_character_wallet_v1_description.innerHTML = "esi-wallet.read_character_wallet.v1";

    const esi_wallet_read_character_wallet_v1_checkbox = document.createElement("div");
    esi_wallet_read_character_wallet_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-wallet.read_character_wallet.v1"] === "yes") {
        esi_wallet_read_character_wallet_v1_checkbox.style.color = "#00FF00";
        esi_wallet_read_character_wallet_v1_checkbox.style.borderColor = "#00FF00";
        esi_wallet_read_character_wallet_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_wallet_read_character_wallet_v1_checkbox.style.color = "#FF0000";
        esi_wallet_read_character_wallet_v1_checkbox.style.borderColor = "#FF0000";
        esi_wallet_read_character_wallet_v1_checkbox.innerHTML = "NO";
    }

    esi_wallet_read_character_wallet_v1.appendChild(esi_wallet_read_character_wallet_v1_description);
    esi_wallet_read_character_wallet_v1.appendChild(esi_wallet_read_character_wallet_v1_checkbox);

    scopes_area.appendChild(esi_wallet_read_character_wallet_v1);
    // #endregion

    // #region esi-wallet.read_corporation_wallet.v1
    const esi_wallet_read_corporation_wallet_v1 = document.createElement("div");
    esi_wallet_read_corporation_wallet_v1.id = "esi-wallet.read_corporation_wallet.v1";
    esi_wallet_read_corporation_wallet_v1.className = "flex-row flex-static action-option";

    if (data["esi-wallet.read_corporation_wallet.v1"] === "yes") {
        esi_wallet_read_corporation_wallet_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_wallet_read_corporation_wallet_v1.setAttribute("data-checked", "no");
    }

    esi_wallet_read_corporation_wallet_v1.addEventListener(
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

    const esi_wallet_read_corporation_wallet_v1_description = document.createElement("span");
    esi_wallet_read_corporation_wallet_v1_description.className = "action-option-description";
    esi_wallet_read_corporation_wallet_v1_description.innerHTML = "esi-wallet.read_corporation_wallet.v1";

    const esi_wallet_read_corporation_wallet_v1_checkbox = document.createElement("div");
    esi_wallet_read_corporation_wallet_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-wallet.read_corporation_wallet.v1"] === "yes") {
        esi_wallet_read_corporation_wallet_v1_checkbox.style.color = "#00FF00";
        esi_wallet_read_corporation_wallet_v1_checkbox.style.borderColor = "#00FF00";
        esi_wallet_read_corporation_wallet_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_wallet_read_corporation_wallet_v1_checkbox.style.color = "#FF0000";
        esi_wallet_read_corporation_wallet_v1_checkbox.style.borderColor = "#FF0000";
        esi_wallet_read_corporation_wallet_v1_checkbox.innerHTML = "NO";
    }

    esi_wallet_read_corporation_wallet_v1.appendChild(esi_wallet_read_corporation_wallet_v1_description);
    esi_wallet_read_corporation_wallet_v1.appendChild(esi_wallet_read_corporation_wallet_v1_checkbox);

    scopes_area.appendChild(esi_wallet_read_corporation_wallet_v1);
    // #endregion

    // #region esi-search.search_structures.v1
    const esi_search_search_structures_v1 = document.createElement("div");
    esi_search_search_structures_v1.id = "esi-search.search_structures.v1";
    esi_search_search_structures_v1.className = "flex-row flex-static action-option";

    if (data["esi-search.search_structures.v1"] === "yes") {
        esi_search_search_structures_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_search_search_structures_v1.setAttribute("data-checked", "no");
    }

    esi_search_search_structures_v1.addEventListener(
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

    const esi_search_search_structures_v1_description = document.createElement("span");
    esi_search_search_structures_v1_description.className = "action-option-description";
    esi_search_search_structures_v1_description.innerHTML = "esi-search.search_structures.v1";

    const esi_search_search_structures_v1_checkbox = document.createElement("div");
    esi_search_search_structures_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-search.search_structures.v1"] === "yes") {
        esi_search_search_structures_v1_checkbox.style.color = "#00FF00";
        esi_search_search_structures_v1_checkbox.style.borderColor = "#00FF00";
        esi_search_search_structures_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_search_search_structures_v1_checkbox.style.color = "#FF0000";
        esi_search_search_structures_v1_checkbox.style.borderColor = "#FF0000";
        esi_search_search_structures_v1_checkbox.innerHTML = "NO";
    }

    esi_search_search_structures_v1.appendChild(esi_search_search_structures_v1_description);
    esi_search_search_structures_v1.appendChild(esi_search_search_structures_v1_checkbox);

    scopes_area.appendChild(esi_search_search_structures_v1);
    // #endregion

    // #region esi-clones.read_clones.v1
    const esi_clones_read_clones_v1 = document.createElement("div");
    esi_clones_read_clones_v1.id = "esi-clones.read_clones.v1";
    esi_clones_read_clones_v1.className = "flex-row flex-static action-option";

    if (data["esi-clones.read_clones.v1"] === "yes") {
        esi_clones_read_clones_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_clones_read_clones_v1.setAttribute("data-checked", "no");
    }

    esi_clones_read_clones_v1.addEventListener(
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

    const esi_clones_read_clones_v1_description = document.createElement("span");
    esi_clones_read_clones_v1_description.className = "action-option-description";
    esi_clones_read_clones_v1_description.innerHTML = "esi-clones.read_clones.v1";

    const esi_clones_read_clones_v1_checkbox = document.createElement("div");
    esi_clones_read_clones_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-clones.read_clones.v1"] === "yes") {
        esi_clones_read_clones_v1_checkbox.style.color = "#00FF00";
        esi_clones_read_clones_v1_checkbox.style.borderColor = "#00FF00";
        esi_clones_read_clones_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_clones_read_clones_v1_checkbox.style.color = "#FF0000";
        esi_clones_read_clones_v1_checkbox.style.borderColor = "#FF0000";
        esi_clones_read_clones_v1_checkbox.innerHTML = "NO";
    }

    esi_clones_read_clones_v1.appendChild(esi_clones_read_clones_v1_description);
    esi_clones_read_clones_v1.appendChild(esi_clones_read_clones_v1_checkbox);

    scopes_area.appendChild(esi_clones_read_clones_v1);
    // #endregion

    // #region esi-characters.read_contacts.v1
    const esi_characters_read_contacts_v1 = document.createElement("div");
    esi_characters_read_contacts_v1.id = "esi-characters.read_contacts.v1";
    esi_characters_read_contacts_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.read_contacts.v1"] === "yes") {
        esi_characters_read_contacts_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_read_contacts_v1.setAttribute("data-checked", "no");
    }

    esi_characters_read_contacts_v1.addEventListener(
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

    const esi_characters_read_contacts_v1_description = document.createElement("span");
    esi_characters_read_contacts_v1_description.className = "action-option-description";
    esi_characters_read_contacts_v1_description.innerHTML = "esi-characters.read_contacts.v1";

    const esi_characters_read_contacts_v1_checkbox = document.createElement("div");
    esi_characters_read_contacts_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.read_contacts.v1"] === "yes") {
        esi_characters_read_contacts_v1_checkbox.style.color = "#00FF00";
        esi_characters_read_contacts_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_read_contacts_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_read_contacts_v1_checkbox.style.color = "#FF0000";
        esi_characters_read_contacts_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_read_contacts_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_read_contacts_v1.appendChild(esi_characters_read_contacts_v1_description);
    esi_characters_read_contacts_v1.appendChild(esi_characters_read_contacts_v1_checkbox);

    scopes_area.appendChild(esi_characters_read_contacts_v1);
    // #endregion

    // #region esi-universe.read_structures.v1
    const esi_universe_read_structures_v1 = document.createElement("div");
    esi_universe_read_structures_v1.id = "esi-universe.read_structures.v1";
    esi_universe_read_structures_v1.className = "flex-row flex-static action-option";

    if (data["esi-universe.read_structures.v1"] === "yes") {
        esi_universe_read_structures_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_universe_read_structures_v1.setAttribute("data-checked", "no");
    }

    esi_universe_read_structures_v1.addEventListener(
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

    const esi_universe_read_structures_v1_description = document.createElement("span");
    esi_universe_read_structures_v1_description.className = "action-option-description";
    esi_universe_read_structures_v1_description.innerHTML = "esi-universe.read_structures.v1";

    const esi_universe_read_structures_v1_checkbox = document.createElement("div");
    esi_universe_read_structures_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-universe.read_structures.v1"] === "yes") {
        esi_universe_read_structures_v1_checkbox.style.color = "#00FF00";
        esi_universe_read_structures_v1_checkbox.style.borderColor = "#00FF00";
        esi_universe_read_structures_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_universe_read_structures_v1_checkbox.style.color = "#FF0000";
        esi_universe_read_structures_v1_checkbox.style.borderColor = "#FF0000";
        esi_universe_read_structures_v1_checkbox.innerHTML = "NO";
    }

    esi_universe_read_structures_v1.appendChild(esi_universe_read_structures_v1_description);
    esi_universe_read_structures_v1.appendChild(esi_universe_read_structures_v1_checkbox);

    scopes_area.appendChild(esi_universe_read_structures_v1);
    // #endregion

    // #region esi-bookmarks.read_character_bookmarks.v1
    const esi_bookmarks_read_character_bookmarks_v1 = document.createElement("div");
    esi_bookmarks_read_character_bookmarks_v1.id = "esi-bookmarks.read_character_bookmarks.v1";
    esi_bookmarks_read_character_bookmarks_v1.className = "flex-row flex-static action-option";

    if (data["esi-bookmarks.read_character_bookmarks.v1"] === "yes") {
        esi_bookmarks_read_character_bookmarks_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_bookmarks_read_character_bookmarks_v1.setAttribute("data-checked", "no");
    }

    esi_bookmarks_read_character_bookmarks_v1.addEventListener(
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

    const esi_bookmarks_read_character_bookmarks_v1_description = document.createElement("span");
    esi_bookmarks_read_character_bookmarks_v1_description.className = "action-option-description";
    esi_bookmarks_read_character_bookmarks_v1_description.innerHTML = "esi-bookmarks.read_character_bookmarks.v1";

    const esi_bookmarks_read_character_bookmarks_v1_checkbox = document.createElement("div");
    esi_bookmarks_read_character_bookmarks_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-bookmarks.read_character_bookmarks.v1"] === "yes") {
        esi_bookmarks_read_character_bookmarks_v1_checkbox.style.color = "#00FF00";
        esi_bookmarks_read_character_bookmarks_v1_checkbox.style.borderColor = "#00FF00";
        esi_bookmarks_read_character_bookmarks_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_bookmarks_read_character_bookmarks_v1_checkbox.style.color = "#FF0000";
        esi_bookmarks_read_character_bookmarks_v1_checkbox.style.borderColor = "#FF0000";
        esi_bookmarks_read_character_bookmarks_v1_checkbox.innerHTML = "NO";
    }

    esi_bookmarks_read_character_bookmarks_v1.appendChild(esi_bookmarks_read_character_bookmarks_v1_description);
    esi_bookmarks_read_character_bookmarks_v1.appendChild(esi_bookmarks_read_character_bookmarks_v1_checkbox);

    scopes_area.appendChild(esi_bookmarks_read_character_bookmarks_v1);
    // #endregion

    // #region esi-killmails.read_killmails.v1
    const esi_killmails_read_killmails_v1 = document.createElement("div");
    esi_killmails_read_killmails_v1.id = "esi-killmails.read_killmails.v1";
    esi_killmails_read_killmails_v1.className = "flex-row flex-static action-option";

    if (data["esi-killmails.read_killmails.v1"] === "yes") {
        esi_killmails_read_killmails_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_killmails_read_killmails_v1.setAttribute("data-checked", "no");
    }

    esi_killmails_read_killmails_v1.addEventListener(
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

    const esi_killmails_read_killmails_v1_description = document.createElement("span");
    esi_killmails_read_killmails_v1_description.className = "action-option-description";
    esi_killmails_read_killmails_v1_description.innerHTML = "esi-killmails.read_killmails.v1";

    const esi_killmails_read_killmails_v1_checkbox = document.createElement("div");
    esi_killmails_read_killmails_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-killmails.read_killmails.v1"] === "yes") {
        esi_killmails_read_killmails_v1_checkbox.style.color = "#00FF00";
        esi_killmails_read_killmails_v1_checkbox.style.borderColor = "#00FF00";
        esi_killmails_read_killmails_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_killmails_read_killmails_v1_checkbox.style.color = "#FF0000";
        esi_killmails_read_killmails_v1_checkbox.style.borderColor = "#FF0000";
        esi_killmails_read_killmails_v1_checkbox.innerHTML = "NO";
    }

    esi_killmails_read_killmails_v1.appendChild(esi_killmails_read_killmails_v1_description);
    esi_killmails_read_killmails_v1.appendChild(esi_killmails_read_killmails_v1_checkbox);

    scopes_area.appendChild(esi_killmails_read_killmails_v1);
    // #endregion

    // #region esi-corporations.read_corporation_membership.v1
    const esi_corporations_read_corporation_membership_v1 = document.createElement("div");
    esi_corporations_read_corporation_membership_v1.id = "esi-corporations.read_corporation_membership.v1";
    esi_corporations_read_corporation_membership_v1.className = "flex-row flex-static action-option";

    if (data["esi-corporations.read_corporation_membership.v1"] === "yes") {
        esi_corporations_read_corporation_membership_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_corporations_read_corporation_membership_v1.setAttribute("data-checked", "no");
    }

    esi_corporations_read_corporation_membership_v1.addEventListener(
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

    const esi_corporations_read_corporation_membership_v1_description = document.createElement("span");
    esi_corporations_read_corporation_membership_v1_description.className = "action-option-description";
    esi_corporations_read_corporation_membership_v1_description.innerHTML = "esi-corporations.read_corporation_membership.v1";

    const esi_corporations_read_corporation_membership_v1_checkbox = document.createElement("div");
    esi_corporations_read_corporation_membership_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-corporations.read_corporation_membership.v1"] === "yes") {
        esi_corporations_read_corporation_membership_v1_checkbox.style.color = "#00FF00";
        esi_corporations_read_corporation_membership_v1_checkbox.style.borderColor = "#00FF00";
        esi_corporations_read_corporation_membership_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_corporations_read_corporation_membership_v1_checkbox.style.color = "#FF0000";
        esi_corporations_read_corporation_membership_v1_checkbox.style.borderColor = "#FF0000";
        esi_corporations_read_corporation_membership_v1_checkbox.innerHTML = "NO";
    }

    esi_corporations_read_corporation_membership_v1.appendChild(esi_corporations_read_corporation_membership_v1_description);
    esi_corporations_read_corporation_membership_v1.appendChild(esi_corporations_read_corporation_membership_v1_checkbox);

    scopes_area.appendChild(esi_corporations_read_corporation_membership_v1);
    // #endregion

    // #region esi-assets.read_assets.v1
    const esi_assets_read_assets_v1 = document.createElement("div");
    esi_assets_read_assets_v1.id = "esi-assets.read_assets.v1";
    esi_assets_read_assets_v1.className = "flex-row flex-static action-option";

    if (data["esi-assets.read_assets.v1"] === "yes") {
        esi_assets_read_assets_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_assets_read_assets_v1.setAttribute("data-checked", "no");
    }

    esi_assets_read_assets_v1.addEventListener(
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

    const esi_assets_read_assets_v1_description = document.createElement("span");
    esi_assets_read_assets_v1_description.className = "action-option-description";
    esi_assets_read_assets_v1_description.innerHTML = "esi-assets.read_assets.v1";

    const esi_assets_read_assets_v1_checkbox = document.createElement("div");
    esi_assets_read_assets_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-assets.read_assets.v1"] === "yes") {
        esi_assets_read_assets_v1_checkbox.style.color = "#00FF00";
        esi_assets_read_assets_v1_checkbox.style.borderColor = "#00FF00";
        esi_assets_read_assets_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_assets_read_assets_v1_checkbox.style.color = "#FF0000";
        esi_assets_read_assets_v1_checkbox.style.borderColor = "#FF0000";
        esi_assets_read_assets_v1_checkbox.innerHTML = "NO";
    }

    esi_assets_read_assets_v1.appendChild(esi_assets_read_assets_v1_description);
    esi_assets_read_assets_v1.appendChild(esi_assets_read_assets_v1_checkbox);

    scopes_area.appendChild(esi_assets_read_assets_v1);
    // #endregion

    // #region esi-planets.manage_planets.v1
    const esi_planets_manage_planets_v1 = document.createElement("div");
    esi_planets_manage_planets_v1.id = "esi-planets.manage_planets.v1";
    esi_planets_manage_planets_v1.className = "flex-row flex-static action-option";

    if (data["esi-planets.manage_planets.v1"] === "yes") {
        esi_planets_manage_planets_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_planets_manage_planets_v1.setAttribute("data-checked", "no");
    }

    esi_planets_manage_planets_v1.addEventListener(
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

    const esi_planets_manage_planets_v1_description = document.createElement("span");
    esi_planets_manage_planets_v1_description.className = "action-option-description";
    esi_planets_manage_planets_v1_description.innerHTML = "esi-planets.manage_planets.v1";

    const esi_planets_manage_planets_v1_checkbox = document.createElement("div");
    esi_planets_manage_planets_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-planets.manage_planets.v1"] === "yes") {
        esi_planets_manage_planets_v1_checkbox.style.color = "#00FF00";
        esi_planets_manage_planets_v1_checkbox.style.borderColor = "#00FF00";
        esi_planets_manage_planets_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_planets_manage_planets_v1_checkbox.style.color = "#FF0000";
        esi_planets_manage_planets_v1_checkbox.style.borderColor = "#FF0000";
        esi_planets_manage_planets_v1_checkbox.innerHTML = "NO";
    }

    esi_planets_manage_planets_v1.appendChild(esi_planets_manage_planets_v1_description);
    esi_planets_manage_planets_v1.appendChild(esi_planets_manage_planets_v1_checkbox);

    scopes_area.appendChild(esi_planets_manage_planets_v1);
    // #endregion

    // #region esi-fleets.read_fleet.v1
    const esi_fleets_read_fleet_v1 = document.createElement("div");
    esi_fleets_read_fleet_v1.id = "esi-fleets.read_fleet.v1";
    esi_fleets_read_fleet_v1.className = "flex-row flex-static action-option";

    if (data["esi-fleets.read_fleet.v1"] === "yes") {
        esi_fleets_read_fleet_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_fleets_read_fleet_v1.setAttribute("data-checked", "no");
    }

    esi_fleets_read_fleet_v1.addEventListener(
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

    const esi_fleets_read_fleet_v1_description = document.createElement("span");
    esi_fleets_read_fleet_v1_description.className = "action-option-description";
    esi_fleets_read_fleet_v1_description.innerHTML = "esi-fleets.read_fleet.v1";

    const esi_fleets_read_fleet_v1_checkbox = document.createElement("div");
    esi_fleets_read_fleet_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-fleets.read_fleet.v1"] === "yes") {
        esi_fleets_read_fleet_v1_checkbox.style.color = "#00FF00";
        esi_fleets_read_fleet_v1_checkbox.style.borderColor = "#00FF00";
        esi_fleets_read_fleet_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_fleets_read_fleet_v1_checkbox.style.color = "#FF0000";
        esi_fleets_read_fleet_v1_checkbox.style.borderColor = "#FF0000";
        esi_fleets_read_fleet_v1_checkbox.innerHTML = "NO";
    }

    esi_fleets_read_fleet_v1.appendChild(esi_fleets_read_fleet_v1_description);
    esi_fleets_read_fleet_v1.appendChild(esi_fleets_read_fleet_v1_checkbox);

    scopes_area.appendChild(esi_fleets_read_fleet_v1);
    // #endregion

    // #region esi-fleets.write_fleet.v1
    const esi_fleets_write_fleet_v1 = document.createElement("div");
    esi_fleets_write_fleet_v1.id = "esi-fleets.write_fleet.v1";
    esi_fleets_write_fleet_v1.className = "flex-row flex-static action-option";

    if (data["esi-fleets.write_fleet.v1"] === "yes") {
        esi_fleets_write_fleet_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_fleets_write_fleet_v1.setAttribute("data-checked", "no");
    }

    esi_fleets_write_fleet_v1.addEventListener(
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

    const esi_fleets_write_fleet_v1_description = document.createElement("span");
    esi_fleets_write_fleet_v1_description.className = "action-option-description";
    esi_fleets_write_fleet_v1_description.innerHTML = "esi-fleets.write_fleet.v1";

    const esi_fleets_write_fleet_v1_checkbox = document.createElement("div");
    esi_fleets_write_fleet_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-fleets.write_fleet.v1"] === "yes") {
        esi_fleets_write_fleet_v1_checkbox.style.color = "#00FF00";
        esi_fleets_write_fleet_v1_checkbox.style.borderColor = "#00FF00";
        esi_fleets_write_fleet_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_fleets_write_fleet_v1_checkbox.style.color = "#FF0000";
        esi_fleets_write_fleet_v1_checkbox.style.borderColor = "#FF0000";
        esi_fleets_write_fleet_v1_checkbox.innerHTML = "NO";
    }

    esi_fleets_write_fleet_v1.appendChild(esi_fleets_write_fleet_v1_description);
    esi_fleets_write_fleet_v1.appendChild(esi_fleets_write_fleet_v1_checkbox);

    scopes_area.appendChild(esi_fleets_write_fleet_v1);
    // #endregion

    // #region esi-ui.open_window.v1
    const esi_ui_open_window_v1 = document.createElement("div");
    esi_ui_open_window_v1.id = "esi-ui.open_window.v1";
    esi_ui_open_window_v1.className = "flex-row flex-static action-option";

    if (data["esi-ui.open_window.v1"] === "yes") {
        esi_ui_open_window_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_ui_open_window_v1.setAttribute("data-checked", "no");
    }

    esi_ui_open_window_v1.addEventListener(
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

    const esi_ui_open_window_v1_description = document.createElement("span");
    esi_ui_open_window_v1_description.className = "action-option-description";
    esi_ui_open_window_v1_description.innerHTML = "esi-ui.open_window.v1";

    const esi_ui_open_window_v1_checkbox = document.createElement("div");
    esi_ui_open_window_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-ui.open_window.v1"] === "yes") {
        esi_ui_open_window_v1_checkbox.style.color = "#00FF00";
        esi_ui_open_window_v1_checkbox.style.borderColor = "#00FF00";
        esi_ui_open_window_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_ui_open_window_v1_checkbox.style.color = "#FF0000";
        esi_ui_open_window_v1_checkbox.style.borderColor = "#FF0000";
        esi_ui_open_window_v1_checkbox.innerHTML = "NO";
    }

    esi_ui_open_window_v1.appendChild(esi_ui_open_window_v1_description);
    esi_ui_open_window_v1.appendChild(esi_ui_open_window_v1_checkbox);

    scopes_area.appendChild(esi_ui_open_window_v1);
    // #endregion

    // #region esi-ui.write_waypoint.v1
    const esi_ui_write_waypoint_v1 = document.createElement("div");
    esi_ui_write_waypoint_v1.id = "esi-ui.write_waypoint.v1";
    esi_ui_write_waypoint_v1.className = "flex-row flex-static action-option";

    if (data["esi-ui.write_waypoint.v1"] === "yes") {
        esi_ui_write_waypoint_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_ui_write_waypoint_v1.setAttribute("data-checked", "no");
    }

    esi_ui_write_waypoint_v1.addEventListener(
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

    const esi_ui_write_waypoint_v1_description = document.createElement("span");
    esi_ui_write_waypoint_v1_description.className = "action-option-description";
    esi_ui_write_waypoint_v1_description.innerHTML = "esi-ui.write_waypoint.v1";

    const esi_ui_write_waypoint_v1_checkbox = document.createElement("div");
    esi_ui_write_waypoint_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-ui.write_waypoint.v1"] === "yes") {
        esi_ui_write_waypoint_v1_checkbox.style.color = "#00FF00";
        esi_ui_write_waypoint_v1_checkbox.style.borderColor = "#00FF00";
        esi_ui_write_waypoint_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_ui_write_waypoint_v1_checkbox.style.color = "#FF0000";
        esi_ui_write_waypoint_v1_checkbox.style.borderColor = "#FF0000";
        esi_ui_write_waypoint_v1_checkbox.innerHTML = "NO";
    }

    esi_ui_write_waypoint_v1.appendChild(esi_ui_write_waypoint_v1_description);
    esi_ui_write_waypoint_v1.appendChild(esi_ui_write_waypoint_v1_checkbox);

    scopes_area.appendChild(esi_ui_write_waypoint_v1);
    // #endregion

    // #region esi-characters.write_contacts.v1
    const esi_characters_write_contacts_v1 = document.createElement("div");
    esi_characters_write_contacts_v1.id = "esi-characters.write_contacts.v1";
    esi_characters_write_contacts_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.write_contacts.v1"] === "yes") {
        esi_characters_write_contacts_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_write_contacts_v1.setAttribute("data-checked", "no");
    }

    esi_characters_write_contacts_v1.addEventListener(
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

    const esi_characters_write_contacts_v1_description = document.createElement("span");
    esi_characters_write_contacts_v1_description.className = "action-option-description";
    esi_characters_write_contacts_v1_description.innerHTML = "esi-characters.write_contacts.v1";

    const esi_characters_write_contacts_v1_checkbox = document.createElement("div");
    esi_characters_write_contacts_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.write_contacts.v1"] === "yes") {
        esi_characters_write_contacts_v1_checkbox.style.color = "#00FF00";
        esi_characters_write_contacts_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_write_contacts_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_write_contacts_v1_checkbox.style.color = "#FF0000";
        esi_characters_write_contacts_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_write_contacts_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_write_contacts_v1.appendChild(esi_characters_write_contacts_v1_description);
    esi_characters_write_contacts_v1.appendChild(esi_characters_write_contacts_v1_checkbox);

    scopes_area.appendChild(esi_characters_write_contacts_v1);
    // #endregion

    // #region esi-fittings.read_fittings.v1
    const esi_fittings_read_fittings_v1 = document.createElement("div");
    esi_fittings_read_fittings_v1.id = "esi-fittings.read_fittings.v1";
    esi_fittings_read_fittings_v1.className = "flex-row flex-static action-option";

    if (data["esi-fittings.read_fittings.v1"] === "yes") {
        esi_fittings_read_fittings_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_fittings_read_fittings_v1.setAttribute("data-checked", "no");
    }

    esi_fittings_read_fittings_v1.addEventListener(
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

    const esi_fittings_read_fittings_v1_description = document.createElement("span");
    esi_fittings_read_fittings_v1_description.className = "action-option-description";
    esi_fittings_read_fittings_v1_description.innerHTML = "esi-fittings.read_fittings.v1";

    const esi_fittings_read_fittings_v1_checkbox = document.createElement("div");
    esi_fittings_read_fittings_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-fittings.read_fittings.v1"] === "yes") {
        esi_fittings_read_fittings_v1_checkbox.style.color = "#00FF00";
        esi_fittings_read_fittings_v1_checkbox.style.borderColor = "#00FF00";
        esi_fittings_read_fittings_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_fittings_read_fittings_v1_checkbox.style.color = "#FF0000";
        esi_fittings_read_fittings_v1_checkbox.style.borderColor = "#FF0000";
        esi_fittings_read_fittings_v1_checkbox.innerHTML = "NO";
    }

    esi_fittings_read_fittings_v1.appendChild(esi_fittings_read_fittings_v1_description);
    esi_fittings_read_fittings_v1.appendChild(esi_fittings_read_fittings_v1_checkbox);

    scopes_area.appendChild(esi_fittings_read_fittings_v1);
    // #endregion

    // #region esi-fittings.write_fittings.v1
    const esi_fittings_write_fittings_v1 = document.createElement("div");
    esi_fittings_write_fittings_v1.id = "esi-fittings.write_fittings.v1";
    esi_fittings_write_fittings_v1.className = "flex-row flex-static action-option";

    if (data["esi-fittings.write_fittings.v1"] === "yes") {
        esi_fittings_write_fittings_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_fittings_write_fittings_v1.setAttribute("data-checked", "no");
    }

    esi_fittings_write_fittings_v1.addEventListener(
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

    const esi_fittings_write_fittings_v1_description = document.createElement("span");
    esi_fittings_write_fittings_v1_description.className = "action-option-description";
    esi_fittings_write_fittings_v1_description.innerHTML = "esi-fittings.write_fittings.v1";

    const esi_fittings_write_fittings_v1_checkbox = document.createElement("div");
    esi_fittings_write_fittings_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-fittings.write_fittings.v1"] === "yes") {
        esi_fittings_write_fittings_v1_checkbox.style.color = "#00FF00";
        esi_fittings_write_fittings_v1_checkbox.style.borderColor = "#00FF00";
        esi_fittings_write_fittings_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_fittings_write_fittings_v1_checkbox.style.color = "#FF0000";
        esi_fittings_write_fittings_v1_checkbox.style.borderColor = "#FF0000";
        esi_fittings_write_fittings_v1_checkbox.innerHTML = "NO";
    }

    esi_fittings_write_fittings_v1.appendChild(esi_fittings_write_fittings_v1_description);
    esi_fittings_write_fittings_v1.appendChild(esi_fittings_write_fittings_v1_checkbox);

    scopes_area.appendChild(esi_fittings_write_fittings_v1);
    // #endregion

    // #region esi-markets.structure_markets.v1
    const esi_markets_structure_markets_v1 = document.createElement("div");
    esi_markets_structure_markets_v1.id = "esi-markets.structure_markets.v1";
    esi_markets_structure_markets_v1.className = "flex-row flex-static action-option";

    if (data["esi-markets.structure_markets.v1"] === "yes") {
        esi_markets_structure_markets_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_markets_structure_markets_v1.setAttribute("data-checked", "no");
    }

    esi_markets_structure_markets_v1.addEventListener(
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

    const esi_markets_structure_markets_v1_description = document.createElement("span");
    esi_markets_structure_markets_v1_description.className = "action-option-description";
    esi_markets_structure_markets_v1_description.innerHTML = "esi-markets.structure_markets.v1";

    const esi_markets_structure_markets_v1_checkbox = document.createElement("div");
    esi_markets_structure_markets_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-markets.structure_markets.v1"] === "yes") {
        esi_markets_structure_markets_v1_checkbox.style.color = "#00FF00";
        esi_markets_structure_markets_v1_checkbox.style.borderColor = "#00FF00";
        esi_markets_structure_markets_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_markets_structure_markets_v1_checkbox.style.color = "#FF0000";
        esi_markets_structure_markets_v1_checkbox.style.borderColor = "#FF0000";
        esi_markets_structure_markets_v1_checkbox.innerHTML = "NO";
    }

    esi_markets_structure_markets_v1.appendChild(esi_markets_structure_markets_v1_description);
    esi_markets_structure_markets_v1.appendChild(esi_markets_structure_markets_v1_checkbox);

    scopes_area.appendChild(esi_markets_structure_markets_v1);
    // #endregion

    // #region esi-corporations.read_structures.v1
    const esi_corporation_read_structures_v1 = document.createElement("div");
    esi_corporation_read_structures_v1.id = "esi-corporations.read_structures.v1";
    esi_corporation_read_structures_v1.className = "flex-row flex-static action-option";

    if (data["esi-corporations.read_structures.v1"] === "yes") {
        esi_corporation_read_structures_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_corporation_read_structures_v1.setAttribute("data-checked", "no");
    }

    esi_corporation_read_structures_v1.addEventListener(
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

    const esi_corporation_read_structures_v1_description = document.createElement("span");
    esi_corporation_read_structures_v1_description.className = "action-option-description";
    esi_corporation_read_structures_v1_description.innerHTML = "esi-corporations.read_structures.v1";

    const esi_corporation_read_structures_v1_checkbox = document.createElement("div");
    esi_corporation_read_structures_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-corporations.read_structures.v1"] === "yes") {
        esi_corporation_read_structures_v1_checkbox.style.color = "#00FF00";
        esi_corporation_read_structures_v1_checkbox.style.borderColor = "#00FF00";
        esi_corporation_read_structures_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_corporation_read_structures_v1_checkbox.style.color = "#FF0000";
        esi_corporation_read_structures_v1_checkbox.style.borderColor = "#FF0000";
        esi_corporation_read_structures_v1_checkbox.innerHTML = "NO";
    }

    esi_corporation_read_structures_v1.appendChild(esi_corporation_read_structures_v1_description);
    esi_corporation_read_structures_v1.appendChild(esi_corporation_read_structures_v1_checkbox);

    scopes_area.appendChild(esi_corporation_read_structures_v1);
    // #endregion

    // #region esi-characters.read_loyalty.v1
    const esi_characters_read_loyalty_v1 = document.createElement("div");
    esi_characters_read_loyalty_v1.id = "esi-characters.read_loyalty.v1";
    esi_characters_read_loyalty_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.read_loyalty.v1"] === "yes") {
        esi_characters_read_loyalty_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_read_loyalty_v1.setAttribute("data-checked", "no");
    }

    esi_characters_read_loyalty_v1.addEventListener(
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

    const esi_characters_read_loyalty_v1_description = document.createElement("span");
    esi_characters_read_loyalty_v1_description.className = "action-option-description";
    esi_characters_read_loyalty_v1_description.innerHTML = "esi-characters.read_loyalty.v1";

    const esi_characters_read_loyalty_v1_checkbox = document.createElement("div");
    esi_characters_read_loyalty_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.read_loyalty.v1"] === "yes") {
        esi_characters_read_loyalty_v1_checkbox.style.color = "#00FF00";
        esi_characters_read_loyalty_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_read_loyalty_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_read_loyalty_v1_checkbox.style.color = "#FF0000";
        esi_characters_read_loyalty_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_read_loyalty_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_read_loyalty_v1.appendChild(esi_characters_read_loyalty_v1_description);
    esi_characters_read_loyalty_v1.appendChild(esi_characters_read_loyalty_v1_checkbox);

    scopes_area.appendChild(esi_characters_read_loyalty_v1);
    // #endregion

    // #region esi-characters.read_opportunities.v1
    const esi_characters_read_opportunities_v1 = document.createElement("div");
    esi_characters_read_opportunities_v1.id = "esi-characters.read_opportunities.v1";
    esi_characters_read_opportunities_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.read_opportunities.v1"] === "yes") {
        esi_characters_read_opportunities_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_read_opportunities_v1.setAttribute("data-checked", "no");
    }

    esi_characters_read_opportunities_v1.addEventListener(
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

    const esi_characters_read_opportunities_v1_description = document.createElement("span");
    esi_characters_read_opportunities_v1_description.className = "action-option-description";
    esi_characters_read_opportunities_v1_description.innerHTML = "esi-characters.read_opportunities.v1";

    const esi_characters_read_opportunities_v1_checkbox = document.createElement("div");
    esi_characters_read_opportunities_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.read_opportunities.v1"] === "yes") {
        esi_characters_read_opportunities_v1_checkbox.style.color = "#00FF00";
        esi_characters_read_opportunities_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_read_opportunities_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_read_opportunities_v1_checkbox.style.color = "#FF0000";
        esi_characters_read_opportunities_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_read_opportunities_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_read_opportunities_v1.appendChild(esi_characters_read_opportunities_v1_description);
    esi_characters_read_opportunities_v1.appendChild(esi_characters_read_opportunities_v1_checkbox);

    scopes_area.appendChild(esi_characters_read_opportunities_v1);
    // #endregion

    // #region esi-characters.read_chat_channels.v1
    const esi_characters_read_chat_channels_v1 = document.createElement("div");
    esi_characters_read_chat_channels_v1.id = "esi-characters.read_chat_channels.v1";
    esi_characters_read_chat_channels_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.read_chat_channels.v1"] === "yes") {
        esi_characters_read_chat_channels_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_read_chat_channels_v1.setAttribute("data-checked", "no");
    }

    esi_characters_read_chat_channels_v1.addEventListener(
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

    const esi_characters_read_chat_channels_v1_description = document.createElement("span");
    esi_characters_read_chat_channels_v1_description.className = "action-option-description";
    esi_characters_read_chat_channels_v1_description.innerHTML = "esi-characters.read_chat_channels.v1";

    const esi_characters_read_chat_channels_v1_checkbox = document.createElement("div");
    esi_characters_read_chat_channels_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.read_chat_channels.v1"] === "yes") {
        esi_characters_read_chat_channels_v1_checkbox.style.color = "#00FF00";
        esi_characters_read_chat_channels_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_read_chat_channels_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_read_chat_channels_v1_checkbox.style.color = "#FF0000";
        esi_characters_read_chat_channels_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_read_chat_channels_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_read_chat_channels_v1.appendChild(esi_characters_read_chat_channels_v1_description);
    esi_characters_read_chat_channels_v1.appendChild(esi_characters_read_chat_channels_v1_checkbox);

    scopes_area.appendChild(esi_characters_read_chat_channels_v1);
    // #endregion

    // #region esi-characters.read_medals.v1
    const esi_characters_read_medals_v1 = document.createElement("div");
    esi_characters_read_medals_v1.id = "esi-characters.read_medals.v1";
    esi_characters_read_medals_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.read_medals.v1"] === "yes") {
        esi_characters_read_medals_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_read_medals_v1.setAttribute("data-checked", "no");
    }

    esi_characters_read_medals_v1.addEventListener(
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

    const esi_characters_read_medals_v1_description = document.createElement("span");
    esi_characters_read_medals_v1_description.className = "action-option-description";
    esi_characters_read_medals_v1_description.innerHTML = "esi-characters.read_medals.v1";

    const esi_characters_read_medals_v1_checkbox = document.createElement("div");
    esi_characters_read_medals_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.read_medals.v1"] === "yes") {
        esi_characters_read_medals_v1_checkbox.style.color = "#00FF00";
        esi_characters_read_medals_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_read_medals_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_read_medals_v1_checkbox.style.color = "#FF0000";
        esi_characters_read_medals_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_read_medals_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_read_medals_v1.appendChild(esi_characters_read_medals_v1_description);
    esi_characters_read_medals_v1.appendChild(esi_characters_read_medals_v1_checkbox);

    scopes_area.appendChild(esi_characters_read_medals_v1);
    // #endregion

    // #region esi-characters.read_standings.v1
    const esi_characters_read_standings_v1 = document.createElement("div");
    esi_characters_read_standings_v1.id = "esi-characters.read_standings.v1";
    esi_characters_read_standings_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.read_standings.v1"] === "yes") {
        esi_characters_read_standings_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_read_standings_v1.setAttribute("data-checked", "no");
    }

    esi_characters_read_standings_v1.addEventListener(
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

    const esi_characters_read_standings_v1_description = document.createElement("span");
    esi_characters_read_standings_v1_description.className = "action-option-description";
    esi_characters_read_standings_v1_description.innerHTML = "esi-characters.read_standings.v1";

    const esi_characters_read_standings_v1_checkbox = document.createElement("div");
    esi_characters_read_standings_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.read_standings.v1"] === "yes") {
        esi_characters_read_standings_v1_checkbox.style.color = "#00FF00";
        esi_characters_read_standings_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_read_standings_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_read_standings_v1_checkbox.style.color = "#FF0000";
        esi_characters_read_standings_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_read_standings_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_read_standings_v1.appendChild(esi_characters_read_standings_v1_description);
    esi_characters_read_standings_v1.appendChild(esi_characters_read_standings_v1_checkbox);

    scopes_area.appendChild(esi_characters_read_standings_v1);
    // #endregion

    // #region esi-characters.read_agents_research.v1
    const esi_characters_read_agents_research_v1 = document.createElement("div");
    esi_characters_read_agents_research_v1.id = "esi-characters.read_agents_research.v1";
    esi_characters_read_agents_research_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.read_agents_research.v1"] === "yes") {
        esi_characters_read_agents_research_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_read_agents_research_v1.setAttribute("data-checked", "no");
    }

    esi_characters_read_agents_research_v1.addEventListener(
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

    const esi_characters_read_agents_research_v1_description = document.createElement("span");
    esi_characters_read_agents_research_v1_description.className = "action-option-description";
    esi_characters_read_agents_research_v1_description.innerHTML = "esi-characters.read_agents_research.v1";

    const esi_characters_read_agents_research_v1_checkbox = document.createElement("div");
    esi_characters_read_agents_research_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.read_agents_research.v1"] === "yes") {
        esi_characters_read_agents_research_v1_checkbox.style.color = "#00FF00";
        esi_characters_read_agents_research_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_read_agents_research_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_read_agents_research_v1_checkbox.style.color = "#FF0000";
        esi_characters_read_agents_research_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_read_agents_research_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_read_agents_research_v1.appendChild(esi_characters_read_agents_research_v1_description);
    esi_characters_read_agents_research_v1.appendChild(esi_characters_read_agents_research_v1_checkbox);

    scopes_area.appendChild(esi_characters_read_agents_research_v1);
    // #endregion

    // #region esi-industry.read_character_jobs.v1
    const esi_industry_read_character_jobs_v1 = document.createElement("div");
    esi_industry_read_character_jobs_v1.id = "esi-industry.read_character_jobs.v1";
    esi_industry_read_character_jobs_v1.className = "flex-row flex-static action-option";

    if (data["esi-industry.read_character_jobs.v1"] === "yes") {
        esi_industry_read_character_jobs_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_industry_read_character_jobs_v1.setAttribute("data-checked", "no");
    }

    esi_industry_read_character_jobs_v1.addEventListener(
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

    const esi_industry_read_character_jobs_v1_description = document.createElement("span");
    esi_industry_read_character_jobs_v1_description.className = "action-option-description";
    esi_industry_read_character_jobs_v1_description.innerHTML = "esi-industry.read_character_jobs.v1";

    const esi_industry_read_character_jobs_v1_checkbox = document.createElement("div");
    esi_industry_read_character_jobs_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-industry.read_character_jobs.v1"] === "yes") {
        esi_industry_read_character_jobs_v1_checkbox.style.color = "#00FF00";
        esi_industry_read_character_jobs_v1_checkbox.style.borderColor = "#00FF00";
        esi_industry_read_character_jobs_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_industry_read_character_jobs_v1_checkbox.style.color = "#FF0000";
        esi_industry_read_character_jobs_v1_checkbox.style.borderColor = "#FF0000";
        esi_industry_read_character_jobs_v1_checkbox.innerHTML = "NO";
    }

    esi_industry_read_character_jobs_v1.appendChild(esi_industry_read_character_jobs_v1_description);
    esi_industry_read_character_jobs_v1.appendChild(esi_industry_read_character_jobs_v1_checkbox);

    scopes_area.appendChild(esi_industry_read_character_jobs_v1);
    // #endregion

    // #region esi-markets.read_character_orders.v1
    const esi_markets_read_character_orders_v1 = document.createElement("div");
    esi_markets_read_character_orders_v1.id = "esi-markets.read_character_orders.v1";
    esi_markets_read_character_orders_v1.className = "flex-row flex-static action-option";

    if (data["esi-markets.read_character_orders.v1"] === "yes") {
        esi_markets_read_character_orders_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_markets_read_character_orders_v1.setAttribute("data-checked", "no");
    }

    esi_markets_read_character_orders_v1.addEventListener(
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

    const esi_markets_read_character_orders_v1_description = document.createElement("span");
    esi_markets_read_character_orders_v1_description.className = "action-option-description";
    esi_markets_read_character_orders_v1_description.innerHTML = "esi-markets.read_character_orders.v1";

    const esi_markets_read_character_orders_v1_checkbox = document.createElement("div");
    esi_markets_read_character_orders_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-markets.read_character_orders.v1"] === "yes") {
        esi_markets_read_character_orders_v1_checkbox.style.color = "#00FF00";
        esi_markets_read_character_orders_v1_checkbox.style.borderColor = "#00FF00";
        esi_markets_read_character_orders_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_markets_read_character_orders_v1_checkbox.style.color = "#FF0000";
        esi_markets_read_character_orders_v1_checkbox.style.borderColor = "#FF0000";
        esi_markets_read_character_orders_v1_checkbox.innerHTML = "NO";
    }

    esi_markets_read_character_orders_v1.appendChild(esi_markets_read_character_orders_v1_description);
    esi_markets_read_character_orders_v1.appendChild(esi_markets_read_character_orders_v1_checkbox);

    scopes_area.appendChild(esi_markets_read_character_orders_v1);
    // #endregion

    // #region esi-characters.read_blueprints.v1
    const esi_characters_read_blueprints_v1 = document.createElement("div");
    esi_characters_read_blueprints_v1.id = "esi-characters.read_blueprints.v1";
    esi_characters_read_blueprints_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.read_blueprints.v1"] === "yes") {
        esi_characters_read_blueprints_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_read_blueprints_v1.setAttribute("data-checked", "no");
    }

    esi_characters_read_blueprints_v1.addEventListener(
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

    const esi_characters_read_blueprints_v1_description = document.createElement("span");
    esi_characters_read_blueprints_v1_description.className = "action-option-description";
    esi_characters_read_blueprints_v1_description.innerHTML = "esi-characters.read_blueprints.v1";

    const esi_characters_read_blueprints_v1_checkbox = document.createElement("div");
    esi_characters_read_blueprints_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.read_blueprints.v1"] === "yes") {
        esi_characters_read_blueprints_v1_checkbox.style.color = "#00FF00";
        esi_characters_read_blueprints_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_read_blueprints_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_read_blueprints_v1_checkbox.style.color = "#FF0000";
        esi_characters_read_blueprints_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_read_blueprints_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_read_blueprints_v1.appendChild(esi_characters_read_blueprints_v1_description);
    esi_characters_read_blueprints_v1.appendChild(esi_characters_read_blueprints_v1_checkbox);

    scopes_area.appendChild(esi_characters_read_blueprints_v1);
    // #endregion

    // #region esi-characters.read_corporation_roles.v1
    const esi_characters_read_corporation_roles_v1 = document.createElement("div");
    esi_characters_read_corporation_roles_v1.id = "esi-characters.read_corporation_roles.v1";
    esi_characters_read_corporation_roles_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.read_corporation_roles.v1"] === "yes") {
        esi_characters_read_corporation_roles_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_read_corporation_roles_v1.setAttribute("data-checked", "no");
    }

    esi_characters_read_corporation_roles_v1.addEventListener(
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

    const esi_characters_read_corporation_roles_v1_description = document.createElement("span");
    esi_characters_read_corporation_roles_v1_description.className = "action-option-description";
    esi_characters_read_corporation_roles_v1_description.innerHTML = "esi-characters.read_corporation_roles.v1";

    const esi_characters_read_corporation_roles_v1_checkbox = document.createElement("div");
    esi_characters_read_corporation_roles_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.read_corporation_roles.v1"] === "yes") {
        esi_characters_read_corporation_roles_v1_checkbox.style.color = "#00FF00";
        esi_characters_read_corporation_roles_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_read_corporation_roles_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_read_corporation_roles_v1_checkbox.style.color = "#FF0000";
        esi_characters_read_corporation_roles_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_read_corporation_roles_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_read_corporation_roles_v1.appendChild(esi_characters_read_corporation_roles_v1_description);
    esi_characters_read_corporation_roles_v1.appendChild(esi_characters_read_corporation_roles_v1_checkbox);

    scopes_area.appendChild(esi_characters_read_corporation_roles_v1);
    // #endregion

    // #region esi-location.read_online.v1
    const esi_location_read_online_v1 = document.createElement("div");
    esi_location_read_online_v1.id = "esi-location.read_online.v1";
    esi_location_read_online_v1.className = "flex-row flex-static action-option";

    if (data["esi-location.read_online.v1"] === "yes") {
        esi_location_read_online_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_location_read_online_v1.setAttribute("data-checked", "no");
    }

    esi_location_read_online_v1.addEventListener(
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

    const esi_location_read_online_v1_description = document.createElement("span");
    esi_location_read_online_v1_description.className = "action-option-description";
    esi_location_read_online_v1_description.innerHTML = "esi-location.read_online.v1";

    const esi_location_read_online_v1_checkbox = document.createElement("div");
    esi_location_read_online_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-location.read_online.v1"] === "yes") {
        esi_location_read_online_v1_checkbox.style.color = "#00FF00";
        esi_location_read_online_v1_checkbox.style.borderColor = "#00FF00";
        esi_location_read_online_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_location_read_online_v1_checkbox.style.color = "#FF0000";
        esi_location_read_online_v1_checkbox.style.borderColor = "#FF0000";
        esi_location_read_online_v1_checkbox.innerHTML = "NO";
    }

    esi_location_read_online_v1.appendChild(esi_location_read_online_v1_description);
    esi_location_read_online_v1.appendChild(esi_location_read_online_v1_checkbox);

    scopes_area.appendChild(esi_location_read_online_v1);
    // #endregion

    // #region esi-contracts.read_character_contracts.v1
    const esi_contracts_read_character_contracts_v1 = document.createElement("div");
    esi_contracts_read_character_contracts_v1.id = "esi-contracts.read_character_contracts.v1";
    esi_contracts_read_character_contracts_v1.className = "flex-row flex-static action-option";

    if (data["esi-contracts.read_character_contracts.v1"] === "yes") {
        esi_contracts_read_character_contracts_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_contracts_read_character_contracts_v1.setAttribute("data-checked", "no");
    }

    esi_contracts_read_character_contracts_v1.addEventListener(
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

    const esi_contracts_read_character_contracts_v1_description = document.createElement("span");
    esi_contracts_read_character_contracts_v1_description.className = "action-option-description";
    esi_contracts_read_character_contracts_v1_description.innerHTML = "esi-contracts.read_character_contracts.v1";

    const esi_contracts_read_character_contracts_v1_checkbox = document.createElement("div");
    esi_contracts_read_character_contracts_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-contracts.read_character_contracts.v1"] === "yes") {
        esi_contracts_read_character_contracts_v1_checkbox.style.color = "#00FF00";
        esi_contracts_read_character_contracts_v1_checkbox.style.borderColor = "#00FF00";
        esi_contracts_read_character_contracts_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_contracts_read_character_contracts_v1_checkbox.style.color = "#FF0000";
        esi_contracts_read_character_contracts_v1_checkbox.style.borderColor = "#FF0000";
        esi_contracts_read_character_contracts_v1_checkbox.innerHTML = "NO";
    }

    esi_contracts_read_character_contracts_v1.appendChild(esi_contracts_read_character_contracts_v1_description);
    esi_contracts_read_character_contracts_v1.appendChild(esi_contracts_read_character_contracts_v1_checkbox);

    scopes_area.appendChild(esi_contracts_read_character_contracts_v1);
    // #endregion

    // #region esi-clones.read_implants.v1
    const esi_clones_read_implants_v1 = document.createElement("div");
    esi_clones_read_implants_v1.id = "esi-clones.read_implants.v1";
    esi_clones_read_implants_v1.className = "flex-row flex-static action-option";

    if (data["esi-clones.read_implants.v1"] === "yes") {
        esi_clones_read_implants_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_clones_read_implants_v1.setAttribute("data-checked", "no");
    }

    esi_clones_read_implants_v1.addEventListener(
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

    const esi_clones_read_implants_v1_description = document.createElement("span");
    esi_clones_read_implants_v1_description.className = "action-option-description";
    esi_clones_read_implants_v1_description.innerHTML = "esi-clones.read_implants.v1";

    const esi_clones_read_implants_v1_checkbox = document.createElement("div");
    esi_clones_read_implants_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-clones.read_implants.v1"] === "yes") {
        esi_clones_read_implants_v1_checkbox.style.color = "#00FF00";
        esi_clones_read_implants_v1_checkbox.style.borderColor = "#00FF00";
        esi_clones_read_implants_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_clones_read_implants_v1_checkbox.style.color = "#FF0000";
        esi_clones_read_implants_v1_checkbox.style.borderColor = "#FF0000";
        esi_clones_read_implants_v1_checkbox.innerHTML = "NO";
    }

    esi_clones_read_implants_v1.appendChild(esi_clones_read_implants_v1_description);
    esi_clones_read_implants_v1.appendChild(esi_clones_read_implants_v1_checkbox);

    scopes_area.appendChild(esi_clones_read_implants_v1);
    // #endregion

    // #region esi-characters.read_fatigue.v1
    const esi_characters_read_fatigue_v1 = document.createElement("div");
    esi_characters_read_fatigue_v1.id = "esi-characters.read_fatigue.v1";
    esi_characters_read_fatigue_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.read_fatigue.v1"] === "yes") {
        esi_characters_read_fatigue_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_read_fatigue_v1.setAttribute("data-checked", "no");
    }

    esi_characters_read_fatigue_v1.addEventListener(
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

    const esi_characters_read_fatigue_v1_description = document.createElement("span");
    esi_characters_read_fatigue_v1_description.className = "action-option-description";
    esi_characters_read_fatigue_v1_description.innerHTML = "esi-characters.read_fatigue.v1";

    const esi_characters_read_fatigue_v1_checkbox = document.createElement("div");
    esi_characters_read_fatigue_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.read_fatigue.v1"] === "yes") {
        esi_characters_read_fatigue_v1_checkbox.style.color = "#00FF00";
        esi_characters_read_fatigue_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_read_fatigue_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_read_fatigue_v1_checkbox.style.color = "#FF0000";
        esi_characters_read_fatigue_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_read_fatigue_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_read_fatigue_v1.appendChild(esi_characters_read_fatigue_v1_description);
    esi_characters_read_fatigue_v1.appendChild(esi_characters_read_fatigue_v1_checkbox);

    scopes_area.appendChild(esi_characters_read_fatigue_v1);
    // #endregion

    // #region esi-killmails.read_corporation_killmails.v1
    const esi_killmails_read_corporation_killmails_v1 = document.createElement("div");
    esi_killmails_read_corporation_killmails_v1.id = "esi-killmails.read_corporation_killmails.v1";
    esi_killmails_read_corporation_killmails_v1.className = "flex-row flex-static action-option";

    if (data["esi-killmails.read_corporation_killmails.v1"] === "yes") {
        esi_killmails_read_corporation_killmails_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_killmails_read_corporation_killmails_v1.setAttribute("data-checked", "no");
    }

    esi_killmails_read_corporation_killmails_v1.addEventListener(
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

    const esi_killmails_read_corporation_killmails_v1_description = document.createElement("span");
    esi_killmails_read_corporation_killmails_v1_description.className = "action-option-description";
    esi_killmails_read_corporation_killmails_v1_description.innerHTML = "esi-killmails.read_corporation_killmails.v1";

    const esi_killmails_read_corporation_killmails_v1_checkbox = document.createElement("div");
    esi_killmails_read_corporation_killmails_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-killmails.read_corporation_killmails.v1"] === "yes") {
        esi_killmails_read_corporation_killmails_v1_checkbox.style.color = "#00FF00";
        esi_killmails_read_corporation_killmails_v1_checkbox.style.borderColor = "#00FF00";
        esi_killmails_read_corporation_killmails_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_killmails_read_corporation_killmails_v1_checkbox.style.color = "#FF0000";
        esi_killmails_read_corporation_killmails_v1_checkbox.style.borderColor = "#FF0000";
        esi_killmails_read_corporation_killmails_v1_checkbox.innerHTML = "NO";
    }

    esi_killmails_read_corporation_killmails_v1.appendChild(esi_killmails_read_corporation_killmails_v1_description);
    esi_killmails_read_corporation_killmails_v1.appendChild(esi_killmails_read_corporation_killmails_v1_checkbox);

    scopes_area.appendChild(esi_killmails_read_corporation_killmails_v1);
    // #endregion

    // #region esi-corporations.track_members.v1
    const esi_corporations_track_members_v1 = document.createElement("div");
    esi_corporations_track_members_v1.id = "esi-corporations.track_members.v1";
    esi_corporations_track_members_v1.className = "flex-row flex-static action-option";

    if (data["esi-corporations.track_members.v1"] === "yes") {
        esi_corporations_track_members_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_corporations_track_members_v1.setAttribute("data-checked", "no");
    }

    esi_corporations_track_members_v1.addEventListener(
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

    const esi_corporations_track_members_v1_description = document.createElement("span");
    esi_corporations_track_members_v1_description.className = "action-option-description";
    esi_corporations_track_members_v1_description.innerHTML = "esi-corporations.track_members.v1";

    const esi_corporations_track_members_v1_checkbox = document.createElement("div");
    esi_corporations_track_members_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-corporations.track_members.v1"] === "yes") {
        esi_corporations_track_members_v1_checkbox.style.color = "#00FF00";
        esi_corporations_track_members_v1_checkbox.style.borderColor = "#00FF00";
        esi_corporations_track_members_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_corporations_track_members_v1_checkbox.style.color = "#FF0000";
        esi_corporations_track_members_v1_checkbox.style.borderColor = "#FF0000";
        esi_corporations_track_members_v1_checkbox.innerHTML = "NO";
    }

    esi_corporations_track_members_v1.appendChild(esi_corporations_track_members_v1_description);
    esi_corporations_track_members_v1.appendChild(esi_corporations_track_members_v1_checkbox);

    scopes_area.appendChild(esi_corporations_track_members_v1);
    // #endregion

    // #region esi-wallet.read_corporation_wallets.v1
    const esi_wallet_read_corporation_wallets_v1 = document.createElement("div");
    esi_wallet_read_corporation_wallets_v1.id = "esi-wallet.read_corporation_wallets.v1";
    esi_wallet_read_corporation_wallets_v1.className = "flex-row flex-static action-option";

    if (data["esi-wallet.read_corporation_wallets.v1"] === "yes") {
        esi_wallet_read_corporation_wallets_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_wallet_read_corporation_wallets_v1.setAttribute("data-checked", "no");
    }

    esi_wallet_read_corporation_wallets_v1.addEventListener(
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

    const esi_wallet_read_corporation_wallets_v1_description = document.createElement("span");
    esi_wallet_read_corporation_wallets_v1_description.className = "action-option-description";
    esi_wallet_read_corporation_wallets_v1_description.innerHTML = "esi-wallet.read_corporation_wallets.v1";

    const esi_wallet_read_corporation_wallets_v1_checkbox = document.createElement("div");
    esi_wallet_read_corporation_wallets_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-wallet.read_corporation_wallets.v1"] === "yes") {
        esi_wallet_read_corporation_wallets_v1_checkbox.style.color = "#00FF00";
        esi_wallet_read_corporation_wallets_v1_checkbox.style.borderColor = "#00FF00";
        esi_wallet_read_corporation_wallets_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_wallet_read_corporation_wallets_v1_checkbox.style.color = "#FF0000";
        esi_wallet_read_corporation_wallets_v1_checkbox.style.borderColor = "#FF0000";
        esi_wallet_read_corporation_wallets_v1_checkbox.innerHTML = "NO";
    }

    esi_wallet_read_corporation_wallets_v1.appendChild(esi_wallet_read_corporation_wallets_v1_description);
    esi_wallet_read_corporation_wallets_v1.appendChild(esi_wallet_read_corporation_wallets_v1_checkbox);

    scopes_area.appendChild(esi_wallet_read_corporation_wallets_v1);
    // #endregion

    // #region esi-characters.read_notifications.v1
    const esi_characters_read_notifications_v1 = document.createElement("div");
    esi_characters_read_notifications_v1.id = "esi-characters.read_notifications.v1";
    esi_characters_read_notifications_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.read_notifications.v1"] === "yes") {
        esi_characters_read_notifications_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_read_notifications_v1.setAttribute("data-checked", "no");
    }

    esi_characters_read_notifications_v1.addEventListener(
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

    const esi_characters_read_notifications_v1_description = document.createElement("span");
    esi_characters_read_notifications_v1_description.className = "action-option-description";
    esi_characters_read_notifications_v1_description.innerHTML = "esi-characters.read_notifications.v1";

    const esi_characters_read_notifications_v1_checkbox = document.createElement("div");
    esi_characters_read_notifications_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.read_notifications.v1"] === "yes") {
        esi_characters_read_notifications_v1_checkbox.style.color = "#00FF00";
        esi_characters_read_notifications_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_read_notifications_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_read_notifications_v1_checkbox.style.color = "#FF0000";
        esi_characters_read_notifications_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_read_notifications_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_read_notifications_v1.appendChild(esi_characters_read_notifications_v1_description);
    esi_characters_read_notifications_v1.appendChild(esi_characters_read_notifications_v1_checkbox);

    scopes_area.appendChild(esi_characters_read_notifications_v1);
    // #endregion

    // #region esi-corporations.read_divisions.v1
    const esi_corporations_read_divisions_v1 = document.createElement("div");
    esi_corporations_read_divisions_v1.id = "esi-corporations.read_divisions.v1";
    esi_corporations_read_divisions_v1.className = "flex-row flex-static action-option";

    if (data["esi-corporations.read_divisions.v1"] === "yes") {
        esi_corporations_read_divisions_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_corporations_read_divisions_v1.setAttribute("data-checked", "no");
    }

    esi_corporations_read_divisions_v1.addEventListener(
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

    const esi_corporations_read_divisions_v1_description = document.createElement("span");
    esi_corporations_read_divisions_v1_description.className = "action-option-description";
    esi_corporations_read_divisions_v1_description.innerHTML = "esi-corporations.read_divisions.v1";

    const esi_corporations_read_divisions_v1_checkbox = document.createElement("div");
    esi_corporations_read_divisions_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-corporations.read_divisions.v1"] === "yes") {
        esi_corporations_read_divisions_v1_checkbox.style.color = "#00FF00";
        esi_corporations_read_divisions_v1_checkbox.style.borderColor = "#00FF00";
        esi_corporations_read_divisions_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_corporations_read_divisions_v1_checkbox.style.color = "#FF0000";
        esi_corporations_read_divisions_v1_checkbox.style.borderColor = "#FF0000";
        esi_corporations_read_divisions_v1_checkbox.innerHTML = "NO";
    }

    esi_corporations_read_divisions_v1.appendChild(esi_corporations_read_divisions_v1_description);
    esi_corporations_read_divisions_v1.appendChild(esi_corporations_read_divisions_v1_checkbox);

    scopes_area.appendChild(esi_corporations_read_divisions_v1);
    // #endregion

    // #region esi-corporations.read_contacts.v1
    const esi_corporations_read_contacts_v1 = document.createElement("div");
    esi_corporations_read_contacts_v1.id = "esi-corporations.read_contacts.v1";
    esi_corporations_read_contacts_v1.className = "flex-row flex-static action-option";

    if (data["esi-corporations.read_contacts.v1"] === "yes") {
        esi_corporations_read_contacts_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_corporations_read_contacts_v1.setAttribute("data-checked", "no");
    }

    esi_corporations_read_contacts_v1.addEventListener(
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

    const esi_corporations_read_contacts_v1_description = document.createElement("span");
    esi_corporations_read_contacts_v1_description.className = "action-option-description";
    esi_corporations_read_contacts_v1_description.innerHTML = "esi-corporations.read_contacts.v1";

    const esi_corporations_read_contacts_v1_checkbox = document.createElement("div");
    esi_corporations_read_contacts_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-corporations.read_contacts.v1"] === "yes") {
        esi_corporations_read_contacts_v1_checkbox.style.color = "#00FF00";
        esi_corporations_read_contacts_v1_checkbox.style.borderColor = "#00FF00";
        esi_corporations_read_contacts_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_corporations_read_contacts_v1_checkbox.style.color = "#FF0000";
        esi_corporations_read_contacts_v1_checkbox.style.borderColor = "#FF0000";
        esi_corporations_read_contacts_v1_checkbox.innerHTML = "NO";
    }

    esi_corporations_read_contacts_v1.appendChild(esi_corporations_read_contacts_v1_description);
    esi_corporations_read_contacts_v1.appendChild(esi_corporations_read_contacts_v1_checkbox);

    scopes_area.appendChild(esi_corporations_read_contacts_v1);
    // #endregion

    // #region esi-assets.read_corporation_assets.v1
    const esi_assets_read_corporation_assets_v1 = document.createElement("div");
    esi_assets_read_corporation_assets_v1.id = "esi-assets.read_corporation_assets.v1";
    esi_assets_read_corporation_assets_v1.className = "flex-row flex-static action-option";

    if (data["esi-assets.read_corporation_assets.v1"] === "yes") {
        esi_assets_read_corporation_assets_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_assets_read_corporation_assets_v1.setAttribute("data-checked", "no");
    }

    esi_assets_read_corporation_assets_v1.addEventListener(
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

    const esi_assets_read_corporation_assets_v1_description = document.createElement("span");
    esi_assets_read_corporation_assets_v1_description.className = "action-option-description";
    esi_assets_read_corporation_assets_v1_description.innerHTML = "esi-assets.read_corporation_assets.v1";

    const esi_assets_read_corporation_assets_v1_checkbox = document.createElement("div");
    esi_assets_read_corporation_assets_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-assets.read_corporation_assets.v1"] === "yes") {
        esi_assets_read_corporation_assets_v1_checkbox.style.color = "#00FF00";
        esi_assets_read_corporation_assets_v1_checkbox.style.borderColor = "#00FF00";
        esi_assets_read_corporation_assets_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_assets_read_corporation_assets_v1_checkbox.style.color = "#FF0000";
        esi_assets_read_corporation_assets_v1_checkbox.style.borderColor = "#FF0000";
        esi_assets_read_corporation_assets_v1_checkbox.innerHTML = "NO";
    }

    esi_assets_read_corporation_assets_v1.appendChild(esi_assets_read_corporation_assets_v1_description);
    esi_assets_read_corporation_assets_v1.appendChild(esi_assets_read_corporation_assets_v1_checkbox);

    scopes_area.appendChild(esi_assets_read_corporation_assets_v1);
    // #endregion

    // #region esi-corporations.read_titles.v1
    const esi_corporations_read_titles_v1 = document.createElement("div");
    esi_corporations_read_titles_v1.id = "esi-corporations.read_titles.v1";
    esi_corporations_read_titles_v1.className = "flex-row flex-static action-option";

    if (data["esi-corporations.read_titles.v1"] === "yes") {
        esi_corporations_read_titles_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_corporations_read_titles_v1.setAttribute("data-checked", "no");
    }

    esi_corporations_read_titles_v1.addEventListener(
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

    const esi_corporations_read_titles_v1_description = document.createElement("span");
    esi_corporations_read_titles_v1_description.className = "action-option-description";
    esi_corporations_read_titles_v1_description.innerHTML = "esi-corporations.read_titles.v1";

    const esi_corporations_read_titles_v1_checkbox = document.createElement("div");
    esi_corporations_read_titles_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-corporations.read_titles.v1"] === "yes") {
        esi_corporations_read_titles_v1_checkbox.style.color = "#00FF00";
        esi_corporations_read_titles_v1_checkbox.style.borderColor = "#00FF00";
        esi_corporations_read_titles_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_corporations_read_titles_v1_checkbox.style.color = "#FF0000";
        esi_corporations_read_titles_v1_checkbox.style.borderColor = "#FF0000";
        esi_corporations_read_titles_v1_checkbox.innerHTML = "NO";
    }

    esi_corporations_read_titles_v1.appendChild(esi_corporations_read_titles_v1_description);
    esi_corporations_read_titles_v1.appendChild(esi_corporations_read_titles_v1_checkbox);

    scopes_area.appendChild(esi_corporations_read_titles_v1);
    // #endregion

    // #region esi-corporations.read_blueprints.v1
    const esi_corporations_read_blueprints_v1 = document.createElement("div");
    esi_corporations_read_blueprints_v1.id = "esi-corporations.read_blueprints.v1";
    esi_corporations_read_blueprints_v1.className = "flex-row flex-static action-option";

    if (data["esi-corporations.read_blueprints.v1"] === "yes") {
        esi_corporations_read_blueprints_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_corporations_read_blueprints_v1.setAttribute("data-checked", "no");
    }

    esi_corporations_read_blueprints_v1.addEventListener(
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

    const esi_corporations_read_blueprints_v1_description = document.createElement("span");
    esi_corporations_read_blueprints_v1_description.className = "action-option-description";
    esi_corporations_read_blueprints_v1_description.innerHTML = "esi-corporations.read_blueprints.v1";

    const esi_corporations_read_blueprints_v1_checkbox = document.createElement("div");
    esi_corporations_read_blueprints_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-corporations.read_blueprints.v1"] === "yes") {
        esi_corporations_read_blueprints_v1_checkbox.style.color = "#00FF00";
        esi_corporations_read_blueprints_v1_checkbox.style.borderColor = "#00FF00";
        esi_corporations_read_blueprints_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_corporations_read_blueprints_v1_checkbox.style.color = "#FF0000";
        esi_corporations_read_blueprints_v1_checkbox.style.borderColor = "#FF0000";
        esi_corporations_read_blueprints_v1_checkbox.innerHTML = "NO";
    }

    esi_corporations_read_blueprints_v1.appendChild(esi_corporations_read_blueprints_v1_description);
    esi_corporations_read_blueprints_v1.appendChild(esi_corporations_read_blueprints_v1_checkbox);

    scopes_area.appendChild(esi_corporations_read_blueprints_v1);
    // #endregion

    // #region esi-bookmarks.read_corporation_bookmarks.v1
    const esi_bookmarks_read_corporation_bookmarks_v1 = document.createElement("div");
    esi_bookmarks_read_corporation_bookmarks_v1.id = "esi-bookmarks.read_corporation_bookmarks.v1";
    esi_bookmarks_read_corporation_bookmarks_v1.className = "flex-row flex-static action-option";

    if (data["esi-bookmarks.read_corporation_bookmarks.v1"] === "yes") {
        esi_bookmarks_read_corporation_bookmarks_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_bookmarks_read_corporation_bookmarks_v1.setAttribute("data-checked", "no");
    }

    esi_bookmarks_read_corporation_bookmarks_v1.addEventListener(
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

    const esi_bookmarks_read_corporation_bookmarks_v1_description = document.createElement("span");
    esi_bookmarks_read_corporation_bookmarks_v1_description.className = "action-option-description";
    esi_bookmarks_read_corporation_bookmarks_v1_description.innerHTML = "esi-bookmarks.read_corporation_bookmarks.v1";

    const esi_bookmarks_read_corporation_bookmarks_v1_checkbox = document.createElement("div");
    esi_bookmarks_read_corporation_bookmarks_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-bookmarks.read_corporation_bookmarks.v1"] === "yes") {
        esi_bookmarks_read_corporation_bookmarks_v1_checkbox.style.color = "#00FF00";
        esi_bookmarks_read_corporation_bookmarks_v1_checkbox.style.borderColor = "#00FF00";
        esi_bookmarks_read_corporation_bookmarks_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_bookmarks_read_corporation_bookmarks_v1_checkbox.style.color = "#FF0000";
        esi_bookmarks_read_corporation_bookmarks_v1_checkbox.style.borderColor = "#FF0000";
        esi_bookmarks_read_corporation_bookmarks_v1_checkbox.innerHTML = "NO";
    }

    esi_bookmarks_read_corporation_bookmarks_v1.appendChild(esi_bookmarks_read_corporation_bookmarks_v1_description);
    esi_bookmarks_read_corporation_bookmarks_v1.appendChild(esi_bookmarks_read_corporation_bookmarks_v1_checkbox);

    scopes_area.appendChild(esi_bookmarks_read_corporation_bookmarks_v1);
    // #endregion

    // #region esi-contracts.read_corporation_contracts.v1
    const esi_contracts_read_corporation_contracts_v1 = document.createElement("div");
    esi_contracts_read_corporation_contracts_v1.id = "esi-contracts.read_corporation_contracts.v1";
    esi_contracts_read_corporation_contracts_v1.className = "flex-row flex-static action-option";

    if (data["esi-contracts.read_corporation_contracts.v1"] === "yes") {
        esi_contracts_read_corporation_contracts_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_contracts_read_corporation_contracts_v1.setAttribute("data-checked", "no");
    }

    esi_contracts_read_corporation_contracts_v1.addEventListener(
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

    const esi_contracts_read_corporation_contracts_v1_description = document.createElement("span");
    esi_contracts_read_corporation_contracts_v1_description.className = "action-option-description";
    esi_contracts_read_corporation_contracts_v1_description.innerHTML = "esi-contracts.read_corporation_contracts.v1";

    const esi_contracts_read_corporation_contracts_v1_checkbox = document.createElement("div");
    esi_contracts_read_corporation_contracts_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-contracts.read_corporation_contracts.v1"] === "yes") {
        esi_contracts_read_corporation_contracts_v1_checkbox.style.color = "#00FF00";
        esi_contracts_read_corporation_contracts_v1_checkbox.style.borderColor = "#00FF00";
        esi_contracts_read_corporation_contracts_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_contracts_read_corporation_contracts_v1_checkbox.style.color = "#FF0000";
        esi_contracts_read_corporation_contracts_v1_checkbox.style.borderColor = "#FF0000";
        esi_contracts_read_corporation_contracts_v1_checkbox.innerHTML = "NO";
    }

    esi_contracts_read_corporation_contracts_v1.appendChild(esi_contracts_read_corporation_contracts_v1_description);
    esi_contracts_read_corporation_contracts_v1.appendChild(esi_contracts_read_corporation_contracts_v1_checkbox);

    scopes_area.appendChild(esi_contracts_read_corporation_contracts_v1);
    // #endregion

    // #region esi-corporations.read_standings.v1
    const esi_corporations_read_standings_v1 = document.createElement("div");
    esi_corporations_read_standings_v1.id = "esi-corporations.read_standings.v1";
    esi_corporations_read_standings_v1.className = "flex-row flex-static action-option";

    if (data["esi-corporations.read_standings.v1"] === "yes") {
        esi_corporations_read_standings_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_corporations_read_standings_v1.setAttribute("data-checked", "no");
    }

    esi_corporations_read_standings_v1.addEventListener(
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

    const esi_corporations_read_standings_v1_description = document.createElement("span");
    esi_corporations_read_standings_v1_description.className = "action-option-description";
    esi_corporations_read_standings_v1_description.innerHTML = "esi-corporations.read_standings.v1";

    const esi_corporations_read_standings_v1_checkbox = document.createElement("div");
    esi_corporations_read_standings_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-corporations.read_standings.v1"] === "yes") {
        esi_corporations_read_standings_v1_checkbox.style.color = "#00FF00";
        esi_corporations_read_standings_v1_checkbox.style.borderColor = "#00FF00";
        esi_corporations_read_standings_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_corporations_read_standings_v1_checkbox.style.color = "#FF0000";
        esi_corporations_read_standings_v1_checkbox.style.borderColor = "#FF0000";
        esi_corporations_read_standings_v1_checkbox.innerHTML = "NO";
    }

    esi_corporations_read_standings_v1.appendChild(esi_corporations_read_standings_v1_description);
    esi_corporations_read_standings_v1.appendChild(esi_corporations_read_standings_v1_checkbox);

    scopes_area.appendChild(esi_corporations_read_standings_v1);
    // #endregion

    // #region esi-corporations.read_starbases.v1
    const esi_corporations_read_starbases_v1 = document.createElement("div");
    esi_corporations_read_starbases_v1.id = "esi-corporations.read_starbases.v1";
    esi_corporations_read_starbases_v1.className = "flex-row flex-static action-option";

    if (data["esi-corporations.read_starbases.v1"] === "yes") {
        esi_corporations_read_starbases_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_corporations_read_starbases_v1.setAttribute("data-checked", "no");
    }

    esi_corporations_read_starbases_v1.addEventListener(
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

    const esi_corporations_read_starbases_v1_description = document.createElement("span");
    esi_corporations_read_starbases_v1_description.className = "action-option-description";
    esi_corporations_read_starbases_v1_description.innerHTML = "esi-corporations.read_starbases.v1";

    const esi_corporations_read_starbases_v1_checkbox = document.createElement("div");
    esi_corporations_read_starbases_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-corporations.read_starbases.v1"] === "yes") {
        esi_corporations_read_starbases_v1_checkbox.style.color = "#00FF00";
        esi_corporations_read_starbases_v1_checkbox.style.borderColor = "#00FF00";
        esi_corporations_read_starbases_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_corporations_read_starbases_v1_checkbox.style.color = "#FF0000";
        esi_corporations_read_starbases_v1_checkbox.style.borderColor = "#FF0000";
        esi_corporations_read_starbases_v1_checkbox.innerHTML = "NO";
    }

    esi_corporations_read_starbases_v1.appendChild(esi_corporations_read_starbases_v1_description);
    esi_corporations_read_starbases_v1.appendChild(esi_corporations_read_starbases_v1_checkbox);

    scopes_area.appendChild(esi_corporations_read_starbases_v1);
    // #endregion

    // #region esi-industry.read_corporation_jobs.v1
    const esi_industry_read_corporation_jobs_v1 = document.createElement("div");
    esi_industry_read_corporation_jobs_v1.id = "esi-industry.read_corporation_jobs.v1";
    esi_industry_read_corporation_jobs_v1.className = "flex-row flex-static action-option";

    if (data["esi-industry.read_corporation_jobs.v1"] === "yes") {
        esi_industry_read_corporation_jobs_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_industry_read_corporation_jobs_v1.setAttribute("data-checked", "no");
    }

    esi_industry_read_corporation_jobs_v1.addEventListener(
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

    const esi_industry_read_corporation_jobs_v1_description = document.createElement("span");
    esi_industry_read_corporation_jobs_v1_description.className = "action-option-description";
    esi_industry_read_corporation_jobs_v1_description.innerHTML = "esi-industry.read_corporation_jobs.v1";

    const esi_industry_read_corporation_jobs_v1_checkbox = document.createElement("div");
    esi_industry_read_corporation_jobs_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-industry.read_corporation_jobs.v1"] === "yes") {
        esi_industry_read_corporation_jobs_v1_checkbox.style.color = "#00FF00";
        esi_industry_read_corporation_jobs_v1_checkbox.style.borderColor = "#00FF00";
        esi_industry_read_corporation_jobs_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_industry_read_corporation_jobs_v1_checkbox.style.color = "#FF0000";
        esi_industry_read_corporation_jobs_v1_checkbox.style.borderColor = "#FF0000";
        esi_industry_read_corporation_jobs_v1_checkbox.innerHTML = "NO";
    }

    esi_industry_read_corporation_jobs_v1.appendChild(esi_industry_read_corporation_jobs_v1_description);
    esi_industry_read_corporation_jobs_v1.appendChild(esi_industry_read_corporation_jobs_v1_checkbox);

    scopes_area.appendChild(esi_industry_read_corporation_jobs_v1);
    // #endregion

    // #region esi-markets.read_corporation_orders.v1
    const esi_markets_read_corporation_orders_v1 = document.createElement("div");
    esi_markets_read_corporation_orders_v1.id = "esi-markets.read_corporation_orders.v1";
    esi_markets_read_corporation_orders_v1.className = "flex-row flex-static action-option";

    if (data["esi-markets.read_corporation_orders.v1"] === "yes") {
        esi_markets_read_corporation_orders_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_markets_read_corporation_orders_v1.setAttribute("data-checked", "no");
    }

    esi_markets_read_corporation_orders_v1.addEventListener(
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

    const esi_markets_read_corporation_orders_v1_description = document.createElement("span");
    esi_markets_read_corporation_orders_v1_description.className = "action-option-description";
    esi_markets_read_corporation_orders_v1_description.innerHTML = "esi-markets.read_corporation_orders.v1";

    const esi_markets_read_corporation_orders_v1_checkbox = document.createElement("div");
    esi_markets_read_corporation_orders_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-markets.read_corporation_orders.v1"] === "yes") {
        esi_markets_read_corporation_orders_v1_checkbox.style.color = "#00FF00";
        esi_markets_read_corporation_orders_v1_checkbox.style.borderColor = "#00FF00";
        esi_markets_read_corporation_orders_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_markets_read_corporation_orders_v1_checkbox.style.color = "#FF0000";
        esi_markets_read_corporation_orders_v1_checkbox.style.borderColor = "#FF0000";
        esi_markets_read_corporation_orders_v1_checkbox.innerHTML = "NO";
    }

    esi_markets_read_corporation_orders_v1.appendChild(esi_markets_read_corporation_orders_v1_description);
    esi_markets_read_corporation_orders_v1.appendChild(esi_markets_read_corporation_orders_v1_checkbox);

    scopes_area.appendChild(esi_markets_read_corporation_orders_v1);
    // #endregion

    // #region esi-corporations.read_container_logs.v1
    const esi_corporations_read_container_logs_v1 = document.createElement("div");
    esi_corporations_read_container_logs_v1.id = "esi-corporations.read_container_logs.v1";
    esi_corporations_read_container_logs_v1.className = "flex-row flex-static action-option";

    if (data["esi-corporations.read_container_logs.v1"] === "yes") {
        esi_corporations_read_container_logs_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_corporations_read_container_logs_v1.setAttribute("data-checked", "no");
    }

    esi_corporations_read_container_logs_v1.addEventListener(
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

    const esi_corporations_read_container_logs_v1_description = document.createElement("span");
    esi_corporations_read_container_logs_v1_description.className = "action-option-description";
    esi_corporations_read_container_logs_v1_description.innerHTML = "esi-corporations.read_container_logs.v1";

    const esi_corporations_read_container_logs_v1_checkbox = document.createElement("div");
    esi_corporations_read_container_logs_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-corporations.read_container_logs.v1"] === "yes") {
        esi_corporations_read_container_logs_v1_checkbox.style.color = "#00FF00";
        esi_corporations_read_container_logs_v1_checkbox.style.borderColor = "#00FF00";
        esi_corporations_read_container_logs_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_corporations_read_container_logs_v1_checkbox.style.color = "#FF0000";
        esi_corporations_read_container_logs_v1_checkbox.style.borderColor = "#FF0000";
        esi_corporations_read_container_logs_v1_checkbox.innerHTML = "NO";
    }

    esi_corporations_read_container_logs_v1.appendChild(esi_corporations_read_container_logs_v1_description);
    esi_corporations_read_container_logs_v1.appendChild(esi_corporations_read_container_logs_v1_checkbox);

    scopes_area.appendChild(esi_corporations_read_container_logs_v1);
    // #endregion

    // #region esi-industry.read_character_mining.v1
    const esi_industry_read_character_mining_v1 = document.createElement("div");
    esi_industry_read_character_mining_v1.id = "esi-industry.read_character_mining.v1";
    esi_industry_read_character_mining_v1.className = "flex-row flex-static action-option";

    if (data["esi-industry.read_character_mining.v1"] === "yes") {
        esi_industry_read_character_mining_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_industry_read_character_mining_v1.setAttribute("data-checked", "no");
    }

    esi_industry_read_character_mining_v1.addEventListener(
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

    const esi_industry_read_character_mining_v1_description = document.createElement("span");
    esi_industry_read_character_mining_v1_description.className = "action-option-description";
    esi_industry_read_character_mining_v1_description.innerHTML = "esi-industry.read_character_mining.v1";

    const esi_industry_read_character_mining_v1_checkbox = document.createElement("div");
    esi_industry_read_character_mining_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-industry.read_character_mining.v1"] === "yes") {
        esi_industry_read_character_mining_v1_checkbox.style.color = "#00FF00";
        esi_industry_read_character_mining_v1_checkbox.style.borderColor = "#00FF00";
        esi_industry_read_character_mining_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_industry_read_character_mining_v1_checkbox.style.color = "#FF0000";
        esi_industry_read_character_mining_v1_checkbox.style.borderColor = "#FF0000";
        esi_industry_read_character_mining_v1_checkbox.innerHTML = "NO";
    }

    esi_industry_read_character_mining_v1.appendChild(esi_industry_read_character_mining_v1_description);
    esi_industry_read_character_mining_v1.appendChild(esi_industry_read_character_mining_v1_checkbox);

    scopes_area.appendChild(esi_industry_read_character_mining_v1);
    // #endregion

    // #region esi-industry.read_corporation_mining.v1
    const esi_industry_read_corporation_mining_v1 = document.createElement("div");
    esi_industry_read_corporation_mining_v1.id = "esi-industry.read_corporation_mining.v1";
    esi_industry_read_corporation_mining_v1.className = "flex-row flex-static action-option";

    if (data["esi-industry.read_corporation_mining.v1"] === "yes") {
        esi_industry_read_corporation_mining_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_industry_read_corporation_mining_v1.setAttribute("data-checked", "no");
    }

    esi_industry_read_corporation_mining_v1.addEventListener(
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

    const esi_industry_read_corporation_mining_v1_description = document.createElement("span");
    esi_industry_read_corporation_mining_v1_description.className = "action-option-description";
    esi_industry_read_corporation_mining_v1_description.innerHTML = "esi-industry.read_corporation_mining.v1";

    const esi_industry_read_corporation_mining_v1_checkbox = document.createElement("div");
    esi_industry_read_corporation_mining_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-industry.read_corporation_mining.v1"] === "yes") {
        esi_industry_read_corporation_mining_v1_checkbox.style.color = "#00FF00";
        esi_industry_read_corporation_mining_v1_checkbox.style.borderColor = "#00FF00";
        esi_industry_read_corporation_mining_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_industry_read_corporation_mining_v1_checkbox.style.color = "#FF0000";
        esi_industry_read_corporation_mining_v1_checkbox.style.borderColor = "#FF0000";
        esi_industry_read_corporation_mining_v1_checkbox.innerHTML = "NO";
    }

    esi_industry_read_corporation_mining_v1.appendChild(esi_industry_read_corporation_mining_v1_description);
    esi_industry_read_corporation_mining_v1.appendChild(esi_industry_read_corporation_mining_v1_checkbox);

    scopes_area.appendChild(esi_industry_read_corporation_mining_v1);
    // #endregion

    // #region esi-planets.read_customs_offices.v1
    const esi_planets_read_customs_offices_v1 = document.createElement("div");
    esi_planets_read_customs_offices_v1.id = "esi-planets.read_customs_offices.v1";
    esi_planets_read_customs_offices_v1.className = "flex-row flex-static action-option";

    if (data["esi-planets.read_customs_offices.v1"] === "yes") {
        esi_planets_read_customs_offices_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_planets_read_customs_offices_v1.setAttribute("data-checked", "no");
    }

    esi_planets_read_customs_offices_v1.addEventListener(
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

    const esi_planets_read_customs_offices_v1_description = document.createElement("span");
    esi_planets_read_customs_offices_v1_description.className = "action-option-description";
    esi_planets_read_customs_offices_v1_description.innerHTML = "esi-planets.read_customs_offices.v1";

    const esi_planets_read_customs_offices_v1_checkbox = document.createElement("div");
    esi_planets_read_customs_offices_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-planets.read_customs_offices.v1"] === "yes") {
        esi_planets_read_customs_offices_v1_checkbox.style.color = "#00FF00";
        esi_planets_read_customs_offices_v1_checkbox.style.borderColor = "#00FF00";
        esi_planets_read_customs_offices_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_planets_read_customs_offices_v1_checkbox.style.color = "#FF0000";
        esi_planets_read_customs_offices_v1_checkbox.style.borderColor = "#FF0000";
        esi_planets_read_customs_offices_v1_checkbox.innerHTML = "NO";
    }

    esi_planets_read_customs_offices_v1.appendChild(esi_planets_read_customs_offices_v1_description);
    esi_planets_read_customs_offices_v1.appendChild(esi_planets_read_customs_offices_v1_checkbox);

    scopes_area.appendChild(esi_planets_read_customs_offices_v1);
    // #endregion

    // #region esi-corporations.read_facilities.v1
    const esi_corporations_read_facilities_v1 = document.createElement("div");
    esi_corporations_read_facilities_v1.id = "esi-corporations.read_facilities.v1";
    esi_corporations_read_facilities_v1.className = "flex-row flex-static action-option";

    if (data["esi-corporations.read_facilities.v1"] === "yes") {
        esi_corporations_read_facilities_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_corporations_read_facilities_v1.setAttribute("data-checked", "no");
    }

    esi_corporations_read_facilities_v1.addEventListener(
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

    const esi_corporations_read_facilities_v1_description = document.createElement("span");
    esi_corporations_read_facilities_v1_description.className = "action-option-description";
    esi_corporations_read_facilities_v1_description.innerHTML = "esi-corporations.read_facilities.v1";

    const esi_corporations_read_facilities_v1_checkbox = document.createElement("div");
    esi_corporations_read_facilities_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-corporations.read_facilities.v1"] === "yes") {
        esi_corporations_read_facilities_v1_checkbox.style.color = "#00FF00";
        esi_corporations_read_facilities_v1_checkbox.style.borderColor = "#00FF00";
        esi_corporations_read_facilities_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_corporations_read_facilities_v1_checkbox.style.color = "#FF0000";
        esi_corporations_read_facilities_v1_checkbox.style.borderColor = "#FF0000";
        esi_corporations_read_facilities_v1_checkbox.innerHTML = "NO";
    }

    esi_corporations_read_facilities_v1.appendChild(esi_corporations_read_facilities_v1_description);
    esi_corporations_read_facilities_v1.appendChild(esi_corporations_read_facilities_v1_checkbox);

    scopes_area.appendChild(esi_corporations_read_facilities_v1);
    // #endregion

    // #region esi-corporations.read_medals.v1
    const esi_corporations_read_medals_v1 = document.createElement("div");
    esi_corporations_read_medals_v1.id = "esi-corporations.read_medals.v1";
    esi_corporations_read_medals_v1.className = "flex-row flex-static action-option";

    if (data["esi-corporations.read_medals.v1"] === "yes") {
        esi_corporations_read_medals_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_corporations_read_medals_v1.setAttribute("data-checked", "no");
    }

    esi_corporations_read_medals_v1.addEventListener(
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

    const esi_corporations_read_medals_v1_description = document.createElement("span");
    esi_corporations_read_medals_v1_description.className = "action-option-description";
    esi_corporations_read_medals_v1_description.innerHTML = "esi-corporations.read_medals.v1";

    const esi_corporations_read_medals_v1_checkbox = document.createElement("div");
    esi_corporations_read_medals_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-corporations.read_medals.v1"] === "yes") {
        esi_corporations_read_medals_v1_checkbox.style.color = "#00FF00";
        esi_corporations_read_medals_v1_checkbox.style.borderColor = "#00FF00";
        esi_corporations_read_medals_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_corporations_read_medals_v1_checkbox.style.color = "#FF0000";
        esi_corporations_read_medals_v1_checkbox.style.borderColor = "#FF0000";
        esi_corporations_read_medals_v1_checkbox.innerHTML = "NO";
    }

    esi_corporations_read_medals_v1.appendChild(esi_corporations_read_medals_v1_description);
    esi_corporations_read_medals_v1.appendChild(esi_corporations_read_medals_v1_checkbox);

    scopes_area.appendChild(esi_corporations_read_medals_v1);
    // #endregion

    // #region esi-characters.read_titles.v1
    const esi_characters_read_titles_v1 = document.createElement("div");
    esi_characters_read_titles_v1.id = "esi-characters.read_titles.v1";
    esi_characters_read_titles_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.read_titles.v1"] === "yes") {
        esi_characters_read_titles_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_read_titles_v1.setAttribute("data-checked", "no");
    }

    esi_characters_read_titles_v1.addEventListener(
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

    const esi_characters_read_titles_v1_description = document.createElement("span");
    esi_characters_read_titles_v1_description.className = "action-option-description";
    esi_characters_read_titles_v1_description.innerHTML = "esi-characters.read_titles.v1";

    const esi_characters_read_titles_v1_checkbox = document.createElement("div");
    esi_characters_read_titles_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.read_titles.v1"] === "yes") {
        esi_characters_read_titles_v1_checkbox.style.color = "#00FF00";
        esi_characters_read_titles_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_read_titles_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_read_titles_v1_checkbox.style.color = "#FF0000";
        esi_characters_read_titles_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_read_titles_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_read_titles_v1.appendChild(esi_characters_read_titles_v1_description);
    esi_characters_read_titles_v1.appendChild(esi_characters_read_titles_v1_checkbox);

    scopes_area.appendChild(esi_characters_read_titles_v1);
    // #endregion

    // #region esi-alliances.read_contacts.v1
    const esi_alliances_read_contacts_v1 = document.createElement("div");
    esi_alliances_read_contacts_v1.id = "esi-alliances.read_contacts.v1";
    esi_alliances_read_contacts_v1.className = "flex-row flex-static action-option";

    if (data["esi-alliances.read_contacts.v1"] === "yes") {
        esi_alliances_read_contacts_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_alliances_read_contacts_v1.setAttribute("data-checked", "no");
    }

    esi_alliances_read_contacts_v1.addEventListener(
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

    const esi_alliances_read_contacts_v1_description = document.createElement("span");
    esi_alliances_read_contacts_v1_description.className = "action-option-description";
    esi_alliances_read_contacts_v1_description.innerHTML = "esi-alliances.read_contacts.v1";

    const esi_alliances_read_contacts_v1_checkbox = document.createElement("div");
    esi_alliances_read_contacts_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-alliances.read_contacts.v1"] === "yes") {
        esi_alliances_read_contacts_v1_checkbox.style.color = "#00FF00";
        esi_alliances_read_contacts_v1_checkbox.style.borderColor = "#00FF00";
        esi_alliances_read_contacts_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_alliances_read_contacts_v1_checkbox.style.color = "#FF0000";
        esi_alliances_read_contacts_v1_checkbox.style.borderColor = "#FF0000";
        esi_alliances_read_contacts_v1_checkbox.innerHTML = "NO";
    }

    esi_alliances_read_contacts_v1.appendChild(esi_alliances_read_contacts_v1_description);
    esi_alliances_read_contacts_v1.appendChild(esi_alliances_read_contacts_v1_checkbox);

    scopes_area.appendChild(esi_alliances_read_contacts_v1);
    // #endregion

    // #region esi-characters.read_fw_stats.v1
    const esi_characters_read_fw_stats_v1 = document.createElement("div");
    esi_characters_read_fw_stats_v1.id = "esi-characters.read_fw_stats.v1";
    esi_characters_read_fw_stats_v1.className = "flex-row flex-static action-option";

    if (data["esi-characters.read_fw_stats.v1"] === "yes") {
        esi_characters_read_fw_stats_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characters_read_fw_stats_v1.setAttribute("data-checked", "no");
    }

    esi_characters_read_fw_stats_v1.addEventListener(
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

    const esi_characters_read_fw_stats_v1_description = document.createElement("span");
    esi_characters_read_fw_stats_v1_description.className = "action-option-description";
    esi_characters_read_fw_stats_v1_description.innerHTML = "esi-characters.read_fw_stats.v1";

    const esi_characters_read_fw_stats_v1_checkbox = document.createElement("div");
    esi_characters_read_fw_stats_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characters.read_fw_stats.v1"] === "yes") {
        esi_characters_read_fw_stats_v1_checkbox.style.color = "#00FF00";
        esi_characters_read_fw_stats_v1_checkbox.style.borderColor = "#00FF00";
        esi_characters_read_fw_stats_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characters_read_fw_stats_v1_checkbox.style.color = "#FF0000";
        esi_characters_read_fw_stats_v1_checkbox.style.borderColor = "#FF0000";
        esi_characters_read_fw_stats_v1_checkbox.innerHTML = "NO";
    }

    esi_characters_read_fw_stats_v1.appendChild(esi_characters_read_fw_stats_v1_description);
    esi_characters_read_fw_stats_v1.appendChild(esi_characters_read_fw_stats_v1_checkbox);

    scopes_area.appendChild(esi_characters_read_fw_stats_v1);
    // #endregion

    // #region esi-corporations.read_fw_stats.v1
    const esi_corporations_read_fw_stats_v1 = document.createElement("div");
    esi_corporations_read_fw_stats_v1.id = "esi-corporations.read_fw_stats.v1";
    esi_corporations_read_fw_stats_v1.className = "flex-row flex-static action-option";

    if (data["esi-corporations.read_fw_stats.v1"] === "yes") {
        esi_corporations_read_fw_stats_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_corporations_read_fw_stats_v1.setAttribute("data-checked", "no");
    }

    esi_corporations_read_fw_stats_v1.addEventListener(
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

    const esi_corporations_read_fw_stats_v1_description = document.createElement("span");
    esi_corporations_read_fw_stats_v1_description.className = "action-option-description";
    esi_corporations_read_fw_stats_v1_description.innerHTML = "esi-corporations.read_fw_stats.v1";

    const esi_corporations_read_fw_stats_v1_checkbox = document.createElement("div");
    esi_corporations_read_fw_stats_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-corporations.read_fw_stats.v1"] === "yes") {
        esi_corporations_read_fw_stats_v1_checkbox.style.color = "#00FF00";
        esi_corporations_read_fw_stats_v1_checkbox.style.borderColor = "#00FF00";
        esi_corporations_read_fw_stats_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_corporations_read_fw_stats_v1_checkbox.style.color = "#FF0000";
        esi_corporations_read_fw_stats_v1_checkbox.style.borderColor = "#FF0000";
        esi_corporations_read_fw_stats_v1_checkbox.innerHTML = "NO";
    }

    esi_corporations_read_fw_stats_v1.appendChild(esi_corporations_read_fw_stats_v1_description);
    esi_corporations_read_fw_stats_v1.appendChild(esi_corporations_read_fw_stats_v1_checkbox);

    scopes_area.appendChild(esi_corporations_read_fw_stats_v1);
    // #endregion

    // #region esi-characterstats.read.v1
    const esi_characterstats_read_v1 = document.createElement("div");
    esi_characterstats_read_v1.id = "esi-characterstats.read.v1";
    esi_characterstats_read_v1.className = "flex-row flex-static action-option";

    if (data["esi-characterstats.read.v1"] === "yes") {
        esi_characterstats_read_v1.setAttribute("data-checked", "yes");
    }
    else {
        esi_characterstats_read_v1.setAttribute("data-checked", "no");
    }

    esi_characterstats_read_v1.addEventListener(
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

    const esi_characterstats_read_v1_description = document.createElement("span");
    esi_characterstats_read_v1_description.className = "action-option-description";
    esi_characterstats_read_v1_description.innerHTML = "esi-characterstats.read.v1";

    const esi_characterstats_read_v1_checkbox = document.createElement("div");
    esi_characterstats_read_v1_checkbox.className = "action-option-checkbox";

    if (data["esi-characterstats.read.v1"] === "yes") {
        esi_characterstats_read_v1_checkbox.style.color = "#00FF00";
        esi_characterstats_read_v1_checkbox.style.borderColor = "#00FF00";
        esi_characterstats_read_v1_checkbox.innerHTML = "YES";
    }
    else {
        esi_characterstats_read_v1_checkbox.style.color = "#FF0000";
        esi_characterstats_read_v1_checkbox.style.borderColor = "#FF0000";
        esi_characterstats_read_v1_checkbox.innerHTML = "NO";
    }

    esi_characterstats_read_v1.appendChild(esi_characterstats_read_v1_description);
    esi_characterstats_read_v1.appendChild(esi_characterstats_read_v1_checkbox);

    scopes_area.appendChild(esi_characterstats_read_v1);
    // #endregion
}

function get_data() {
    socket.emit(
        "config_scopes",
        {
            "method": "get"
        }
    );
}

function post_data() {
    const data = {
        "publicData": document.getElementById("publicData").getAttribute("data-checked"),
        "esi-calendar.respond_calendar_events.v1": document.getElementById("esi-calendar.respond_calendar_events.v1").getAttribute("data-checked"),
        "esi-calendar.read_calendar_events.v1": document.getElementById("esi-calendar.read_calendar_events.v1").getAttribute("data-checked"),
        "esi-location.read_location.v1": document.getElementById("esi-location.read_location.v1").getAttribute("data-checked"),
        "esi-location.read_ship_type.v1": document.getElementById("esi-location.read_ship_type.v1").getAttribute("data-checked"),
        "esi-mail.organize_mail.v1": document.getElementById("esi-mail.organize_mail.v1").getAttribute("data-checked"),
        "esi-mail.read_mail.v1": document.getElementById("esi-mail.read_mail.v1").getAttribute("data-checked"),
        "esi-mail.send_mail.v1": document.getElementById("esi-mail.send_mail.v1").getAttribute("data-checked"),
        "esi-skills.read_skills.v1": document.getElementById("esi-skills.read_skills.v1").getAttribute("data-checked"),
        "esi-skills.read_skillqueue.v1": document.getElementById("esi-skills.read_skillqueue.v1").getAttribute("data-checked"),
        "esi-wallet.read_character_wallet.v1": document.getElementById("esi-wallet.read_character_wallet.v1").getAttribute("data-checked"),
        "esi-wallet.read_corporation_wallet.v1": document.getElementById("esi-wallet.read_corporation_wallet.v1").getAttribute("data-checked"),
        "esi-search.search_structures.v1": document.getElementById("esi-search.search_structures.v1").getAttribute("data-checked"),
        "esi-clones.read_clones.v1": document.getElementById("esi-clones.read_clones.v1").getAttribute("data-checked"),
        "esi-characters.read_contacts.v1": document.getElementById("esi-characters.read_contacts.v1").getAttribute("data-checked"),
        "esi-universe.read_structures.v1": document.getElementById("esi-universe.read_structures.v1").getAttribute("data-checked"),
        "esi-bookmarks.read_character_bookmarks.v1": document.getElementById("esi-bookmarks.read_character_bookmarks.v1").getAttribute("data-checked"),
        "esi-killmails.read_killmails.v1": document.getElementById("esi-killmails.read_killmails.v1").getAttribute("data-checked"),
        "esi-corporations.read_corporation_membership.v1": document.getElementById("esi-corporations.read_corporation_membership.v1").getAttribute("data-checked"),
        "esi-assets.read_assets.v1": document.getElementById("esi-assets.read_assets.v1").getAttribute("data-checked"),
        "esi-planets.manage_planets.v1": document.getElementById("esi-planets.manage_planets.v1").getAttribute("data-checked"),
        "esi-fleets.read_fleet.v1": document.getElementById("esi-fleets.read_fleet.v1").getAttribute("data-checked"),
        "esi-fleets.write_fleet.v1": document.getElementById("esi-fleets.write_fleet.v1").getAttribute("data-checked"),
        "esi-ui.open_window.v1": document.getElementById("esi-ui.open_window.v1").getAttribute("data-checked"),
        "esi-ui.write_waypoint.v1": document.getElementById("esi-ui.write_waypoint.v1").getAttribute("data-checked"),
        "esi-characters.write_contacts.v1": document.getElementById("esi-characters.write_contacts.v1").getAttribute("data-checked"),
        "esi-fittings.read_fittings.v1": document.getElementById("esi-fittings.read_fittings.v1").getAttribute("data-checked"),
        "esi-fittings.write_fittings.v1": document.getElementById("esi-fittings.write_fittings.v1").getAttribute("data-checked"),
        "esi-markets.structure_markets.v1": document.getElementById("esi-markets.structure_markets.v1").getAttribute("data-checked"),
        "esi-corporations.read_structures.v1": document.getElementById("esi-corporations.read_structures.v1").getAttribute("data-checked"),
        "esi-characters.read_loyalty.v1": document.getElementById("esi-characters.read_loyalty.v1").getAttribute("data-checked"),
        "esi-characters.read_opportunities.v1": document.getElementById("esi-characters.read_opportunities.v1").getAttribute("data-checked"),
        "esi-characters.read_chat_channels.v1": document.getElementById("esi-characters.read_chat_channels.v1").getAttribute("data-checked"),
        "esi-characters.read_medals.v1": document.getElementById("esi-characters.read_medals.v1").getAttribute("data-checked"),
        "esi-characters.read_standings.v1": document.getElementById("esi-characters.read_standings.v1").getAttribute("data-checked"),
        "esi-characters.read_agents_research.v1": document.getElementById("esi-characters.read_agents_research.v1").getAttribute("data-checked"),
        "esi-industry.read_character_jobs.v1": document.getElementById("esi-industry.read_character_jobs.v1").getAttribute("data-checked"),
        "esi-markets.read_character_orders.v1": document.getElementById("esi-markets.read_character_orders.v1").getAttribute("data-checked"),
        "esi-characters.read_blueprints.v1": document.getElementById("esi-characters.read_blueprints.v1").getAttribute("data-checked"),
        "esi-characters.read_corporation_roles.v1": document.getElementById("esi-characters.read_corporation_roles.v1").getAttribute("data-checked"),
        "esi-location.read_online.v1": document.getElementById("esi-location.read_online.v1").getAttribute("data-checked"),
        "esi-contracts.read_character_contracts.v1": document.getElementById("esi-contracts.read_character_contracts.v1").getAttribute("data-checked"),
        "esi-clones.read_implants.v1": document.getElementById("esi-clones.read_implants.v1").getAttribute("data-checked"),
        "esi-characters.read_fatigue.v1": document.getElementById("esi-characters.read_fatigue.v1").getAttribute("data-checked"),
        "esi-killmails.read_corporation_killmails.v1": document.getElementById("esi-killmails.read_corporation_killmails.v1").getAttribute("data-checked"),
        "esi-corporations.track_members.v1": document.getElementById("esi-corporations.track_members.v1").getAttribute("data-checked"),
        "esi-wallet.read_corporation_wallets.v1": document.getElementById("esi-wallet.read_corporation_wallets.v1").getAttribute("data-checked"),
        "esi-characters.read_notifications.v1": document.getElementById("esi-characters.read_notifications.v1").getAttribute("data-checked"),
        "esi-corporations.read_divisions.v1": document.getElementById("esi-corporations.read_divisions.v1").getAttribute("data-checked"),
        "esi-corporations.read_contacts.v1": document.getElementById("esi-corporations.read_contacts.v1").getAttribute("data-checked"),
        "esi-assets.read_corporation_assets.v1": document.getElementById("esi-assets.read_corporation_assets.v1").getAttribute("data-checked"),
        "esi-corporations.read_titles.v1": document.getElementById("esi-corporations.read_titles.v1").getAttribute("data-checked"),
        "esi-corporations.read_blueprints.v1": document.getElementById("esi-corporations.read_blueprints.v1").getAttribute("data-checked"),
        "esi-bookmarks.read_corporation_bookmarks.v1": document.getElementById("esi-bookmarks.read_corporation_bookmarks.v1").getAttribute("data-checked"),
        "esi-contracts.read_corporation_contracts.v1": document.getElementById("esi-contracts.read_corporation_contracts.v1").getAttribute("data-checked"),
        "esi-corporations.read_standings.v1": document.getElementById("esi-corporations.read_standings.v1").getAttribute("data-checked"),
        "esi-corporations.read_starbases.v1": document.getElementById("esi-corporations.read_starbases.v1").getAttribute("data-checked"),
        "esi-industry.read_corporation_jobs.v1": document.getElementById("esi-industry.read_corporation_jobs.v1").getAttribute("data-checked"),
        "esi-markets.read_corporation_orders.v1": document.getElementById("esi-markets.read_corporation_orders.v1").getAttribute("data-checked"),
        "esi-corporations.read_container_logs.v1": document.getElementById("esi-corporations.read_container_logs.v1").getAttribute("data-checked"),
        "esi-industry.read_character_mining.v1": document.getElementById("esi-industry.read_character_mining.v1").getAttribute("data-checked"),
        "esi-industry.read_corporation_mining.v1": document.getElementById("esi-industry.read_corporation_mining.v1").getAttribute("data-checked"),
        "esi-planets.read_customs_offices.v1": document.getElementById("esi-planets.read_customs_offices.v1").getAttribute("data-checked"),
        "esi-corporations.read_facilities.v1": document.getElementById("esi-corporations.read_facilities.v1").getAttribute("data-checked"),
        "esi-corporations.read_medals.v1": document.getElementById("esi-corporations.read_medals.v1").getAttribute("data-checked"),
        "esi-characters.read_titles.v1": document.getElementById("esi-characters.read_titles.v1").getAttribute("data-checked"),
        "esi-alliances.read_contacts.v1": document.getElementById("esi-alliances.read_contacts.v1").getAttribute("data-checked"),
        "esi-characters.read_fw_stats.v1": document.getElementById("esi-characters.read_fw_stats.v1").getAttribute("data-checked"),
        "esi-corporations.read_fw_stats.v1": document.getElementById("esi-corporations.read_fw_stats.v1").getAttribute("data-checked"),
        "esi-characterstats.read.v1": document.getElementById("esi-characterstats.read.v1").getAttribute("data-checked")
    };

    socket.emit(
        "config_scopes",
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
        initialize_scopes_area(data);
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