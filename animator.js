/************************************/
/*             ANIMATOR             */
/************************************/

/* The Animator will manage the drawing of all objects on the canvas frame-by-frame */

function Animator(canvas) {
    this.queue = [];        // The queue containing the id of each object currently being animated
    this.objects = {};      // Associative array containing all of the drawable objects managed by the Animator
}


// The Animate method facilitates the drawing of every frame
Animator.prototype.animate = function() {
    draw.clearRect(0, 0, dimension_x, dimension_y);

    // Draw all of the active animata
    let termination_list = [];
    this.queue.forEach((id) => {
       // Queue the object for deletion from the animation loop if terminated
       if (this.objects[id].terminated) {
           termination_list.push(id);
       }
       this.objects[id].draw();
       this.objects[id].update();

       // Check for a wait condition
       let condition = this.objects[id].wait_condition;
       if (condition && Array.isArray(condition)) {
           if (this.objects[condition[0]]
               && this.objects[condition[0]].current_action_set
               && this.objects[condition[0]].current_action_set.actions[condition[1]]) {

               // The wait condition has been met and can be removed from the current_object
               this.objects[id].clearWaitCondition();
           }

       }
    });

    // Remove any terminated objects from the animation loop
    termination_list.forEach((id) =>{
       this.removeObject(id);
    });

    // Loop indefinitely
    window.requestAnimationFrame(() => this.animate());

    return;
}


// Add an object to the list of objects queued to be animated
// If an object already exists in the queue with the same id, then replace it
Animator.prototype.addObject = function(id, object) {
    if (this.objects[id]) {
        this.removeObject(id);
    }

    this.queue.push(id);
    this.objects[id] = object;
}


// Remove an object from the queue of currently animated objects
Animator.prototype.removeObject = function(id) {
    delete this.objects[id];
    let index = this.queue.indexOf(id);
    this.queue.splice(index, 1);
}
