"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;

let discord_users = undefined;
//#endregion

function load_discord_user_details(details = undefined) {
    const operator_area = document.getElementById("operator-area");
    const operator_body = operator_area.getElementsByClassName("operator-body")[0];

    while (operator_body.lastChild) {
        operator_body.removeChild(operator_body.lastChild);
    }

    // #region Access Rights
    const access_rights_header = document.createElement("div");
    access_rights_header.className = "discord-user-header";
    access_rights_header.style.marginTop = "10px";
    access_rights_header.style.marginBottom = "5px";
    access_rights_header.style.background = "#333333";
    access_rights_header.innerHTML = "Access Rights";

    operator_body.appendChild(access_rights_header);
    // #endregion

    // #region Dashboard (View)
    const access_right_1 = document.createElement("div");
    access_right_1.id = "access-right-1";
    access_right_1.className = "flex-row flex-dynamic discord-user-option";
    access_right_1.title = "This operator can visit the 'Dashboard' page.";
    access_right_1.addEventListener(
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
        },
        false
    );

    const access_right_1_description = document.createElement("span");
    access_right_1_description.className = "discord-user-option-description";
    access_right_1_description.innerHTML = "Dashboard (View)";

    const access_right_1_checkbox = document.createElement("div");
    access_right_1_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_1"] === "yes") {
            access_right_1.setAttribute("data-checked", "yes");
            access_right_1_checkbox.style.color = "#00FF00";
            access_right_1_checkbox.style.borderColor = "#00FF00";
            access_right_1_checkbox.innerHTML = "YES";
        }
        else {
            access_right_1.setAttribute("data-checked", "no");
            access_right_1_checkbox.style.color = "#FF0000";
            access_right_1_checkbox.style.borderColor = "#FF0000";
            access_right_1_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_1.setAttribute("data-checked", "yes");
        access_right_1_checkbox.style.color = "#00FF00";
        access_right_1_checkbox.style.borderColor = "#00FF00";
        access_right_1_checkbox.innerHTML = "YES";
    }

    access_right_1.appendChild(access_right_1_description);
    access_right_1.appendChild(access_right_1_checkbox);

    operator_body.appendChild(access_right_1);
    // #endregion

    // #region Payments (View)
    const access_right_2 = document.createElement("div");
    access_right_2.id = "access-right-2";
    access_right_2.className = "flex-row flex-dynamic discord-user-option";
    access_right_2.title = "This operator can visit the 'Payments' page.";
    access_right_2.addEventListener(
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
        },
        false
    );

    const access_right_2_description = document.createElement("span");
    access_right_2_description.className = "discord-user-option-description";
    access_right_2_description.innerHTML = "Payments (View)";

    const access_right_2_checkbox = document.createElement("div");
    access_right_2_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_2"] === "yes") {
            access_right_2.setAttribute("data-checked", "yes");
            access_right_2_checkbox.style.color = "#00FF00";
            access_right_2_checkbox.style.borderColor = "#00FF00";
            access_right_2_checkbox.innerHTML = "YES";
        }
        else {
            access_right_2.setAttribute("data-checked", "no");
            access_right_2_checkbox.style.color = "#FF0000";
            access_right_2_checkbox.style.borderColor = "#FF0000";
            access_right_2_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_2.setAttribute("data-checked", "yes");
        access_right_2_checkbox.style.color = "#00FF00";
        access_right_2_checkbox.style.borderColor = "#00FF00";
        access_right_2_checkbox.innerHTML = "YES";
    }

    access_right_2.appendChild(access_right_2_description);
    access_right_2.appendChild(access_right_2_checkbox);

    operator_body.appendChild(access_right_2);
    // #endregion

    // #region Problems (View)
    const access_right_3 = document.createElement("div");
    access_right_3.id = "access-right-3";
    access_right_3.className = "flex-row flex-dynamic discord-user-option";
    access_right_3.title = "This operator can visit the 'Problems' page.";
    access_right_3.addEventListener(
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
        },
        false
    );

    const access_right_3_description = document.createElement("span");
    access_right_3_description.className = "discord-user-option-description";
    access_right_3_description.innerHTML = "Problems (View)";

    const access_right_3_checkbox = document.createElement("div");
    access_right_3_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_3"] === "yes") {
            access_right_3.setAttribute("data-checked", "yes");
            access_right_3_checkbox.style.color = "#00FF00";
            access_right_3_checkbox.style.borderColor = "#00FF00";
            access_right_3_checkbox.innerHTML = "YES";
        }
        else {
            access_right_3.setAttribute("data-checked", "no");
            access_right_3_checkbox.style.color = "#FF0000";
            access_right_3_checkbox.style.borderColor = "#FF0000";
            access_right_3_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_3.setAttribute("data-checked", "yes");
        access_right_3_checkbox.style.color = "#00FF00";
        access_right_3_checkbox.style.borderColor = "#00FF00";
        access_right_3_checkbox.innerHTML = "YES";
    }

    access_right_3.appendChild(access_right_3_description);
    access_right_3.appendChild(access_right_3_checkbox);

    operator_body.appendChild(access_right_3);
    // #endregion

    // #region Modules (View)
    const access_right_4 = document.createElement("div");
    access_right_4.id = "access-right-4";
    access_right_4.className = "flex-row flex-dynamic discord-user-option";
    access_right_4.title = "This operator can visit the 'Modules' page.";
    access_right_4.addEventListener(
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

                document.getElementById("access-right-5").setAttribute("data-checked", "no");

                document.getElementById("access-right-5").childNodes[1].style.color = "#FF0000";
                document.getElementById("access-right-5").childNodes[1].style.borderColor = "#FF0000";

                document.getElementById("access-right-5").childNodes[1].innerHTML = "NO";
            }
        },
        false
    );

    const access_right_4_description = document.createElement("span");
    access_right_4_description.className = "discord-user-option-description";
    access_right_4_description.innerHTML = "Modules (View)";

    const access_right_4_checkbox = document.createElement("div");
    access_right_4_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_4"] === "yes") {
            access_right_4.setAttribute("data-checked", "yes");
            access_right_4_checkbox.style.color = "#00FF00";
            access_right_4_checkbox.style.borderColor = "#00FF00";
            access_right_4_checkbox.innerHTML = "YES";
        }
        else {
            access_right_4.setAttribute("data-checked", "no");
            access_right_4_checkbox.style.color = "#FF0000";
            access_right_4_checkbox.style.borderColor = "#FF0000";
            access_right_4_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_4.setAttribute("data-checked", "yes");
        access_right_4_checkbox.style.color = "#00FF00";
        access_right_4_checkbox.style.borderColor = "#00FF00";
        access_right_4_checkbox.innerHTML = "YES";
    }

    access_right_4.appendChild(access_right_4_description);
    access_right_4.appendChild(access_right_4_checkbox);

    operator_body.appendChild(access_right_4);
    // #endregion

    // #region Modules (Manage)
    const access_right_5 = document.createElement("div");
    access_right_5.id = "access-right-5";
    access_right_5.className = "flex-row flex-dynamic discord-user-option";
    access_right_5.title = "This operator can install and uninstall modules on the 'Modules' page.";
    access_right_5.addEventListener(
        "click",
        function () {
            if (this.getAttribute("data-checked") === "no") {
                this.setAttribute("data-checked", "yes");

                this.childNodes[1].style.color = "#00FF00";
                this.childNodes[1].style.borderColor = "#00FF00";

                this.childNodes[1].innerHTML = "YES";

                document.getElementById("access-right-4").setAttribute("data-checked", "yes");

                document.getElementById("access-right-4").childNodes[1].style.color = "#00FF00";
                document.getElementById("access-right-4").childNodes[1].style.borderColor = "#00FF00";

                document.getElementById("access-right-4").childNodes[1].innerHTML = "YES";
            }
            else if (this.getAttribute("data-checked") === "yes") {
                this.setAttribute("data-checked", "no");

                this.childNodes[1].style.color = "#FF0000";
                this.childNodes[1].style.borderColor = "#FF0000";

                this.childNodes[1].innerHTML = "NO";
            }
        },
        false
    );

    const access_right_5_description = document.createElement("span");
    access_right_5_description.className = "discord-user-option-description";
    access_right_5_description.innerHTML = "Modules (Manage)";

    const access_right_5_checkbox = document.createElement("div");
    access_right_5_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_5"] === "yes") {
            access_right_5.setAttribute("data-checked", "yes");
            access_right_5_checkbox.style.color = "#00FF00";
            access_right_5_checkbox.style.borderColor = "#00FF00";
            access_right_5_checkbox.innerHTML = "YES";
        }
        else {
            access_right_5.setAttribute("data-checked", "no");
            access_right_5_checkbox.style.color = "#FF0000";
            access_right_5_checkbox.style.borderColor = "#FF0000";
            access_right_5_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_5.setAttribute("data-checked", "yes");
        access_right_5_checkbox.style.color = "#00FF00";
        access_right_5_checkbox.style.borderColor = "#00FF00";
        access_right_5_checkbox.innerHTML = "YES";
    }

    access_right_5.appendChild(access_right_5_description);
    access_right_5.appendChild(access_right_5_checkbox);

    operator_body.appendChild(access_right_5);
    // #endregion

    // #region Operators (View)
    const access_right_6 = document.createElement("div");
    access_right_6.id = "access-right-6";
    access_right_6.className = "flex-row flex-dynamic discord-user-option";
    access_right_6.title = "This operator can visit the 'Operators' page.";
    access_right_6.addEventListener(
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

                document.getElementById("access-right-7").setAttribute("data-checked", "no");

                document.getElementById("access-right-7").childNodes[1].style.color = "#FF0000";
                document.getElementById("access-right-7").childNodes[1].style.borderColor = "#FF0000";

                document.getElementById("access-right-7").childNodes[1].innerHTML = "NO";
            }
        },
        false
    );

    const access_right_6_description = document.createElement("span");
    access_right_6_description.className = "discord-user-option-description";
    access_right_6_description.innerHTML = "Operators (View)";

    const access_right_6_checkbox = document.createElement("div");
    access_right_6_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_6"] === "yes") {
            access_right_6.setAttribute("data-checked", "yes");
            access_right_6_checkbox.style.color = "#00FF00";
            access_right_6_checkbox.style.borderColor = "#00FF00";
            access_right_6_checkbox.innerHTML = "YES";
        }
        else {
            access_right_6.setAttribute("data-checked", "no");
            access_right_6_checkbox.style.color = "#FF0000";
            access_right_6_checkbox.style.borderColor = "#FF0000";
            access_right_6_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_6.setAttribute("data-checked", "yes");
        access_right_6_checkbox.style.color = "#00FF00";
        access_right_6_checkbox.style.borderColor = "#00FF00";
        access_right_6_checkbox.innerHTML = "YES";
    }

    access_right_6.appendChild(access_right_6_description);
    access_right_6.appendChild(access_right_6_checkbox);

    operator_body.appendChild(access_right_6);
    // #endregion

    // #region Operators (Manage)
    const access_right_7 = document.createElement("div");
    access_right_7.id = "access-right-7";
    access_right_7.className = "flex-row flex-dynamic discord-user-option";
    access_right_7.title = "This operator can add, edit and delete operators on the 'Operators' page. Be careful with this!";
    access_right_7.addEventListener(
        "click",
        function () {
            if (this.getAttribute("data-checked") === "no") {
                this.setAttribute("data-checked", "yes");

                this.childNodes[1].style.color = "#00FF00";
                this.childNodes[1].style.borderColor = "#00FF00";

                this.childNodes[1].innerHTML = "YES";

                document.getElementById("access-right-6").setAttribute("data-checked", "yes");

                document.getElementById("access-right-6").childNodes[1].style.color = "#00FF00";
                document.getElementById("access-right-6").childNodes[1].style.borderColor = "#00FF00";

                document.getElementById("access-right-6").childNodes[1].innerHTML = "YES";
            }
            else if (this.getAttribute("data-checked") === "yes") {
                this.setAttribute("data-checked", "no");

                this.childNodes[1].style.color = "#FF0000";
                this.childNodes[1].style.borderColor = "#FF0000";

                this.childNodes[1].innerHTML = "NO";
            }
        },
        false
    );

    const access_right_7_description = document.createElement("span");
    access_right_7_description.className = "discord-user-option-description";
    access_right_7_description.innerHTML = "Operators (Manage)";

    const access_right_7_checkbox = document.createElement("div");
    access_right_7_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_7"] === "yes") {
            access_right_7.setAttribute("data-checked", "yes");
            access_right_7_checkbox.style.color = "#00FF00";
            access_right_7_checkbox.style.borderColor = "#00FF00";
            access_right_7_checkbox.innerHTML = "YES";
        }
        else {
            access_right_7.setAttribute("data-checked", "no");
            access_right_7_checkbox.style.color = "#FF0000";
            access_right_7_checkbox.style.borderColor = "#FF0000";
            access_right_7_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_7.setAttribute("data-checked", "no");
        access_right_7_checkbox.style.color = "#FF0000";
        access_right_7_checkbox.style.borderColor = "#FF0000";
        access_right_7_checkbox.innerHTML = "NO";
    }

    access_right_7.appendChild(access_right_7_description);
    access_right_7.appendChild(access_right_7_checkbox);

    operator_body.appendChild(access_right_7);
    // #endregion

    // #region Keywords (View)
    const access_right_8 = document.createElement("div");
    access_right_8.id = "access-right-8";
    access_right_8.className = "flex-row flex-dynamic discord-user-option";
    access_right_8.title = "This operator can visit the 'Keywords' page.";
    access_right_8.addEventListener(
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

                document.getElementById("access-right-9").setAttribute("data-checked", "no");

                document.getElementById("access-right-9").childNodes[1].style.color = "#FF0000";
                document.getElementById("access-right-9").childNodes[1].style.borderColor = "#FF0000";

                document.getElementById("access-right-9").childNodes[1].innerHTML = "NO";
            }
        },
        false
    );

    const access_right_8_description = document.createElement("span");
    access_right_8_description.className = "discord-user-option-description";
    access_right_8_description.innerHTML = "Keywords (View)";

    const access_right_8_checkbox = document.createElement("div");
    access_right_8_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_8"] === "yes") {
            access_right_8.setAttribute("data-checked", "yes");
            access_right_8_checkbox.style.color = "#00FF00";
            access_right_8_checkbox.style.borderColor = "#00FF00";
            access_right_8_checkbox.innerHTML = "YES";
        }
        else {
            access_right_8.setAttribute("data-checked", "no");
            access_right_8_checkbox.style.color = "#FF0000";
            access_right_8_checkbox.style.borderColor = "#FF0000";
            access_right_8_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_8.setAttribute("data-checked", "yes");
        access_right_8_checkbox.style.color = "#00FF00";
        access_right_8_checkbox.style.borderColor = "#00FF00";
        access_right_8_checkbox.innerHTML = "YES";
    }

    access_right_8.appendChild(access_right_8_description);
    access_right_8.appendChild(access_right_8_checkbox);

    operator_body.appendChild(access_right_8);
    // #endregion

    // #region Keywords (Manage)
    const access_right_9 = document.createElement("div");
    access_right_9.id = "access-right-9";
    access_right_9.className = "flex-row flex-dynamic discord-user-option";
    access_right_9.title = "This operator can add, edit and delete keywords on the 'Keywords' page.";
    access_right_9.addEventListener(
        "click",
        function () {
            if (this.getAttribute("data-checked") === "no") {
                this.setAttribute("data-checked", "yes");

                this.childNodes[1].style.color = "#00FF00";
                this.childNodes[1].style.borderColor = "#00FF00";

                this.childNodes[1].innerHTML = "YES";

                document.getElementById("access-right-8").setAttribute("data-checked", "yes");

                document.getElementById("access-right-8").childNodes[1].style.color = "#00FF00";
                document.getElementById("access-right-8").childNodes[1].style.borderColor = "#00FF00";

                document.getElementById("access-right-8").childNodes[1].innerHTML = "YES";
            }
            else if (this.getAttribute("data-checked") === "yes") {
                this.setAttribute("data-checked", "no");

                this.childNodes[1].style.color = "#FF0000";
                this.childNodes[1].style.borderColor = "#FF0000";

                this.childNodes[1].innerHTML = "NO";
            }
        },
        false
    );

    const access_right_9_description = document.createElement("span");
    access_right_9_description.className = "discord-user-option-description";
    access_right_9_description.innerHTML = "Keywords (Manage)";

    const access_right_9_checkbox = document.createElement("div");
    access_right_9_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_9"] === "yes") {
            access_right_9.setAttribute("data-checked", "yes");
            access_right_9_checkbox.style.color = "#00FF00";
            access_right_9_checkbox.style.borderColor = "#00FF00";
            access_right_9_checkbox.innerHTML = "YES";
        }
        else {
            access_right_9.setAttribute("data-checked", "no");
            access_right_9_checkbox.style.color = "#FF0000";
            access_right_9_checkbox.style.borderColor = "#FF0000";
            access_right_9_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_9.setAttribute("data-checked", "yes");
        access_right_9_checkbox.style.color = "#00FF00";
        access_right_9_checkbox.style.borderColor = "#00FF00";
        access_right_9_checkbox.innerHTML = "YES";
    }

    access_right_9.appendChild(access_right_9_description);
    access_right_9.appendChild(access_right_9_checkbox);

    operator_body.appendChild(access_right_9);
    // #endregion

    // #region Conditions (View)
    const access_right_10 = document.createElement("div");
    access_right_10.id = "access-right-10";
    access_right_10.className = "flex-row flex-dynamic discord-user-option";
    access_right_10.title = "This operator can visit the 'Conditions' page.";
    access_right_10.addEventListener(
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

                document.getElementById("access-right-11").setAttribute("data-checked", "no");

                document.getElementById("access-right-11").childNodes[1].style.color = "#FF0000";
                document.getElementById("access-right-11").childNodes[1].style.borderColor = "#FF0000";

                document.getElementById("access-right-11").childNodes[1].innerHTML = "NO";
            }
        },
        false
    );

    const access_right_10_description = document.createElement("span");
    access_right_10_description.className = "discord-user-option-description";
    access_right_10_description.innerHTML = "Conditions (View)";

    const access_right_10_checkbox = document.createElement("div");
    access_right_10_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_10"] === "yes") {
            access_right_10.setAttribute("data-checked", "yes");
            access_right_10_checkbox.style.color = "#00FF00";
            access_right_10_checkbox.style.borderColor = "#00FF00";
            access_right_10_checkbox.innerHTML = "YES";
        }
        else {
            access_right_10.setAttribute("data-checked", "no");
            access_right_10_checkbox.style.color = "#FF0000";
            access_right_10_checkbox.style.borderColor = "#FF0000";
            access_right_10_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_10.setAttribute("data-checked", "yes");
        access_right_10_checkbox.style.color = "#00FF00";
        access_right_10_checkbox.style.borderColor = "#00FF00";
        access_right_10_checkbox.innerHTML = "YES";
    }

    access_right_10.appendChild(access_right_10_description);
    access_right_10.appendChild(access_right_10_checkbox);

    operator_body.appendChild(access_right_10);
    // #endregion

    // #region Conditions (Manage)
    const access_right_11 = document.createElement("div");
    access_right_11.id = "access-right-11";
    access_right_11.className = "flex-row flex-dynamic discord-user-option";
    access_right_11.title = "This operator can add, edit and delete conditions on the 'Conditions' page. He can not edit or delete conditions that are already used in rules, unless he does have the 'Rules (Manage)' access right.";
    access_right_11.addEventListener(
        "click",
        function () {
            if (this.getAttribute("data-checked") === "no") {
                this.setAttribute("data-checked", "yes");

                this.childNodes[1].style.color = "#00FF00";
                this.childNodes[1].style.borderColor = "#00FF00";

                this.childNodes[1].innerHTML = "YES";

                document.getElementById("access-right-10").setAttribute("data-checked", "yes");

                document.getElementById("access-right-10").childNodes[1].style.color = "#00FF00";
                document.getElementById("access-right-10").childNodes[1].style.borderColor = "#00FF00";

                document.getElementById("access-right-10").childNodes[1].innerHTML = "YES";
            }
            else if (this.getAttribute("data-checked") === "yes") {
                this.setAttribute("data-checked", "no");

                this.childNodes[1].style.color = "#FF0000";
                this.childNodes[1].style.borderColor = "#FF0000";

                this.childNodes[1].innerHTML = "NO";
            }
        },
        false
    );

    const access_right_11_description = document.createElement("span");
    access_right_11_description.className = "discord-user-option-description";
    access_right_11_description.innerHTML = "Conditions (Manage)";

    const access_right_11_checkbox = document.createElement("div");
    access_right_11_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_11"] === "yes") {
            access_right_11.setAttribute("data-checked", "yes");
            access_right_11_checkbox.style.color = "#00FF00";
            access_right_11_checkbox.style.borderColor = "#00FF00";
            access_right_11_checkbox.innerHTML = "YES";
        }
        else {
            access_right_11.setAttribute("data-checked", "no");
            access_right_11_checkbox.style.color = "#FF0000";
            access_right_11_checkbox.style.borderColor = "#FF0000";
            access_right_11_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_11.setAttribute("data-checked", "yes");
        access_right_11_checkbox.style.color = "#00FF00";
        access_right_11_checkbox.style.borderColor = "#00FF00";
        access_right_11_checkbox.innerHTML = "YES";
    }

    access_right_11.appendChild(access_right_11_description);
    access_right_11.appendChild(access_right_11_checkbox);

    operator_body.appendChild(access_right_11);
    // #endregion

    // #region Rules (View)
    const access_right_12 = document.createElement("div");
    access_right_12.id = "access-right-12";
    access_right_12.className = "flex-row flex-dynamic discord-user-option";
    access_right_12.title = "This operator can visit the 'Rules' page.";
    access_right_12.addEventListener(
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

                document.getElementById("access-right-13").setAttribute("data-checked", "no");

                document.getElementById("access-right-13").childNodes[1].style.color = "#FF0000";
                document.getElementById("access-right-13").childNodes[1].style.borderColor = "#FF0000";

                document.getElementById("access-right-13").childNodes[1].innerHTML = "NO";
            }
        },
        false
    );

    const access_right_12_description = document.createElement("span");
    access_right_12_description.className = "discord-user-option-description";
    access_right_12_description.innerHTML = "Rules (View)";

    const access_right_12_checkbox = document.createElement("div");
    access_right_12_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_12"] === "yes") {
            access_right_12.setAttribute("data-checked", "yes");
            access_right_12_checkbox.style.color = "#00FF00";
            access_right_12_checkbox.style.borderColor = "#00FF00";
            access_right_12_checkbox.innerHTML = "YES";
        }
        else {
            access_right_12.setAttribute("data-checked", "no");
            access_right_12_checkbox.style.color = "#FF0000";
            access_right_12_checkbox.style.borderColor = "#FF0000";
            access_right_12_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_12.setAttribute("data-checked", "yes");
        access_right_12_checkbox.style.color = "#00FF00";
        access_right_12_checkbox.style.borderColor = "#00FF00";
        access_right_12_checkbox.innerHTML = "YES";
    }

    access_right_12.appendChild(access_right_12_description);
    access_right_12.appendChild(access_right_12_checkbox);

    operator_body.appendChild(access_right_12);
    // #endregion

    // #region Rules (Manage)
    const access_right_13 = document.createElement("div");
    access_right_13.id = "access-right-13";
    access_right_13.className = "flex-row flex-dynamic discord-user-option";
    access_right_13.title = "This operator can add, edit and delete rules on the 'Rules' page.";
    access_right_13.addEventListener(
        "click",
        function () {
            if (this.getAttribute("data-checked") === "no") {
                this.setAttribute("data-checked", "yes");

                this.childNodes[1].style.color = "#00FF00";
                this.childNodes[1].style.borderColor = "#00FF00";

                this.childNodes[1].innerHTML = "YES";

                document.getElementById("access-right-12").setAttribute("data-checked", "yes");

                document.getElementById("access-right-12").childNodes[1].style.color = "#00FF00";
                document.getElementById("access-right-12").childNodes[1].style.borderColor = "#00FF00";

                document.getElementById("access-right-12").childNodes[1].innerHTML = "YES";
            }
            else if (this.getAttribute("data-checked") === "yes") {
                this.setAttribute("data-checked", "no");

                this.childNodes[1].style.color = "#FF0000";
                this.childNodes[1].style.borderColor = "#FF0000";

                this.childNodes[1].innerHTML = "NO";
            }
        },
        false
    );

    const access_right_13_description = document.createElement("span");
    access_right_13_description.className = "discord-user-option-description";
    access_right_13_description.innerHTML = "Rules (Manage)";

    const access_right_13_checkbox = document.createElement("div");
    access_right_13_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_13"] === "yes") {
            access_right_13.setAttribute("data-checked", "yes");
            access_right_13_checkbox.style.color = "#00FF00";
            access_right_13_checkbox.style.borderColor = "#00FF00";
            access_right_13_checkbox.innerHTML = "YES";
        }
        else {
            access_right_13.setAttribute("data-checked", "no");
            access_right_13_checkbox.style.color = "#FF0000";
            access_right_13_checkbox.style.borderColor = "#FF0000";
            access_right_13_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_13.setAttribute("data-checked", "yes");
        access_right_13_checkbox.style.color = "#00FF00";
        access_right_13_checkbox.style.borderColor = "#00FF00";
        access_right_13_checkbox.innerHTML = "YES";
    }

    access_right_13.appendChild(access_right_13_description);
    access_right_13.appendChild(access_right_13_checkbox);

    operator_body.appendChild(access_right_13);
    // #endregion

    // #region Bot Control (View)
    const access_right_14 = document.createElement("div");
    access_right_14.id = "access-right-14";
    access_right_14.className = "flex-row flex-dynamic discord-user-option";
    access_right_14.title = "This operator can visit the 'Bot Control' page.";
    access_right_14.addEventListener(
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

                document.getElementById("access-right-15").setAttribute("data-checked", "no");

                document.getElementById("access-right-15").childNodes[1].style.color = "#FF0000";
                document.getElementById("access-right-15").childNodes[1].style.borderColor = "#FF0000";
          
                document.getElementById("access-right-15").childNodes[1].innerHTML = "NO";
            }
        },
        false
    );

    const access_right_14_description = document.createElement("span");
    access_right_14_description.className = "discord-user-option-description";
    access_right_14_description.innerHTML = "Bot Control (View)";

    const access_right_14_checkbox = document.createElement("div");
    access_right_14_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_14"] === "yes") {
            access_right_14.setAttribute("data-checked", "yes");
            access_right_14_checkbox.style.color = "#00FF00";
            access_right_14_checkbox.style.borderColor = "#00FF00";
            access_right_14_checkbox.innerHTML = "YES";
        }
        else {
            access_right_14.setAttribute("data-checked", "no");
            access_right_14_checkbox.style.color = "#FF0000";
            access_right_14_checkbox.style.borderColor = "#FF0000";
            access_right_14_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_14.setAttribute("data-checked", "yes");
        access_right_14_checkbox.style.color = "#00FF00";
        access_right_14_checkbox.style.borderColor = "#00FF00";
        access_right_14_checkbox.innerHTML = "YES";
    }

    access_right_14.appendChild(access_right_14_description);
    access_right_14.appendChild(access_right_14_checkbox);

    operator_body.appendChild(access_right_14);
    // #endregion

    // #region Bot Control (Manage)
    const access_right_15 = document.createElement("div");
    access_right_15.id = "access-right-15";
    access_right_15.className = "flex-row flex-dynamic discord-user-option";
    access_right_15.title = "This operator can use the bot controls on the 'Bot Control' page.";
    access_right_15.addEventListener(
        "click",
        function () {
            if (this.getAttribute("data-checked") === "no") {
                this.setAttribute("data-checked", "yes");

                this.childNodes[1].style.color = "#00FF00";
                this.childNodes[1].style.borderColor = "#00FF00";

                this.childNodes[1].innerHTML = "YES";

                document.getElementById("access-right-14").setAttribute("data-checked", "yes");

                document.getElementById("access-right-14").childNodes[1].style.color = "#00FF00";
                document.getElementById("access-right-14").childNodes[1].style.borderColor = "#00FF00";

                document.getElementById("access-right-14").childNodes[1].innerHTML = "YES";
            }
            else if (this.getAttribute("data-checked") === "yes") {
                this.setAttribute("data-checked", "no");

                this.childNodes[1].style.color = "#FF0000";
                this.childNodes[1].style.borderColor = "#FF0000";

                this.childNodes[1].innerHTML = "NO";
            }
        },
        false
    );

    const access_right_15_description = document.createElement("span");
    access_right_15_description.className = "discord-user-option-description";
    access_right_15_description.innerHTML = "Bot Control (Manage)";

    const access_right_15_checkbox = document.createElement("div");
    access_right_15_checkbox.className = "discord-user-option-checkbox";

    if (details) {
        if (details["access_right_15"] === "yes") {
            access_right_15.setAttribute("data-checked", "yes");
            access_right_15_checkbox.style.color = "#00FF00";
            access_right_15_checkbox.style.borderColor = "#00FF00";
            access_right_15_checkbox.innerHTML = "YES";
        }
        else {
            access_right_15.setAttribute("data-checked", "no");
            access_right_15_checkbox.style.color = "#FF0000";
            access_right_15_checkbox.style.borderColor = "#FF0000";
            access_right_15_checkbox.innerHTML = "NO";
        }
    }
    else {
        access_right_15.setAttribute("data-checked", "yes");
        access_right_15_checkbox.style.color = "#00FF00";
        access_right_15_checkbox.style.borderColor = "#00FF00";
        access_right_15_checkbox.innerHTML = "YES";
    }

    access_right_15.appendChild(access_right_15_description);
    access_right_15.appendChild(access_right_15_checkbox);

    operator_body.appendChild(access_right_15);
    // #endregion

    operator_body.style.display = null;
}

