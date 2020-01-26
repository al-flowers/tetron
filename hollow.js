/********************
 *      HOLLOW      *
 ********************/

// Hollows are squares with shadows withing the boundary to give the appearance of a recessed platform
// The Hollow is mainly intended for use as a background UI element.
// The Hollow object inherits from the Animata object.
// The position of the Hollow is determined by its top left corner.

function Hollow(id, position_x, position_y, size_x, size_y) {
    // Inherit details from the Animata constructor.
    Animata.call(this, id, position_x, position_y, size_x);

    // Main attributes
    this.size_x = size_x;
    this.size_y = size_y;

    // Shadow attributes
    this.depth = 0;
    this.max_depth = 9;
}

// Inherit the prototype from Animata
Hollow.prototype = Object.create(Animata.prototype);



/*------- DISPLAY -------*/

/* The appearance of a hollow consists of a rectangle with shadows bleeding in from
 * its edges to give the illusion of a recessed platform. This is done by drawing a
 * ring-like structure with a shadow and masking out anything outside of the bounds of
 * the opening within the ring.
*/
Hollow.prototype.draw = function() {
    ctx.save();
    ctx.translate(this.position_x, this.position_y);

    // Set the mask with the opening in the ring as the positive space
    ctx.beginPath();
    ctx.moveTo(1, 1);                                                   // Top-left corner
    ctx.lineTo(this.size_x - 1, 1);                                         // Top edge
    ctx.lineTo(this.size_x - 1, this.size_y - 1);                               // Right edge
    ctx.lineTo(1, this.size_y - 1);                                         // Bottom edge
    ctx.lineTo(1, 1);                                                   // Left edge
    ctx.clip('evenodd');

    // If the hollow is recessed, draw a shadow simulating a light from the upper-left direction
    // The shadow will be created from a ring-like shape that will be masked out
    if (this.depth > 0) {

        // Draw the outer boundary of the ring
        let ring_width = 20;
        ctx.beginPath();
        ctx.moveTo(-ring_width, -ring_width);                           // Top-left corner
        ctx.lineTo(this.size_x + ring_width, -ring_width);              // Top egde
        ctx.lineTo(this.size_x + ring_width, this.size_y + ring_width); // Right edge
        ctx.lineTo(-ring_width, this.size_y + ring_width);              // Bottom edge
        ctx.lineTo(-ring_width, -ring_width);                           // Left edge

        // Draw the inner boundary of the ring
        ctx.moveTo(0, 0);                                               // Top-left corner
        ctx.lineTo(this.size_x, 0);                                     // Top edge
        ctx.lineTo(this.size_x, this.size_y);                           // Right edge
        ctx.lineTo(0, this.size_y);                                     // Bottom edge
        ctx.lineTo(0, 0);                                               // Left edge
        ctx.closePath();

        // The depth of the hollow is demonstrated through its shadow's sharpness and offset
        ctx.shadowBlur = this.depth * 1.2;
        ctx.shadowColor = "rgb(50, 50, 50)";
        ctx.shadowOffsetX = this.depth / 2;
        ctx.shadowOffsetY = this.depth / 2;
        ctx.fill('evenodd');
    }

    ctx.restore();
}


// The intro animation will involve recessing the hollow to its default depth if left unspecified
Hollow.prototype.intro = function(rate = 1, initial_depth = this.max_depth) {
    this.newActionSet();
    this.setDepth('intro', initial_depth, rate * 0.05);
    this.closeActionSet();
}



/*------- MANIPULATE -------*/

Hollow.prototype.setDepth = function(action_id, new_depth, rate, carryover = false) {
    if (new_depth < 0) {
        console.error("Hollow cannot have a depth value lower than 0");
        return;
    }

    let set_depth = new Action('set_depth', action_id, new_depth, rate);
    set_depth.carryover = carryover;
    set_depth.acceleration = 0.02;
    this.assignAction(set_depth);
}



/*------- UPDATE -------*/
// Call the appropriate update function for the specified action
Hollow.prototype.updateAction = function(action) {
    let modified_action;
    switch (action.type) {
        case 'set_depth':
            modified_action = this.updateSetDepth(action);
            break;
        default:
            modified_action = Animata.prototype.updateAction.call(this, action);
    }
    return modified_action;

}


Hollow.prototype.updateSetDepth = function(action) {
    action.progress = this.depth;

    if (!action.initialized) {
        if (action.progress > action.goal) {
            action.direction = -1;
        }
        action.initialized = true;
    }

    // Check for completeness
    if (action.progress * action.direction > action.goal * action.direction) {
        action.progress = action.goal;
        this.depth = action.goal;
        action.complete();
        return action;
    }

    // Apply acceleration to the rate and advance progress of the animation
    if (action.rate + action.acceleration > 0) {
        action.rate += action.acceleration;
    }

    action.progress += action.rate * action.direction;
    this.depth += action.rate * action.direction;

    return action;
}
