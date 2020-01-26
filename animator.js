/************************************/
/*             ANIMATOR             */
/************************************/

/* The Animator will manage the drawing of all objects on the canvas frame-by-frame */

function Animator(framerate) {
    this.queue = [];        // The queue containing the id of each object currently being animated
    this.objects = {};      // Associative array containing all of the drawable objects managed by the Animator

    // Framerate variables
    /* NOTE: Actual framerate will likely be off by a couple frames due to the precision of the
        Date.now() function. The Date.now() function has a precision to the nearest millisecond.
        The performance.now() function has the ability to provide a precision of fractions of a
        second, but is now inconsistently limited across browsers for security reasons. */
    this.framerate = framerate;
    this.frame_interval = Math.round(1000 / framerate);
    // console.log(this.frame_interval);
    this.then = Date.now();
    // console.log(`initial: ${this.then}`);
    this.now = 0;
    this.elapsed = 0;
    this.excess;
}


// The Animate method facilitates the drawing of every frame
Animator.prototype.animate = function() {
    // Maintain endless looping of animation frames
    window.requestAnimationFrame(() => this.animate());

    /* Track the duration of the current frame and wait (using while loop) the
       appropriate amount of time to maintain the desired framerate */
    this.now = Date.now();
    this.elapsed = this.now - this.then;

    //console.groupCollapsed();
    while (this.elapsed <= this.frame_interval) {
        this.now = Date.now();
        this.elapsed = this.now - this.then;
        // console.log(this.elapsed);
    }
    //console.groupEnd();

    // console.log(`EXITING LOOP ${this.elapsed}`);

    this.then = this.now;

    // Display framerate
    document.getElementById("framerate").innerHTML = `FPS: ${(1000 / this.elapsed).toFixed(1)}`;

    // Draw all drawable objects present in the current frame
    this.draw();

    return;
}



Animator.prototype.draw = function() {
    // Clear canvas
    ctx.clearRect(0, 0, dimension_x, dimension_y);

    // Draw all of the active animata
    let termination_list = [];
    this.queue.forEach(id => {
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
    termination_list.forEach(id => {
       this.removeObject(id);
    });
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
