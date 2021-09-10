"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;

let endpoints = undefined;
//#endregion

async function initialize_keyword(data) {
    endpoints = data["endpoints"];
    
    initialize_toolbox();

    if (get_url_parameter("id") === "new") {
        return;
    }

    const keyword = data["keyword"];

    const keyword_header = document.getElementById("keyword-header");
    keyword_header.value = keyword["keyword"];

    if (keyword["description"] !== "No description.") {
        document.getElementById("keyword-description").getElementsByTagName("textarea")[0].value = keyword["description"];
    }

    const select_endpoint_wrapper = document.getElementById("select-endpoint-wrapper");
    select_endpoint(select_endpoint_wrapper, keyword["endpoint"]);
};

function show_or_hide_toolbox_group() {
    const status = this.getAttribute("status");
    const target_name = this.getAttribute("target");
    const target = document.querySelectorAll("[data-id=" + target_name + "]")[0];

    if (status === "expanded") {
        this.setAttribute("status", "collapsed");
        target.style.display = "none";
    }
    else if (status === "collapsed") {
        this.setAttribute("status", "expanded");
        target.style.display = "";
    }
};

function generate_endpoint_string() {
    const endpoint_body = document.getElementById("select-endpoint-wrapper").childNodes[0];

    let endpoint_string = "";

    const parsing_type = endpoint_body.childNodes[0].childNodes[1].getAttribute("parsing-type");

    if (Number(parsing_type) === 1) {
        const endpoint = "[" + endpoint_body.childNodes[0].childNodes[1].getAttribute("data-id") + "]";
        
        endpoint_string += "[" + parsing_type + "]";
        endpoint_string += endpoint;
    }
    else if (Number(parsing_type) === 2) {
        const endpoint = "[" + endpoint_body.childNodes[0].childNodes[1].getAttribute("data-id") + "]";
        const direction = "[" + endpoint_body.childNodes[1].childNodes[1].innerHTML + "]";
        const entity_type = "[" + endpoint_body.childNodes[2].childNodes[1].innerHTML + "]";
        const entity_data_type = endpoint_body.childNodes[3].childNodes[1].childNodes[0].getAttribute("data-type");
        let entity = "[" + endpoint_body.childNodes[3].childNodes[1].childNodes[1].value + "]";

        if (entity_data_type === "number") {
            entity = entity.replace(",", ".");
        }
        
        endpoint_string += "[" + parsing_type + "]";
        endpoint_string += endpoint;
        endpoint_string += direction;
        endpoint_string += entity_type;
        endpoint_string += entity;
    }
    else if (Number(parsing_type) === 3) {
        const endpoint = "[" + endpoint_body.childNodes[0].childNodes[1].getAttribute("data-id") + "]";
        const indicator = "[" + endpoint_body.childNodes[1].childNodes[1].innerHTML + "]";
        const target = "[" + endpoint_body.childNodes[2].childNodes[1].childNodes[1].value + "]";
        
        endpoint_string += "[" + parsing_type + "]";
        endpoint_string += endpoint;
        endpoint_string += indicator;
        endpoint_string += target;
    }

    return endpoint_string;
};

function validate_keyword() {
    let valid = true;
    
    const keyword_header = document.getElementById("keyword-header");
    const keyword_body = document.getElementById("select-endpoint-wrapper");

    if (keyword_body.childNodes.length !== 2) {
        valid = false;

        alert("Select an Endpoint the keyword should resolve to.");
    }

    if (!valid) {
        return valid;
    }

    if (!keyword_header.validity.valid || keyword_header.value.trim().length === 0) {
        keyword_header.style.border = "solid 3px #FF0000";

        valid = false;
    }
    else {
        keyword_header.style.border = "1px solid #FFFFFF";
    }

    Array.prototype.forEach.call(keyword_body.getElementsByTagName("input"), function (value_field) {
        if (!value_field.validity.valid) {
            value_field.style.border = "solid 3px #FF0000";

            valid = false;
        }
        else {
            value_field.style.border = "0";
        }
    });

    Array.prototype.forEach.call(keyword_body.getElementsByTagName("select"), function (value_field) {
        if (!value_field.validity.valid) {
            value_field.style.border = "solid 3px #FF0000";

            valid = false;
        }
        else {
            value_field.style.border = "0";
        }
    });

    if (!valid) {
        return valid;
    }

    return valid;
};

function get_keyword_title() {
    const keyword_header = document.getElementById("keyword-header");

    return keyword_header.value;
};

function get_keyword_description() {
    const keyword_description = document.getElementById("keyword-description").getElementsByTagName("textarea")[0];

    return keyword_description.value;
};

function save_keyword() {
    if (!validate_keyword()) {
        return;
    }

    const keyword = get_keyword_title();
    const description = get_keyword_description();
    const endpoint = generate_endpoint_string();

    post_data({
        "id": get_url_parameter("id"),
        "keyword": keyword,
        "description": description,
        "endpoint": endpoint
    });
};

function close_direction_dialog() {
    const direction_dialog = document.getElementById("direction-selection").parentNode;
    direction_dialog.parentNode.removeChild(direction_dialog);
};

function close_entity_type_dialog() {
    const entity_type_dialog = document.getElementById("entity-type-selection").parentNode;
    entity_type_dialog.parentNode.removeChild(entity_type_dialog);
};

function selected_direction(direction, direction_element) {
    const clone = direction_element.cloneNode(true);
    clone.style.marginTop = "15px";
    clone.style.marginRight = "5px";
    clone.style.marginBottom = "0px";
    clone.addEventListener("click", show_direction_dialog, false);

    direction.parentNode.insertBefore(clone, direction);
    direction.parentNode.removeChild(direction);
};