function close_discord_user_dialog() {
    const discord_user_dialog = document.getElementById("discord-user-selection").parentNode;
    discord_user_dialog.parentNode.removeChild(discord_user_dialog);
};

function selected_discord_user(discord_user_wrapper, discord_user_element) {
    const discord_user_id = discord_user_element.getAttribute("data-id");
    const discord_user_header = discord_user_element.getElementsByClassName("discord-user-header")[0].innerHTML;
    const discord_user_description = discord_user_element.getElementsByClassName("discord-user-description")[0].innerHTML;

    discord_user_wrapper.setAttribute("data-id", discord_user_id);
    discord_user_wrapper.getElementsByClassName("discord-user-header")[0].innerHTML = discord_user_header;
    discord_user_wrapper.getElementsByClassName("discord-user-description")[0].innerHTML = discord_user_description;

    discord_user_wrapper.style.borderColor = "#00FF00";

    load_discord_user_details();
};

async function show_discord_user_dialog(event) {
    event.stopPropagation();

    if (document.getElementById("discord-user-selection")) {
        return;
    }
    
    const discord_user_wrapper = this.parentNode.parentNode;

    const x_coord = discord_user_wrapper.offsetLeft + 10;
    const y_coord = discord_user_wrapper.offsetTop + 10;

    const dialog_width = discord_user_wrapper.offsetWidth - 20;

    const discord_user_dialog = document.createElement("div");
    discord_user_dialog.style.position = "absolute";
    discord_user_dialog.style.top = y_coord + "px";
    discord_user_dialog.style.left = x_coord + "px";
    discord_user_dialog.style.width = dialog_width + "px";
    discord_user_dialog.style.maxHeight = "500px";
    discord_user_dialog.style.overflow = "auto";

    const discord_user_area = document.createElement("div");
    discord_user_area.id = "discord-user-selection";
    discord_user_area.className = "flex-column flex-dynamic area with-border";
    discord_user_area.style.marginBottom = "10px";
    discord_user_area.style.background = "#555555";

    const discord_user_keys = Object.keys(discord_users);

    for (let i = 0; i < discord_user_keys.length; i++) {
        const discord_user_id = discord_user_keys[i];
        const data_row = discord_users[discord_user_id];

        const discord_user_selection = document.createElement("div");
        discord_user_selection.className = "flex-column flex-static area with-border";
        discord_user_selection.setAttribute("data-id", discord_user_id);
        discord_user_selection.style.marginBottom = "5px";
        discord_user_selection.style.background = "#222222";
        discord_user_selection.style.cursor = "pointer";
        discord_user_selection.addEventListener(
            "click",
            function () {
                selected_discord_user(discord_user_wrapper, this);

                close_discord_user_dialog();
            },
            false
        );

        const discord_user_header = document.createElement("div");
        discord_user_header.className = "discord-user-header";
        discord_user_header.innerHTML = data_row["display_name"];

        const discord_user_operation_area = document.createElement("div");
        discord_user_operation_area.className = "flex-row flex-dynamic area";
        discord_user_operation_area.style.background = "#222222";

        const discord_user_description = document.createElement("div");
        discord_user_description.className = "discord-user-description area";
        discord_user_description.innerHTML = "Joined on " + new Date(data_row["joined_at"]).toLocaleDateString() + " with username " + data_row["user_name"] + ".";

        discord_user_selection.appendChild(discord_user_header);

        discord_user_selection.appendChild(discord_user_description);

        discord_user_area.appendChild(discord_user_selection);
    }

    discord_user_dialog.appendChild(discord_user_area);
    document.body.appendChild(discord_user_dialog);
};

