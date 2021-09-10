"use strict";

//#region Globals
let cookie = undefined;
let socket = undefined;

let endpoints = undefined;
let conditions = undefined;
//#endregion

async function initialize_condition(data) {
    endpoints = data["endpoints"];
    conditions = data["conditions"];

    initialize_toolbox();

    const condition_area = document.getElementById("condition-area");
    const condition_body = condition_area.childNodes[1];

    if (get_url_parameter("id") === "new") {
        /* Tell the user to start by dragging and dropping endpoints. */
        const starting_dialog = document.createElement("div");
        starting_dialog.className = "area with-border";
        starting_dialog.style.position = "absolute";
        starting_dialog.style.top = "0px";
        starting_dialog.style.left = "0px";
        starting_dialog.style.right = "0px";
        starting_dialog.style.bottom = "0px";
        starting_dialog.style.margin = "auto";
        starting_dialog.style.marginTop = (condition_body.offsetTop + 90) + "px";
        starting_dialog.style.width = "300px";
        starting_dialog.style.height = "120px";
        starting_dialog.style.background = "#FFFFFF";
        starting_dialog.style.fontSize = "16px";
        starting_dialog.style.fontWeight = "bold";
        starting_dialog.innerHTML = "Drag and drop an endpoint from the list on the right into the dark area above.<br><br>Start by clicking the >Endpoints< group to expand it.";

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

        return;
    }

    const condition = data["condition"];

    const condition_title = condition["title"];
    const condition_description = condition["description"];
    const condition_string = condition["condition"];

    /* Load Title. */
    condition_area.childNodes[0].value = condition_title;

    /* Load Description. */
    if (condition_description !== "No description.") {
        document.getElementById("condition-description").getElementsByTagName("textarea")[0].value = condition_description;
    }
    
    let parsing = false;
    let parsed = false;
    let parsing_step = "parsing_type";
    let nesting = 0;
    let condition_element = "";

    let parsing_type = 0;

    let clone = undefined;
    let comparation = undefined;

    /* For parsing_type = 2 */
    let p_direction = undefined;
    let p_entity_type = undefined;

    /* For parsing_type = 2, 3 */
    let p_base_endpoint = undefined;

    /* Load Condition. */
    for (let i = 0; i < condition_string.length; i++) {
        const char = condition_string.charAt(i);

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

                comparation = document.createElement("div");
                comparation.className = "flex-row flex-static area";
                comparation.style.marginTop = "5px";
                comparation.style.marginBottom = "5px";
                comparation.style.background = "#555555";
                comparation.style.border = "solid 2px #000000";

                /* Left Brackets */
                const bg_wrapper_left = document.createElement("div");
                bg_wrapper_left.className = "flex-column flex-static";
                bg_wrapper_left.style.marginRight = "10px";

                const bracket_left_add = document.createElement("button");
                bracket_left_add.setAttribute("data-direction", "left");
                bracket_left_add.style.height = "12px";
                bracket_left_add.style.paddingTop = "0px";
                bracket_left_add.style.paddingBottom = "0px";
                bracket_left_add.style.paddingLeft = "2px";
                bracket_left_add.style.paddingRight = "2px";
                bracket_left_add.style.border = "solid 1px #88FF88";
                bracket_left_add.style.borderRadius = "2px";
                bracket_left_add.style.fontSize = "10px";
                bracket_left_add.style.color = "#88FF88";
                bracket_left_add.style.background = "#333333";
                bracket_left_add.innerHTML = "B";
                bracket_left_add.title = "Add one bracket on the left.";
                bracket_left_add.addEventListener("click", clicked_bracket_left_add, false);

                const bracket_left_remove = document.createElement("button");
                bracket_left_remove.setAttribute("data-direction", "left");
                bracket_left_remove.style.height = "12px";
                bracket_left_remove.style.marginTop = "auto";
                bracket_left_remove.style.paddingTop = "0px";
                bracket_left_remove.style.paddingBottom = "0px";
                bracket_left_remove.style.paddingLeft = "2px";
                bracket_left_remove.style.paddingRight = "2px";
                bracket_left_remove.style.border = "solid 1px #FF8888";
                bracket_left_remove.style.borderRadius = "2px";
                bracket_left_remove.style.fontSize = "10px";
                bracket_left_remove.style.color = "#FF8888";
                bracket_left_remove.style.background = "#333333";
                bracket_left_remove.innerHTML = "B";
                bracket_left_remove.title = "Remove one bracket on the left.";
                bracket_left_remove.addEventListener("click", clicked_bracket_left_remove, false);

                bg_wrapper_left.appendChild(bracket_left_add);
                bg_wrapper_left.appendChild(bracket_left_remove);
                comparation.appendChild(bg_wrapper_left);

                /* Endpoint */
                const header = document.createElement("span");
                header.style.marginBottom = "3px";
                header.style.fontSize = "12px";
                header.style.fontWeight = "normal";
                header.style.color = "#FFFFFF";

                if (condition_element.startsWith("te-endpoints-my_conditions-")) {
                    header.innerHTML = "Condition";
                }
                else {
                    header.innerHTML = endpoints[condition_element]["group"];
                }

                const endpoint = document.createElement("div");
                endpoint.className = "flex-column flex-static";
                endpoint.style.marginRight = "5px";

                clone = document.querySelectorAll("[data-id=" + condition_element + "]")[0].cloneNode(true);

                if (parsing_type === 2 && !condition_element.endsWith("-has_standing")) {
                    clone.getElementsByClassName("element-name")[0].innerHTML = "Standing";
                }

                endpoint.appendChild(header);
                endpoint.appendChild(clone);
                comparation.appendChild(endpoint);

                if (parsing_type === 1) {
                    parsing_step = "comparator";
                }
                else if (parsing_type === 2) {
                    parsing_step = "direction";
                }
                else if (parsing_type === 3) {
                    parsing_step = "indicator";
                }
            }
            else if (parsing_step === "indicator") {
                /* Target */
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
                comparation.appendChild(indicator);

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

                comparation.appendChild(wrapper_target);

                parsing_step = "comparator";
            }
            else if (parsing_step === "direction") {
                p_direction = condition_element;

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
                comparation.appendChild(direction);

                parsing_step = "entity_type";
            }
            else if (parsing_step === "entity_type") {
                p_entity_type = condition_element;;

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
                comparation.appendChild(entity_type);

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
                    }

                    if ("max" in endpoints[p_base_endpoint]) {
                        entity_input.max = String(endpoints[p_base_endpoint]["max"]).replace(",", ".");
                    }

                    if ("min" in endpoints[p_base_endpoint]) {
                        entity_input.min = String(endpoints[p_base_endpoint]["min"]).replace(",", ".");
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

                comparation.appendChild(wrapper_entity);

                parsing_step = "comparator";
            }
            else if (parsing_step === "comparator") {
                /* Comparator */
                const comparator = document.createElement("div");
                comparator.className = "flex-row flex-static toolbox-element";
                comparator.setAttribute("endpoint-type", "comparator");
                comparator.style.marginTop = "15px";
                comparator.style.marginRight = "5px";
                comparator.addEventListener("click", show_comparator_dialog, false);

                const comparator_symbol = document.createElement("span");
                comparator_symbol.className = "data-type";
                comparator_symbol.setAttribute("data-type", "comparator");

                if (condition_element === "IS") {
                    comparator_symbol.innerHTML = "=";
                }
                else if (condition_element === "IS NOT") {
                    comparator_symbol.innerHTML = "!=";
                }
                else if (condition_element === "CONTAINS") {
                    comparator_symbol.innerHTML = "*";
                }
                else if (condition_element === "CONTAINS NOT") {
                    comparator_symbol.innerHTML = "!*";
                }
                else if (condition_element === "GREATER OR EQUAL") {
                    comparator_symbol.innerHTML = ">=";
                }
                else if (condition_element === "GREATER") {
                    comparator_symbol.innerHTML = ">";
                }
                else if (condition_element === "LESS") {
                    comparator_symbol.innerHTML = "<";
                }
                else if (condition_element === "LESS OR EQUAL") {
                    comparator_symbol.innerHTML = "<=";
                }

                const comparator_text = document.createElement("span");
                comparator_text.className = "element-name";
                comparator_text.innerHTML = condition_element;
                
                comparator.appendChild(comparator_symbol);
                comparator.appendChild(comparator_text);
                comparation.appendChild(comparator);

                parsing_step = "value";
            }
            else if (parsing_step === "value") {
                /* Wrapper */
                const wrapper = document.createElement("div");
                wrapper.className = "flex-column flex-static";

                if (parsing_type === 3) {
                    /* Header */
                    const header_value_wrapper = document.createElement("div");
                    header_value_wrapper.className = "flex-row flex-static";

                    const value_header = document.createElement("span");
                    value_header.style.marginLeft = "2px";
                    value_header.style.marginRight = "auto";
                    value_header.style.fontSize = "12px";
                    value_header.style.fontWeight = "normal";
                    value_header.style.color = "#FFFFFF";
                    value_header.innerHTML = comparation.childNodes[1].childNodes[0].innerHTML;
                    header_value_wrapper.appendChild(value_header);

                    const command_move_left = document.createElement("button");
                    command_move_left.style.height = "12px";
                    command_move_left.style.marginLeft = "10px";
                    command_move_left.style.paddingTop = "0px";
                    command_move_left.style.paddingBottom = "0px";
                    command_move_left.style.paddingLeft = "2px";
                    command_move_left.style.paddingRight = "2px";
                    command_move_left.style.border = "solid 1px #FFFFFF";
                    command_move_left.style.borderRadius = "2px";
                    command_move_left.style.fontSize = "10px";
                    command_move_left.style.color = "#FFFFFF";
                    command_move_left.style.background = "#333333";
                    command_move_left.innerHTML = "<<";
                    command_move_left.title = "Move this condition part to the left.";
                    command_move_left.addEventListener("click", clicked_command_move_left, false);
                    header_value_wrapper.appendChild(command_move_left);

                    const command_move_right = document.createElement("button");
                    command_move_right.style.height = "12px";
                    command_move_right.style.marginLeft = "2px";
                    command_move_right.style.paddingTop = "0px";
                    command_move_right.style.paddingBottom = "0px";
                    command_move_right.style.paddingLeft = "2px";
                    command_move_right.style.paddingRight = "2px";
                    command_move_right.style.border = "solid 1px #FFFFFF";
                    command_move_right.style.borderRadius = "2px";
                    command_move_right.style.fontSize = "10px";
                    command_move_right.style.color = "#FFFFFF";
                    command_move_right.style.background = "#333333";
                    command_move_right.innerHTML = ">>";
                    command_move_right.title = "Move this condition part to the right.";
                    command_move_right.addEventListener("click", clicked_command_move_right, false);
                    header_value_wrapper.appendChild(command_move_right);

                    const command_remove = document.createElement("button");
                    command_remove.style.height = "12px";
                    command_remove.style.marginLeft = "5px";
                    command_remove.style.marginRight = "1px";
                    command_remove.style.paddingTop = "0px";
                    command_remove.style.paddingBottom = "0px";
                    command_remove.style.paddingLeft = "2px";
                    command_remove.style.paddingRight = "2px";
                    command_remove.style.border = "solid 1px #FF8888";
                    command_remove.style.borderRadius = "2px";
                    command_remove.style.fontSize = "10px";
                    command_remove.style.color = "#FF8888";
                    command_remove.style.background = "#333333";
                    command_remove.innerHTML = "X";
                    command_remove.title = "Remove this condition part.";
                    command_remove.addEventListener("click", clicked_command_remove, false);
                    header_value_wrapper.appendChild(command_remove);
                    
                    /* Value */
                    const clone_id = clone.getAttribute("data-id");
                    const clone_endpoint = clone.getAttribute("endpoint-type");
                    const clone_type = clone.getElementsByClassName("data-type")[0].getAttribute("data-type");
                    const clone_type_text = clone.getElementsByClassName("data-type")[0].innerHTML;
                    const clone_text = clone.getElementsByClassName("element-name")[0].innerHTML;

                    const value = document.createElement("div");
                    value.className = "flex-row flex-static toolbox-element";
                    value.setAttribute("endpoint-type", clone_endpoint);
                    value.style.marginTop = "3px";

                    const value_symbol = document.createElement("span");
                    value_symbol.className = "data-type";
                    value_symbol.setAttribute("data-type", clone_type);
                    value_symbol.innerHTML = clone_type_text;

                    let value_input;

                    if (clone_type === "number") {
                        value_input = document.createElement("input");
                        value_input.type = "number";
                        value_input.placeholder = clone_text;

                        if (!endpoints[clone_id]["integer"]) {
                            if ("step" in endpoints[clone_id]) {
                                value_input.step = String(endpoints[clone_id]["step"]).replace(",", ".");
                            }
                        }

                        if ("max" in endpoints[clone_id]) {
                            value_input.max = String(endpoints[clone_id]["max"]).replace(",", ".");
                        }

                        if ("min" in endpoints[clone_id]) {
                            value_input.min = String(endpoints[clone_id]["min"]).replace(",", ".");
                        }
                    }
                    else if (clone_type === "string") {
                        value_input = document.createElement("input");
                        value_input.type = "text";
                        value_input.placeholder = clone_text;

                        if ("max_length" in endpoints[clone_id]) {
                            value_input.maxLength = Number(endpoints[clone_id]["max_length"]);
                        }

                        if ("min_length" in endpoints[clone_id]) {
                            value_input.minLength = Number(endpoints[clone_id]["min_length"]);
                        }
                    }
                    else if (clone_type === "boolean") {
                        value_input = document.createElement("select");

                        const option_true = document.createElement("option");
                        option_true.value = "true";
                        option_true.innerHTML = "True";
                        option_true.selected = true;

                        const option_false = document.createElement("option");
                        option_false.value = "false";
                        option_false.innerHTML = "False";

                        value_input.appendChild(option_true);
                        value_input.appendChild(option_false);
                    }

                    value_input.required = true;
                    value_input.value = condition_element;
                    value_input.style.height = "20px";
                    value_input.style.width = "100%";
                    value_input.style.marginTop = "-2px";
                    value_input.style.marginLeft = "3px";
                    value_input.style.paddingLeft = "5px";
                    value_input.style.fontSize = "14px";
                    value_input.style.fontWeight = "bold";

                    value.appendChild(value_symbol);
                    value.appendChild(value_input);

                    wrapper.appendChild(header_value_wrapper);
                    wrapper.appendChild(value);

                    comparation.appendChild(wrapper);
                }
                else if (parsing_type === 2) {
                    /* Header */
                    const header_value_wrapper = document.createElement("div");
                    header_value_wrapper.className = "flex-row flex-static";

                    const value_header = document.createElement("span");
                    value_header.style.marginLeft = "2px";
                    value_header.style.marginRight = "auto";
                    value_header.style.fontSize = "12px";
                    value_header.style.fontWeight = "normal";
                    value_header.style.color = "#FFFFFF";

                    if (p_direction === "TOWARDS") {
                        if (p_base_endpoint.includes("-alliance-")) {
                            value_header.innerHTML = "Alliance > Standing";
                        }
                        else if (p_base_endpoint.includes("-corporation-")) {
                            value_header.innerHTML = "Corporation > Standing";
                        }
                        else if (p_base_endpoint.includes("-character-")) {
                            value_header.innerHTML = "Character > Standing";
                        }
                    }
                    else if (p_direction === "FROM") {
                        if (p_entity_type === "ALLIANCE") {
                            value_header.innerHTML = "Alliance > Standing";
                        }
                        else if (p_entity_type === "CORPORATION") {
                            value_header.innerHTML = "Corporation > Standing";
                        }
                        else if (p_entity_type === "CHARACTER") {
                            value_header.innerHTML = "Character > Standing";
                        }
                    }
                    
                    header_value_wrapper.appendChild(value_header);

                    const command_move_left = document.createElement("button");
                    command_move_left.style.height = "12px";
                    command_move_left.style.marginLeft = "10px";
                    command_move_left.style.paddingTop = "0px";
                    command_move_left.style.paddingBottom = "0px";
                    command_move_left.style.paddingLeft = "2px";
                    command_move_left.style.paddingRight = "2px";
                    command_move_left.style.border = "solid 1px #FFFFFF";
                    command_move_left.style.borderRadius = "2px";
                    command_move_left.style.fontSize = "10px";
                    command_move_left.style.color = "#FFFFFF";
                    command_move_left.style.background = "#333333";
                    command_move_left.innerHTML = "<<";
                    command_move_left.title = "Move this condition part to the left.";
                    command_move_left.addEventListener("click", clicked_command_move_left, false);
                    header_value_wrapper.appendChild(command_move_left);

                    const command_move_right = document.createElement("button");
                    command_move_right.style.height = "12px";
                    command_move_right.style.marginLeft = "2px";
                    command_move_right.style.paddingTop = "0px";
                    command_move_right.style.paddingBottom = "0px";
                    command_move_right.style.paddingLeft = "2px";
                    command_move_right.style.paddingRight = "2px";
                    command_move_right.style.border = "solid 1px #FFFFFF";
                    command_move_right.style.borderRadius = "2px";
                    command_move_right.style.fontSize = "10px";
                    command_move_right.style.color = "#FFFFFF";
                    command_move_right.style.background = "#333333";
                    command_move_right.innerHTML = ">>";
                    command_move_right.title = "Move this condition part to the right.";
                    command_move_right.addEventListener("click", clicked_command_move_right, false);
                    header_value_wrapper.appendChild(command_move_right);

                    const command_remove = document.createElement("button");
                    command_remove.style.height = "12px";
                    command_remove.style.marginLeft = "5px";
                    command_remove.style.marginRight = "1px";
                    command_remove.style.paddingTop = "0px";
                    command_remove.style.paddingBottom = "0px";
                    command_remove.style.paddingLeft = "2px";
                    command_remove.style.paddingRight = "2px";
                    command_remove.style.border = "solid 1px #FF8888";
                    command_remove.style.borderRadius = "2px";
                    command_remove.style.fontSize = "10px";
                    command_remove.style.color = "#FF8888";
                    command_remove.style.background = "#333333";
                    command_remove.innerHTML = "X";
                    command_remove.title = "Remove this condition part.";
                    command_remove.addEventListener("click", clicked_command_remove, false);
                    header_value_wrapper.appendChild(command_remove);

                    /* Value */
                    const value = document.createElement("div");
                    value.className = "flex-row flex-static toolbox-element";
                    value.style.marginTop = "3px";

                    if (p_direction === "TOWARDS") {
                        if (p_base_endpoint.includes("-alliance-")) {
                            value.setAttribute("endpoint-type", "alliance");
                        }
                        else if (p_base_endpoint.includes("-corporation-")) {
                            value.setAttribute("endpoint-type", "corporation");
                        }
                        else if (p_base_endpoint.includes("-character-")) {
                            value.setAttribute("endpoint-type", "character");
                        }
                    }
                    else if (p_direction === "FROM") {
                        if (p_entity_type === "ALLIANCE") {
                            value.setAttribute("endpoint-type", "alliance");
                        }
                        else if (p_entity_type === "CORPORATION") {
                            value.setAttribute("endpoint-type", "corporation");
                        }
                        else if (p_entity_type === "CHARACTER") {
                            value.setAttribute("endpoint-type", "character");
                        }
                    }
                    
                    const value_symbol = document.createElement("span");
                    value_symbol.className = "data-type";
                    
                    if (p_base_endpoint.endsWith("-has_standing")) {
                        value_symbol.setAttribute("data-type", "boolean");
                        value_symbol.innerHTML = "B";
                    }
                    else {
                        value_symbol.setAttribute("data-type", "number");
                        value_symbol.innerHTML = "N";
                    }

                    let value_input = undefined;

                    if (p_base_endpoint.endsWith("-has_standing")) {
                        value_input = document.createElement("select");

                        const option_true = document.createElement("option");
                        option_true.value = "true";
                        option_true.innerHTML = "True";
                        option_true.selected = true;

                        const option_false = document.createElement("option");
                        option_false.value = "false";
                        option_false.innerHTML = "False";

                        value_input.appendChild(option_true);
                        value_input.appendChild(option_false);
                    }
                    else {
                        value_input = document.createElement("input");

                        value_input.type = "number";
                        value_input.placeholder = "Standing (-10.0 to 10.0)";
                        value_input.step = "0.1";
                        value_input.max = "10.0";
                        value_input.min = "-10.0";
                    }
                    
                    value_input.required = true;
                    value_input.value = condition_element;
                    value_input.style.height = "20px";
                    value_input.style.width = "100%";
                    value_input.style.marginTop = "-2px";
                    value_input.style.marginLeft = "3px";
                    value_input.style.paddingLeft = "5px";
                    value_input.style.fontSize = "14px";
                    value_input.style.fontWeight = "bold";

                    value.appendChild(value_symbol);
                    value.appendChild(value_input);

                    wrapper.appendChild(header_value_wrapper);
                    wrapper.appendChild(value);

                    comparation.appendChild(wrapper);
                }
                else if (parsing_type === 1) {
                    /* Header */
                    const header_value_wrapper = document.createElement("div");
                    header_value_wrapper.className = "flex-row flex-static";

                    const value_header = document.createElement("span");
                    value_header.style.marginLeft = "2px";
                    value_header.style.marginRight = "auto";
                    value_header.style.fontSize = "12px";
                    value_header.style.fontWeight = "normal";
                    value_header.style.color = "#FFFFFF";

                    if (condition_element.startsWith("te-endpoints-")) {
                        if (condition_element.startsWith("te-endpoints-my_conditions-")) {
                            value_header.innerHTML = "Condition";
                        }
                        else {
                            value_header.innerHTML = endpoints[condition_element]["group"];
                        }
                    }
                    else {
                        value_header.innerHTML = comparation.childNodes[1].childNodes[0].innerHTML;
                    }

                    header_value_wrapper.appendChild(value_header);

                    const command_use_endpoint = document.createElement("button");
                    command_use_endpoint.style.height = "12px";
                    command_use_endpoint.style.marginLeft = "10px";
                    command_use_endpoint.style.paddingTop = "0px";
                    command_use_endpoint.style.paddingBottom = "0px";
                    command_use_endpoint.style.paddingLeft = "2px";
                    command_use_endpoint.style.paddingRight = "2px";
                    command_use_endpoint.style.borderRadius = "2px";
                    command_use_endpoint.style.fontSize = "10px";
                    command_use_endpoint.style.background = "#333333";
                    command_use_endpoint.innerHTML = "Endpoint";
                    command_use_endpoint.title = "Compare to an endpoint.";
                    command_use_endpoint.addEventListener("click", show_endpoint_dialog, false);
                    header_value_wrapper.appendChild(command_use_endpoint);

                    const command_use_input = document.createElement("button");
                    command_use_input.style.height = "12px";
                    command_use_input.style.marginLeft = "2px";
                    command_use_input.style.paddingTop = "0px";
                    command_use_input.style.paddingBottom = "0px";
                    command_use_input.style.paddingLeft = "2px";
                    command_use_input.style.paddingRight = "2px";
                    command_use_input.style.borderRadius = "2px";
                    command_use_input.style.fontSize = "10px";
                    command_use_input.style.background = "#333333";
                    command_use_input.innerHTML = "Input";
                    command_use_input.title = "Compare to manual input.";
                    command_use_input.addEventListener("click", selected_input, false);
                    header_value_wrapper.appendChild(command_use_input);

                    if (condition_element.startsWith("te-")) {
                        command_use_endpoint.style.color = "#88FF88";
                        command_use_endpoint.style.border = "solid 1px #88FF88";

                        command_use_input.style.color = "#FF8888";
                        command_use_input.style.border = "solid 1px #FF8888";
                    }
                    else {
                        command_use_endpoint.style.color = "#FF8888";
                        command_use_endpoint.style.border = "solid 1px #FF8888";

                        command_use_input.style.color = "#88FF88";
                        command_use_input.style.border = "solid 1px #88FF88";
                    }

                    const command_move_left = document.createElement("button");
                    command_move_left.style.height = "12px";
                    command_move_left.style.marginLeft = "10px";
                    command_move_left.style.paddingTop = "0px";
                    command_move_left.style.paddingBottom = "0px";
                    command_move_left.style.paddingLeft = "2px";
                    command_move_left.style.paddingRight = "2px";
                    command_move_left.style.border = "solid 1px #FFFFFF";
                    command_move_left.style.borderRadius = "2px";
                    command_move_left.style.fontSize = "10px";
                    command_move_left.style.color = "#FFFFFF";
                    command_move_left.style.background = "#333333";
                    command_move_left.innerHTML = "<<";
                    command_move_left.title = "Move this condition part to the left.";
                    command_move_left.addEventListener("click", clicked_command_move_left, false);
                    header_value_wrapper.appendChild(command_move_left);

                    const command_move_right = document.createElement("button");
                    command_move_right.style.height = "12px";
                    command_move_right.style.marginLeft = "2px";
                    command_move_right.style.paddingTop = "0px";
                    command_move_right.style.paddingBottom = "0px";
                    command_move_right.style.paddingLeft = "2px";
                    command_move_right.style.paddingRight = "2px";
                    command_move_right.style.border = "solid 1px #FFFFFF";
                    command_move_right.style.borderRadius = "2px";
                    command_move_right.style.fontSize = "10px";
                    command_move_right.style.color = "#FFFFFF";
                    command_move_right.style.background = "#333333";
                    command_move_right.innerHTML = ">>";
                    command_move_right.title = "Move this condition part to the right.";
                    command_move_right.addEventListener("click", clicked_command_move_right, false);
                    header_value_wrapper.appendChild(command_move_right);

                    const command_remove = document.createElement("button");
                    command_remove.style.height = "12px";
                    command_remove.style.marginLeft = "5px";
                    command_remove.style.marginRight = "1px";
                    command_remove.style.paddingTop = "0px";
                    command_remove.style.paddingBottom = "0px";
                    command_remove.style.paddingLeft = "2px";
                    command_remove.style.paddingRight = "2px";
                    command_remove.style.border = "solid 1px #FF8888";

                    command_remove.style.borderRadius = "2px";
                    command_remove.style.fontSize = "10px";
                    command_remove.style.color = "#FF8888";
                    command_remove.style.background = "#333333";
                    command_remove.innerHTML = "X";
                    command_remove.title = "Remove this condition part.";
                    command_remove.addEventListener("click", clicked_command_remove, false);
                    header_value_wrapper.appendChild(command_remove);

                    /* Value */
                    let value = undefined;

                    if (condition_element.startsWith("te-")) {
                        value = document.querySelectorAll("[data-id=" + condition_element + "]")[0].cloneNode(true);
                        value.style.marginTop = "3px";
                    }
                    else {
                        const clone_id = clone.getAttribute("data-id");
                        const clone_endpoint = clone.getAttribute("endpoint-type");
                        const clone_type = clone.getElementsByClassName("data-type")[0].getAttribute("data-type");
                        const clone_type_text = clone.getElementsByClassName("data-type")[0].innerHTML;
                        const clone_text = clone.getElementsByClassName("element-name")[0].innerHTML;

                        value = document.createElement("div");
                        value.className = "flex-row flex-static toolbox-element";
                        value.setAttribute("endpoint-type", clone_endpoint);
                        value.style.marginTop = "3px";

                        const value_symbol = document.createElement("span");
                        value_symbol.className = "data-type";
                        value_symbol.setAttribute("data-type", clone_type);
                        value_symbol.innerHTML = clone_type_text;

                        let value_input;

                        if (clone_type === "number") {
                            value_input = document.createElement("input");
                            value_input.type = "number";
                            value_input.placeholder = clone_text;

                            if (!endpoints[clone_id]["integer"]) {
                                if ("step" in endpoints[clone_id]) {
                                    value_input.step = String(endpoints[clone_id]["step"]).replace(",", ".");
                                }
                            }

                            if ("max" in endpoints[clone_id]) {
                                value_input.max = String(endpoints[clone_id]["max"]).replace(",", ".");
                            }

                            if ("min" in endpoints[clone_id]) {
                                value_input.min = String(endpoints[clone_id]["min"]).replace(",", ".");
                            }
                        }
                        else if (clone_type === "string") {
                            value_input = document.createElement("input");
                            value_input.type = "text";
                            value_input.placeholder = clone_text;

                            if ("max_length" in endpoints[clone_id]) {
                                value_input.maxLength = Number(endpoints[clone_id]["max_length"]);
                            }

                            if ("min_length" in endpoints[clone_id]) {
                                value_input.minLength = Number(endpoints[clone_id]["min_length"]);
                            }
                        }
                        else if (clone_type === "boolean") {
                            value_input = document.createElement("select");

                            const option_true = document.createElement("option");
                            option_true.value = "true";
                            option_true.innerHTML = "True";
                            option_true.selected = true;

                            const option_false = document.createElement("option");
                            option_false.value = "false";
                            option_false.innerHTML = "False";

                            value_input.appendChild(option_true);
                            value_input.appendChild(option_false);
                        }

                        value_input.required = true;
                        value_input.value = condition_element;
                        value_input.style.height = "20px";
                        value_input.style.width = "100%";
                        value_input.style.marginTop = "-2px";
                        value_input.style.marginLeft = "3px";
                        value_input.style.paddingLeft = "5px";
                        value_input.style.fontSize = "14px";
                        value_input.style.fontWeight = "bold";

                        value.appendChild(value_symbol);
                        value.appendChild(value_input);
                    }

                    wrapper.appendChild(header_value_wrapper);
                    wrapper.appendChild(value);

                    comparation.appendChild(wrapper);
                }

                /* Right Brackets */
                const bg_wrapper_right = document.createElement("div");
                bg_wrapper_right.className = "flex-column flex-static";
                bg_wrapper_right.style.marginLeft = "10px";

                const bracket_right_add = document.createElement("button");
                bracket_right_add.style.height = "12px";
                bracket_right_add.style.paddingTop = "0px";
                bracket_right_add.style.paddingBottom = "0px";
                bracket_right_add.style.paddingLeft = "2px";
                bracket_right_add.style.paddingRight = "2px";
                bracket_right_add.style.border = "solid 1px #88FF88";
                bracket_right_add.style.borderRadius = "2px";
                bracket_right_add.style.fontSize = "10px";
                bracket_right_add.style.color = "#88FF88";
                bracket_right_add.style.background = "#333333";
                bracket_right_add.innerHTML = "B";
                bracket_right_add.title = "Add one bracket on the right.";
                bracket_right_add.addEventListener("click", clicked_bracket_right_add, false);

                const bracket_right_remove = document.createElement("button");
                bracket_right_remove.style.height = "12px";
                bracket_right_remove.style.marginTop = "auto";
                bracket_right_remove.style.paddingTop = "0px";
                bracket_right_remove.style.paddingBottom = "0px";
                bracket_right_remove.style.paddingLeft = "2px";
                bracket_right_remove.style.paddingRight = "2px";
                bracket_right_remove.style.border = "solid 1px #FF8888";
                bracket_right_remove.style.borderRadius = "2px";
                bracket_right_remove.style.fontSize = "10px";
                bracket_right_remove.style.color = "#FF8888";
                bracket_right_remove.style.background = "#333333";
                bracket_right_remove.innerHTML = "B";
                bracket_right_remove.title = "Remove one bracket on the right.";
                bracket_right_remove.addEventListener("click", clicked_bracket_right_remove, false);

                bg_wrapper_right.appendChild(bracket_right_add);
                bg_wrapper_right.appendChild(bracket_right_remove);
                comparation.appendChild(bg_wrapper_right);

                condition_body.appendChild(comparation);

                parsing_step = "parsing_type";
            }

            condition_element = "";
            parsed = false;

            continue;
        }

        if ((char === "(" || char === ")" || char === "[") && condition_element.length > 0) {
            if (condition_element === "AND") {
                const logic_gate_and = document.createElement("div");
                logic_gate_and.className = "flex-row flex-static toolbox-element";
                logic_gate_and.title = "AND - GATE\\nIf all conditions are true, the result will be true.\\n\\nA\\tB\\tRESULT\\n0\\t0\\t0\\n0\\t1\\t0\\n1\\t0\\t0\\n1\\t1\\t1";
                logic_gate_and.setAttribute("data-id", "te-logic-gates-and");
                logic_gate_and.setAttribute("endpoint-type", "logic");
                logic_gate_and.style.marginTop = "auto";
                logic_gate_and.style.marginBottom = "auto";
                logic_gate_and.style.marginLeft = "5px";
                logic_gate_and.style.marginRight = "5px";
                logic_gate_and.addEventListener("click", show_logic_gate_dialog, false);

                const logic_gate_and_symbol = document.createElement("span");
                logic_gate_and_symbol.className = "data-type";
                logic_gate_and_symbol.setAttribute("data-type", "logic");
                logic_gate_and_symbol.innerHTML = "&";

                const logic_gate_and_text = document.createElement("span");
                logic_gate_and_text.className = "element-name";
                logic_gate_and_text.innerHTML = "AND";

                logic_gate_and.appendChild(logic_gate_and_symbol);
                logic_gate_and.appendChild(logic_gate_and_text);
                condition_body.appendChild(logic_gate_and);
            }
            else if (condition_element === "OR") {
                const logic_gate_or = document.createElement("div");
                logic_gate_or.className = "flex-row flex-static toolbox-element";
                logic_gate_or.title = "OR - GATE\\nIf one of the conditions is true, the result will be true.\\n\\nA\\tB\\tRESULT\\n0\\t0\\t0\\n0\\t1\\t1\\n1\\t0\\t1\\n1\\t1\\t1";
                logic_gate_or.setAttribute("data-id", "te-logic-gates-or");
                logic_gate_or.setAttribute("endpoint-type", "logic");
                logic_gate_or.style.marginTop = "auto";
                logic_gate_or.style.marginBottom = "auto";
                logic_gate_or.style.marginLeft = "5px";
                logic_gate_or.style.marginRight = "5px";
                logic_gate_or.addEventListener("click", show_logic_gate_dialog, false);

                const logic_gate_or_symbol = document.createElement("span");
                logic_gate_or_symbol.className = "data-type";
                logic_gate_or_symbol.setAttribute("data-type", "logic");
                logic_gate_or_symbol.innerHTML = "|";

                const logic_gate_or_text = document.createElement("span");
                logic_gate_or_text.className = "element-name";
                logic_gate_or_text.innerHTML = "OR";

                logic_gate_or.appendChild(logic_gate_or_symbol);
                logic_gate_or.appendChild(logic_gate_or_text);
                condition_body.appendChild(logic_gate_or);
            }
            else if (condition_element === "NAND") {
                const logic_gate_nand = document.createElement("div");
                logic_gate_nand.className = "flex-row flex-static toolbox-element";
                logic_gate_nand.title = "NOT AND - GATE\\nAs long as not all conditions are true, the result will be true.\\n\\nA\\tB\\tRESULT\\n0\\t0\\t1\\n0\\t1\\t1\\n1\\t0\\t1\\n1\\t1\\t0";
                logic_gate_nand.setAttribute("data-id", "te-logic-gates-nand");
                logic_gate_nand.setAttribute("endpoint-type", "logic");
                logic_gate_nand.style.marginTop = "auto";
                logic_gate_nand.style.marginBottom = "auto";
                logic_gate_nand.style.marginLeft = "5px";
                logic_gate_nand.style.marginRight = "5px";
                logic_gate_nand.addEventListener("click", show_logic_gate_dialog, false);

                const logic_gate_nand_symbol = document.createElement("span");
                logic_gate_nand_symbol.className = "data-type";
                logic_gate_nand_symbol.setAttribute("data-type", "logic");
                logic_gate_nand_symbol.innerHTML = "!&";

                const logic_gate_nand_text = document.createElement("span");
                logic_gate_nand_text.className = "element-name";
                logic_gate_nand_text.innerHTML = "NAND";

                logic_gate_nand.appendChild(logic_gate_nand_symbol);
                logic_gate_nand.appendChild(logic_gate_nand_text);
                condition_body.appendChild(logic_gate_nand);
            }
            else if (condition_element === "NOR") {
                const logic_gate_nor = document.createElement("div");
                logic_gate_nor.className = "flex-row flex-static toolbox-element";
                logic_gate_nor.title = "NOT OR - GATE\\nIf all conditions are false, the result will be true.\\n\\nA\\tB\\tRESULT\\n0\\t0\\t1\\n0\\t1\\t0\\n1\\t0\\t0\\n1\\t1\\t0";
                logic_gate_nor.setAttribute("data-id", "te-logic-gates-nor");
                logic_gate_nor.setAttribute("endpoint-type", "logic");
                logic_gate_nor.style.marginTop = "auto";
                logic_gate_nor.style.marginBottom = "auto";
                logic_gate_nor.style.marginLeft = "5px";
                logic_gate_nor.style.marginRight = "5px";
                logic_gate_nor.addEventListener("click", show_logic_gate_dialog, false);

                const logic_gate_nor_symbol = document.createElement("span");
                logic_gate_nor_symbol.className = "data-type";
                logic_gate_nor_symbol.setAttribute("data-type", "logic");
                logic_gate_nor_symbol.innerHTML = "!|";

                const logic_gate_nor_text = document.createElement("span");
                logic_gate_nor_text.className = "element-name";
                logic_gate_nor_text.innerHTML = "NOR";

                logic_gate_nor.appendChild(logic_gate_nor_symbol);
                logic_gate_nor.appendChild(logic_gate_nor_text);
                condition_body.appendChild(logic_gate_nor);
            }
            else if (condition_element === "XOR") {
                const logic_gate_xor = document.createElement("div");
                logic_gate_xor.className = "flex-row flex-static toolbox-element";
                logic_gate_xor.title = "EXCLUSIVE OR - GATE\\nAs long as not all conditions are either true or false, the result will be true.\\n\\nA\\tB\\tRESULT\\n0\\t0\\t0\\n0\\t1\\t1\\n1\\t0\\t1\\n1\\t1\\t0";
                logic_gate_xor.setAttribute("data-id", "te-logic-gates-xor");
                logic_gate_xor.setAttribute("endpoint-type", "logic");
                logic_gate_xor.style.marginTop = "auto";
                logic_gate_xor.style.marginBottom = "auto";
                logic_gate_xor.style.marginLeft = "5px";
                logic_gate_xor.style.marginRight = "5px";
                logic_gate_xor.addEventListener("click", show_logic_gate_dialog, false);

                const logic_gate_xor_symbol = document.createElement("span");
                logic_gate_xor_symbol.className = "data-type";
                logic_gate_xor_symbol.setAttribute("data-type", "logic");
                logic_gate_xor_symbol.innerHTML = "x|";

                const logic_gate_xor_text = document.createElement("span");
                logic_gate_xor_text.className = "element-name";
                logic_gate_xor_text.innerHTML = "XOR";

                logic_gate_xor.appendChild(logic_gate_xor_symbol);
                logic_gate_xor.appendChild(logic_gate_xor_text);
                condition_body.appendChild(logic_gate_xor);
            }
            else if (condition_element === "XNOR") {
                const logic_gate_xnor = document.createElement("div");
                logic_gate_xnor.className = "flex-row flex-static toolbox-element";
                logic_gate_xnor.title = "EXCLUSIVE NOT OR - GATE\\nAs long as all conditions are either true or false, the result will be true.\\n\\nA\\tB\\tRESULT\\n0\\t0\\t1\\n0\\t1\\t0\\n1\\t0\\t0\\n1\\t1\\t1";
                logic_gate_xnor.setAttribute("data-id", "te-logic-gates-xnor");
                logic_gate_xnor.setAttribute("endpoint-type", "logic");
                logic_gate_xnor.style.marginTop = "auto";
                logic_gate_xnor.style.marginBottom = "auto";
                logic_gate_xnor.style.marginLeft = "5px";
                logic_gate_xnor.style.marginRight = "5px";
                logic_gate_xnor.addEventListener("click", show_logic_gate_dialog, false);

                const logic_gate_xnor_symbol = document.createElement("span");
                logic_gate_xnor_symbol.className = "data-type";
                logic_gate_xnor_symbol.setAttribute("data-type", "logic");
                logic_gate_xnor_symbol.innerHTML = "x!|";

                const logic_gate_xnor_text = document.createElement("span");
                logic_gate_xnor_text.className = "element-name";
                logic_gate_xnor_text.innerHTML = "XNOR";

                logic_gate_xnor.appendChild(logic_gate_xnor_symbol);
                logic_gate_xnor.appendChild(logic_gate_xnor_text);
                condition_body.appendChild(logic_gate_xnor);
            }

            condition_element = "";
        }

        if (char === "(") {
            const bracket = document.createElement("span");
            bracket.style.height = "57px";
            bracket.style.marginTop = "-5px";
            bracket.style.fontSize = "65px";
            bracket.style.color = "#FFFFFF";
            bracket.innerHTML = "(";

            condition_body.appendChild(bracket);
        }
        else if (char === ")") {
            const bracket = document.createElement("span");
            bracket.style.height = "57px";
            bracket.style.marginTop = "-5px";
            bracket.style.fontSize = "65px";
            bracket.style.color = "#FFFFFF";
            bracket.innerHTML = ")";

            condition_body.appendChild(bracket);
        }
        else if (char === "[") {
            nesting++;

            parsing = true;
        }
        else {
            condition_element += char;
        }
    }
};