function selected_entity_type(entity_type, entity_type_element) {
    const clone = entity_type_element.cloneNode(true);
    clone.style.marginTop = "15px";
    clone.style.marginRight = "5px";
    clone.style.marginBottom = "0px";
    clone.addEventListener("click", show_entity_type_dialog, false);

    entity_type.parentNode.insertBefore(clone, entity_type);
    entity_type.parentNode.removeChild(entity_type);

    if (clone.childNodes[1].innerHTML === "ALLIANCE") {
        clone.parentNode.childNodes[3].childNodes[0].childNodes[0].innerHTML = "Alliance";
        clone.parentNode.childNodes[3].childNodes[1].setAttribute("endpoint-type", "alliance");
    }
    else if (clone.childNodes[1].innerHTML === "CORPORATION") {
        clone.parentNode.childNodes[3].childNodes[0].childNodes[0].innerHTML = "Corporation";
        clone.parentNode.childNodes[3].childNodes[1].setAttribute("endpoint-type", "corporation");
    }
    else if (clone.childNodes[1].innerHTML === "CHARACTER") {
        clone.parentNode.childNodes[3].childNodes[0].childNodes[0].innerHTML = "Character";
        clone.parentNode.childNodes[3].childNodes[1].setAttribute("endpoint-type", "character");
    }
};

function show_direction_dialog(event) {
    event.stopPropagation();

    if (document.getElementById("direction-selection") || document.getElementById("entity-type-selection")) {
        return;
    }

    const old_direction = this;

    const x_coord = event.pageX;
    const y_coord = event.pageY;

    const direction = document.createElement("div");
    direction.className = "with-border";
    direction.style.position = "absolute";
    direction.style.top = y_coord + "px";
    direction.style.left = x_coord + "px";
    direction.style.maxHeight = "500px";

    const direction_selection = document.getElementById("toolbox").cloneNode(false);
    direction_selection.id = "direction-selection";
    direction_selection.style.display = "";

    const direction_selection_wrapper = document.createElement("div");
    direction_selection_wrapper.className = "flex-column flex-static";

    /* TOWARDS */
    const direction_towards = document.createElement("div");
    direction_towards.className = "flex-row flex-static toolbox-element";
    direction_towards.title = "This entities status towards another entity.";
    direction_towards.setAttribute("data-id", "te-directions-towards");
    direction_towards.setAttribute("endpoint-type", "direction");
    direction_towards.style.marginBottom = "3px";

    const direction_towards_symbol = document.createElement("span");
    direction_towards_symbol.className = "data-type";
    direction_towards_symbol.setAttribute("data-type", "direction");
    direction_towards_symbol.innerHTML = "->";

    const direction_towards_text = document.createElement("span");
    direction_towards_text.className = "element-name";
    direction_towards_text.innerHTML = "TOWARDS";

    direction_towards.appendChild(direction_towards_symbol);
    direction_towards.appendChild(direction_towards_text);
    direction_selection_wrapper.appendChild(direction_towards);

    /* FROM */
    const direction_from = document.createElement("div");
    direction_from.className = "flex-row flex-static toolbox-element";
    direction_from.title = "This entities status towards another entity.";
    direction_from.setAttribute("data-id", "te-directions-from");
    direction_from.setAttribute("endpoint-type", "direction");
    direction_from.style.marginBottom = "3px";

    const direction_from_symbol = document.createElement("span");
    direction_from_symbol.className = "data-type";
    direction_from_symbol.setAttribute("data-type", "direction");
    direction_from_symbol.innerHTML = "<-";

    const direction_from_text = document.createElement("span");
    direction_from_text.className = "element-name";
    direction_from_text.innerHTML = "FROM";

    direction_from.appendChild(direction_from_symbol);
    direction_from.appendChild(direction_from_text);
    direction_selection_wrapper.appendChild(direction_from);

    direction_selection.appendChild(direction_selection_wrapper);

    /* Add click event to select a direction. */
    Array.prototype.forEach.call(direction_selection.getElementsByClassName("toolbox-element"), function (element) {
        element.addEventListener(
            "click",
            function () {
                selected_direction(old_direction, this);

                close_direction_dialog();
            },
            false
        );
    });

    direction.appendChild(direction_selection);
    document.body.appendChild(direction);
};

