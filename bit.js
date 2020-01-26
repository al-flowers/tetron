/**************************/
/*          BIT           */
/**************************/

// The Bit object is the smallest manipulable object on the canvas.
// The Bit object inherits from the Animata object.
// The position of the Bit is determined by its center.
/* The default shape of a bit is a square and it can become a circle. This is done
    by using bezier curves for the edges. We can simulate an approximation of a circle
    using 4 cubic bezier curves with control points with a distance of radius * 0.5522847498
    away from the end points along the edge of the square within which the circle is inscribed.
    source: https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves */
const BEZIER_CONST = 0.5522847498;

function Bit(id, shape, position_x, position_y, size) {
    // Inherit details from the Animata constructor
    Animata.call(this, id, position_x, position_y, size);

    // Shape attribute
    this.shape = shape;
    this.corner_rating; // A value between 0 and 1. 0 results in a square. 1 results in a circle.
    switch (shape) {
        case 'circle':
            this.corner_rating = 0;
            break;
        case 'square':
            this.corner_rating = 1;
            break;
        default:
            console.error("'" + shape + "' is not a valid Bit shape. The shape will default to 'square'.");
            this.shape = 'square';
            this.corner_rating = 1;
    }

    // Coordinate variables
    this.square_corner_dist;
    this.bezier_dist;
    this.radius;
    this.corner_dist;
    this.updateCoordinateVars(size);

    // Shadow attributes
    this.depth = 0;
    this.max_depth = 9;

    // Fill attributes
    this.fill_layers = [];
    this.fill_colors = {};
    this.fill_levels = {};
}

// Inherit prototype from Animata
Bit.prototype = Object.create(Animata.prototype);



/*----- COORDINATE VARIABLES -----*/

/* Calculate all coordinate variables necessary for drawing the Bit.
 * This method shall be called any time there is a change to the size of the Bit.
 * values:
 *      size (s):                   the horizontal distances between the edges when the Bit is a quare with a corner_rating of 1
 *      square_corner_dist (scd):   the distance between the center and a corner of the square resulting from a corner_rating of 1
 *      bezier_const (bc):          * refer to the top of this document *
 *      bezier_dist (bd):           the distance between a control point and its respective point on a circle created from bezier curves
 *      radius (r):                 the radius of the circle resulting from a corner_rating of 0
 * formulas:
 *      scd = (s / 2) * sqrt(2)
 *      bd = bc * r
 *      r = scd - bd
 *      NOTE: bd is also the distance a corner on the square must move inwards to reach the edge of the complete circled after transformation
 * derivation to calculate radius:
 *      r = scd - (bc * r)
 *      scd = r + (bc * r)
 *      scd = r * (1 + bc)
 *      r = scd / (bc + 1)
 */
Bit.prototype.updateCoordinateVars = function(size) {
    this.square_corner_dist = (size / 2) * Math.sqrt(2);
    this.radius = this.square_corner_dist / (BEZIER_CONST + 1);
    this.bezier_dist = BEZIER_CONST * this.radius;
    this.corner_dist = this.radius + (this.bezier_dist * this.corner_rating);
}



/*------- DISPLAY -------*/

/* The appearance of a bit in this instance is of a platform recessed into the
 * screen. This is done by drawing a ring structure (initially a square)),
 * projecting a shadow, and masking the outer edges and shadows out. */
