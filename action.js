/********************/
/*      ACTION      */
/********************/

/* The Action object stores the dynamic state of a specific action until
 * the action is completed */
function Action(action, action_id, goal, rate = 1) {
    this.type = action;
    this.id = action_id;
    this.paused = false;
    this.is_complete = false;
    this.carryover = false;

    switch (action) {
        case 'display_text':
            this.level = goal;
            this.rate = rate;
            break;

        case 'resize':
            this.direction = 1;
            this.rate = Math.abs(rate);
            this.goal = goal;
            this.progress = 0;
            this.initialized = false;
            break;

        case 'move':
            // In this case, 'goal' is an array with two values [goal_x, goal_y]
            if (Array.isArray(goal)) {
                this.destination_x = goal[0];
                this.destination_y = goal[1];
            } else {
                this.destination_x = 0;
                this.destination_y = 0;
                goal = [0, 0];
            }
            this.velocity = rate;
            this.progress_x = 0;
            this.progress_y = 0;
            this.reached_x = false;
            this.reached_y = false;
            this.initialized = false;
            // The following attributes will be initialized at the start of the movement
            this.velocity_x;
            this.velocity_y;
            this.direction_x;
            this.direction_y;
            this.relative_goal_x;
            this.relative_goal_y;
            break;

        case 'rotate':
            this.direction = 1;
            this.rate = Math.abs(rate);
            this.goal = goal;
            this.progress = 0;
            this.initialized = false;
            break;

        case 'wait':
            this.wait_time = goal;
            this.goal_time = 0;
            this.progress = 0;
            this.initialized = false;
            this.carryover = false;
            break;

        case 'fill':
            this.progress = 0;
            this.destination = goal;
            this.rate = rate;
            break;

        case 'unfill':
            this.rate = rate;
            break;

        case 'set_depth':
            this.direction = 1;
            this.rate = Math.abs(rate);
            this.goal = goal;
            this.progress = 0;
            this.initialized = false;
            break;

        case 'transform':
            this.direction = 1;
            this.rate = rate * 0.01;
            this.goal = goal;
            this.initialized = false;
            break;

        default:
            console.error(action_id + ": '" + action + "' is not a valid action");
            break;
    }
}


// Pause the action
Action.prototype.pause = function() {
    this.pause = true;
}


// Resume the action from a paused state
Action.prototype.resume = function() {
    this.pause = false;
}


// Set the action as complete
// TODO: figure out any necessary clean up and if this is even necessary
Action.prototype.complete = function() {
    this.is_complete = true;
}



/***************************/
/*        ACTION SET       */
/***************************/

// The Action Set object will store and facilitate any set of actions being perform simultaneously
function ActionSet() {
    this.action_ids = [];
    this.actions = {};
}


// Add/link an action to the action set
ActionSet.prototype.appendAction = function(action) {
    //console.log("appending action '" + action.id + "' to action set '" + this.set_id + "'");
    this.action_ids.push(action.id);
    this.actions[action.id] = action;
}


// Remove/unlink an action from the action set
ActionSet.prototype.removeAction = function(action_id) {
    //console.log("removing action '" + action_id + "' from action set '" + this.set_id + "'");
    let index = this.action_ids.indexOf(action_id);
    this.action_ids.splice(index, 1);
    delete this.actions[action_id];
}


// Check to see if there any actions left in the action set and return true if so.
ActionSet.prototype.isComplete = function() {
    if (this.action_ids == 0) {
        return true;
    }
    return false;
}