function close_endpoint_dialog() {
    const endpoint_dialog = document.getElementById("endpoint-selection").parentNode;
    endpoint_dialog.parentNode.removeChild(endpoint_dialog);
};

function close_comparator_dialog() {
    const comparator_dialog = document.getElementById("comparator-selection").parentNode;
    comparator_dialog.parentNode.removeChild(comparator_dialog);
};

function close_logic_gate_dialog() {
    const logic_gate_dialog = document.getElementById("logic-gate-selection").parentNode;
    logic_gate_dialog.parentNode.removeChild(logic_gate_dialog);
};

function close_direction_dialog() {
    const direction_dialog = document.getElementById("direction-selection").parentNode;
    direction_dialog.parentNode.removeChild(direction_dialog);
};

function close_entity_type_dialog() {
    const entity_type_dialog = document.getElementById("entity-type-selection").parentNode;
    entity_type_dialog.parentNode.removeChild(entity_type_dialog);
};

function selected_endpoint(value_wrapper, endpoint_element) {
    const clone = endpoint_element.cloneNode(true);
    clone.setAttribute("data-id", clone.getAttribute("data-id").replace("-clone", ""));
    clone.style.marginTop = "3px";

    const clone_id = clone.getAttribute("data-id");
    
    value_wrapper.childNodes[0].childNodes[0].innerHTML = endpoints[clone_id]["group"];
    
    value_wrapper.removeChild(value_wrapper.childNodes[1]);
    value_wrapper.appendChild(clone);

    /* Endpoint */
    value_wrapper.childNodes[0].childNodes[1].style.border = "1px solid #88FF88";
    value_wrapper.childNodes[0].childNodes[1].style.color = "#88FF88";
    
    /* Input */
    value_wrapper.childNodes[0].childNodes[2].style.border = "1px solid #FF8888";
    value_wrapper.childNodes[0].childNodes[2].style.color = "#FF8888";
};

