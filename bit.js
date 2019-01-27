/**************************/
/*          BIT           */
/**************************/

// The Bit object is the smallest manipulable object on the canvas.
// The Bit object inherits from the Animata object
/* The default shape of a bit is a square and it can become a circle. This is done
 * by using bezier curves for the edges. We can simulate an approximation of a circle
 * using 4 cubic bezier curves with control points with a distance of radius * 0.5522847498
 * away from the end points along the edge of the square within which the circle is inscribed.
 * source: https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves */
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

    // Coordinate variables (TODO: shall be updated with any update to size)
    this.square_corner_dist;
    this.bezier_dist;
    this.radius;

    // Will this work????
    this.updateCoordinateVars(size);
    console.log("sq corner: " + this.square_corner_dist);
    console.log("bezier_dist: " + this.bezier_dist);
    console.log("radius: " + this.radius);

    // The calculated distance of all corners from the center (TODO: shall be updated with any update to the shape)
    this.corner_position = this.radius + (this.bezier_dist * this.corner_rating);

    // Shadow attributes
    this.depth = 0;
    this.max_depth = 5;

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
 *      size (s):           the horizontal distances between the edges when the Bit is a quare with a corner_rating of 1
 *      square_corner_dist (scd):   the distance between the center and a corner of the square resulting from a corner_rating of 1
 *      bezier_const (bc):  * refer to the top of this document *
 *      bezier_dist (bd):   the distance between a control point and its respective point on a circle created from bezier curves
 *      radius (r):         the radius of the circle resulting from a corner_rating of 0
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
}



/*------- DISPLAY -------*/

/* The appearance of a bit in this instance is of a platform recessed into the
 * screen. This is done by drawing a ring structure (square-like to begin with),
 * projecting a shadow, and masking the outer edges and shadows out. */
Bit.prototype.draw = function() {
    draw.save();

    // The bit is drawn at a 45 degree offset and then rotated back 45 degrees to correct the offset.
    // The rotation offset will simplify the drawing process.
    draw.translate(this.center_x, this.center_y);
    draw.rotate((this.angle + 45) * Math.PI/180);

    this.corner_position = this.radius + (this.bezier_dist * this.corner_rating)

    // Set the mask
    draw.beginPath();
    draw.moveTo(0, -this.corner_position);
    draw.bezierCurveTo(this.bezier_dist, -this.radius, this.radius, -this.bezier_dist, this.corner_position, 0);
    draw.bezierCurveTo(this.radius, this.bezier_dist, this.bezier_dist, this.radius, 0, this.corner_position);
    draw.bezierCurveTo(-this.bezier_dist, this.radius, -this.radius, this.bezier_dist, -this.corner_position, 0);
    draw.bezierCurveTo(-this.radius, -this.bezier_dist, -this.bezier_dist, -this.radius, 0, -this.corner_position);
    draw.closePath();
    draw.clip();

    // Draw the fill layers in chronological order starting with the oldest layer
    let disposal_index = 0;
    for (let i = this.fill_layers.length - 1; i >= 0; --i) {
        let fill_id = this.fill_layers[i];
        if (this.fill_levels[fill_id] >= this.size) {
            disposal_index = i + 1;
        }
        draw.beginPath();
        draw.arc(0, 0, this.fill_levels[fill_id], 0, 2 * Math.PI);
        draw.closePath();
        draw.fillStyle = this.fill_colors[fill_id];
        draw.fill();
    }

    // Remove all old fill layers that have been completely obscured by new fill layers
    if (disposal_index > 0 && disposal_index < this.fill_layers.length) {
        let top_layer = this.fill_layers[disposal_index - 1];
        let old_fill_layers = this.fill_layers.splice(disposal_index);

        old_fill_layers.forEach((fill_id) => {
            delete this.fill_colors[fill_id];
            delete this.fill_levels[fill_id];
        });
    }

    // Draw the ring like object that will project the shadow
    // The outer shape will always be a square since it will not be visible
    let ring_width = 40;
    let outer_corner_position = this.square_corner_dist + ring_width;

    draw.beginPath();
    draw.moveTo(0, -outer_corner_position);
    draw.lineTo(outer_corner_position, 0);
    draw.lineTo(0, outer_corner_position);
    draw.lineTo(-outer_corner_position, 0);
    draw.lineTo(0, -outer_corner_position);

    // Draw counter-clockwise to create the hole in the ring
    draw.moveTo(0, -this.corner_position);
    draw.bezierCurveTo(-this.bezier_dist, -this.radius, -this.radius, -this.bezier_dist, -this.corner_position, 0);
    draw.bezierCurveTo(-this.radius, this.bezier_dist, -this.bezier_dist, this.radius, 0, this.corner_position);
    draw.bezierCurveTo(this.bezier_dist, this.radius, this.radius, this.bezier_dist, this.corner_position, 0);
    draw.bezierCurveTo(this.radius, -this.bezier_dist, this.bezier_dist, -this.radius, 0, -this.corner_position);

    draw.closePath();

    // The shadows are set to simulate a light source from the upper-left direction
    draw.shadowBlur = this.depth * 1.2;
    draw.shadowColor = "rgb(0, 0, 0)";
    draw.shadowOffsetX = this.depth / 2;
    draw.shadowOffsetY = this.depth / 2;
    draw.fillStyle = "rgba(126, 126, 126, 1)";
    draw.fill();
    //draw.translate(-this.center_x, this.center_y);

    draw.restore();
}


