/*****************************************


                tetron

       -- a recreation of tetris
       for educational purposes --


*****************************************/

// NOTE: Safari provides the best and most consistent performance when compared with Chrome and Firefox.

// Dimensions of canvas variables to be accessible globally
var dimension_x = window.screen.availHeight * 0.85;
var dimension_y = window.screen.availHeight * 0.85;
var canvas_center_x = dimension_x/2;
var canvas_center_y = dimension_y/2;

// Variables storing canvas context and animation states
var ctx;
var animator;

// Tetron UI variables
var bit_size = dimension_y / 25;
var bit_padding = dimension_y / 22;       // Padding between each Bit
var board_size_x = dimension_x / 2.13;
var board_size_y = dimension_y * 0.925;
var board_position_x = dimension_x / 3.75;
var board_position_y = dimension_y / 20;
var inner_board_padding_left = dimension_x / 33;  // Padding between the edges of the board and objects located on the board
var inner_board_padding_top = dimension_y / 33;
var ui_padding_x = dimension_x / 27;
var ui_padding_y = dimension_y / 27;

Tetron();


function Tetron() {
    console.log("Initializing 'tetron'");

    console.log(`x: ${dimension_x}, y: ${dimension_y}`);

    // Set the resolution for the canvas
    document.getElementById("canvas").setAttribute("width", dimension_x);
    document.getElementById("canvas").setAttribute("height", dimension_y);
    document.getElementById("canvas_container").setAttribute("width", dimension_x);
    document.getElementById("canvas_container").setAttribute("height", dimension_y);

    // Initialize the canvas context and the animator
    ctx = document.getElementById("canvas").getContext("2d");
    ctx.globalCompositeOperation = 'source-over';
    animator = new Animator(60); // Set framerate to ~60 fps

    displayUI();
    

    animator.animate();
}



/***********
 *   UI    *
 ***********/
// Draw the main UI elements for the game
function displayUI() {
    // Set the entire game window as a hollow providing shadows inward from all edges
    let window_background = new Hollow("window_background", 0, 0, dimension_x, dimension_y);
    animator.addObject("window_background", window_background);
    animator.objects["window_background"].intro();

    // Add the background for the game board
    let board_background = new Platform("board_background", board_position_x, board_position_y, board_size_x, board_size_y);
    animator.addObject("board_background", board_background);
    animator.objects["board_background"].waitOn("window_background", "intro" , 300);
    animator.objects["board_background"].intro();

    // Add the background for the piece in hold
    let hold_size = board_size_x / 2.5;
    let hold_background = new Platform("hold_background", board_position_x - ui_padding_x - hold_size, ui_padding_y, hold_size, hold_size);
    animator.addObject("hold_background", hold_background);
    animator.objects["hold_background"].waitOn("board_background", "intro", 425);
    animator.objects["hold_background"].intro();

    // Add a background for each of the next pieces being shown
    let next1_size = board_size_x / 2.5;
    let next1_background = new Platform("next1_background", board_position_x + board_size_x + ui_padding_x, ui_padding_y, next1_size, next1_size);
    animator.addObject("next1_background", next1_background);
    animator.objects["next1_background"].waitOn("board_background", "intro", 200);
    animator.objects["next1_background"].intro();

    let next2_size = board_size_x / 3;
    let next2_background = new Platform("next2_background",  board_position_x + board_size_x + ui_padding_x, ui_padding_y + next1_size + ui_padding_y, next2_size, next2_size);
    animator.addObject("next2_background", next2_background);
    animator.objects["next2_background"].waitOn("board_background", "intro", 300);
    animator.objects["next2_background"].intro();

    let next3_size = board_size_x / 3;
    let next3_background = new Platform("next3_background",  board_position_x + board_size_x + ui_padding_x, ui_padding_y + next1_size + next2_size + (ui_padding_y * 2), next3_size, next3_size);
    animator.addObject("next3_background", next3_background);
    animator.objects["next3_background"].waitOn("board_background", "intro", 350);
    animator.objects["next3_background"].intro();

    let next4_size = board_size_x / 3;
    let next4_background = new Platform("next4_background",  board_position_x + board_size_x + ui_padding_x, ui_padding_y + next1_size + next2_size + next3_size + (ui_padding_y * 3), next4_size, next4_size);
    animator.addObject("next4_background", next4_background);
    animator.objects["next4_background"].waitOn("board_background", "intro", 375);
    animator.objects["next4_background"].intro();
}


/* The Board consists of a matrix with 1's representing spaces taken up by placed tetrominos.
        * The spaces in the Board are numbered left to right (rows) and from top to bottom (columns).
        * Tetrominos spawn on row 1.
        * Row 1 is partially visible and row 0 is completely invisible.
        * TENTATIVE: The game ends when any part of a tetromino is placed on row 0
*/
function Board() {
    this.row_count = 22;
    this.column_count = 10;

    // Initialize the board_matrix 2-dimensional array with zeros
    // board_matrix[row][col]
    this.board_matrix = [];
    for (let row = 0; row < this.row_count; ++row) {
        this.board_matrix[row] = [];
        for (let col = 0; col < this.column_count; ++col) {
            this.board_matrix[row][col] = 1;
        }
    }
}

// Places a tetromino data_matrix onto the board_matrix
Board.prototype.commit = function(tetromino) {

}

// Check the Board for completed lines
Board.prototype.scan = function(tetromino) {

}



function bitArrayTest() {
    for (let i = 0; i < 20; ++i) {
        for (let j = 0; j < 10; ++j) {
            let id = "test_" + i + "_" + j;
            let test_bit = new Bit(id, "circle", board_position_x + inner_board_padding_left + (bit_padding * j), board_position_y + inner_board_padding_top + (bit_padding * i), bit_size);
            animator.addObject(id, test_bit);
            animator.objects[id].waitOn("hold_background", "intro", 500);
            animator.objects[id].intro("#4474CE");
            if (i != 0 && i != 1) {
                //animator.objects[id].setDepth("complete_" + id, 0, 2);
                // animator.objects[id].newActionSet();
                // animator.objects[id].waitOn("hold_background", "intro", 1000);
                // animator.objects[id].closeActionSet();

                // animator.objects[id].newActionSet();
                // animator.objects[id].transform("demo_transform", "circle", 5);
                // animator.objects[id].setDepth("demo_depth", 0);
                // animator.objects[id].closeActionSet();

                // animator.objects[id].newActionSet();
                // animator.objects[id].transform("arrow", "circle");
                // animator.objects[id].closeActionSet();

                animator.objects[id].newActionSet();
                animator.objects[id].setDepth("demo_depth", 0, 0.3);
                //animator.objects[id].outro();
                animator.objects[id].closeActionSet();

                animator.objects[id].newActionSet();
                animator.objects[id].transform("placement", "square", 0.4);
                animator.objects[id].closeActionSet();
            }
            //animator.objects[id].outro();

        }
    }
}