function selected_comparator(comparator_wrapper, comparator_element) {
    const clone = comparator_element.cloneNode(true);
    clone.style.marginTop = "15px";
    clone.style.marginRight = "5px";
    clone.style.marginBottom = "0px";

    if (Number(comparator_wrapper.childNodes[1].childNodes[1].getAttribute("parsing-type")) === 1) {
        comparator_wrapper.insertBefore(clone, comparator_wrapper.childNodes[2]);
        comparator_wrapper.removeChild(comparator_wrapper.childNodes[3]);
    }
    else if (Number(comparator_wrapper.childNodes[1].childNodes[1].getAttribute("parsing-type")) === 2) {
        comparator_wrapper.insertBefore(clone, comparator_wrapper.childNodes[5]);
        comparator_wrapper.removeChild(comparator_wrapper.childNodes[6]);
    }
    else if (Number(comparator_wrapper.childNodes[1].childNodes[1].getAttribute("parsing-type")) === 3) {
        comparator_wrapper.insertBefore(clone, comparator_wrapper.childNodes[4]);
        comparator_wrapper.removeChild(comparator_wrapper.childNodes[5]);
    }

    clone.addEventListener("click", show_comparator_dialog, false);
};

function selected_logic_gate(logic_gate, logic_gate_element) {
    const clone = logic_gate_element.cloneNode(true);
    clone.style.marginTop = "auto";
    clone.style.marginBottom = "auto";
    clone.style.marginLeft = "5px";
    clone.style.marginRight = "5px";
    clone.addEventListener("click", show_logic_gate_dialog, false);
    
    logic_gate.parentNode.insertBefore(clone, logic_gate);
    logic_gate.parentNode.removeChild(logic_gate);
};