function show_entity_type_dialog(event) {
    event.stopPropagation();

    if (document.getElementById("direction-selection") || document.getElementById("entity-type-selection")) {
        return;
    }

    const old_entity_type = this;

    const x_coord = event.pageX;
    const y_coord = event.pageY;

    const entity_type = document.createElement("div");
    entity_type.className = "with-border";
    entity_type.style.position = "absolute";
    entity_type.style.top = y_coord + "px";
    entity_type.style.left = x_coord + "px";
    entity_type.style.maxHeight = "500px";

    const entity_type_selection = document.getElementById("toolbox").cloneNode(false);
    entity_type_selection.id = "entity-type-selection";
    entity_type_selection.style.display = "";

    const entity_type_selection_wrapper = document.createElement("div");
    entity_type_selection_wrapper.className = "flex-column flex-static";

    /* ALLIANCE */
    const entity_type_alliance = document.createElement("div");
    entity_type_alliance.className = "flex-row flex-static toolbox-element";
    entity_type_alliance.title = "The status request refers to an alliance.";
    entity_type_alliance.setAttribute("data-id", "te-entity-types-alliance");
    entity_type_alliance.setAttribute("endpoint-type", "entity");
    entity_type_alliance.style.marginBottom = "3px";

    const entity_type_alliance_symbol = document.createElement("span");
    entity_type_alliance_symbol.className = "data-type";
    entity_type_alliance_symbol.setAttribute("data-type", "entity");
    entity_type_alliance_symbol.innerHTML = "Al";

    const entity_type_alliance_text = document.createElement("span");
    entity_type_alliance_text.className = "element-name";
    entity_type_alliance_text.innerHTML = "ALLIANCE";

    entity_type_alliance.appendChild(entity_type_alliance_symbol);
    entity_type_alliance.appendChild(entity_type_alliance_text);
    entity_type_selection_wrapper.appendChild(entity_type_alliance);

    /* CORPORATION */
    const entity_type_corporation = document.createElement("div");
    entity_type_corporation.className = "flex-row flex-static toolbox-element";
    entity_type_corporation.title = "The status request refers to a corporation.";
    entity_type_corporation.setAttribute("data-id", "te-entity-types-corporation");
    entity_type_corporation.setAttribute("endpoint-type", "entity");
    entity_type_corporation.style.marginBottom = "3px";

    const entity_type_corporation_symbol = document.createElement("span");
    entity_type_corporation_symbol.className = "data-type";
    entity_type_corporation_symbol.setAttribute("data-type", "entity");
    entity_type_corporation_symbol.innerHTML = "Co";

    const entity_type_corporation_text = document.createElement("span");
    entity_type_corporation_text.className = "element-name";
    entity_type_corporation_text.innerHTML = "CORPORATION";

    entity_type_corporation.appendChild(entity_type_corporation_symbol);
    entity_type_corporation.appendChild(entity_type_corporation_text);
    entity_type_selection_wrapper.appendChild(entity_type_corporation);

    const is_ticker = this.parentNode.childNodes[0].childNodes[1].getAttribute("data-id").endsWith("-ticker");

    if (!is_ticker) {
        /* CHARACTER */
        const entity_type_character = document.createElement("div");
        entity_type_character.className = "flex-row flex-static toolbox-element";
        entity_type_character.title = "The status request refers to a character.";
        entity_type_character.setAttribute("data-id", "te-entity-types-character");
        entity_type_character.setAttribute("endpoint-type", "entity");
        entity_type_character.style.marginBottom = "3px";

        const entity_type_character_symbol = document.createElement("span");
        entity_type_character_symbol.className = "data-type";
        entity_type_character_symbol.setAttribute("data-type", "entity");
        entity_type_character_symbol.innerHTML = "Ch";

        const entity_type_character_text = document.createElement("span");
        entity_type_character_text.className = "element-name";
        entity_type_character_text.innerHTML = "CHARACTER";

        entity_type_character.appendChild(entity_type_character_symbol);
        entity_type_character.appendChild(entity_type_character_text);
        entity_type_selection_wrapper.appendChild(entity_type_character);
    }

    entity_type_selection.appendChild(entity_type_selection_wrapper);

    /* Add click event to select a entity type. */
    Array.prototype.forEach.call(entity_type_selection.getElementsByClassName("toolbox-element"), function (element) {
        element.addEventListener(
            "click",
            function () {
                selected_entity_type(old_entity_type, this);

                close_entity_type_dialog();
            },
            false
        );
    });

    entity_type.appendChild(entity_type_selection);
    document.body.appendChild(entity_type);
};