Bit.prototype.draw = function() {
    ctx.save();

    // The bit is drawn at a 45 degree clock-wise offset and then rotated back 45 degrees to correct the offset.
    // The rotation offset will simplify the drawing process.
    ctx.translate(this.position_x, this.position_y);
    ctx.rotate((this.angle + 45) * Math.PI/180);

    // Set the mask
    ctx.beginPath();
    ctx.moveTo(0, -this.corner_dist);
    ctx.bezierCurveTo(this.bezier_dist, -this.radius, this.radius, -this.bezier_dist, this.corner_dist, 0);
    ctx.bezierCurveTo(this.radius, this.bezier_dist, this.bezier_dist, this.radius, 0, this.corner_dist);
    ctx.bezierCurveTo(-this.bezier_dist, this.radius, -this.radius, this.bezier_dist, -this.corner_dist, 0);
    ctx.bezierCurveTo(-this.radius, -this.bezier_dist, -this.bezier_dist, -this.radius, 0, -this.corner_dist);
    ctx.clip();

    // Remove all old fill layers that have been completely obscured by new fill layers
    let disposal_index = 0;
    for (let i = this.fill_layers.length - 1; i >= 0; --i) {
        let fill_id = this.fill_layers[i];
        if (this.fill_levels[fill_id] >= this.size * 0.75) {
            disposal_index = i + 1;
        }
    }

    if (disposal_index > 0) {
        let obsolete_fill_layers = this.fill_layers.splice(disposal_index);
        obsolete_fill_layers.forEach(fill_id => {
            delete this.fill_colors[fill_id];
            delete this.fill_levels[fill_id];
        });
    }

    // Draw the fill layers in chronological order starting with the oldest layer
    for (let i = this.fill_layers.length - 1; i >= 0; --i) {
        let fill_id = this.fill_layers[i];
        ctx.beginPath();
        ctx.arc(0, 0, this.fill_levels[fill_id], 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = this.fill_colors[fill_id];
        ctx.fill();
    }

    // Draw the ring like object that will project the shadow
    // The outer shape will always be a square since it will not be visible
    if (this.depth > 0) {
        let ring_width = 20;
        let outer_corner_position = this.square_corner_dist + ring_width;

        // The outer boundary is a square large enough to project a full shadow
        ctx.beginPath();
        ctx.moveTo(0, -outer_corner_position);  // Top-left (after reverting rotation)
        ctx.lineTo(outer_corner_position, 0);   // Top-right ("")
        ctx.lineTo(0, outer_corner_position);   // Bottom-right ("")
        ctx.lineTo(-outer_corner_position, 0);  // Bottom-left ("")
        ctx.lineTo(0, -outer_corner_position);  // Top-left ("")

        // The inner boundary (cutout) will determine the shape the of the Bit and its shadow
        ctx.moveTo(0, -this.corner_dist);
        ctx.bezierCurveTo(this.bezier_dist, -this.radius, this.radius, -this.bezier_dist, this.corner_dist, 0);     // Right side (after reverting rotation)
        ctx.bezierCurveTo(this.radius, this.bezier_dist, this.bezier_dist, this.radius, 0, this.corner_dist);       // Bottom side ("")
        ctx.bezierCurveTo(-this.bezier_dist, this.radius, -this.radius, this.bezier_dist, -this.corner_dist, 0);    // Left side ("")
        ctx.bezierCurveTo(-this.radius, -this.bezier_dist, -this.bezier_dist, -this.radius, 0, -this.corner_dist);  // Top side ("")
        ctx.closePath();

        // Draw a shadow simulating a light source from the upper-left direction
        if (this.depth > 0) {
            ctx.shadowBlur = this.depth * 1.2;
            ctx.shadowColor = "rgb(50, 50, 50)";
            ctx.shadowOffsetX = this.depth / 2;
            ctx.shadowOffsetY = this.depth / 2;
            ctx.fill('evenodd');
        }
    }

    ctx.restore();
}



// Animate the Bit appearing with an intro animation
// Fill the initial square shape and then recess it to the inital_depth
Bit.prototype.intro = function(initial_color = "#FFFFFF", rate = 1, initial_depth = this.max_depth) {
    // First, recess
    this.newActionSet();
    this.setDepth('intro_recess', initial_depth, rate);
    this.closeActionSet();

    // Then, fill
    this.newActionSet();
    this.setColor('intro_fill', initial_color, rate);
    this.closeActionSet();
}


// Animate the Bit disappearing with an outro animation
// Perform the opposite of the intro
Bit.prototype.outro = function(rate = 1) {
    // First, set depth to 0
    this.newActionSet();
    this.setDepth('outro_unrecess', 0, rate);
    this.closeActionSet();

    // Then, unfill
    this.newActionSet();
    this.transform("outro_circle", "circle", rate * 2);
    this.removeColor("outro_clear", rate* 2);
    this.closeActionSet();
}



/*------- MANIPULATE -------*/

// Set a new fill color and schedule the fill animation
// Consists of a circle of the new color growing from the center to fill the Bit
Bit.prototype.setColor = function(action_id, new_fill, rate = 1, carryover = false) {
    this.fill_layers.unshift(action_id);
    this.fill_colors[action_id] = new_fill;
    this.fill_levels[action_id] = 0;

    let fill = new Action('fill', action_id, this.size * 0.75, rate);
    fill.acceleration = 0.02;
    fill.carryover = carryover;
    this.assignAction(fill);
}


// Remove all fill color layers
Bit.prototype.removeColor = function(action_id, rate = 1, carryover = false) {
    let unfill = new Action('unfill', action_id, null, rate);
    unfill.acceleration = 0.02;
    unfill.carryover = carryover;
    this.assignAction(unfill);
}


// Set the depth of the bit to increase/decrease the recession into the page
// NOTE: depth cannot be reduced to a value less than 0
Bit.prototype.setDepth = function(action_id, new_depth, rate = 1, carryover = false) {
    if (new_depth < 0) {
        console.error("Bit depth cannot be set to a value lower than 0");
        return;
    }

    let set_depth = new Action('set_depth', action_id, new_depth, rate);
    set_depth.carryover = carryover;
    set_depth.acceleration = 0;
    this.assignAction(set_depth);
}


// Transform the Bit into another shape
// The default shape is a square. Currently the only other available shape is a circle.
Bit.prototype.transform = function(action_id, new_shape, rate = 1, carryover = false) {
    let modified_rate = rate * 8;
    if (new_shape == this.shape) {
        console.error("Bit with id '" + this.id + "' is already of the shape type '" + new_shape + "'");
        return;
    }
    let transform;

    // Transform into the appropriate shape
    switch (new_shape) {
        case 'circle':
            transform = new Action('transform', action_id, 0, modified_rate);
            break;
        case 'square':
            transform = new Action('transform', action_id, 1, modified_rate);
            break;
        default:
            console.error("'" + new_Shape + "' is not a valid shape for Bit with id '" + this.id + "'");
            return;
    }

    transform.carryover = carryover;
    this.assignAction(transform);

    this.shape = new_shape;
}



/*------- UPDATE -------*/

// Call the appropriate update function for the specified action
Bit.prototype.updateAction = function(action) {
    let modified_action;
    switch (action.type) {
        case 'fill':
            modified_action = this.updateFill(action);
            break;
        case 'unfill':
            modified_action = this.updateUnfill(action);
            break;
        case 'set_depth':
            modified_action = this.updateSetDepth(action);
            break;
        case 'transform':
            modified_action = this.updateTransform(action);
            break;
        case 'resize':
            modified_action = this.updateResize(action);
            break;
        default:
            // Check if it is an action defined by the Animata (parent)
            modified_action = Animata.prototype.updateAction.call(this, action);
    }

    return modified_action;
}


// Animate color fill when setting new colors
Bit.prototype.updateFill = function(action) {
    // Check for completion
    if (action.progress >= action.destination) {
        action.progress = action.destination;
        this.fill_levels[action.id] = action.destination;
        action.complete();
        return action;
    }

    // Apply acceleration/decceleration to rate without halting the fill before it is complete
    if (action.rate + action.acceleration > 0) {
        action.rate += action.acceleration;
    }
    action.progress += action.rate;
    this.fill_levels[action.id] += action.rate;

    return action;
}


// Animate the removal of a color fill; The reverse of updateFill
Bit.prototype.updateUnfill = function(action) {
    // Loop through all of the fill layers and decrement all of them
    let unfill_complete = true;

    this.fill_layers.forEach(fill_id => {
        if (this.fill_levels[fill_id] >= 0) {
            // Apply acceleration//decceleration to rate without halting the unfill before it is complete
            if (action.rate + action.acceleration > 0) {
                action.rate += action.acceleration;
            }
            this.fill_levels[fill_id] -= action.rate;

            // The lowest possible fill_level is 0
            if (this.fill_levels[fill_id] < 0) {
                this.fill_levels[fill_id] = 0;
            }

            unfill_complete = false;
        }
    });

    if (unfill_complete) {
        action.complete();
    }

    return action;
}


// Animate change in depth
Bit.prototype.updateSetDepth = function(action) {
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

    // Apply acceleration to the rate without halting the depth change before it is complete
    if (action.rate + action.acceleration > 0) {
        action.rate += action.acceleration;
    }
    action.progress += action.rate * action.direction;
    this.depth += action.rate * action.direction;

    return action;
}


// Update the coordinate variables as a change in size is animated
Bit.prototype.updateResize = function(action) {
    action = Animata.prototype.updateResize.call(this, action);
    this.updateCoordinateVars(this.size);

    return action;
}


// Animate the transformation of the bit into a different shape
Bit.prototype.updateTransform = function(action) {
    action.progress = this.corner_rating;

    if (!action.initialized) {
        if (action.progress > action.goal) {
            action.direction = -1;
        }
        action.initialized = true;
    }

    // Check for completeness
    if (action.progress * action.direction > action.goal * action.direction) {
        action.progress = action.goal;
        this.corner_rating = action.goal;
        action.complete();
        this.corner_dist = this.radius + (this.bezier_dist * this.corner_rating);
        return action;
    }

    // Increment the corner_rating and the progress of the action
    action.progress += action.rate * action.direction;
    this.corner_rating += action.rate * action.direction;

    this.corner_dist = this.radius + (this.bezier_dist * this.corner_rating);
    return action;
}


// TODO: dynamically size the fill to match the size of the bit
//      IDEA: define in this class, but use to super to perform shared code