function selected_direction(direction, direction_element) {
    const clone = direction_element.cloneNode(true);
    clone.style.marginTop = "15px";
    clone.style.marginRight = "5px";
    clone.style.marginBottom = "0px";
    clone.addEventListener("click", show_direction_dialog, false);

    direction.parentNode.insertBefore(clone, direction);
    direction.parentNode.removeChild(direction);

    if (clone.childNodes[1].innerHTML === "TOWARDS") {
        clone.parentNode.childNodes[6].childNodes[0].childNodes[0].innerHTML = clone.parentNode.childNodes[1].childNodes[0].innerHTML;
        clone.parentNode.childNodes[6].childNodes[1].setAttribute("endpoint-type", clone.parentNode.childNodes[1].childNodes[1].getAttribute("endpoint-type"));
    }
    else if (clone.childNodes[1].innerHTML === "FROM") {
        if (clone.parentNode.childNodes[3].childNodes[1].innerHTML === "ALLIANCE") {
            clone.parentNode.childNodes[6].childNodes[0].childNodes[0].innerHTML = "Alliance > Standing";
            clone.parentNode.childNodes[6].childNodes[1].setAttribute("endpoint-type", "alliance");
        }
        else if (clone.parentNode.childNodes[3].childNodes[1].innerHTML === "CORPORATION") {
            clone.parentNode.childNodes[6].childNodes[0].childNodes[0].innerHTML = "Corporation > Standing";
            clone.parentNode.childNodes[6].childNodes[1].setAttribute("endpoint-type", "corporation");
        }
        else if (clone.parentNode.childNodes[3].childNodes[1].innerHTML === "CHARACTER") {
            clone.parentNode.childNodes[6].childNodes[0].childNodes[0].innerHTML = "Character > Standing";
            clone.parentNode.childNodes[6].childNodes[1].setAttribute("endpoint-type", "character");
        }
    }
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
        clone.parentNode.childNodes[4].childNodes[0].childNodes[0].innerHTML = "Alliance";
        clone.parentNode.childNodes[4].childNodes[1].setAttribute("endpoint-type", "alliance");

        if (clone.parentNode.childNodes[2].childNodes[1].innerHTML === "FROM") {
            clone.parentNode.childNodes[6].childNodes[0].childNodes[0].innerHTML = "Alliance > Standing";
            clone.parentNode.childNodes[6].childNodes[1].setAttribute("endpoint-type", "alliance");
        }
    }
    else if (clone.childNodes[1].innerHTML === "CORPORATION") {
        clone.parentNode.childNodes[4].childNodes[0].childNodes[0].innerHTML = "Corporation";
        clone.parentNode.childNodes[4].childNodes[1].setAttribute("endpoint-type", "corporation");

        if (clone.parentNode.childNodes[2].childNodes[1].innerHTML === "FROM") {
            clone.parentNode.childNodes[6].childNodes[0].childNodes[0].innerHTML = "Corporation > Standing";
            clone.parentNode.childNodes[6].childNodes[1].setAttribute("endpoint-type", "corporation");
        }
    }
    else if (clone.childNodes[1].innerHTML === "CHARACTER") {
        clone.parentNode.childNodes[4].childNodes[0].childNodes[0].innerHTML = "Character";
        clone.parentNode.childNodes[4].childNodes[1].setAttribute("endpoint-type", "character");

        if (clone.parentNode.childNodes[2].childNodes[1].innerHTML === "FROM") {
            clone.parentNode.childNodes[6].childNodes[0].childNodes[0].innerHTML = "Character > Standing";
            clone.parentNode.childNodes[6].childNodes[1].setAttribute("endpoint-type", "character");
        }
    }
};

function selected_input() {
    const value_wrapper = this.parentNode.parentNode;

    const clone = value_wrapper.parentNode.childNodes[1].childNodes[1];
    const clone_id = clone.getAttribute("data-id");
    const clone_endpoint = clone.getAttribute("endpoint-type");
    const clone_type = clone.getElementsByClassName("data-type")[0].getAttribute("data-type");
    const clone_type_text = clone.getElementsByClassName("data-type")[0].innerHTML;
    const clone_text = clone.getElementsByClassName("element-name")[0].innerHTML;
    
    const value = document.createElement("div");
    value.className = "flex-row flex-static toolbox-element";
    value.setAttribute("endpoint-type", clone_endpoint);
    value.style.marginTop = "3px";

    const value_symbol = document.createElement("span");
    value_symbol.className = "data-type";
    value_symbol.setAttribute("data-type", clone_type);
    value_symbol.innerHTML = clone_type_text;

    let value_input;

    if (clone_type === "number") {
        value_input = document.createElement("input");
        value_input.type = "number";
        value_input.placeholder = clone_text;

        if (!endpoints[clone_id]["integer"]) {
            if ("step" in endpoints[clone_id]) {
                value_input.step = String(endpoints[clone_id]["step"]).replace(",", ".");
            }
        }

        if ("max" in endpoints[clone_id]) {
            value_input.max = String(endpoints[clone_id]["max"]).replace(",", ".");
        }

        if ("min" in endpoints[clone_id]) {
            value_input.min = String(endpoints[clone_id]["min"]).replace(",", ".");
        }
    }
    else if (clone_type === "string") {
        value_input = document.createElement("input");
        value_input.type = "text";
        value_input.placeholder = clone_text;

        if ("max_length" in endpoints[clone_id]) {
            value_input.maxLength = Number(endpoints[clone_id]["max_length"]);
        }

        if ("min_length" in endpoints[clone_id]) {
            value_input.minLength = Number(endpoints[clone_id]["min_length"]);
        }
    }
    else if (clone_type === "boolean") {
        value_input = document.createElement("select");

        const option_true = document.createElement("option");
        option_true.value = "true";
        option_true.innerHTML = "True";
        option_true.selected = true;

        const option_false = document.createElement("option");
        option_false.value = "false";
        option_false.innerHTML = "False";

        value_input.appendChild(option_true);
        value_input.appendChild(option_false);
    }

    value_input.required = true;
    value_input.style.height = "20px";
    value_input.style.width = "100%";
    value_input.style.marginTop = "-2px";
    value_input.style.marginLeft = "3px";
    value_input.style.paddingLeft = "5px";
    value_input.style.fontSize = "14px";
    value_input.style.fontWeight = "bold";

    value_wrapper.childNodes[0].childNodes[0].innerHTML = endpoints[clone_id]["group"];

    value_wrapper.removeChild(value_wrapper.childNodes[1]);

    value.appendChild(value_symbol);
    value.appendChild(value_input);
    value_wrapper.appendChild(value);
    
    /* Endpoint */
    value_wrapper.childNodes[0].childNodes[1].style.border = "1px solid #FF8888";
    value_wrapper.childNodes[0].childNodes[1].style.color = "#FF8888";
    
    /* Input */
    value_wrapper.childNodes[0].childNodes[2].style.border = "1px solid #88FF88";
    value_wrapper.childNodes[0].childNodes[2].style.color = "#88FF88";
};

function show_endpoint_dialog(event) {
    event.stopPropagation();
    
    if (document.getElementById("endpoint-selection") || document.getElementById("comparator-selection") || document.getElementById("logic-gate-selection") || document.getElementById("direction-selection") || document.getElementById("entity-type-selection")) {
        return;
    }

    const value_wrapper = this.parentNode.parentNode;
    const allowed_type = value_wrapper.childNodes[1].childNodes[0].getAttribute("data-type");

    const x_coord = event.pageX;
    const y_coord = event.pageY;
    
    const endpoint_dialog = document.createElement("div");
    endpoint_dialog.className = "with-border";
    endpoint_dialog.style.position = "absolute";
    endpoint_dialog.style.top = y_coord + "px";
    endpoint_dialog.style.left = x_coord + "px";
    endpoint_dialog.style.maxHeight = "500px";
    
    const endpoint_selection = document.getElementById("toolbox").cloneNode(true);
    endpoint_selection.id = "endpoint-selection";

    /* Rename data-id. */
    Array.prototype.forEach.call(endpoint_selection.querySelectorAll("[data-id]"), function (endpoint) {
        endpoint.setAttribute("data-id", endpoint.getAttribute("data-id") + "-clone");
    });

    /* Rename target. */
    Array.prototype.forEach.call(endpoint_selection.querySelectorAll("[target]"), function (endpoint) {
        endpoint.setAttribute("target", endpoint.getAttribute("target") + "-clone");
    });

    let removal_list = [];

    /* Get list of endpoints with wrong parsing-type or data-type. */
    Array.prototype.forEach.call(endpoint_selection.getElementsByClassName("toolbox-element"), function (endpoint) {
        if (Number(endpoint.getAttribute("parsing-type")) !== 1 || endpoint.childNodes[0].getAttribute("data-type") !== allowed_type) {
            removal_list.push(endpoint.getAttribute("data-id"));
        }
    });

    /* Remove endpoints with wrong parsing-type or data-type. */
    for (let i = 0; i < removal_list.length; i++) {
        const endpoint = endpoint_selection.querySelectorAll("[data-id=" + removal_list[i] + "]")[0];
        endpoint.parentNode.removeChild(endpoint);
    }

    removal_list = [];

    /* Get list of endpoint groups without endpoints. */
    Array.prototype.forEach.call(endpoint_selection.getElementsByClassName("toolbox-group"), function (endpoint_group) {
        if (endpoint_group.childNodes.length === 0) {
            removal_list.push(endpoint_group.getAttribute("data-id"));
        }
    });

    /* Remove endpoint groups without endpoints. Also removes their headers. */
    for (let i = 0; i < removal_list.length; i++) {
        const endpoint_group = endpoint_selection.querySelectorAll("[data-id=" + removal_list[i] + "]")[0];
        endpoint_group.parentNode.removeChild(endpoint_group);

        const endpoint_group_header = endpoint_selection.querySelectorAll("[target=" + removal_list[i] + "]")[0];
        endpoint_group_header.parentNode.removeChild(endpoint_group_header);
    }

    /* Add click event to expand and collapse endpoint groups. */
    Array.prototype.forEach.call(endpoint_selection.getElementsByClassName("toolbox-header"), function (header) {
        header.addEventListener("click", show_or_hide_toolbox_group, false);
    });
    
    /* Add click event to select an endpoint. */
    Array.prototype.forEach.call(endpoint_selection.getElementsByClassName("toolbox-element"), function (element) {
        element.addEventListener(
            "click",
            function () {
                selected_endpoint(value_wrapper, this);

                close_endpoint_dialog();
            },
            false
        );
    });
    
    endpoint_dialog.appendChild(endpoint_selection);
    document.body.appendChild(endpoint_dialog);
};

function show_comparator_dialog(event) {
    event.stopPropagation();

    if (document.getElementById("endpoint-selection") || document.getElementById("comparator-selection") || document.getElementById("logic-gate-selection") || document.getElementById("direction-selection") || document.getElementById("entity-type-selection")) {
        return;
    }

    const endpoint_wrapper = this.parentNode;
    const allowed_type = this.nextSibling.childNodes[1].childNodes[0].getAttribute("data-type");

    const x_coord = event.pageX;
    const y_coord = event.pageY;

    const comparator_dialog = document.createElement("div");
    comparator_dialog.className = "with-border";
    comparator_dialog.style.position = "absolute";
    comparator_dialog.style.top = y_coord + "px";
    comparator_dialog.style.left = x_coord + "px";
    comparator_dialog.style.maxHeight = "500px";

    const comparator_selection = document.getElementById("toolbox").cloneNode(false);
    comparator_selection.id = "comparator-selection";

    const comparator_selection_wrapper = document.createElement("div");
    comparator_selection_wrapper.className = "flex-column flex-static";
    
    /* IS */
    const comparator_is = document.createElement("div");
    comparator_is.className = "flex-row flex-static toolbox-element";
    comparator_is.setAttribute("data-id", "te-comparators-is");
    comparator_is.setAttribute("endpoint-type", "comparator");
    comparator_is.style.marginBottom = "3px";

    const comparator_is_symbol = document.createElement("span");
    comparator_is_symbol.className = "data-type";
    comparator_is_symbol.setAttribute("data-type", "comparator");
    comparator_is_symbol.innerHTML = "=";

    const comparator_is_text = document.createElement("span");
    comparator_is_text.className = "element-name";
    comparator_is_text.innerHTML = "IS";

    comparator_is.appendChild(comparator_is_symbol);
    comparator_is.appendChild(comparator_is_text);
    comparator_selection_wrapper.appendChild(comparator_is);

    /* IS NOT */
    const comparator_is_not = document.createElement("div");
    comparator_is_not.className = "flex-row flex-static toolbox-element";
    comparator_is_not.setAttribute("data-id", "te-comparators-is_not");
    comparator_is_not.setAttribute("endpoint-type", "comparator");
    comparator_is_not.style.marginBottom = "3px";

    const comparator_is_not_symbol = document.createElement("span");
    comparator_is_not_symbol.className = "data-type";
    comparator_is_not_symbol.setAttribute("data-type", "comparator");
    comparator_is_not_symbol.innerHTML = "!=";

    const comparator_is_not_text = document.createElement("span");
    comparator_is_not_text.className = "element-name";
    comparator_is_not_text.innerHTML = "IS NOT";

    comparator_is_not.appendChild(comparator_is_not_symbol);
    comparator_is_not.appendChild(comparator_is_not_text);
    comparator_selection_wrapper.appendChild(comparator_is_not);

    if (allowed_type === "number") {
        /* GREATER OR EQUAL */
        const comparator_greater_or_equal = document.createElement("div");
        comparator_greater_or_equal.className = "flex-row flex-static toolbox-element";
        comparator_greater_or_equal.setAttribute("data-id", "te-comparators-greater_or_equal");
        comparator_greater_or_equal.setAttribute("endpoint-type", "comparator");
        comparator_greater_or_equal.style.marginBottom = "3px";

        const comparator_greater_or_equal_symbol = document.createElement("span");
        comparator_greater_or_equal_symbol.className = "data-type";
        comparator_greater_or_equal_symbol.setAttribute("data-type", "comparator");
        comparator_greater_or_equal_symbol.innerHTML = ">=";

        const comparator_greater_or_equal_text = document.createElement("span");
        comparator_greater_or_equal_text.className = "element-name";
        comparator_greater_or_equal_text.innerHTML = "GREATER OR EQUAL";

        comparator_greater_or_equal.appendChild(comparator_greater_or_equal_symbol);
        comparator_greater_or_equal.appendChild(comparator_greater_or_equal_text);
        comparator_selection_wrapper.appendChild(comparator_greater_or_equal);

        /* GREATER */
        const comparator_greater = document.createElement("div");
        comparator_greater.className = "flex-row flex-static toolbox-element";
        comparator_greater.setAttribute("data-id", "te-comparators-greater");
        comparator_greater.setAttribute("endpoint-type", "comparator");
        comparator_greater.style.marginBottom = "3px";

        const comparator_greater_symbol = document.createElement("span");
        comparator_greater_symbol.className = "data-type";
        comparator_greater_symbol.setAttribute("data-type", "comparator");
        comparator_greater_symbol.innerHTML = ">";

        const comparator_greater_text = document.createElement("span");
        comparator_greater_text.className = "element-name";
        comparator_greater_text.innerHTML = "GREATER";

        comparator_greater.appendChild(comparator_greater_symbol);
        comparator_greater.appendChild(comparator_greater_text);
        comparator_selection_wrapper.appendChild(comparator_greater);

        /* LESS */
        const comparator_less = document.createElement("div");
        comparator_less.className = "flex-row flex-static toolbox-element";
        comparator_less.setAttribute("data-id", "te-comparators-less");
        comparator_less.setAttribute("endpoint-type", "comparator");
        comparator_less.style.marginBottom = "3px";

        const comparator_less_symbol = document.createElement("span");
        comparator_less_symbol.className = "data-type";
        comparator_less_symbol.setAttribute("data-type", "comparator");
        comparator_less_symbol.innerHTML = "<";

        const comparator_less_text = document.createElement("span");
        comparator_less_text.className = "element-name";
        comparator_less_text.innerHTML = "LESS";

        comparator_less.appendChild(comparator_less_symbol);
        comparator_less.appendChild(comparator_less_text);
        comparator_selection_wrapper.appendChild(comparator_less);

        /* LESS OR EQUAL */
        const comparator_less_or_equal = document.createElement("div");
        comparator_less_or_equal.className = "flex-row flex-static toolbox-element";
        comparator_less_or_equal.setAttribute("data-id", "te-comparators-less_or_equal");
        comparator_less_or_equal.setAttribute("endpoint-type", "comparator");
        comparator_less_or_equal.style.marginBottom = "3px";

        const comparator_less_or_equal_symbol = document.createElement("span");
        comparator_less_or_equal_symbol.className = "data-type";
        comparator_less_or_equal_symbol.setAttribute("data-type", "comparator");
        comparator_less_or_equal_symbol.innerHTML = "<=";

        const comparator_less_or_equal_text = document.createElement("span");
        comparator_less_or_equal_text.className = "element-name";
        comparator_less_or_equal_text.innerHTML = "LESS OR EQUAL";

        comparator_less_or_equal.appendChild(comparator_less_or_equal_symbol);
        comparator_less_or_equal.appendChild(comparator_less_or_equal_text);
        comparator_selection_wrapper.appendChild(comparator_less_or_equal);
    }
    else if (allowed_type === "string") {
        /* CONTAINS */
        const comparator_contains = document.createElement("div");
        comparator_contains.className = "flex-row flex-static toolbox-element";
        comparator_contains.setAttribute("data-id", "te-comparators-contains");
        comparator_contains.setAttribute("endpoint-type", "comparator");
        comparator_contains.style.marginBottom = "3px";

        const comparator_contains_symbol = document.createElement("span");
        comparator_contains_symbol.className = "data-type";
        comparator_contains_symbol.setAttribute("data-type", "comparator");
        comparator_contains_symbol.innerHTML = "*";

        const comparator_contains_text = document.createElement("span");
        comparator_contains_text.className = "element-name";
        comparator_contains_text.innerHTML = "CONTAINS";

        comparator_contains.appendChild(comparator_contains_symbol);
        comparator_contains.appendChild(comparator_contains_text);
        comparator_selection_wrapper.appendChild(comparator_contains);

        /* CONTAINS NOT */
        const comparator_contains_not = document.createElement("div");
        comparator_contains_not.className = "flex-row flex-static toolbox-element";
        comparator_contains_not.setAttribute("data-id", "te-comparators-contains_not");
        comparator_contains_not.setAttribute("endpoint-type", "comparator");
        comparator_contains_not.style.marginBottom = "3px";

        const comparator_contains_not_symbol = document.createElement("span");
        comparator_contains_not_symbol.className = "data-type";
        comparator_contains_not_symbol.setAttribute("data-type", "comparator");
        comparator_contains_not_symbol.innerHTML = "!*";

        const comparator_contains_not_text = document.createElement("span");
        comparator_contains_not_text.className = "element-name";
        comparator_contains_not_text.innerHTML = "CONTAINS NOT";

        comparator_contains_not.appendChild(comparator_contains_not_symbol);
        comparator_contains_not.appendChild(comparator_contains_not_text);
        comparator_selection_wrapper.appendChild(comparator_contains_not);
    }
    else if (allowed_type === "boolean") {
        /* No special comparators. */
    }
    
    comparator_selection.appendChild(comparator_selection_wrapper);

    /* Add click event to select a comparator. */
    Array.prototype.forEach.call(comparator_selection.getElementsByClassName("toolbox-element"), function (element) {
        element.addEventListener(
            "click",
            function () {
                selected_comparator(endpoint_wrapper, this);

                close_comparator_dialog();
            },
            false
        );
    });
    
    comparator_dialog.appendChild(comparator_selection);
    document.body.appendChild(comparator_dialog);
};