function select_endpoint(select_endpoint_wrapper, endpoint_string) {
    select_endpoint_wrapper.style.borderColor = "#00FF00";
    
    /* Endpoint Wrapper */
    const endpoint_wrapper = document.createElement("div");
    endpoint_wrapper.className = "flex-row flex-static area";
    endpoint_wrapper.style.background = "#555555";
    endpoint_wrapper.style.border = "2px solid #000000";
    endpoint_wrapper.style.minWidth = "250px";

    select_endpoint_wrapper.insertBefore(endpoint_wrapper, select_endpoint_wrapper.firstChild);

    if (endpoint_string.startsWith("[")) {
        let parsing = false;
        let parsed = false;
        let parsing_step = "parsing_type";
        let nesting = 0;
        let condition_element = "";

        let parsing_type = 0;

        let clone = undefined;

        /* For parsing_type = 2 */
        let p_entity_type = undefined;

        /* For parsing_type = 2, 3 */
        let p_base_endpoint = undefined;

        /* Load Condition. */
        for (let i = 0; i < endpoint_string.length; i++) {
            const char = endpoint_string.charAt(i);

            if (parsing) {
                if (char === "[") {
                    nesting++;
                }
                else if (char === "]") {
                    nesting--;
                }

                if (nesting === 0) {
                    parsing = false;
                    parsed = true;
                }
                else {
                    condition_element += char;

                    continue;
                }
            }

            if (parsed) {
                if (parsing_step === "parsing_type") {
                    parsing_type = Number(condition_element);

                    parsing_step = "endpoint";
                }
                else if (parsing_step === "endpoint") {
                    p_base_endpoint = condition_element;

                    /* Endpoint */
                    const header = document.createElement("span");
                    header.style.marginBottom = "3px";
                    header.style.fontSize = "12px";
                    header.style.fontWeight = "normal";
                    header.style.color = "#FFFFFF";
                    header.innerHTML = endpoints[condition_element]["group"];

                    const endpoint = document.createElement("div");
                    endpoint.className = "flex-column flex-dynamic";
                    endpoint.style.marginRight = "5px";

                    clone = document.querySelectorAll("[data-id=" + condition_element + "]")[0].cloneNode(true);

                    if (parsing_type === 2 && !condition_element.endsWith("-has_standing")) {
                        clone.getElementsByClassName("element-name")[0].innerHTML = "Standing";
                    }

                    endpoint.appendChild(header);
                    endpoint.appendChild(clone);
                    endpoint_wrapper.appendChild(endpoint);

                    if (parsing_type === 1) {
                        parsing_step = "parsing_type";
                    }
                    else if (parsing_type === 2) {
                        parsing_step = "direction";
                    }
                    else if (parsing_type === 3) {
                        parsing_step = "indicator";
                    }
                }
                else if (parsing_step === "indicator") {
                    /* Indicator */
                    const indicator = document.createElement("div");
                    indicator.className = "flex-row flex-static toolbox-element";
                    indicator.setAttribute("endpoint-type", "indicator");
                    indicator.style.marginTop = "15px";
                    indicator.style.marginRight = "5px";

                    const indicator_symbol = document.createElement("span");
                    indicator_symbol.className = "data-type";
                    indicator_symbol.setAttribute("data-type", "indicator");

                    if (condition_element === "OF") {
                        indicator_symbol.innerHTML = "?";
                    }

                    const indicator_text = document.createElement("span");
                    indicator_text.className = "element-name";
                    indicator_text.innerHTML = condition_element;

                    indicator.appendChild(indicator_symbol);
                    indicator.appendChild(indicator_text);
                    endpoint_wrapper.appendChild(indicator);

                    parsing_step = "target";
                }
                else if (parsing_step === "target") {
                    /* Entity and Header */
                    const wrapper_target = document.createElement("div");
                    wrapper_target.className = "flex-column flex-static";
                    wrapper_target.style.marginRight = "5px";

                    /* Header */
                    const header_target_wrapper = document.createElement("div");
                    header_target_wrapper.className = "flex-row flex-static";

                    const target_header = document.createElement("span");
                    target_header.style.marginLeft = "2px";
                    target_header.style.marginRight = "auto";
                    target_header.style.fontSize = "12px";
                    target_header.style.fontWeight = "normal";
                    target_header.style.color = "#FFFFFF";

                    if (p_base_endpoint.includes("-faction-")) {
                        target_header.innerHTML = "Faction";
                    }
                    else if (p_base_endpoint.includes("-alliance-")) {
                        target_header.innerHTML = "Alliance";
                    }
                    else if (p_base_endpoint.includes("-corporation-")) {
                        target_header.innerHTML = "Corporation";
                    }
                    else if (p_base_endpoint.includes("-character-")) {
                        target_header.innerHTML = "Character";
                    }

                    header_target_wrapper.appendChild(target_header);

                    /* Entity */
                    const target = document.createElement("div");
                    target.className = "flex-row flex-static toolbox-element";
                    target.style.marginTop = "3px";

                    if (p_base_endpoint.includes("-faction-")) {
                        target.setAttribute("endpoint-type", "faction");
                    }
                    else if (p_base_endpoint.includes("-alliance-")) {
                        target.setAttribute("endpoint-type", "alliance");
                    }
                    else if (p_base_endpoint.includes("-corporation-")) {
                        target.setAttribute("endpoint-type", "corporation");
                    }
                    else if (p_base_endpoint.includes("-character-")) {
                        target.setAttribute("endpoint-type", "character");
                    }

                    const target_symbol = document.createElement("span");
                    target_symbol.className = "data-type";
                    target_symbol.setAttribute("data-type", "string");
                    target_symbol.innerHTML = "S";

                    const target_input = document.createElement("input");
                    target_input.type = "text";
                    target_input.placeholder = "Name";
                    target_input.required = true;
                    target_input.value = condition_element;
                    target_input.style.height = "20px";
                    target_input.style.width = "100%";
                    target_input.style.marginTop = "-2px";
                    target_input.style.marginLeft = "3px";
                    target_input.style.paddingLeft = "5px";
                    target_input.style.fontSize = "14px";
                    target_input.style.fontWeight = "bold";

                    target.appendChild(target_symbol);
                    target.appendChild(target_input);

                    wrapper_target.appendChild(header_target_wrapper);
                    wrapper_target.appendChild(target);

                    endpoint_wrapper.appendChild(wrapper_target);

                    parsing_step = "parsing_type";
                }
                else if (parsing_step === "direction") {
                    /* Direction */
                    const direction = document.createElement("div");
                    direction.className = "flex-row flex-static toolbox-element";
                    direction.setAttribute("endpoint-type", "direction");
                    direction.style.marginTop = "15px";
                    direction.style.marginRight = "5px";
                    direction.addEventListener("click", show_direction_dialog, false);

                    const direction_symbol = document.createElement("span");
                    direction_symbol.className = "data-type";
                    direction_symbol.setAttribute("data-type", "direction");

                    if (condition_element === "TOWARDS") {
                        direction_symbol.innerHTML = "->";
                    }
                    else if (condition_element === "FROM") {
                        direction_symbol.innerHTML = "<-";
                    }

                    const direction_text = document.createElement("span");
                    direction_text.className = "element-name";
                    direction_text.innerHTML = condition_element;

                    direction.appendChild(direction_symbol);
                    direction.appendChild(direction_text);
                    endpoint_wrapper.appendChild(direction);

                    parsing_step = "entity_type";
                }
                else if (parsing_step === "entity_type") {
                    p_entity_type = condition_element;

                    /* Entity Type */
                    const entity_type = document.createElement("div");
                    entity_type.className = "flex-row flex-static toolbox-element";
                    entity_type.setAttribute("endpoint-type", "entity");
                    entity_type.style.marginTop = "15px";
                    entity_type.style.marginRight = "5px";
                    entity_type.addEventListener("click", show_entity_type_dialog, false);

                    const entity_type_symbol = document.createElement("span");
                    entity_type_symbol.className = "data-type";
                    entity_type_symbol.setAttribute("data-type", "entity");

                    if (condition_element === "ALLIANCE") {
                        entity_type_symbol.innerHTML = "Al";
                    }
                    else if (condition_element === "CORPORATION") {
                        entity_type_symbol.innerHTML = "Co";
                    }
                    else if (condition_element === "CHARACTER") {
                        entity_type_symbol.innerHTML = "Ch";
                    }

                    const entity_type_text = document.createElement("span");
                    entity_type_text.className = "element-name";
                    entity_type_text.innerHTML = condition_element;

                    entity_type.appendChild(entity_type_symbol);
                    entity_type.appendChild(entity_type_text);
                    endpoint_wrapper.appendChild(entity_type);

                    parsing_step = "entity";
                }
                else if (parsing_step === "entity") {
                    /* Entity and Header */
                    const wrapper_entity = document.createElement("div");
                    wrapper_entity.className = "flex-column flex-static";
                    wrapper_entity.style.marginRight = "5px";

                    /* Header */
                    const header_entity_wrapper = document.createElement("div");
                    header_entity_wrapper.className = "flex-row flex-static";

                    const entity_header = document.createElement("span");
                    entity_header.style.marginLeft = "2px";
                    entity_header.style.marginRight = "auto";
                    entity_header.style.fontSize = "12px";
                    entity_header.style.fontWeight = "normal";
                    entity_header.style.color = "#FFFFFF";

                    if (p_entity_type === "ALLIANCE") {
                        entity_header.innerHTML = "Alliance";
                    }
                    else if (p_entity_type === "CORPORATION") {
                        entity_header.innerHTML = "Corporation";
                    }
                    else if (p_entity_type === "CHARACTER") {
                        entity_header.innerHTML = "Character";
                    }

                    header_entity_wrapper.appendChild(entity_header);

                    /* Entity */
                    const entity = document.createElement("div");
                    entity.className = "flex-row flex-static toolbox-element";
                    entity.style.marginTop = "3px";

                    if (p_entity_type === "ALLIANCE") {
                        entity.setAttribute("endpoint-type", "alliance");
                    }
                    else if (p_entity_type === "CORPORATION") {
                        entity.setAttribute("endpoint-type", "corporation");
                    }
                    else if (p_entity_type === "CHARACTER") {
                        entity.setAttribute("endpoint-type", "character");
                    }

                    const entity_symbol = document.createElement("span");
                    entity_symbol.className = "data-type";

                    if (p_base_endpoint.endsWith("-id")) {
                        entity_symbol.setAttribute("data-type", "number");
                        entity_symbol.innerHTML = "N";
                    }
                    else if (p_base_endpoint.endsWith("-name") || p_base_endpoint.endsWith("-ticker")) {
                        entity_symbol.setAttribute("data-type", "string");
                        entity_symbol.innerHTML = "S";
                    }
                    else {
                        entity_symbol.setAttribute("data-type", "string");
                        entity_symbol.innerHTML = "S";
                    }

                    let entity_input = undefined;

                    if (p_base_endpoint.endsWith("-id")) {
                        entity_input = document.createElement("input");
                        entity_input.type = "number";
                        entity_input.placeholder = "ID";

                        if (!endpoints[p_base_endpoint]["integer"]) {
                            if ("step" in endpoints[p_base_endpoint]) {
                                entity_input.step = String(endpoints[p_base_endpoint]["step"]).replace(",", ".");
                            }

                            if ("max" in endpoints[p_base_endpoint]) {
                                entity_input.max = String(endpoints[p_base_endpoint]["max"]).replace(",", ".");
                            }

                            if ("min" in endpoints[p_base_endpoint]) {
                                entity_input.min = String(endpoints[p_base_endpoint]["min"]).replace(",", ".");
                            }
                        }
                    }
                    else if (p_base_endpoint.endsWith("-name") || p_base_endpoint.endsWith("-ticker")) {
                        entity_input = document.createElement("input");
                        entity_input.type = "text";

                        if (p_base_endpoint.endsWith("-name")) {
                            entity_input.placeholder = "Name";
                        }
                        else if (p_base_endpoint.endsWith("-ticker")) {
                            entity_input.placeholder = "Ticker";
                        }

                        if ("max_length" in endpoints[p_base_endpoint]) {
                            entity_input.maxLength = Number(endpoints[p_base_endpoint]["max_length"]);
                        }

                        if ("min_length" in endpoints[p_base_endpoint]) {
                            entity_input.minLength = Number(endpoints[p_base_endpoint]["min_length"]);
                        }
                    }
                    else {
                        entity_input = document.createElement("input");
                        entity_input.type = "text";
                        entity_input.placeholder = "Name";

                        if ("max_length" in endpoints[p_base_endpoint]) {
                            entity_input.maxLength = Number(endpoints[p_base_endpoint]["max_length"]);
                        }

                        if ("min_length" in endpoints[p_base_endpoint]) {
                            entity_input.minLength = Number(endpoints[p_base_endpoint]["min_length"]);
                        }
                    }

                    entity_input.required = true;
                    entity_input.value = condition_element;
                    entity_input.style.height = "20px";
                    entity_input.style.width = "100%";
                    entity_input.style.marginTop = "-2px";
                    entity_input.style.marginLeft = "3px";
                    entity_input.style.paddingLeft = "5px";
                    entity_input.style.fontSize = "14px";
                    entity_input.style.fontWeight = "bold";

                    entity.appendChild(entity_symbol);
                    entity.appendChild(entity_input);

                    wrapper_entity.appendChild(header_entity_wrapper);
                    wrapper_entity.appendChild(entity);

                    endpoint_wrapper.appendChild(wrapper_entity);

                    parsing_step = "parsing_type";
                }

                condition_element = "";
                parsed = false;

                continue;
            }

            if (char === "[") {
                nesting++;

                parsing = true;
            }
            else {
                condition_element += char;
            }
        }
    }
    else {
        const parsing_type = endpoints[endpoint_string]["parsing_type"];

        let clone = undefined;

        /* Endpoint */
        const header = document.createElement("span");
        header.style.marginBottom = "3px";
        header.style.fontSize = "12px";
        header.style.fontWeight = "normal";
        header.style.color = "#FFFFFF";
        header.innerHTML = endpoints[endpoint_string]["group"];

        const endpoint = document.createElement("div");
        endpoint.className = "flex-column flex-dynamic";
        endpoint.style.marginRight = "5px";

        clone = document.querySelectorAll("[data-id=" + endpoint_string + "]")[0].cloneNode(true);

        if (parsing_type === 2 && !endpoint_string.endsWith("-has_standing")) {
            clone.getElementsByClassName("element-name")[0].innerHTML = "Standing";
        }

        endpoint.appendChild(header);
        endpoint.appendChild(clone);
        endpoint_wrapper.appendChild(endpoint);
        
        if (parsing_type === 2) {
            /* Direction */
            const direction = document.createElement("div");
            direction.className = "flex-row flex-static toolbox-element";
            direction.setAttribute("endpoint-type", "direction");
            direction.style.marginTop = "15px";
            direction.style.marginRight = "5px";
            direction.addEventListener("click", show_direction_dialog, false);

            const direction_symbol = document.createElement("span");
            direction_symbol.className = "data-type";
            direction_symbol.setAttribute("data-type", "direction");
            direction_symbol.innerHTML = "->";
            
            const direction_text = document.createElement("span");
            direction_text.className = "element-name";
            direction_text.innerHTML = "TOWARDS";

            direction.appendChild(direction_symbol);
            direction.appendChild(direction_text);
            endpoint_wrapper.appendChild(direction);

            /* Entity Type */
            const entity_type = document.createElement("div");
            entity_type.className = "flex-row flex-static toolbox-element";
            entity_type.setAttribute("endpoint-type", "entity");
            entity_type.style.marginTop = "15px";
            entity_type.style.marginRight = "5px";
            entity_type.addEventListener("click", show_entity_type_dialog, false);

            const entity_type_symbol = document.createElement("span");
            entity_type_symbol.className = "data-type";
            entity_type_symbol.setAttribute("data-type", "entity");
            entity_type_symbol.innerHTML = "Al";
            
            const entity_type_text = document.createElement("span");
            entity_type_text.className = "element-name";
            entity_type_text.innerHTML = "ALLIANCE";

            entity_type.appendChild(entity_type_symbol);
            entity_type.appendChild(entity_type_text);
            endpoint_wrapper.appendChild(entity_type);

            /* Entity and Header */
            const wrapper_entity = document.createElement("div");
            wrapper_entity.className = "flex-column flex-static";
            wrapper_entity.style.marginRight = "5px";

            /* Header */
            const header_entity_wrapper = document.createElement("div");
            header_entity_wrapper.className = "flex-row flex-static";

            const entity_header = document.createElement("span");
            entity_header.style.marginLeft = "2px";
            entity_header.style.marginRight = "auto";
            entity_header.style.fontSize = "12px";
            entity_header.style.fontWeight = "normal";
            entity_header.style.color = "#FFFFFF";
            entity_header.innerHTML = "Alliance";
            
            header_entity_wrapper.appendChild(entity_header);

            /* Entity */
            const entity = document.createElement("div");
            entity.className = "flex-row flex-static toolbox-element";
            entity.style.marginTop = "3px";
            entity.setAttribute("endpoint-type", "alliance");

            const entity_symbol = document.createElement("span");
            entity_symbol.className = "data-type";

            if (endpoint_string.endsWith("-id")) {
                entity_symbol.setAttribute("data-type", "number");
                entity_symbol.innerHTML = "N";
            }
            else if (endpoint_string.endsWith("-name") || endpoint_string.endsWith("-ticker")) {
                entity_symbol.setAttribute("data-type", "string");
                entity_symbol.innerHTML = "S";
            }
            else {
                entity_symbol.setAttribute("data-type", "string");
                entity_symbol.innerHTML = "S";
            }

            let entity_input = undefined;

            if (endpoint_string.endsWith("-id")) {
                entity_input = document.createElement("input");
                entity_input.type = "number";
                entity_input.placeholder = "ID";

                if (!endpoints[endpoint_string]["integer"]) {
                    if ("step" in endpoints[endpoint_string]) {
                        entity_input.step = String(endpoints[endpoint_string]["step"]).replace(",", ".");
                    }

                    if ("max" in endpoints[endpoint_string]) {
                        entity_input.max = String(endpoints[endpoint_string]["max"]).replace(",", ".");
                    }

                    if ("min" in endpoints[endpoint_string]) {
                        entity_input.min = String(endpoints[endpoint_string]["min"]).replace(",", ".");
                    }
                }
            }
            else if (endpoint_string.endsWith("-name") || endpoint_string.endsWith("-ticker")) {
                entity_input = document.createElement("input");
                entity_input.type = "text";

                if (endpoint_string.endsWith("-name")) {
                    entity_input.placeholder = "Name";
                }
                else if (endpoint_string.endsWith("-ticker")) {
                    entity_input.placeholder = "Ticker";
                }

                if ("max_length" in endpoints[endpoint_string]) {
                    entity_input.maxLength = Number(endpoints[endpoint_string]["max_length"]);
                }

                if ("min_length" in endpoints[endpoint_string]) {
                    entity_input.minLength = Number(endpoints[endpoint_string]["min_length"]);
                }
            }
            else {
                entity_input = document.createElement("input");
                entity_input.type = "text";
                entity_input.placeholder = "Name";

                if ("max_length" in endpoints[endpoint_string]) {
                    entity_input.maxLength = Number(endpoints[endpoint_string]["max_length"]);
                }

                if ("min_length" in endpoints[endpoint_string]) {
                    entity_input.minLength = Number(endpoints[endpoint_string]["min_length"]);
                }
            }

            entity_input.required = true;
            entity_input.style.height = "20px";
            entity_input.style.width = "100%";
            entity_input.style.marginTop = "-2px";
            entity_input.style.marginLeft = "3px";
            entity_input.style.paddingLeft = "5px";
            entity_input.style.fontSize = "14px";
            entity_input.style.fontWeight = "bold";

            entity.appendChild(entity_symbol);
            entity.appendChild(entity_input);

            wrapper_entity.appendChild(header_entity_wrapper);
            wrapper_entity.appendChild(entity);

            endpoint_wrapper.appendChild(wrapper_entity);
        }
        else if (parsing_type === 3) {
            /* Indicator */
            const indicator = document.createElement("div");
            indicator.className = "flex-row flex-static toolbox-element";
            indicator.setAttribute("endpoint-type", "indicator");
            indicator.style.marginTop = "15px";
            indicator.style.marginRight = "5px";

            const indicator_symbol = document.createElement("span");
            indicator_symbol.className = "data-type";
            indicator_symbol.setAttribute("data-type", "indicator");
            indicator_symbol.innerHTML = "?";
            
            const indicator_text = document.createElement("span");
            indicator_text.className = "element-name";
            indicator_text.innerHTML = "OF";

            indicator.appendChild(indicator_symbol);
            indicator.appendChild(indicator_text);
            endpoint_wrapper.appendChild(indicator);

            /* Entity and Header */
            const wrapper_target = document.createElement("div");
            wrapper_target.className = "flex-column flex-static";
            wrapper_target.style.marginRight = "5px";

            /* Header */
            const header_target_wrapper = document.createElement("div");
            header_target_wrapper.className = "flex-row flex-static";

            const target_header = document.createElement("span");
            target_header.style.marginLeft = "2px";
            target_header.style.marginRight = "auto";
            target_header.style.fontSize = "12px";
            target_header.style.fontWeight = "normal";
            target_header.style.color = "#FFFFFF";

            if (endpoint_string.includes("-faction-")) {
                target_header.innerHTML = "Faction";
            }
            else if (endpoint_string.includes("-alliance-")) {
                target_header.innerHTML = "Alliance";
            }
            else if (endpoint_string.includes("-corporation-")) {
                target_header.innerHTML = "Corporation";
            }
            else if (endpoint_string.includes("-character-")) {
                target_header.innerHTML = "Character";
            }

            header_target_wrapper.appendChild(target_header);

            /* Entity */
            const target = document.createElement("div");
            target.className = "flex-row flex-static toolbox-element";
            target.style.marginTop = "3px";

            if (endpoint_string.includes("-faction-")) {
                target.setAttribute("endpoint-type", "faction");
            }
            else if (endpoint_string.includes("-alliance-")) {
                target.setAttribute("endpoint-type", "alliance");
            }
            else if (endpoint_string.includes("-corporation-")) {
                target.setAttribute("endpoint-type", "corporation");
            }
            else if (endpoint_string.includes("-character-")) {
                target.setAttribute("endpoint-type", "character");
            }

            const target_symbol = document.createElement("span");
            target_symbol.className = "data-type";
            target_symbol.setAttribute("data-type", "string");
            target_symbol.innerHTML = "S";

            const target_input = document.createElement("input");
            target_input.type = "text";
            target_input.placeholder = "Name";
            target_input.required = true;
            target_input.style.height = "20px";
            target_input.style.width = "100%";
            target_input.style.marginTop = "-2px";
            target_input.style.marginLeft = "3px";
            target_input.style.paddingLeft = "5px";
            target_input.style.fontSize = "14px";
            target_input.style.fontWeight = "bold";

            target.appendChild(target_symbol);
            target.appendChild(target_input);

            wrapper_target.appendChild(header_target_wrapper);
            wrapper_target.appendChild(target);

            endpoint_wrapper.appendChild(wrapper_target);
        }
    }
}

