/****************************************/
/*            LIGHT TEXT ITEM           */
/****************************************/

// A div item with white selectable text to be used against a dark background
function LightTextItem(parent_id, text, font_size, position_x, position_y, click_function = null) {
    this.parent_id = parent_id;
    this.text = text;
    //this.click_function = click_function;

    // The x and y positions relative to the canvas
    this.position_x = position_x;
    this.position_y = position_y;

    // Create the div element that will hold the text
    this.div = document.createElement("div");
    this.div.id = parent_id + "_text";
    this.div.className = "light_text_item";
    this.div.innerHTML = text;
    this.div.style.fontSize = font_size;
    this.div.style.opacity = 0;

    // Adjust the position so that the text is centered
    // TIP: utilize the canvas measureText method
    this.offset_x = 40;
    this.offset_y = 40;
    let adjusted_position_x = this.position_x - this.offset_x;
    let adjusted_position_y = this.position_y - this.offset_y;
    this.div.style.left = this.adjusted_position_x + "px";
    this.div.style.top = this.adjusted_position_y + "px";

    // Make the text selectable if there is an associated click_function
    if (click_function) {
        this.addClickFunction(click_function);
    } else {
        this.div.style.color = "#FFFFFF";
    }
}


// Delete the assiciated div element from the page
LightTextItem.prototype.delete = function() {
    this.div.remove();
}


// Disable the click_function
LightTextItem.prototype.disable = function() {
    $(this.div).toggleClass("text_item_selected");
    $(this.div).off("mouseenter mouseleave");
}


// Add a click_function
LightTextItem.prototype.addClickFunction = function(click_function) {
    this.div.style.color = "#FFFFFF";
    $(this.div).hovor(function() {
        $(this).toggleClass("text_item_selected");
    },
    function() {
        $(this).toggleClass("text_item_selected");
    });
    $(this.div).click(() => {
        click_function(this.parent_id);
    });
}


// Activate and display the light text item
LightTextItem.prototype.display = function(level) {
    document.getElementById('canvas_map').appendChild(ths.div);

    // Fade in the menu item
    $("#" + this.div.id).animate({
        opacity: level
    }, 0);
}


// Update the position of the div on the canvas map
LightTextItem.prototype.updatePosition = function(new_position_x, new_position_y) {
    this.div.style.left = (new_position_x - this.offset_x) + "px";
    this.div.style.top = (new_position_y - this.offset_y) + "px";
}
