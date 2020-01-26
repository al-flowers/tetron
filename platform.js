/***********************/
/*      PLATFORM       */
/***********************/

// Platforms are squares with a shadow giving the appearance of a raised platform.
// The Platform is mainly intended for use as a background UI element.
// The Platform object inherits from the Animata object.
// The position of the Platform is determined by its top left corner.

function Platform(id, position_x, position_y, size_x, size_y) {
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
Platform.prototype = Object.create(Animata.prototype);



/*------- DISPLAY -------*/

// Drawing a platform is achieved by drawing a square with a shadow and masking out the square
Platform.prototype.draw = function() {
    ctx.save();
    ctx.translate(this.position_x, this.position_y);

    // Set the mask which will consist of a ring around the platform
    // Draw the outer boundary of the mask positive space
    let ring_width = 20;

    ctx.beginPath();
    ctx.moveTo(-ring_width, -ring_width);                           // Top-left
    ctx.lineTo(this.size_x + ring_width, -ring_width);              // Top-right
    ctx.lineTo(this.size_x + ring_width, this.size_y + ring_width); // Bottom-right
    ctx.lineTo(-ring_width, this.size_y + ring_width);              // Bottom-left
    ctx.lineTo(-ring_width, -ring_width);                           // Top-left

    // Draw the inner boundary of the mask positive space w/ each point 1 pixel further in each direction from (0, 0)
    ctx.moveTo(-1, -1);                                             // Top-left
    ctx.lineTo(this.size_x + 1, -1);                                // Top-right
    ctx.lineTo(this.size_x + 1, this.size_y + 1);                   // Bottom-right
    ctx.lineTo(-1, this.size_y + 1);                                // Bottom-left
    ctx.lineTo(-1, -1);                                             // Top-left

    ctx.clip('evenodd');

    // If the platform is raised, draw a shadow simulating a light source from the upper-left direction
    if (this.depth > 0) {
        ctx.beginPath();
        ctx.rect(0, 0, this.size_x, this.size_y);
        ctx.closePath();

        // The depth of the platform is demonstrated through its shadow's sharpness and offset
        ctx.shadowBlur = this.depth * 1.2;
        ctx.shadowColor = "rgb(50, 50, 50)";
        ctx.shadowOffsetX = this.depth / 2;
        ctx.shadowOffsetY = this.depth / 2;
        ctx.fill();
    }

    ctx.restore();
}


// The intro animation will involve elevating the platform to its default depth if left unspecified
Platform.prototype.intro = function(rate = 1, initial_depth = this.max_depth) {
    this.newActionSet();
    this.setDepth('intro', initial_depth, rate * 0.05);
    this.closeActionSet();
}



/*------- MANIPULATE -------*/

// Set the depth of the platform's shadow indicating the simulated distance between the platform and the page
Platform.prototype.setDepth = function(action_id, new_depth, rate, carryover = false) {
    if (new_depth < 0) {
        console.error("Platform cannot have a depth value lower than 0");
        return;
    }

    let set_depth = new Action('set_depth', action_id, new_depth, rate);
    set_depth.carryover = carryover;
    set_depth.acceleration = 0.02;
    this.assignAction(set_depth);
}



/*------- UPDATE -------*/

// Call the appropriate update function for the specified action
Platform.prototype.updateAction = function(action) {
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


// Animate change in depth of shadow
Platform.prototype.updateSetDepth = function(action) {
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

    // Apply acceleration to the rate and advance progress of animation
    if (action.rate + action.acceleration > 0) {
        action.rate += action.acceleration;
    }

    action.progress += action.rate * action.direction;
    this.depth += action.rate * action.direction;

    return action;
}