function show_logic_gate_dialog(event) {
    event.stopPropagation();

    if (document.getElementById("endpoint-selection") || document.getElementById("comparator-selection") || document.getElementById("logic-gate-selection") || document.getElementById("direction-selection") || document.getElementById("entity-type-selection")) {
        return;
    }

    const old_logic_gate = this;

    const x_coord = event.pageX;
    const y_coord = event.pageY;

    const logic_gate = document.createElement("div");
    logic_gate.className = "with-border";
    logic_gate.style.position = "absolute";
    logic_gate.style.top = y_coord + "px";
    logic_gate.style.left = x_coord + "px";
    logic_gate.style.maxHeight = "500px";

    const logic_gate_selection = document.getElementById("toolbox").cloneNode(false);
    logic_gate_selection.id = "logic-gate-selection";

    const logic_gate_selection_wrapper = document.createElement("div");
    logic_gate_selection_wrapper.className = "flex-column flex-static";

    /* AND */
    const logic_gate_and = document.createElement("div");
    logic_gate_and.className = "flex-row flex-static toolbox-element";
    logic_gate_and.title = "AND - GATE\\nIf all conditions are true, the result will be true.\\n\\nA\\tB\\tRESULT\\n0\\t0\\t0\\n0\\t1\\t0\\n1\\t0\\t0\\n1\\t1\\t1";
    logic_gate_and.setAttribute("data-id", "te-logic-gates-and");
    logic_gate_and.setAttribute("endpoint-type", "logic");
    logic_gate_and.style.marginBottom = "3px";

    const logic_gate_and_symbol = document.createElement("span");
    logic_gate_and_symbol.className = "data-type";
    logic_gate_and_symbol.setAttribute("data-type", "logic");
    logic_gate_and_symbol.innerHTML = "&";

    const logic_gate_and_text = document.createElement("span");
    logic_gate_and_text.className = "element-name";
    logic_gate_and_text.innerHTML = "AND";

    logic_gate_and.appendChild(logic_gate_and_symbol);
    logic_gate_and.appendChild(logic_gate_and_text);
    logic_gate_selection_wrapper.appendChild(logic_gate_and);

    /* OR */
    const logic_gate_or = document.createElement("div");
    logic_gate_or.className = "flex-row flex-static toolbox-element";
    logic_gate_or.title = "OR - GATE\\nIf one of the conditions is true, the result will be true.\\n\\nA\\tB\\tRESULT\\n0\\t0\\t0\\n0\\t1\\t1\\n1\\t0\\t1\\n1\\t1\\t1";
    logic_gate_or.setAttribute("data-id", "te-logic-gates-or");
    logic_gate_or.setAttribute("endpoint-type", "logic");
    logic_gate_or.style.marginBottom = "3px";

    const logic_gate_or_symbol = document.createElement("span");
    logic_gate_or_symbol.className = "data-type";
    logic_gate_or_symbol.setAttribute("data-type", "logic");
    logic_gate_or_symbol.innerHTML = "|";

    const logic_gate_or_text = document.createElement("span");
    logic_gate_or_text.className = "element-name";
    logic_gate_or_text.innerHTML = "OR";

    logic_gate_or.appendChild(logic_gate_or_symbol);
    logic_gate_or.appendChild(logic_gate_or_text);
    logic_gate_selection_wrapper.appendChild(logic_gate_or);

    /* NAND */
    const logic_gate_nand = document.createElement("div");
    logic_gate_nand.className = "flex-row flex-static toolbox-element";
    logic_gate_nand.title = "NOT AND - GATE\\nAs long as not all conditions are true, the result will be true.\\n\\nA\\tB\\tRESULT\\n0\\t0\\t1\\n0\\t1\\t1\\n1\\t0\\t1\\n1\\t1\\t0";
    logic_gate_nand.setAttribute("data-id", "te-logic-gates-nand");
    logic_gate_nand.setAttribute("endpoint-type", "logic");
    logic_gate_nand.style.marginBottom = "3px";

    const logic_gate_nand_symbol = document.createElement("span");
    logic_gate_nand_symbol.className = "data-type";
    logic_gate_nand_symbol.setAttribute("data-type", "logic");
    logic_gate_nand_symbol.innerHTML = "!&";

    const logic_gate_nand_text = document.createElement("span");
    logic_gate_nand_text.className = "element-name";
    logic_gate_nand_text.innerHTML = "NAND";

    logic_gate_nand.appendChild(logic_gate_nand_symbol);
    logic_gate_nand.appendChild(logic_gate_nand_text);
    logic_gate_selection_wrapper.appendChild(logic_gate_nand);

    /* NOR */
    const logic_gate_nor = document.createElement("div");
    logic_gate_nor.className = "flex-row flex-static toolbox-element";
    logic_gate_nor.title = "NOT OR - GATE\\nIf all conditions are false, the result will be true.\\n\\nA\\tB\\tRESULT\\n0\\t0\\t1\\n0\\t1\\t0\\n1\\t0\\t0\\n1\\t1\\t0";
    logic_gate_nor.setAttribute("data-id", "te-logic-gates-nor");
    logic_gate_nor.setAttribute("endpoint-type", "logic");
    logic_gate_nor.style.marginBottom = "3px";

    const logic_gate_nor_symbol = document.createElement("span");
    logic_gate_nor_symbol.className = "data-type";
    logic_gate_nor_symbol.setAttribute("data-type", "logic");
    logic_gate_nor_symbol.innerHTML = "!|";

    const logic_gate_nor_text = document.createElement("span");
    logic_gate_nor_text.className = "element-name";
    logic_gate_nor_text.innerHTML = "NOR";

    logic_gate_nor.appendChild(logic_gate_nor_symbol);
    logic_gate_nor.appendChild(logic_gate_nor_text);
    logic_gate_selection_wrapper.appendChild(logic_gate_nor);

    /* XOR */
    const logic_gate_xor = document.createElement("div");
    logic_gate_xor.className = "flex-row flex-static toolbox-element";
    logic_gate_xor.title = "EXCLUSIVE OR - GATE\\nAs long as not all conditions are either true or false, the result will be true.\\n\\nA\\tB\\tRESULT\\n0\\t0\\t0\\n0\\t1\\t1\\n1\\t0\\t1\\n1\\t1\\t0";
    logic_gate_xor.setAttribute("data-id", "te-logic-gates-xor");
    logic_gate_xor.setAttribute("endpoint-type", "logic");
    logic_gate_xor.style.marginBottom = "3px";

    const logic_gate_xor_symbol = document.createElement("span");
    logic_gate_xor_symbol.className = "data-type";
    logic_gate_xor_symbol.setAttribute("data-type", "logic");
    logic_gate_xor_symbol.innerHTML = "x|";

    const logic_gate_xor_text = document.createElement("span");
    logic_gate_xor_text.className = "element-name";
    logic_gate_xor_text.innerHTML = "XOR";

    logic_gate_xor.appendChild(logic_gate_xor_symbol);
    logic_gate_xor.appendChild(logic_gate_xor_text);
    logic_gate_selection_wrapper.appendChild(logic_gate_xor);

    /* XNOR */
    const logic_gate_xnor = document.createElement("div");
    logic_gate_xnor.className = "flex-row flex-static toolbox-element";
    logic_gate_xnor.title = "EXCLUSIVE NOT OR - GATE\\nAs long as all conditions are either true or false, the result will be true.\\n\\nA\\tB\\tRESULT\\n0\\t0\\t1\\n0\\t1\\t0\\n1\\t0\\t0\\n1\\t1\\t1";
    logic_gate_xnor.setAttribute("data-id", "te-logic-gates-xnor");
    logic_gate_xnor.setAttribute("endpoint-type", "logic");
    logic_gate_xnor.style.marginBottom = "3px";

    const logic_gate_xnor_symbol = document.createElement("span");
    logic_gate_xnor_symbol.className = "data-type";
    logic_gate_xnor_symbol.setAttribute("data-type", "logic");
    logic_gate_xnor_symbol.innerHTML = "x!|";

    const logic_gate_xnor_text = document.createElement("span");
    logic_gate_xnor_text.className = "element-name";
    logic_gate_xnor_text.innerHTML = "XNOR";

    logic_gate_xnor.appendChild(logic_gate_xnor_symbol);
    logic_gate_xnor.appendChild(logic_gate_xnor_text);
    logic_gate_selection_wrapper.appendChild(logic_gate_xnor);

    logic_gate_selection.appendChild(logic_gate_selection_wrapper);

    /* Add click event to select a logic gate. */
    Array.prototype.forEach.call(logic_gate_selection.getElementsByClassName("toolbox-element"), function (element) {
        element.addEventListener(
            "click",
            function () {
                selected_logic_gate(old_logic_gate, this);

                close_logic_gate_dialog();
            },
            false
        );
    });
    
    logic_gate.appendChild(logic_gate_selection);
    document.body.appendChild(logic_gate);
};