async function initialize_operator(data) {
    discord_users = data["discord_users"];

    if (get_url_parameter("id") === "new") {
        return;
    }

    const operator = data["operator"];

    const discord_user_header = operator["display_name"];
    const discord_user_information = operator["information"];
    const details = operator["details"];

    const discord_user_wrapper = document.getElementById("operator-discord-user");
    discord_user_wrapper.setAttribute("data-id", get_url_parameter("id"));
    discord_user_wrapper.getElementsByClassName("discord-user-header")[0].innerHTML = discord_user_header;
    discord_user_wrapper.getElementsByClassName("discord-user-description")[0].innerHTML = discord_user_information;

    discord_user_wrapper.style.borderColor = "#00FF00";

    if (operator["note"] !== "No note.") {
        document.getElementById("operator-description").getElementsByTagName("textarea")[0].value = operator["note"];
    }

    load_discord_user_details(details);
};

function initialize_operator_area() {
    /* Wrapper */
    const operator_area = document.getElementById("operator-area");
    
    /* Discord User Selection */
    const discord_user_selection = document.createElement("div");
    discord_user_selection.id = "operator-discord-user";
    discord_user_selection.className = "flex-column flex-static area with-border";
    discord_user_selection.style.marginBottom = "10px";
    discord_user_selection.style.background = "#222222";
    discord_user_selection.style.borderColor = "#FF0000";

    const discord_user_header = document.createElement("div");
    discord_user_header.className = "discord-user-header";

    const discord_user_operation_area = document.createElement("div");
    discord_user_operation_area.className = "flex-row flex-dynamic area";
    discord_user_operation_area.style.background = "#222222";

    const discord_user_description = document.createElement("span");
    discord_user_description.className = "discord-user-description";

    const discord_user_select = document.createElement("button");
    discord_user_select.setAttribute("edit", true);
    discord_user_select.style.marginLeft = "auto";
    discord_user_select.style.marginTop = "auto";
    discord_user_select.style.marginBottom = "auto";
    discord_user_select.style.whiteSpace = "nowrap";
    discord_user_select.innerHTML = "Select Discord User";
    discord_user_select.addEventListener("click", show_discord_user_dialog, false);

    discord_user_selection.appendChild(discord_user_header);

    discord_user_operation_area.appendChild(discord_user_description);
    discord_user_operation_area.appendChild(discord_user_select);
    discord_user_selection.appendChild(discord_user_operation_area);

    /* Discord User Details */
    const operator_body = document.createElement("div");
    operator_body.id = "operator-discord-user-details";
    operator_body.className = "flex-row flex-static operator-body with-border";
    operator_body.style.borderColor = "#FFFFFF";
    operator_body.style.display = "none";
    
    operator_area.appendChild(discord_user_selection);
    operator_area.appendChild(operator_body);

    get_data();
};

