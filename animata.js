/*****************************/
/*          ANIMATA          */
/*****************************/

/* The Animata object contains all of the essential attributes and methods
 * that allow an object to participate in the animation cycle facilitated by
 * the Animator.  */
function Animata(id, position_x, position_y, size) {
    // General Attributes
    this.id = id;
    this.size = size;
    this.visible = false;
    this.terminated = false;
    this.text;      // To be set as an HTML element displaying text specified by setText()
    this.text_loaded = false;

    // Action attributes
    this.action_queue = [];
    this.current_action_set;
    this.current_action_build;
    this.action_hold = false;
    /* When a wait condition is in place it shall be formatted as an array with
     * two values. The first value shall be the id of the animata that shall perform
     * the action being waited on and the second value shall be the id of the action
     * being waited on */
    this.wait_condition = false;
    this.waitlisted = false;

    // Position attributes
    this.position_x = position_x;
    this.position_y = position_y;
    this.angle = 0;
}



/*------- DISPLAY -------*/

// Draw a red circle with an exclamation by default
// This should be overridden by a child object
Animata.prototype.draw = function() {
    ctx.save();

    // Set the rotation
    ctx.translate(this.position_x, this.position_y);
    ctx.rotate(this.angle * Math.PI/180);
    ctx.translate(-this.position_x, -this.position_y);

    // Draw the circle
    ctx.beginPath();
    ctx.arc(this.position_x, this.position_y, 20, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();

    // Set the default text to an exclamation point
    this.setText("!", 15);

    ctx.restore();
}


// Display the associated text
Animata.prototype.displayText = function(action_id, rate, opacity = 1.0) {
    let display_text = new Action('display_text', action_id, opacity, rate);
    this.assignAction(display_text);
}



/*------- MANIPULATE -------*/

// Set the text within an HTML element associated with the animata along with a click-triggered action
// The default HTML element is a LightTextItem
Animata.prototype.setText = function(text, font_size, click_function = null) {
    this.text = new LightTextItem(this.id, text, font_size, this.position_x, this.position_y, click_function);
}


// Remove the the HTML element associated with the animata
Animata.prototype.removeText = function() {
    this.text.delete();
    delete this.text;
}

// Resize the animata to have a size of new_size
// NOTE: size cannot be reduced to a value less than 0
Animata.prototype.resize = function(action_id, new_size, rate = 1, carryover = false) {
    if (new_size < 0) {
        console.error("animata size cannot be lower than 0");
        return;
    }

    let resize = new Action('resize', action_id, new_size, rate);
    resize.carryover = carryover;
    this.assignAction(resize);
}

// Move the animata to a goal location (absolute coordinates)
Animata.prototype.moveTo = function(action_id, goal_x, goal_y, velocity = 1, carryover = false) {
    let move = new Action('move', action_id, [goal_x, goal_y], velocity);
    move.carryover = carryover;

    this.assignAction(move);
}


// Move the animata by specified x and y distances (relative coordinates)
Animata.prototype.moveBy = function(action_id, relative_x, relative_y, velocity = 1, carryover = false) {
    let goal_x = this.position_x + relative_x;
    let goal_y = this.position_y + relative_y;
    let move = new Action('move', action_id, [goal_x, goal_y], velocity);
    move.carryover = carryover;

    this.assignAction(move);
}


// Rotate the animata by a specified angle in degrees
// Negative rate -> clockwise; positive rate -> counter-clockwise
Animata.prototype.rotate = function(action_id, angle, rate = 1, carryover = false) {
    let rotate = new Action('rotate', action_id, angle, rate);
    rotate.carryover = carryover;

    this.assignAction(rotate);
}


// Set the animata to wait for a specific action to be performed by another animata
// The delay value will determine how long to continue waiting after the specified action begins
Animata.prototype.waitOn = function(object_id, action_id, delay = 0) {
    this.wait_condition = [object_id, action_id];

    let wait = new Action('wait', this.id + "_waiting", delay);
    this.assignAction(wait);
}



/*------- UPDATE -------*/

// Call the appropriate update function for the specified action
Animata.prototype.updateAction = function(action) {
    let modified_action;
    switch (action.type) {
        case 'display_text':
            modified_action = this.updateDisplayText(action);
            break;
        case 'resize':
            modified_action = this.updateResize(action);
            break;
        case 'move':
            modified_action = this.updateMove(action);
            break;
        case 'rotate':
            modified_action = this.updateRotation(action);
            break;
        case 'wait':
            modified_action = this.updateWait(action);
            break;
        default:
            console.error("The Animata with id '" + this.id + "' cannot perform the action with id '" + action.id + "'.");
            return;
    }
    return modified_action;
}


// Animate the HMTL element with text associated with the animata
Animata.prototype.updateDisplayText = function(action) {
    if (!this.text_loaded) {
        this.text.display(action.rate, action.level);
        this.text_loaded = true;
        action.complete();
    }

    return action;
}


// Animate change in size
Animata.prototype.updateResize = function(action) {
    action.progress = this.size;

    if (!action.initialized) {
        if (action.progress > action.goal) {
            action.direction = -1;
        }
        action.initialized = true;
    }

    if (action.progress * action.direction >= action.goal * action.direction) {
        action.progress = action.goal;
        this.size = action.goal;
        action.complete();
        return action;
    } else {
        action.progress += action.rate * action.direction;
        this.size += action.rate * action.direction;
    }

    return action;
}


// Animate change in position
Animata.prototype.updateMove = function(action) {
    // Complete action initialization process if necessary
    if (!action.initialized) {
        // Simulate having the center of the animatable object as the origin of a new coordinate plane
        action.relative_goal_x = action.destination_x - this.position_x;
        action.relative_goal_y = action.destination_y - this.position_y;

        // Using a 1 or -1, set whether the x and y-coordinates will increase or decrease with the position change
        action.direction_x = 1;
        action.direction_y = 1;
        if (action.destination_x < this.position_x) {
            action.direction_x = -1;
        }
        if (action.destination_y < this.position_y) {
            action.direction_y = -1;
        }

        // Separate the movement rate into a horizontal and vertical velocity
        let angle = Math.atan(Math.abs(action.relative_goal_y)/Math.abs(action.relative_goal_x));
        action.velocity_x = action.velocity * Math.cos(angle);
        action.velocity_y = action.velocity * Math.sin(angle);

        action.initialized = true;
    }

    // Remove any extra progress made in any direction
    if (action.progress_x * action.direction_x >= action.relative_goal_x * action.direction_x) {
        let excess = action.progress_x - action.relative_goal_x;
        action.progress_x = action.relative_goal_x;
        this.position_x -= excess * action.direction_x;
        action.reached_x = true;
    }

    if (action.progress_y * action.direction_y >= action.relative_goal_y * action.direction_y) {
        let excess = action.progress_y - action.relative_goal_y;
        action.progress_y = action.relative_goal_y;
        this.position_y -= excess * action.direction_y;
        action.reached_y = true;
    }

    // Check to see if the destination has been reached and update if unnecessary
    if (action.reached_x && action.reached_y) {
        if (this.text) {
            this.text.updatePosition(this.position_x, this.position_y);
        }
        action.complete();
        return action;
    }
    if (!action.reached_x) {
        action.progress_x += action.velocity_x * action.direction_x;
        this.position_x += action.velocity_x * action.direction_x
    }
    if (!action.reached_y) {
        action.progress_y += action.velocity_y * action.direction_y;
        this.position_y += action.velocity_y * action.direction_y
    }
    if (this.text) {
        this.text.updatePosition(this.position_x, this.position_y);
    }

    return action;
}


// Animate change in rotation
Animata.prototype.updateRotation = function(action) {
    action.progress = this.angle;

    // Complete action initialization progress if necessary
    if (!action.initialized) {
        if (action.progress > action.goal) {
            action.direction = -1;
        }
        action.initialized = true;
    }

    // Check to see if goal has been reached and update if necessary
    if (action.progress * action.direction > action.goal * action.direction) {
        action.progress = action.goal;
        this.angle = action.goal;
        action.complete();
        return action;
    } else {
        action.progress += action.rate * action.direction;
        this.angle += action.rate * action.direction;
    }

    return action;
}


// Update the waiting status of the animata in accordance with the wait_condition
// i.e., resume actions after the sepcified delay once the wait_condition is cleared
Animata.prototype.updateWait = function(action) {
    if (!this.wait_condition) {
        action.progress = performance.now();

        // Start the delay timer now that the wait_condition has been met
        if (!action.initialized) {
            action.goal_time = action.progress + action.wait_time;
            action.initialized = true;
        }

        // Once the current time meets or exceeds the goal time, the wait action is complete
        if (action.progress >= action.goal_time) {
            action.complete();
            return action;
        }
    }

    return action;
}


// Facilitate the animation progress of the animata
/* This entails updating the actions in the current action set and progressing to
 * the next action set in the queue if possible */
Animata.prototype.update = function() {
    if (!this.current_action_set || this.current_action_set.isComplete()) {
        this.nextActionSet();
    }

    if (this.current_action_set) {
        let carryover = true;
        let action_disposal = [];
        this.current_action_set.action_ids.forEach(action_id => {
            let current_action = this.current_action_set.actions[action_id];

            // The current action may disqualify the entire action set from carrying over into the next action set
            if (!current_action.carryover) {
                carryover = false;
            }

            if (!current_action.paused) {
                // The updateAction method shall return an updated Action object
                this.current_action_set.actions[action_id] = this.updateAction(current_action);

                // Stage any completed actions from the current_action_set for deletion
                if (this.current_action_set.actions[action_id].is_complete) {
                    action_disposal.push(action_id);
                }
            }
        });

        // Remove any completed actions from the current_action_set
        action_disposal.forEach(action_id => {
            this.current_action_set.removeAction(action_id);
        });

        // If elegible, carry over all of the current actions into the next queued action set
        if (carryover && this.action_queue[0]) {
            this.performCarryover();
        }
    }
}



/*------- ACTION TRACKING -------*/

// Clear the wait condition
Animata.prototype.clearWaitCondition = function() {
    this.wait_condition = false;
}


// Start building a new action set for the Animata
Animata.prototype.newActionSet = function() {
    this.current_action_build = new ActionSet();
    this.action_hold = true;
}


// Queue another action and join it with the current action_set or the current_action_build
Animata.prototype.assignAction = function(action) {
    // An action hold indicates that a new action set (i.e., current_action_build) is being built for future execution
    // Otherwise, the action shall be executed immediately by joing the current_action_set
    if (this.action_hold) {
        if (this.current_action_build) {
            this.current_action_build.appendAction(action);
        } else {
            console.error("Something went terribly wrong. There is an action_hold and no current_action_build.");
        }
    } else {
        if (!this.current_action_set) {
            this.current_action_set = new ActionSet(this.id + "_" + action.id);
        }
        this.current_action_set.appendAction(action);
    }
}


// Complete the current_action_build and add it to the action_queue
Animata.prototype.closeActionSet = function() {
    this.action_queue.push(this.current_action_build);
    delete this.current_action_build;
    this.action_hold = false;
}


// Pull the next action set from the action_queue and set it as the current_action_set
Animata.prototype.nextActionSet = function() {
    this.current_action_set = this.action_queue.shift();
}


// Remove all action sets from the action_queue
Animata.prototype.clearActionQueue = function() {
    this.action_queue = [];
}


// Stop all current actions and remove all action sets from the action_queue
Animata.prototype.stop = function() {
    delete this.current_action_set;
    this.action_queue = [];
}


// Pause all actions in the current_action_set or a specific action if specified
Animata.prototype.pause = function (action_id = null) {
    if (action_id) {
        this.current_action_set.actions[action_id].pause();
    } else {
        this.current_action_set.forEach(action => {
           action.pause();
        });
    }
}


// Resume all actions in the current_action_set or a specific action if specified
Animata.prototype.resume = function(action_id = null) {
    if (action_id) {
        this.current_action_set.actions[action_id].resume();
    } else {
        this.current_action_set.actions.forEach(function(action) {
           action.resume();
        });
    }
}


// Carry over all of the actions in the current_action_set into the next action set in the action_queue
Animata.prototype.performCarryover = function() {
    this.current_action_set.action_ids.forEach(action_id => {
        this.action_queue[0].appendAction(this.current_action_set.actions[action_id]);
    });
    delete this.current_action_set;
}