async function initialize_keyword_area() {
    /* Wrapper */
    const keyword_area = document.getElementById("keyword-area");

    /* Keyword Header */
    const keyword_header = document.createElement("input");
    keyword_header.id = "keyword-header";
    keyword_header.type = "text";
    keyword_header.className = "keyword-header";
    keyword_header.minLength = 3;
    keyword_header.maxLength = 64;
    keyword_header.placeholder = "Enter Keyword";
    keyword_header.required = true;
    
    keyword_area.appendChild(keyword_header);

    /* Select Endpoint Wrapper */
    const select_endpoint_wrapper = document.createElement("div");
    select_endpoint_wrapper.id = "select-endpoint-wrapper";
    select_endpoint_wrapper.className = "flex-row flex-static area with-border";
    select_endpoint_wrapper.style.background = "#333333";
    select_endpoint_wrapper.style.borderColor = "#FF0000";

    keyword_area.appendChild(select_endpoint_wrapper);
    
    /* Select Endpoint Button */
    const select_endpoint_button = document.createElement("button");
    select_endpoint_button.id = "btn-select-endpoint";
    select_endpoint_button.setAttribute("edit", "true");
    select_endpoint_button.style.marginTop = "auto";
    select_endpoint_button.style.marginBottom = "auto";
    select_endpoint_button.style.marginLeft = "auto";
    select_endpoint_button.style.marginRight = "10px";
    select_endpoint_button.innerHTML = "Select Endpoint";
    select_endpoint_button.addEventListener(
        "click",
        function () {
            const keyword_wrapper = document.getElementById("keyword-wrapper");
            keyword_wrapper.style.width = "calc(100% - 410px)";

            const toolbox = document.getElementById("toolbox");
            toolbox.style.display = "";
            
            while (select_endpoint_wrapper.lastChild) {
                select_endpoint_wrapper.removeChild(select_endpoint_wrapper.lastChild);
            }

            select_endpoint_wrapper.style.borderColor = "#FF0000";
        },
        false);

    select_endpoint_wrapper.appendChild(select_endpoint_button);

    get_data();
}

