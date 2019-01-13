/**************************/
/*          BIT           */
/**************************/

// The Bit object is the smallest manipulable object on the canvas.
// The Bit object inherits from the Animata object
/* The default shape of a bit is a square and it can become a circle. This is done
 * by using bezier curves for the edges. We can simulate an approximation of a circle
 * using 4 cubic bezier curves with control points with a distance of 0.5522847498
 * away from the end points along the edge of the square within which the circle is inscribed.
 * source: https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves */
const bezier_const = 0.5522847498;
const inverse_bezier_const = 1 - bezier_const;

function Bit(id, position_x, position_y, size) {
    // Inherit details from the Animata constructor
    Animata.call(this, id, position_x, position_y, size);

    // Shape attributes
    this.bezier_dist = 0;

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


/*------- DISPLAY -------*/

/* The appearance of a bit in this instance is of a platform recessed into the
 * screen. This is done by drawing a ring structure (square-like to begin with),
 * projecting a shadow, and masking the outer edges and shadows out. */
Bit.prototype.draw = function () {
    draw.save();

    draw.translate(this.center_x, this.center_y);
    draw.rotate(this.angle * Math.PI/180);

    // Calculate the distance of the bezier control points
    let adjusted_dist = this.size - (inverse_bezier_const * this.bezier_dist);

    // Set the mask
    draw.beginPath();
    draw.moveTo(-this.size, -this.size);
    draw.bezierCurveTo(this.size, -adjusted_dist, adjusted_dist, -this.size, this.size, -this.size);
    draw.bezierCurveTo(adjusted_dist, this.size, this.size, adjusted_dist, this.size, this.size);
    draw.bezierCurveTo(-this.size, adjusted_dist, -adjusted_dist, this.size, -this.size, this.size);
    draw.bezierCurveTo(-adjusted_dist, -this.size, -this.size, -adjusted_dist, -this.size, -this.size);
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
    let ring_width = 40;

    draw.beginPath();
    draw.moveTo(-(this.size + ring_width), -(this.size + ring_width));
    draw.bezierCurveTo(this.size + ring_width, -adjusted_dist, adjusted_dist, -(this.size + ring_width), this.size + ring_width, -(this.size + ring_width));
    draw.bezierCurveTo(adjusted_dist, this.size + ring_width, this.size + ring_width, adjusted_dist, this.size + ring_width, this.size + ring_width);
    draw.bezierCurveTo(-(this.size + ring_width), adjusted_dist, -adjusted_dist, this.size + ring_width, -(this.size + ring_width), this.size + ring_width);
    draw.bezierCurveTo(-adjusted_dist, -(this.size + ring_width), -(this.size + ring_width), -adjusted_dist, -(this.size + ring_width), -(this.size + ring_width));

    draw.moveTo(-this.size, -this.size);
    draw.bezierCurveTo(-this.size, adjusted_dist, -adjusted_dist, this.size, -this.size, this.size);
    draw.bezierCurveTo(adjusted_dist, this.size, this.size, adjusted_dist, this.size, this.size);
    draw.bezierCurveTo(this.size, -adjusted_dist, adjusted_dist, -this.size, this.size, -this.size);
    draw.bezierCurveTo(-adjusted_dist, -this.size, -this.size, -adjusted_dist, -this.size, -this.size);

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
        console.error('Diamond depth cannot be set to a value lower than 0');
        return;
    }

    let set_depth = new Action('set_depth', action_id, new_depth, rate);
    set_depth.carryover = carryover;
    set_depth.acceleration = -(0.02);
    this.assignAction(set_depth);
}


// Transform the Bit into another shape
// The default shape is a square. Other shapes include: circle (currently the only other shape)
Bit.prototype.transform = function(action_id, new_shape, rate, carryover = false) {

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
        default:
            // Check if it is an action defined by the Animata (parent)
            modified_action = this.super.updateAction(action);
    }

    return modified_action;
}


// Animate the initial appearance of the bit
Bit.prototype.updateIntro = function(action) {

}


// Animate the final disappearance of the bit
Bit.prototype.updateOutro = function(action) {

}


// Animate color fill when setting new colors
Bit.prototype.updateFill = function(action) {
    console.log("updateFill: " + action.progress + ">" + action.destination);
    console.log("udpateFill")
    // Check for completion
    if (action.progress >= action.destination) {
        action.progress = action.destination;
        action.complete();
        return action;
    }
    // Apply acceleration/decceleration to rate without halting the fill before it is complete
    if (action.rate + action.acceleration > 0) {
        action.rate += action.acceleration;
    }
    action.progress += action.rate;
    this.fill_levels[action.action_id] += action.rate;

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
    } else {
        // Apply acceleration/decceleration to the rate without halting the depth change before it is complete
        if (action.rate + action.acceleration > 0) {
            action.rate += action.acceleration;
        }
        action.progress += action.rate * action.direction;
        this.depth += action.rate * action.direction;
    }

    return action;
}


// TODO: dynamically size the fill to match the size of the bit
//      IDEA: define in this class, but use to super to perform shared code
