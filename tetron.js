/*****************************************


                tetron

       -- a recreation of tetris
       for educational purposes --


*****************************************/

// Dimensions of canvas variables to be accessible globally
var dimension_x = 720;
var dimension_y = 720;
var canvas_center_x = dimension_x/2;
var canvas_center_y = dimension_y/2;

// Variables storing canvas context and animation states
var draw;
var animator;

function main() {
    console.log("Initializing 'tetron'");

    // Initialize the canvas context and the animator
    draw = document.getElementById("canvas").getContext("2d");
    draw.globalCompositeOperation = 'source-over';
    animator = new Animator(draw);

    // Let's get this started
    let test_bit_01 = new Bit("test_01", "square", 360, 325, 30);
    let test_bit_02 = new Bit("test_02", "square", 360, 360, 30);
    let test_bit_03 = new Bit("test_03", "square", 360, 395, 30);
    let test_bit_04 = new Bit("test_04", "square", 325, 395, 30);

    animator.addObject("test_01", test_bit_01);
    animator.addObject("test_02", test_bit_02);
    animator.addObject("test_03", test_bit_03);
    animator.addObject("test_04", test_bit_04);

    animator.objects["test_01"].intro();
    animator.objects["test_02"].intro();
    animator.objects["test_03"].intro();
    animator.objects["test_04"].intro();

    animator.objects["test_01"].newActionSet("transform");
    animator.objects["test_01"].transform("t_1", 'circle', 1.75);
    animator.objects["test_01"].closeActionSet();

    animator.objects["test_02"].newActionSet("transform");
    animator.objects["test_02"].transform("t_2", 'circle', 2.5);
    animator.objects["test_02"].closeActionSet();

    animator.objects["test_03"].newActionSet("transform");
    animator.objects["test_03"].transform("t_1", 'circle', 3.5);
    animator.objects["test_03"].closeActionSet();

    animator.objects["test_04"].newActionSet("transform");
    animator.objects["test_04"].transform("t_1", 'circle', 4);
    animator.objects["test_04"].closeActionSet();

    // TODO: well this is broken
    // animator.objects["test_01"].outro();
    // animator.objects["test_02"].outro();
    // animator.objects["test_03"].outro();
    // animator.objects["test_04"].outro();

    console.log(animator);

    animator.animate();
}


main();