function initialize_toolbox() {
    const endpoint_keys = Object.keys(endpoints).reverse();

    for (let i = 0; i < endpoint_keys.length; i++) {
        const endpoint_id = endpoint_keys[i];
        const endpoint = endpoints[endpoint_id];

        const endpoint_parent = endpoint["parent"];
        const endpoint_group = endpoint["group"];
        const endpoint_name = endpoint["name"];
        const endpoint_description = endpoint["description"];
        const endpoint_data_type = endpoint["data_type"];
        const endpoint_parsing_type = endpoint["parsing_type"];

        const toolbox_element = document.createElement("div");
        toolbox_element.className = "flex-row flex-static toolbox-element";
        toolbox_element.title = endpoint_description;
        toolbox_element.setAttribute("data-id", endpoint_id);
        toolbox_element.setAttribute("endpoint-type", endpoint_group.split(">")[0].trim().toLowerCase()); // E. g. Character > Fatigue --> character
        toolbox_element.setAttribute("parsing-type", endpoint_parsing_type);

        const toolbox_element_symbol = document.createElement("span");
        toolbox_element_symbol.className = "data-type";
        toolbox_element_symbol.setAttribute("data-type", endpoint_data_type);
        toolbox_element_symbol.innerHTML = endpoint_data_type.substring(0, 1).toUpperCase(); // E. g. number --> N

        const toolbox_element_name = document.createElement("span");
        toolbox_element_name.className = "element-name";
        toolbox_element_name.innerHTML = endpoint_name;

        toolbox_element.appendChild(toolbox_element_symbol);
        toolbox_element.appendChild(toolbox_element_name);

        const parent = document.querySelectorAll("[data-id=" + endpoint_parent + "]")[0];

        parent.insertBefore(toolbox_element, parent.childNodes[0]);
    }

    Array.prototype.forEach.call(document.getElementsByClassName("toolbox-header"), function (header) {
        header.addEventListener("click", show_or_hide_toolbox_group, false);
    });

    /* Add click event to select a direction. */
    Array.prototype.forEach.call(document.getElementById("toolbox").getElementsByClassName("toolbox-element"), function (element) {
        element.addEventListener(
            "click",
            function () {
                const keyword_wrapper = document.getElementById("keyword-wrapper");
                keyword_wrapper.style.width = "calc(100% - 0px)";

                const toolbox = document.getElementById("toolbox");
                toolbox.style.display = "none";

                const select_endpoint_wrapper = document.getElementById("select-endpoint-wrapper");
                const endpoint_string = this.getAttribute("data-id");

                select_endpoint(select_endpoint_wrapper, endpoint_string);

                /* Select Endpoint Button */
                const select_endpoint_button = document.createElement("button");
                select_endpoint_button.id = "btn-select-endpoint";
                select_endpoint_button.setAttribute("edit", "true");
                select_endpoint_button.style.marginTop = "auto";
                select_endpoint_button.style.marginBottom = "auto";
                select_endpoint_button.style.marginLeft = "auto";
                select_endpoint_button.style.marginRight = "10px";
                select_endpoint_button.innerHTML = "Select Endpoint";
                select_endpoint_button.addEventListener(
                    "click",
                    function () {
                        document.getElementById("keyword-wrapper").style.width = "calc(100% - 410px)";
                        document.getElementById("toolbox").style.display = "";

                        while (select_endpoint_wrapper.lastChild) {
                            select_endpoint_wrapper.removeChild(select_endpoint_wrapper.lastChild);
                        }

                        select_endpoint_wrapper.style.borderColor = "#FF0000";
                    },
                    false);

                select_endpoint_wrapper.appendChild(select_endpoint_button);
            },
            false
        );
    });
}

function get_url_parameter(key) {
    key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var results = regex.exec(location.search);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

function get_data() {
    socket.emit(
        "config_keyword",
        {
            "method": "get",
            "data_id": get_url_parameter("id")
        }
    );
}

function post_data(data) {
    socket.emit(
        "config_keyword",
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
        initialize_keyword(data);
    });

    socket.on("data_posted", function () {
        window.location = "/module/default/html/config/keywords.html";
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
    initialize_keyword_area();
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