function validate_operator() {
    let valid = true;
    
    const operator_discord_user = document.getElementById("operator-discord-user");
    
    if (!operator_discord_user.hasAttribute("data-id")) {
        valid = false;

        operator_discord_user.scrollIntoView({ behavior: "smooth" });

        alert("Please select a discord user.");
    }
    
    return valid;
};

function save_operator() {
    if (!validate_operator()) {
        return;
    }
    
    const operator_discord_user = document.getElementById("operator-discord-user").getAttribute("data-id");
    const operator_display_name = document.getElementById("operator-discord-user").childNodes[0].innerHTML;
    const operator_information = document.getElementById("operator-discord-user").childNodes[1].childNodes[0].innerHTML;

    let operator_discord_user_details = undefined;

    operator_discord_user_details = {
        "access_right_1": document.getElementById("access-right-1").getAttribute("data-checked"),
        "access_right_2": document.getElementById("access-right-2").getAttribute("data-checked"),
        "access_right_3": document.getElementById("access-right-3").getAttribute("data-checked"),
        "access_right_4": document.getElementById("access-right-4").getAttribute("data-checked"),
        "access_right_5": document.getElementById("access-right-5").getAttribute("data-checked"),
        "access_right_6": document.getElementById("access-right-6").getAttribute("data-checked"),
        "access_right_7": document.getElementById("access-right-7").getAttribute("data-checked"),
        "access_right_8": document.getElementById("access-right-8").getAttribute("data-checked"),
        "access_right_9": document.getElementById("access-right-9").getAttribute("data-checked"),
        "access_right_10": document.getElementById("access-right-10").getAttribute("data-checked"),
        "access_right_11": document.getElementById("access-right-11").getAttribute("data-checked"),
        "access_right_12": document.getElementById("access-right-12").getAttribute("data-checked"),
        "access_right_13": document.getElementById("access-right-13").getAttribute("data-checked"),
        "access_right_14": document.getElementById("access-right-14").getAttribute("data-checked"),
        "access_right_15": document.getElementById("access-right-15").getAttribute("data-checked")
    };

    const operator_description = document.getElementById("operator-description").getElementsByTagName("textarea")[0].value;

    post_data({
        "operator": operator_discord_user,
        "display_name": operator_display_name,
        "information": operator_information,
        "details": operator_discord_user_details,
        "note": operator_description,
    });
};

function get_url_parameter(key) {
    key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var results = regex.exec(location.search);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

function get_data() {
    socket.emit(
        "config_operator",
        {
            "method": "get",
            "data_id": get_url_parameter("id")
        }
    );
}

function post_data(data) {
    socket.emit(
        "config_operator",
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
        initialize_operator(data);
    });

    socket.on("data_posted", function () {
        window.location = "/module/default/html/config/operators.html";
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
    initialize_operator_area();
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