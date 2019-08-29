/****************************/
/*        TETROMINOS        */
/****************************/

/* The Tetromino object will provide all basic functions shared by unique tetrominos.
        * row and col refer to the Tetromino's position on the board.
        * A Tetromino's location is referred to by the location of the second space in
            the top row of its rotation space.
        * The data_matrix is a representation of the Tetromino using 1's to represent
            a spot taken up by one of the Tetromino's pieces (visually a Bit).
        * The rotation_state is numbered 0-3 each next one representing a clockwise rotation.
*/
function Tetromino(id, row, col) {
    this.id = id;
    this.type = "";
    this.row = row;
    this.col = col;
    this.color = "#000000";
    this.data_matrix = [];
    this.rotation_state = 0;
    this.commit_pending = false;
}

// Spawn the tetromino and draw all of its Bits
Tetromino.prototype.spawn() {

}

// Shift the tetromino and its rotation space to the left on the board by 1 space
Tetromino.prototype.moveLeft() {

}

// Shift the tetromino and its rotation space to the right on the board by 1 space
Tetromino.prototype.moveRight() {

}

// Shift the tetromino and its rotation space down on the board by 1 space
Tetromino.prototype.moveDown() {

}

// Shift the tetromino
Tetromino.prototype.hardDrop() {

}

Tetromino.prototype.rotateClockwise() {

}

Tetromino.prototype.rotateCounterClockwise() {

}


/* There are 7 unique tetrominos: I, O, T, L, J, S, and Z
        All tetrominos will follow the Super Rotation System guidelines defined at:
            https://tetris.fandom.com/wiki/SRS
        The I and O pieces have a 4x4 rotation space.
        The T, L, J, S, and Z have a 3x3 rotation space.
        The diagram above each object definition represents the starting position.
*/

/******************/
/*    I-piece     */
/*    | | | | |   */
/*    |X|X|X|X|   */
/*    | | | | |   */
/*    | | | | |   */
/******************/
function TetrominoI(id, row = 20, col = 4) {
    Tetromino.call(this, id, row, col);
    this.type = "I";
    this.color = "#4AB4CE";     // Light blue
    this.data_matrix.push({0, 0, 0, 0});
    this.data_matrix.push({1, 1, 1, 1});
    this.data_matrix.push({0, 0, 0, 0});
    this.data_matrix.push({0, 0, 0, 0});
}

TetrominoI.prototype = Object.create(Tetromino.prototype);



/******************/
/*    O-piece     */
/*    | |X|X| |   */
/*    | |X|X| |   */
/*    | | | | |   */
/*    | | | | |   */
/******************/
function TetrominoO(id, row = 20, col = 4) {
    Tetromino.call(this, id, row, col);
    this.type = "I";
    this.color = "#DED87B";     // Yellow
}

TetrominoO.prototype = Object.create(Tetromino.prototype);



/*****************/
/*    T-piece    */
/*    | |X| |    */
/*    |X|X|X|    */
/*    | | | |    */
/*****************/
function TetrominoT(id, row = 20, col = 4) {
    Tetromino.call(this, id, row, col);
    this.type = "I";
    this.color = "#9537E8";     // Violet
}

TetrominoT.prototype = Object.create(Tetromino.prototype);



/*****************/
/*    L-piece    */
/*    | | |X|    */
/*    |X|X|X|    */
/*    | | | |    */
/*****************/
function TetrominoL(id, row = 20, col = 4) {
    Tetromino.call(this, id, row, col);
    this.type = "I";
    this.color = "#DB8F67";     // Orange
}



/*****************/
/*    J-piece    */
/*    |X| | |    */
/*    |X|X|X|    */
/*    | | | |    */
/*****************/
function TetrominoJ(id, row = 20, col = 4) {
    Tetromino.call(this, id, row, col);
    this.type = "I";
    this.color = "#4474CE";     // Blue
}



/*****************/
/*    S-piece    */
/*    | |X|X|    */
/*    |X|X| |    */
/*    | | | |    */
/*****************/
function TetrominoS(id, row = 20, col = 4) {
    Tetromino.call(this, id, row, col);
    this.type = "I";
    this.color = "#7EBA60";     // Green
}



/*****************/
/*    Z-piece    */
/*    |X|X| |    */
/*    | |X|X|    */
/*    | | | |    */
/*****************/
function TetrominoZ(id, row = 20, col = 4) {
    Tetromino.call(this, id, row, col);
    this.type = "I";
    this.color = "#D55969";     // Red
}