// Animate the Bit appearing with an intro animation
// Fill the initial square shape and then recess it to the inital_depth
Bit.prototype.intro = function(rate = 1, initial_depth = this.max_depth) {
    // First, recess
    this.newActionSet(this.id + '_intro_step_2');
    this.setDepth('intro_recess', initial_depth, rate * 0.5);
    this.closeActionSet();
    // Then, fill
    this.newActionSet(this.id + '_intro_step_1');
    this.setColor('intro_fill', "rgb(126, 54, 80)", rate * 0.5);
    this.closeActionSet();
}


// Animate the Bit disappearing with an outro animation
// Perform the opposite of the intro
Bit.prototype.outro = function(rate = 1) {
    // First, set depth to 0
    this.newActionSet(this.id + '_outro_step_1');
    this.setDepth('outro_unrecess', 0, rate);
    this.closeActionSet();
    // Then, unfill
    this.newActionSet(this.id + '_outro_step_2');
    this.removeColor('outro_unfill', rate);
    this.closeActionSet();
}



/*------- MANIPULATE -------*/

// Set a new fill color and schedule the fill animation
// Consists of a circle of the new color growing from the center to fill the Bit
Bit.prototype.setColor = function(action_id, new_fill, rate, carryover = false) {
    this.fill_layers.unshift(action_id);
    this.fill_colors[action_id] = new_fill;
    this.fill_levels[action_id] = 0;

    let fill = new Action('fill', action_id, this.size * 2, rate);
    fill.acceleration = 0.02;
    fill.carryover = carryover;
    this.assignAction(fill);
}


// Remove all fill color layers
Bit.prototype.removeColor = function(action_id, rate, carryover = false) {
    let unfill = new Action('unfill', action_id, null, rate);
    unfill.acceleration = 0.02;
    unfill.carryover = carryover;
    this.assignAction(unfill);
}


// Set the depth of the bit to increase/decrease the recession into the page
// NOTE: depth cannot be reduced to a value less than 0
Bit.prototype.setDepth = function(action_id, new_depth, rate, carryover = false) {
    if (new_depth < 0) {
        console.error("Bit depth cannot be set to a value lower than 0");
        return;
    }

    let set_depth = new Action('set_depth', action_id, new_depth, rate);
    set_depth.carryover = carryover;
    set_depth.acceleration = -(0.02);
    this.assignAction(set_depth);
}


// Transform the Bit into another shape
// The default shape is a square. Currently the only other available shape is a circle.
Bit.prototype.transform = function(action_id, new_shape, rate, carryover = false) {
    if (new_shape == this.shape) {
        console.error("Bit with id '" + this.id + "' is already of the shape type '" + new_shape + "'");
        return;
    }
    let transform;

    // Transform into the appropriate shape
    switch (new_shape) {
        case 'circle':
            transform = new Action('transform', action_id, 0, rate);
            console.log("circle");
            console.log(transform.id);
            break;
        case 'square':
            transform = new Action('transform', action_id, 1, rate);
            break;
        default:
            console.error("'" + new_Shape + "' is not a valid shape for Bit with id '" + this.id + "'");
            return;
    }

    transform.carryover = carryover;
    console.log(transform.id);
    this.assignAction(transform);
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
        default:
            // Check if it is an action defined by the Animata (parent)
            //modified_action = Animata.prototype.updateAction.call(this, action); // Alternative
            modified_action = this.super.updateAction(action);
    }

    return modified_action;
}


// Animate color fill when setting new colors
Bit.prototype.updateFill = function(action) {
    console.log("updateFill: " + action.progress + ">" + action.destination);
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
    // If the fill layer has reached a level of 0 then they are removed
    let disposal_queue = [];
    let unfill_complete = true;
    this.fill_layers.forEach((fill_id) => {
        if (this.fill_levels[fill_id] <= 0) {
            disposal_queue.push(fill_id);
        } else {
            // Apply acceleration//decceleration to rate without halting the unfill before it is complete
            if (action.rate + action.acceleration > 0) {
                action.rate += action.acceleration;
            }
            this.fill_levels[fill_id] -= action.rate;
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
    console.log("updateSetDepth: " + this.depth + ">" + action.goal);

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

    // Apply acceleration/decceleration to the rate without halting the depth change before it is complete
    if (action.rate + action.acceleration > 0) {
        action.rate += action.acceleration;
    }
    action.progress += action.rate * action.direction;
    this.depth += action.rate * action.direction;

    return action;
}


// Animate the transformation of the bit into a different shape
Bit.prototype.updateTransform = function(action) {
    console.log("update transform:" + this.corner_rating + ">" + action.goal);
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
        return action;
    }

    // Increment the corner_rating and the progress of the action
    action.progress += action.rate * action.direction;
    this.corner_rating += action.rate * action.direction;

    return action;
}


// TODO: dynamically size the fill to match the size of the bit
//      IDEA: define in this class, but use to super to perform shared code