function show_direction_dialog(event) {
    event.stopPropagation();

    if (document.getElementById("endpoint-selection") || document.getElementById("comparator-selection") || document.getElementById("logic-gate-selection") || document.getElementById("direction-selection") || document.getElementById("entity-type-selection")) {
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

    if (document.getElementById("endpoint-selection") || document.getElementById("comparator-selection") || document.getElementById("logic-gate-selection") || document.getElementById("direction-selection") || document.getElementById("entity-type-selection")) {
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

    const is_ticker = this.parentNode.childNodes[1].childNodes[1].getAttribute("data-id").endsWith("-ticker");

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

function clicked_bracket_left_add() {
    const endpoint = this.parentNode.parentNode;

    const bracket = document.createElement("span");
    bracket.style.height = "57px";
    bracket.style.marginTop = "-5px";
    bracket.style.fontSize = "65px";
    bracket.style.color = "#FFFFFF";
    bracket.innerHTML = "(";

    endpoint.parentNode.insertBefore(bracket, endpoint);
};

function clicked_bracket_right_add() {
    const endpoint = this.parentNode.parentNode;

    const bracket = document.createElement("span");
    bracket.style.height = "57px";
    bracket.style.marginTop = "-5px";
    bracket.style.fontSize = "65px";
    bracket.style.color = "#FFFFFF";
    bracket.innerHTML = ")";

    endpoint.parentNode.insertBefore(bracket, endpoint.nextSibling);
};

function clicked_bracket_left_remove() {
    const endpoint = this.parentNode.parentNode;

    if (!endpoint.previousSibling) {
        return;
    }

    if (endpoint.previousSibling.innerHTML === "(") {
        endpoint.parentNode.removeChild(endpoint.previousSibling);
    }
};

function clicked_bracket_right_remove() {
    const endpoint = this.parentNode.parentNode;

    if (!endpoint.nextSibling) {
        return;
    }

    if (endpoint.nextSibling.innerHTML === ")") {
        endpoint.parentNode.removeChild(endpoint.nextSibling);
    }
};

function clicked_command_remove() {
    const endpoint = this.parentNode.parentNode.parentNode;

    while (endpoint.previousSibling && endpoint.previousSibling.innerHTML === "(") {
        endpoint.parentNode.removeChild(endpoint.previousSibling);
    }

    while (endpoint.nextSibling && endpoint.nextSibling.innerHTML === ")") {
        endpoint.parentNode.removeChild(endpoint.nextSibling);
    }

    if (endpoint.previousSibling && endpoint.previousSibling.getAttribute("endpoint-type") === "logic") {
        endpoint.parentNode.removeChild(endpoint.previousSibling);
    }

    if (!endpoint.previousSibling && endpoint.nextSibling && endpoint.nextSibling.getAttribute("endpoint-type") === "logic") {
        endpoint.parentNode.removeChild(endpoint.nextSibling);
    }

    endpoint.parentNode.removeChild(endpoint);
};

function clicked_command_move_left() {
    const endpoint = this.parentNode.parentNode.parentNode;
    
    let previousSibling = undefined;

    for (let element = endpoint.previousSibling; element; element = element.previousSibling) {
        if (element.className.includes("area")) {
            previousSibling = element;

            break;
        }
    }

    if (!previousSibling) {
        return;
    }

    let secondPreviousSibling = undefined;
    let siblingCount = 0;

    for (let element = endpoint.previousSibling; element; element = element.previousSibling) {
        if (element.className.includes("area")) {
            siblingCount++;

            if (siblingCount === 2) {
                secondPreviousSibling = element;

                break;
            }
        }
    }

    let nextSibling = undefined;

    for (let element = endpoint.nextSibling; element; element = element.nextSibling) {
        if (element.className.includes("area")) {
            nextSibling = element;

            break;
        }
    }
    
    while (endpoint.previousSibling && endpoint.previousSibling.innerHTML === "(") {
        endpoint.parentNode.removeChild(endpoint.previousSibling);
    }

    while (endpoint.nextSibling && endpoint.nextSibling.innerHTML === ")") {
        endpoint.parentNode.removeChild(endpoint.nextSibling);
    }
    
    const logic_gate = endpoint.previousSibling;

    if (previousSibling && !secondPreviousSibling) {
        previousSibling.parentNode.insertBefore(logic_gate, previousSibling.parentNode.childNodes[0]);
        previousSibling.parentNode.insertBefore(endpoint, logic_gate);
    }
    else if (previousSibling && secondPreviousSibling) {
        for (let element = previousSibling.previousSibling; element; element = element.previousSibling) {
            if (element.getAttribute("endpoint-type") === "logic") {
                element.parentNode.insertBefore(logic_gate, element);
                previousSibling.parentNode.insertBefore(endpoint, element);

                break;
            }
        }
    }
};

function clicked_command_move_right() {
    const endpoint = this.parentNode.parentNode.parentNode;

    let nextSibling = undefined;

    for (let element = endpoint.nextSibling; element; element = element.nextSibling) {
        if (element.className.includes("area")) {
            nextSibling = element;

            break;
        }
    }

    if (!nextSibling) {
        return;
    }

    let previousSibling = undefined;

    for (let element = endpoint.previousSibling; element; element = element.previousSibling) {
        if (element.className.includes("area")) {
            previousSibling = element;

            break;
        }
    }

    while (endpoint.previousSibling && endpoint.previousSibling.innerHTML === "(") {
        endpoint.parentNode.removeChild(endpoint.previousSibling);
    }

    while (endpoint.nextSibling && endpoint.nextSibling.innerHTML === ")") {
        endpoint.parentNode.removeChild(endpoint.nextSibling);
    }
    
    if (previousSibling) {
        const logic_gate = endpoint.previousSibling;

        nextSibling.parentNode.insertBefore(logic_gate, nextSibling.nextSibling);
        nextSibling.parentNode.insertBefore(endpoint, logic_gate.nextSibling);
    }
    else {
        let logic_gate = endpoint.previousSibling;

        for (let element = nextSibling.previousSibling; element; element = element.previousSibling) {
            if (element.getAttribute("endpoint-type") === "logic") {
                logic_gate = element;
                break;
            }
        }

        let last_element = undefined;

        for (let element = nextSibling.nextSibling; element && element.innerHTML === ")"; element = element.previousSibling) {
            last_element = element;
        }

        if (!last_element) {
            last_element = nextSibling;
        }

        last_element.parentNode.insertBefore(logic_gate, last_element.nextSibling);
        last_element.parentNode.insertBefore(endpoint, logic_gate.nextSibling);
    }
};

function initialize_condition_area() {
    const condition_area = document.getElementById("condition-area");

    const condition_header = document.createElement("input");
    condition_header.type = "text";
    condition_header.className = "condition-header";
    condition_header.placeholder = "New Condition";
    condition_header.required = true;

    const condition_body = document.createElement("div");
    condition_body.className = "flex-row flex-static condition-body";
    condition_body.addEventListener(
        "dragover",
        function (event) {
            event.preventDefault();
        },
        false
    );
    condition_body.addEventListener(
        "drop",
        function (event) {
            event.preventDefault();

            const clone = document.querySelectorAll("[data-id=" + event.dataTransfer.getData("text") + "]")[0].cloneNode(true);
            const clone_id = clone.getAttribute("data-id");
            const clone_endpoint = clone.getAttribute("endpoint-type");
            const clone_type = clone.getElementsByClassName("data-type")[0].getAttribute("data-type");
            const clone_type_text = clone.getElementsByClassName("data-type")[0].innerHTML;
            const clone_text = clone.getElementsByClassName("element-name")[0].innerHTML;
            const clone_parsing_type = clone.getAttribute("parsing-type");

            if (this.childNodes.length > 0) {
                const logic_gate = document.createElement("div");
                logic_gate.className = "flex-row flex-static toolbox-element";
                logic_gate.setAttribute("data-id", "te-logic-gates-and");
                logic_gate.setAttribute("endpoint-type", "logic");
                logic_gate.style.marginTop = "auto";
                logic_gate.style.marginBottom = "auto";
                logic_gate.style.marginLeft = "5px";
                logic_gate.style.marginRight = "5px";
                logic_gate.addEventListener("click", show_logic_gate_dialog, false);

                const logic_gate_symbol = document.createElement("span");
                logic_gate_symbol.className = "data-type";
                logic_gate_symbol.setAttribute("data-type", "logic");
                logic_gate_symbol.innerHTML = "&";

                const logic_gate_text = document.createElement("span");
                logic_gate_text.className = "element-name";
                logic_gate_text.innerHTML = "AND";

                logic_gate.appendChild(logic_gate_symbol);
                logic_gate.appendChild(logic_gate_text);

                this.appendChild(logic_gate);
            }

            const comparation = document.createElement("div");
            comparation.className = "flex-row flex-static area";
            comparation.style.marginTop = "5px";
            comparation.style.marginBottom = "5px";
            comparation.style.background = "#555555";
            comparation.style.border = "solid 2px #000000";

            /* Left Brackets */
            const bg_wrapper_left = document.createElement("div");
            bg_wrapper_left.className = "flex-column flex-static";
            bg_wrapper_left.style.marginRight = "10px";

            const bracket_left_add = document.createElement("button");
            bracket_left_add.setAttribute("data-direction", "left");
            bracket_left_add.style.height = "12px";
            bracket_left_add.style.paddingTop = "0px";
            bracket_left_add.style.paddingBottom = "0px";
            bracket_left_add.style.paddingLeft = "2px";
            bracket_left_add.style.paddingRight = "2px";
            bracket_left_add.style.border = "solid 1px #88FF88";
            bracket_left_add.style.borderRadius = "2px";
            bracket_left_add.style.fontSize = "10px";
            bracket_left_add.style.color = "#88FF88";
            bracket_left_add.style.background = "#333333";
            bracket_left_add.innerHTML = "B";
            bracket_left_add.title = "Add one bracket on the left.";
            bracket_left_add.addEventListener("click", clicked_bracket_left_add, false);

            const bracket_left_remove = document.createElement("button");
            bracket_left_remove.setAttribute("data-direction", "left");
            bracket_left_remove.style.height = "12px";
            bracket_left_remove.style.marginTop = "auto";
            bracket_left_remove.style.paddingTop = "0px";
            bracket_left_remove.style.paddingBottom = "0px";
            bracket_left_remove.style.paddingLeft = "2px";
            bracket_left_remove.style.paddingRight = "2px";
            bracket_left_remove.style.border = "solid 1px #FF8888";
            bracket_left_remove.style.borderRadius = "2px";
            bracket_left_remove.style.fontSize = "10px";
            bracket_left_remove.style.color = "#FF8888";
            bracket_left_remove.style.background = "#333333";
            bracket_left_remove.innerHTML = "B";
            bracket_left_remove.title = "Remove one bracket on the left.";
            bracket_left_remove.addEventListener("click", clicked_bracket_left_remove, false);

            bg_wrapper_left.appendChild(bracket_left_add);
            bg_wrapper_left.appendChild(bracket_left_remove);
            comparation.appendChild(bg_wrapper_left);

            if (Number(clone_parsing_type) === 3) {
                /* Endpoint */
                const endpoint = document.createElement("div");
                endpoint.className = "flex-column flex-static";
                endpoint.style.marginRight = "5px";

                const header = document.createElement("span");
                header.style.marginBottom = "3px";
                header.style.fontSize = "12px";
                header.style.fontWeight = "normal";
                header.style.color = "#FFFFFF";
                header.innerHTML = endpoints[clone_id]["group"];

                endpoint.appendChild(header);
                endpoint.appendChild(clone);
                comparation.appendChild(endpoint);
                
                /* Target */
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
                comparation.appendChild(indicator);
                
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

                if (clone_endpoint === "faction") {
                    target_header.innerHTML = "Faction";
                }
                else if (clone_endpoint === "alliance") {
                    target_header.innerHTML = "Alliance";
                }
                else if (clone_endpoint === "corporation") {
                    target_header.innerHTML = "Corporation";
                }
                else if (clone_endpoint === "character") {
                    target_header.innerHTML = "Character";
                }

                header_target_wrapper.appendChild(target_header);

                /* Entity */
                const target = document.createElement("div");
                target.className = "flex-row flex-static toolbox-element";
                target.style.marginTop = "3px";
                target.setAttribute("endpoint-type", clone_endpoint);
                
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

                comparation.appendChild(wrapper_target);
                
                /* Comparator */
                const comparator = document.createElement("div");
                comparator.className = "flex-row flex-static toolbox-element";
                comparator.setAttribute("endpoint-type", "comparator");
                comparator.style.marginTop = "15px";
                comparator.style.marginRight = "5px";
                comparator.addEventListener("click", show_comparator_dialog, false);

                const comparator_symbol = document.createElement("span");
                comparator_symbol.className = "data-type";
                comparator_symbol.setAttribute("data-type", "comparator");
                comparator_symbol.innerHTML = "=";

                const comparator_text = document.createElement("span");
                comparator_text.className = "element-name";
                comparator_text.innerHTML = "IS";

                comparator.appendChild(comparator_symbol);
                comparator.appendChild(comparator_text);
                comparation.appendChild(comparator);

                /* Wrapper */
                const wrapper = document.createElement("div");
                wrapper.className = "flex-column flex-static";

                /* Header */
                const header_value_wrapper = document.createElement("div");
                header_value_wrapper.className = "flex-row flex-static";

                const value_header = document.createElement("span");
                value_header.style.marginLeft = "2px";
                value_header.style.marginRight = "auto";
                value_header.style.fontSize = "12px";
                value_header.style.fontWeight = "normal";
                value_header.style.color = "#FFFFFF";
                header_value_wrapper.appendChild(value_header);

                const command_move_left = document.createElement("button");
                command_move_left.style.height = "12px";
                command_move_left.style.marginLeft = "10px";
                command_move_left.style.paddingTop = "0px";
                command_move_left.style.paddingBottom = "0px";
                command_move_left.style.paddingLeft = "2px";
                command_move_left.style.paddingRight = "2px";
                command_move_left.style.border = "solid 1px #FFFFFF";
                command_move_left.style.borderRadius = "2px";
                command_move_left.style.fontSize = "10px";
                command_move_left.style.color = "#FFFFFF";
                command_move_left.style.background = "#333333";
                command_move_left.innerHTML = "<<";
                command_move_left.title = "Move this condition part to the left.";
                command_move_left.addEventListener("click", clicked_command_move_left, false);
                header_value_wrapper.appendChild(command_move_left);

                const command_move_right = document.createElement("button");
                command_move_right.style.height = "12px";
                command_move_right.style.marginLeft = "2px";
                command_move_right.style.paddingTop = "0px";
                command_move_right.style.paddingBottom = "0px";
                command_move_right.style.paddingLeft = "2px";
                command_move_right.style.paddingRight = "2px";
                command_move_right.style.border = "solid 1px #FFFFFF";
                command_move_right.style.borderRadius = "2px";
                command_move_right.style.fontSize = "10px";
                command_move_right.style.color = "#FFFFFF";
                command_move_right.style.background = "#333333";
                command_move_right.innerHTML = ">>";
                command_move_right.title = "Move this condition part to the right.";
                command_move_right.addEventListener("click", clicked_command_move_right, false);
                header_value_wrapper.appendChild(command_move_right);

                const command_remove = document.createElement("button");
                command_remove.style.height = "12px";
                command_remove.style.marginLeft = "5px";
                command_remove.style.marginRight = "1px";
                command_remove.style.paddingTop = "0px";
                command_remove.style.paddingBottom = "0px";
                command_remove.style.paddingLeft = "2px";
                command_remove.style.paddingRight = "2px";
                command_remove.style.border = "solid 1px #FF8888";
                command_remove.style.borderRadius = "2px";
                command_remove.style.fontSize = "10px";
                command_remove.style.color = "#FF8888";
                command_remove.style.background = "#333333";
                command_remove.innerHTML = "X";
                command_remove.title = "Remove this condition part.";
                command_remove.addEventListener("click", clicked_command_remove, false);
                header_value_wrapper.appendChild(command_remove);

                /* Value */
                const value = document.createElement("div");
                value.className = "flex-row flex-static toolbox-element";
                value.setAttribute("endpoint-type", clone_endpoint);
                value.style.marginTop = "3px";

                const value_symbol = document.createElement("span");
                value_symbol.className = "data-type";
                value_symbol.setAttribute("data-type", clone_type);
                value_symbol.innerHTML = clone_type_text;

                let value_input;

                if (clone_type === "number") {
                    value_input = document.createElement("input");
                    value_input.type = "number";
                    value_input.placeholder = clone_text;

                    if (!endpoints[clone_id]["integer"]) {
                        if ("step" in endpoints[clone_id]) {
                            value_input.step = String(endpoints[clone_id]["step"]).replace(",", ".");
                        }
                    }

                    if ("max" in endpoints[clone_id]) {
                        value_input.max = String(endpoints[clone_id]["max"]).replace(",", ".");
                    }

                    if ("min" in endpoints[clone_id]) {
                        value_input.min = String(endpoints[clone_id]["min"]).replace(",", ".");
                    }
                }
                else if (clone_type === "string") {
                    value_input = document.createElement("input");
                    value_input.type = "text";
                    value_input.placeholder = clone_text;

                    if ("max_length" in endpoints[clone_id]) {
                        value_input.maxLength = Number(endpoints[clone_id]["max_length"]);
                    }

                    if ("min_length" in endpoints[clone_id]) {
                        value_input.minLength = Number(endpoints[clone_id]["min_length"]);
                    }
                }
                else if (clone_type === "boolean") {
                    value_input = document.createElement("select");

                    const option_true = document.createElement("option");
                    option_true.value = "true";
                    option_true.innerHTML = "True";
                    option_true.selected = true;

                    const option_false = document.createElement("option");
                    option_false.value = "false";
                    option_false.innerHTML = "False";

                    value_input.appendChild(option_true);
                    value_input.appendChild(option_false);
                }

                value_input.required = true;
                value_input.style.height = "20px";
                value_input.style.width = "100%";
                value_input.style.marginTop = "-2px";
                value_input.style.marginLeft = "3px";
                value_input.style.paddingLeft = "5px";
                value_input.style.fontSize = "14px";
                value_input.style.fontWeight = "bold";

                value.appendChild(value_symbol);
                value.appendChild(value_input);

                wrapper.appendChild(header_value_wrapper);
                wrapper.appendChild(value);

                comparation.appendChild(wrapper);
            }
            else if (Number(clone_parsing_type) === 2) {
                /* Endpoint */
                const endpoint = document.createElement("div");
                endpoint.className = "flex-column flex-static";
                endpoint.style.marginRight = "5px";

                const header = document.createElement("span");
                header.style.marginBottom = "3px";
                header.style.fontSize = "12px";
                header.style.fontWeight = "normal";
                header.style.color = "#FFFFFF";
                header.innerHTML = endpoints[clone_id]["group"];

                if (!clone_id.endsWith("-has_standing")) {
                    clone.getElementsByClassName("element-name")[0].innerHTML = "Standing";
                }

                endpoint.appendChild(header);
                endpoint.appendChild(clone);
                comparation.appendChild(endpoint);

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
                comparation.appendChild(direction);

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
                comparation.appendChild(entity_type);

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
                entity.setAttribute("endpoint-type", "alliance");
                entity.style.marginTop = "3px";
                
                const entity_symbol = document.createElement("span");
                entity_symbol.className = "data-type";

                if (clone_id.endsWith("-id")) {
                    entity_symbol.setAttribute("data-type", "number");
                    entity_symbol.innerHTML = "N";
                }
                else if (clone_id.endsWith("-name") || clone_id.endsWith("-ticker")) {
                    entity_symbol.setAttribute("data-type", "string");
                    entity_symbol.innerHTML = "S";
                }
                else {
                    entity_symbol.setAttribute("data-type", "string");
                    entity_symbol.innerHTML = "S";
                }

                let entity_input = undefined;

                if (clone_id.endsWith("-id")) {
                    entity_input = document.createElement("input");
                    entity_input.type = "number";
                    entity_input.placeholder = "ID";

                    if (!endpoints[clone_id]["integer"]) {
                        if ("step" in endpoints[clone_id]) {
                            entity_input.step = String(endpoints[clone_id]["step"]).replace(",", ".");
                        }
                    }

                    if ("max" in endpoints[clone_id]) {
                        entity_input.max = String(endpoints[clone_id]["max"]).replace(",", ".");
                    }

                    if ("min" in endpoints[clone_id]) {
                        entity_input.min = String(endpoints[clone_id]["min"]).replace(",", ".");
                    }
                }
                else if (clone_id.endsWith("-name") || clone_id.endsWith("-ticker")) {
                    entity_input = document.createElement("input");
                    entity_input.type = "text";

                    if (clone_id.endsWith("-name")) {
                        entity_input.placeholder = "Name";
                    }
                    else if (clone_id.endsWith("-ticker")) {
                        entity_input.placeholder = "Ticker";
                    }

                    if ("max_length" in endpoints[clone_id]) {
                        entity_input.maxLength = Number(endpoints[clone_id]["max_length"]);
                    }

                    if ("min_length" in endpoints[clone_id]) {
                        entity_input.minLength = Number(endpoints[clone_id]["min_length"]);
                    }
                }
                else {
                    entity_input = document.createElement("input");
                    entity_input.type = "text";
                    entity_input.placeholder = "Name";

                    if ("max_length" in endpoints[clone_id]) {
                        entity_input.maxLength = Number(endpoints[clone_id]["max_length"]);
                    }

                    if ("min_length" in endpoints[clone_id]) {
                        entity_input.minLength = Number(endpoints[clone_id]["min_length"]);
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

                comparation.appendChild(wrapper_entity);

                /* Comparator */
                const comparator = document.createElement("div");
                comparator.className = "flex-row flex-static toolbox-element";
                comparator.setAttribute("endpoint-type", "comparator");
                comparator.style.marginTop = "15px";
                comparator.style.marginRight = "5px";
                comparator.addEventListener("click", show_comparator_dialog, false);

                const comparator_symbol = document.createElement("span");
                comparator_symbol.className = "data-type";
                comparator_symbol.setAttribute("data-type", "comparator");
                comparator_symbol.innerHTML = "=";

                const comparator_text = document.createElement("span");
                comparator_text.className = "element-name";
                comparator_text.innerHTML = "IS";

                comparator.appendChild(comparator_symbol);
                comparator.appendChild(comparator_text);
                comparation.appendChild(comparator);

                /* Wrapper */
                const wrapper = document.createElement("div");
                wrapper.className = "flex-column flex-static";

                /* Header */
                const header_value_wrapper = document.createElement("div");
                header_value_wrapper.className = "flex-row flex-static";

                const value_header = document.createElement("span");
                value_header.style.marginLeft = "2px";
                value_header.style.marginRight = "auto";
                value_header.style.fontSize = "12px";
                value_header.style.fontWeight = "normal";
                value_header.style.color = "#FFFFFF";

                if (clone_endpoint === "alliance") {
                    value_header.innerHTML = "Alliance > Standing";
                }
                else if (clone_endpoint === "corporation") {
                    value_header.innerHTML = "Corporation > Standing";
                }
                else if (clone_endpoint === "character") {
                    value_header.innerHTML = "Character > Standing";
                }

                header_value_wrapper.appendChild(value_header);

                const command_move_left = document.createElement("button");
                command_move_left.style.height = "12px";
                command_move_left.style.marginLeft = "10px";
                command_move_left.style.paddingTop = "0px";
                command_move_left.style.paddingBottom = "0px";
                command_move_left.style.paddingLeft = "2px";
                command_move_left.style.paddingRight = "2px";
                command_move_left.style.border = "solid 1px #FFFFFF";
                command_move_left.style.borderRadius = "2px";
                command_move_left.style.fontSize = "10px";
                command_move_left.style.color = "#FFFFFF";
                command_move_left.style.background = "#333333";
                command_move_left.innerHTML = "<<";
                command_move_left.title = "Move this condition part to the left.";
                command_move_left.addEventListener("click", clicked_command_move_left, false);
                header_value_wrapper.appendChild(command_move_left);

                const command_move_right = document.createElement("button");
                command_move_right.style.height = "12px";
                command_move_right.style.marginLeft = "2px";
                command_move_right.style.paddingTop = "0px";
                command_move_right.style.paddingBottom = "0px";
                command_move_right.style.paddingLeft = "2px";
                command_move_right.style.paddingRight = "2px";
                command_move_right.style.border = "solid 1px #FFFFFF";
                command_move_right.style.borderRadius = "2px";
                command_move_right.style.fontSize = "10px";
                command_move_right.style.color = "#FFFFFF";
                command_move_right.style.background = "#333333";
                command_move_right.innerHTML = ">>";
                command_move_right.title = "Move this condition part to the right.";
                command_move_right.addEventListener("click", clicked_command_move_right, false);
                header_value_wrapper.appendChild(command_move_right);

                const command_remove = document.createElement("button");
                command_remove.style.height = "12px";
                command_remove.style.marginLeft = "5px";
                command_remove.style.marginRight = "1px";
                command_remove.style.paddingTop = "0px";
                command_remove.style.paddingBottom = "0px";
                command_remove.style.paddingLeft = "2px";
                command_remove.style.paddingRight = "2px";
                command_remove.style.border = "solid 1px #FF8888";
                command_remove.style.borderRadius = "2px";
                command_remove.style.fontSize = "10px";
                command_remove.style.color = "#FF8888";
                command_remove.style.background = "#333333";
                command_remove.innerHTML = "X";
                command_remove.title = "Remove this condition part.";
                command_remove.addEventListener("click", clicked_command_remove, false);
                header_value_wrapper.appendChild(command_remove);

                /* Value */
                const value = document.createElement("div");
                value.className = "flex-row flex-static toolbox-element";
                value.setAttribute("endpoint-type", clone_endpoint);
                value.style.marginTop = "3px";

                const value_symbol = document.createElement("span");
                value_symbol.className = "data-type";

                if (clone_id.endsWith("-has_standing")) {
                    value_symbol.setAttribute("data-type", "boolean");
                    value_symbol.innerHTML = "B";
                }
                else {
                    value_symbol.setAttribute("data-type", "number");
                    value_symbol.innerHTML = "N";
                }

                let value_input = undefined;

                if (clone_id.endsWith("-has_standing")) {
                    value_input = document.createElement("select");

                    const option_true = document.createElement("option");
                    option_true.value = "true";
                    option_true.innerHTML = "True";
                    option_true.selected = true;

                    const option_false = document.createElement("option");
                    option_false.value = "false";
                    option_false.innerHTML = "False";

                    value_input.appendChild(option_true);
                    value_input.appendChild(option_false);
                }
                else {
                    value_input = document.createElement("input");

                    value_input.type = "number";
                    value_input.placeholder = "Standing (-10.0 to 10.0)";
                    value_input.step = "0.1";
                    value_input.max = "10.0";
                    value_input.min = "-10.0";
                }
                
                value_input.required = true;
                value_input.style.height = "20px";
                value_input.style.width = "100%";
                value_input.style.marginTop = "-2px";
                value_input.style.marginLeft = "3px";
                value_input.style.paddingLeft = "5px";
                value_input.style.fontSize = "14px";
                value_input.style.fontWeight = "bold";

                value.appendChild(value_symbol);
                value.appendChild(value_input);

                wrapper.appendChild(header_value_wrapper);
                wrapper.appendChild(value);

                comparation.appendChild(wrapper);
            }
            else if (Number(clone_parsing_type) === 1) {
                /* Endpoint */
                const endpoint = document.createElement("div");
                endpoint.className = "flex-column flex-static";
                endpoint.style.marginRight = "5px";

                const header = document.createElement("span");
                header.style.marginBottom = "3px";
                header.style.fontSize = "12px";
                header.style.fontWeight = "normal";
                header.style.color = "#FFFFFF";

                if (clone_id.startsWith("te-endpoints-my_conditions-")) {
                    header.innerHTML = "Condition";
                }
                else {
                    header.innerHTML = endpoints[clone_id]["group"];
                }

                endpoint.appendChild(header);
                endpoint.appendChild(clone);
                comparation.appendChild(endpoint);

                /* Comparator */
                const comparator = document.createElement("div");
                comparator.className = "flex-row flex-static toolbox-element";
                comparator.setAttribute("endpoint-type", "comparator");
                comparator.style.marginTop = "15px";
                comparator.style.marginRight = "5px";
                comparator.addEventListener("click", show_comparator_dialog, false);

                const comparator_symbol = document.createElement("span");
                comparator_symbol.className = "data-type";
                comparator_symbol.setAttribute("data-type", "comparator");
                comparator_symbol.innerHTML = "=";

                const comparator_text = document.createElement("span");
                comparator_text.className = "element-name";
                comparator_text.innerHTML = "IS";

                comparator.appendChild(comparator_symbol);
                comparator.appendChild(comparator_text);
                comparation.appendChild(comparator);

                /* Wrapper */
                const wrapper = document.createElement("div");
                wrapper.className = "flex-column flex-static";
                wrapper.style.marginRight = "5px";

                /* Commands */
                const header_value_wrapper = document.createElement("div");
                header_value_wrapper.className = "flex-row flex-static";

                const value_header = document.createElement("span");
                value_header.style.marginLeft = "2px";
                value_header.style.marginRight = "auto";
                value_header.style.fontSize = "12px";
                value_header.style.fontWeight = "normal";
                value_header.style.color = "#FFFFFF";

                if (clone_id.startsWith("te-endpoints-my_conditions-")) {
                    value_header.innerHTML = "Condition";
                }
                else {
                    value_header.innerHTML = endpoints[clone_id]["group"];
                }

                header_value_wrapper.appendChild(value_header);

                if (!clone_id.startsWith("te-endpoints-my_conditions-")) {
                    const command_use_endpoint = document.createElement("button");
                    command_use_endpoint.style.height = "12px";
                    command_use_endpoint.style.marginLeft = "10px";
                    command_use_endpoint.style.paddingTop = "0px";
                    command_use_endpoint.style.paddingBottom = "0px";
                    command_use_endpoint.style.paddingLeft = "2px";
                    command_use_endpoint.style.paddingRight = "2px";
                    command_use_endpoint.style.border = "solid 1px #FF8888";
                    command_use_endpoint.style.borderRadius = "2px";
                    command_use_endpoint.style.fontSize = "10px";
                    command_use_endpoint.style.color = "#FF8888";
                    command_use_endpoint.style.background = "#333333";
                    command_use_endpoint.innerHTML = "Endpoint";
                    command_use_endpoint.title = "Compare to an endpoint.";
                    command_use_endpoint.addEventListener("click", show_endpoint_dialog, false);
                    header_value_wrapper.appendChild(command_use_endpoint);

                    const command_use_input = document.createElement("button");
                    command_use_input.style.height = "12px";
                    command_use_input.style.marginLeft = "2px";
                    command_use_input.style.paddingTop = "0px";
                    command_use_input.style.paddingBottom = "0px";
                    command_use_input.style.paddingLeft = "2px";
                    command_use_input.style.paddingRight = "2px";
                    command_use_input.style.border = "solid 1px #88FF88";
                    command_use_input.style.borderRadius = "2px";
                    command_use_input.style.fontSize = "10px";
                    command_use_input.style.color = "#88FF88";
                    command_use_input.style.background = "#333333";
                    command_use_input.innerHTML = "Input";
                    command_use_input.title = "Compare to manual input.";
                    command_use_input.addEventListener("click", selected_input, false);
                    header_value_wrapper.appendChild(command_use_input);
                }
                
                const command_move_left = document.createElement("button");
                command_move_left.style.height = "12px";
                command_move_left.style.marginLeft = "10px";
                command_move_left.style.paddingTop = "0px";
                command_move_left.style.paddingBottom = "0px";
                command_move_left.style.paddingLeft = "2px";
                command_move_left.style.paddingRight = "2px";
                command_move_left.style.border = "solid 1px #FFFFFF";
                command_move_left.style.borderRadius = "2px";
                command_move_left.style.fontSize = "10px";
                command_move_left.style.color = "#FFFFFF";
                command_move_left.style.background = "#333333";
                command_move_left.innerHTML = "<<";
                command_move_left.title = "Move this condition part to the left.";
                command_move_left.addEventListener("click", clicked_command_move_left, false);
                header_value_wrapper.appendChild(command_move_left);

                const command_move_right = document.createElement("button");
                command_move_right.style.height = "12px";
                command_move_right.style.marginLeft = "2px";
                command_move_right.style.paddingTop = "0px";
                command_move_right.style.paddingBottom = "0px";
                command_move_right.style.paddingLeft = "2px";
                command_move_right.style.paddingRight = "2px";
                command_move_right.style.border = "solid 1px #FFFFFF";
                command_move_right.style.borderRadius = "2px";
                command_move_right.style.fontSize = "10px";
                command_move_right.style.color = "#FFFFFF";
                command_move_right.style.background = "#333333";
                command_move_right.innerHTML = ">>";
                command_move_right.title = "Move this condition part to the right.";
                command_move_right.addEventListener("click", clicked_command_move_right, false);
                header_value_wrapper.appendChild(command_move_right);

                const command_remove = document.createElement("button");
                command_remove.style.height = "12px";
                command_remove.style.marginLeft = "5px";
                command_remove.style.marginRight = "1px";
                command_remove.style.paddingTop = "0px";
                command_remove.style.paddingBottom = "0px";
                command_remove.style.paddingLeft = "2px";
                command_remove.style.paddingRight = "2px";
                command_remove.style.border = "solid 1px #FF8888";
                command_remove.style.borderRadius = "2px";
                command_remove.style.fontSize = "10px";
                command_remove.style.color = "#FF8888";
                command_remove.style.background = "#333333";
                command_remove.innerHTML = "X";
                command_remove.title = "Remove this condition part.";
                command_remove.addEventListener("click", clicked_command_remove, false);
                header_value_wrapper.appendChild(command_remove);

                /* Value */
                const value = document.createElement("div");
                value.className = "flex-row flex-static toolbox-element";
                value.setAttribute("endpoint-type", clone_endpoint);
                value.style.marginTop = "3px";

                const value_symbol = document.createElement("span");
                value_symbol.className = "data-type";
                value_symbol.setAttribute("data-type", clone_type);
                value_symbol.innerHTML = clone_type_text;

                let value_input;

                if (clone_type === "number") {
                    value_input = document.createElement("input");
                    value_input.type = "number";
                    value_input.placeholder = clone_text;

                    if (!endpoints[clone_id]["integer"]) {
                        if ("step" in endpoints[clone_id]) {
                            value_input.step = String(endpoints[clone_id]["step"]).replace(",", ".");
                        }
                    }

                    if ("max" in endpoints[clone_id]) {
                        value_input.max = String(endpoints[clone_id]["max"]).replace(",", ".");
                    }

                    if ("min" in endpoints[clone_id]) {
                        value_input.min = String(endpoints[clone_id]["min"]).replace(",", ".");
                    }
                }
                else if (clone_type === "string") {
                    value_input = document.createElement("input");
                    value_input.type = "text";
                    value_input.placeholder = clone_text;

                    if ("max_length" in endpoints[clone_id]) {
                        value_input.maxLength = Number(endpoints[clone_id]["max_length"]);
                    }

                    if ("min_length" in endpoints[clone_id]) {
                        value_input.minLength = Number(endpoints[clone_id]["min_length"]);
                    }
                }
                else if (clone_type === "boolean") {
                    value_input = document.createElement("select");

                    const option_true = document.createElement("option");
                    option_true.value = "true";
                    option_true.innerHTML = "True";
                    option_true.selected = true;

                    const option_false = document.createElement("option");
                    option_false.value = "false";
                    option_false.innerHTML = "False";

                    value_input.appendChild(option_true);
                    value_input.appendChild(option_false);
                }

                value_input.required = true;
                value_input.style.height = "20px";
                value_input.style.width = "100%";
                value_input.style.marginTop = "-2px";
                value_input.style.marginLeft = "3px";
                value_input.style.paddingLeft = "5px";
                value_input.style.fontSize = "14px";
                value_input.style.fontWeight = "bold";

                value.appendChild(value_symbol);
                value.appendChild(value_input);

                wrapper.appendChild(header_value_wrapper);
                wrapper.appendChild(value);

                comparation.appendChild(wrapper);
            }
            
            /* Right Brackets */
            const bg_wrapper_right = document.createElement("div");
            bg_wrapper_right.className = "flex-column flex-static";
            bg_wrapper_right.style.marginLeft = "10px";

            const bracket_right_add = document.createElement("button");
            bracket_right_add.style.height = "12px";
            bracket_right_add.style.paddingTop = "0px";
            bracket_right_add.style.paddingBottom = "0px";
            bracket_right_add.style.paddingLeft = "2px";
            bracket_right_add.style.paddingRight = "2px";
            bracket_right_add.style.border = "solid 1px #88FF88";
            bracket_right_add.style.borderRadius = "2px";
            bracket_right_add.style.fontSize = "10px";
            bracket_right_add.style.color = "#88FF88";
            bracket_right_add.style.background = "#333333";
            bracket_right_add.innerHTML = "B";
            bracket_right_add.title = "Add one bracket on the right.";
            bracket_right_add.addEventListener("click", clicked_bracket_right_add, false);

            const bracket_right_remove = document.createElement("button");
            bracket_right_remove.style.height = "12px";
            bracket_right_remove.style.marginTop = "auto";
            bracket_right_remove.style.paddingTop = "0px";
            bracket_right_remove.style.paddingBottom = "0px";
            bracket_right_remove.style.paddingLeft = "2px";
            bracket_right_remove.style.paddingRight = "2px";
            bracket_right_remove.style.border = "solid 1px #FF8888";
            bracket_right_remove.style.borderRadius = "2px";
            bracket_right_remove.style.fontSize = "10px";
            bracket_right_remove.style.color = "#FF8888";
            bracket_right_remove.style.background = "#333333";
            bracket_right_remove.innerHTML = "B";
            bracket_right_remove.title = "Remove one bracket on the right.";
            bracket_right_remove.addEventListener("click", clicked_bracket_right_remove, false);

            bg_wrapper_right.appendChild(bracket_right_add);
            bg_wrapper_right.appendChild(bracket_right_remove);
            comparation.appendChild(bg_wrapper_right);

            this.appendChild(comparation);
        },
        false
    );

    condition_area.appendChild(condition_header);
    condition_area.appendChild(condition_body);

    get_data();
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

function generate_condition_string() {
    const condition_body = document.getElementById("condition-area").childNodes[1];

    let condition_string = "";

    Array.prototype.forEach.call(condition_body.childNodes, function (node) {
        if (node.innerHTML === "(") {
            condition_string += "(";
        }
        else if (node.innerHTML === ")") {
            condition_string += ")";
        }
        else if (node.getAttribute("endpoint-type") === "logic") {
            const logic_gate = node.getAttribute("data-id");

            if (logic_gate === "te-logic-gates-and") {
                condition_string += "AND";
            }
            else if (logic_gate === "te-logic-gates-or") {
                condition_string += "OR";
            }
            else if (logic_gate === "te-logic-gates-nand") {
                condition_string += "NAND";
            }
            else if (logic_gate === "te-logic-gates-nor") {
                condition_string += "NOR";
            }
            else if (logic_gate === "te-logic-gates-xor") {
                condition_string += "XOR";
            }
            else if (logic_gate === "te-logic-gates-xnor") {
                condition_string += "XNOR";
            }
        }
        else if (node.className.includes("area")) {
            const parsing_type = node.childNodes[1].childNodes[1].getAttribute("parsing-type");

            if (Number(parsing_type) === 1) {
                const endpoint = "[" + node.childNodes[1].childNodes[1].getAttribute("data-id") + "]";
                const comparator = "[" + node.childNodes[2].childNodes[1].innerHTML + "]";
                const data_type = node.childNodes[1].childNodes[1].childNodes[0].getAttribute("data-type");

                let value_type = undefined;

                if (endpoint.startsWith("[te-endpoints-my_conditions-")) {
                    value_type = "input";
                }
                else {
                    if (node.childNodes[3].childNodes[0].childNodes[1].style.color === "rgb(136, 255, 136)") {
                        value_type = "endpoint";
                    }
                    else if (node.childNodes[3].childNodes[0].childNodes[2].style.color === "rgb(136, 255, 136)") {
                        value_type = "input";
                    }
                }

                let value = undefined;

                if (value_type === "endpoint") {
                    value = "[" + node.childNodes[3].childNodes[1].getAttribute("data-id") + "]";
                }
                else if (value_type === "input") {
                    value = "[" + node.childNodes[3].childNodes[1].childNodes[1].value + "]";

                    if (data_type === "number") {
                        value = value.replace(",", ".");
                    }
                }

                condition_string += "[" + parsing_type + "]";
                condition_string += endpoint;
                condition_string += comparator;
                condition_string += value;
            }
            else if (Number(parsing_type) === 2) {
                const endpoint = "[" + node.childNodes[1].childNodes[1].getAttribute("data-id") + "]";
                const direction = "[" + node.childNodes[2].childNodes[1].innerHTML + "]";
                const entity_type = "[" + node.childNodes[3].childNodes[1].innerHTML + "]";
                const entity_data_type = node.childNodes[4].childNodes[1].childNodes[0].getAttribute("data-type");
                let entity = "[" + node.childNodes[4].childNodes[1].childNodes[1].value + "]";

                if (entity_data_type === "number") {
                    entity = entity.replace(",", ".");
                }

                const comparator = "[" + node.childNodes[5].childNodes[1].innerHTML + "]";
                const value_data_type = node.childNodes[6].childNodes[1].childNodes[0].getAttribute("data-type");
                let value = "[" + node.childNodes[6].childNodes[1].childNodes[1].value + "]";

                if (value_data_type === "number") {
                    value = value.replace(",", ".");
                }

                condition_string += "[" + parsing_type + "]";
                condition_string += endpoint;
                condition_string += direction;
                condition_string += entity_type;
                condition_string += entity;
                condition_string += comparator;
                condition_string += value;
            }
            else if (Number(parsing_type) === 3) {
                const endpoint = "[" + node.childNodes[1].childNodes[1].getAttribute("data-id") + "]";
                const indicator = "[" + node.childNodes[2].childNodes[1].innerHTML + "]";
                const target = "[" + node.childNodes[3].childNodes[1].childNodes[1].value + "]";
                const comparator = "[" + node.childNodes[4].childNodes[1].innerHTML + "]";
                const value_data_type = node.childNodes[5].childNodes[1].childNodes[0].getAttribute("data-type");
                let value = "[" + node.childNodes[5].childNodes[1].childNodes[1].value + "]";

                if (value_data_type === "number") {
                    value = value.replace(",", ".");
                }

                condition_string += "[" + parsing_type + "]";
                condition_string += endpoint;
                condition_string += indicator;
                condition_string += target;
                condition_string += comparator;
                condition_string += value;
            }
        }
    });

    return condition_string;
};

function validate_condition() {
    let valid = true;

    let brackets_opened = 0;
    let brackets_closed = 0;

    const condition_header = document.getElementById("condition-area").childNodes[0];
    const condition_body = document.getElementById("condition-area").childNodes[1];

    if (condition_body.childNodes.length === 0) {
        valid = false;

        alert("The condition area is empty.");
    }

    if (!valid) {
        return valid;
    }

    if (!condition_header.validity.valid || condition_header.value.trim().length === 0) {
        condition_header.style.border = "solid 3px #FF0000";

        valid = false;
    }
    else {
        condition_header.style.border = "1px solid #FFFFFF";
    }

    Array.prototype.forEach.call(condition_body.getElementsByTagName("input"), function (value_field) {
        if (!value_field.validity.valid) {
            value_field.style.border = "solid 3px #FF0000";

            valid = false;
        }
        else {
            value_field.style.border = "0";
        }
    });

    Array.prototype.forEach.call(condition_body.getElementsByTagName("select"), function (value_field) {
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

    Array.prototype.forEach.call(condition_body.childNodes, function (node) {
        if (node.innerHTML === "(") {
            brackets_opened++;
        }
        else if (node.innerHTML === ")") {
            brackets_closed++;
        }
    });

    if (brackets_opened > brackets_closed) {
        valid = false;

        alert("Bracket mismatch! More brackets opened than closed.");
    }
    else if (brackets_opened < brackets_closed) {
        valid = false;

        alert("Bracket mismatch! More brackets closed than opened.");
    }

    return valid;
};

function get_condition_title() {
    const condition_header = document.getElementById("condition-area").getElementsByTagName("input")[0];

    return condition_header.value;
};

function get_condition_description() {
    const condition_description = document.getElementById("condition-description").getElementsByTagName("textarea")[0];

    return condition_description.value;
};

function save_condition() {
    if (!validate_condition()) {
        return;
    }

    const condition_title = get_condition_title();
    const condition_description = get_condition_description();
    const condition = generate_condition_string();

    post_data({
        "id": get_url_parameter("id"),
        "title": condition_title,
        "description": condition_description,
        "condition": condition
    });
};

function initialize_toolbox() {
    const endpoint_keys = Object.keys(endpoints).reverse();
    const condition_keys = Object.keys(conditions).reverse();

    //#region Endpoints
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
        toolbox_element.draggable = true;
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
    //#endregion

    //#region Conditions
    for (let i = 0; i < condition_keys.length; i++) {
        const condition_id = condition_keys[i];
        const condition = conditions[condition_id];

        const endpoint_parent = "tg-endpoints-my_conditions";
        const endpoint_group = "Condition";
        const endpoint_name = condition["title"];
        const endpoint_description = condition["description"];
        const endpoint_data_type = "boolean";
        const endpoint_parsing_type = 1;

        const toolbox_element = document.createElement("div");
        toolbox_element.className = "flex-row flex-static toolbox-element";
        toolbox_element.draggable = true;
        toolbox_element.title = endpoint_description;
        toolbox_element.setAttribute("data-id", "te-endpoints-my_conditions-" + condition_id);
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
    //#endregion

    Array.prototype.forEach.call(document.getElementsByClassName("toolbox-header"), function (header) {
        header.addEventListener("click", show_or_hide_toolbox_group, false);
    });

    Array.prototype.forEach.call(document.getElementsByClassName("toolbox-element"), function (element) {
        element.addEventListener(
            "dragstart",
            function (event) {
                event.dataTransfer.setData("text", event.target.getAttribute("data-id"));
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
        "config_condition",
        {
            "method": "get",
            "data_id": get_url_parameter("id")
        }
    );
}

function post_data(data) {
    socket.emit(
        "config_condition",
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
        initialize_condition(data);
    });

    socket.on("data_posted", function () {
        window.location = "/module/default/html/config/conditions.html";
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
    initialize_condition_area();
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