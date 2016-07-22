var rows = 75;
var cols = 75;
var playing = false;
var timer;
var reproductionTime = 120;

// 2d arrays will act as data models for table of cells
// stores data about each cell
// only keep track of current grid and the next grid
var grid = new Array(rows);
var nextGrid = new Array(rows);

// makes both grid and nextGrid 2d arrays
function initializeGrids() {
    for (var i = 0; i < rows; i++) {
        grid[i] = new Array(cols);
        nextGrid[i] = new Array(cols);
    }
}

// resets the VALUE of each cell to 0 in the model
function resetGrids() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            grid[i][j] = 0;
            nextGrid[i][j] = 0;
        }
    }
}

// nextGrid receives grid's values then gets reset
function copyAndResetGrid() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            grid[i][j] = nextGrid[i][j];
            nextGrid[i][j] = 0;
        }
    }
}

// initialize
function initialize() {
    createTable();
    initializeGrids();
	// each cell initialized in the model as empty
    resetGrids();
    setupControlButtons();
}

// lay out the grid
function createTable() {
    var gridContainer = document.getElementById("gridContainer");

    // null check
    if (!gridContainer) {
        // throw error
        console.error("Problem: no div for the grid table!");
    }

    var table = document.createElement("table");

    // iterate through table and create all needed cells
    for (var i = 0; i < rows; i++) {
        var tr = document.createElement("tr");
        for (var j = 0; j < cols; j++) {
            var cell = document.createElement("td");
            // give each cell an id to access it later
            cell.setAttribute("id", i + "_" + j);
            cell.setAttribute("class", "dead");
			// execute logic if cell is clicked
            cell.onclick = cellClickHandler;
            tr.appendChild(cell);
        }
		// add the row element to table
        table.appendChild(tr);
    }
    gridContainer.appendChild(table);
}

// turn cells on and off when they're clicked
function cellClickHandler() {
    // parsing cell id for row and column values
    var rowcol = this.id.split("_");
    var row = rowcol[0];
    var col = rowcol[1];

    var classes = this.getAttribute("class");

    // if the object is live, make it dead; and vice versa
    if (classes.indexOf("live") > -1) {
        this.setAttribute("class", "dead");
        // updates cell value in model
        grid[row][col] = 0;
    } else {
        this.setAttribute("class", "live");
        // updates cell value in model
        grid[row][col] = 1;
    }
}

function updateView() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var cell = document.getElementById(i + "_" + j);
            if (grid[i][j] == 0) {
                cell.setAttribute("class", "dead");
            } else {
                cell.setAttribute("class", "live");
            }
        }
    }
}

function setupControlButtons() {
    var startButton = document.getElementById("start");
    startButton.onclick = startButtonHandler;

    var clearButton = document.getElementById("clear");
    clearButton.onclick = clearButtonHandler;

    // button to set random beginning state
    var randomButton = document.getElementById("random");
    randomButton.onclick = randomButtonHandler;
}

function randomButtonHandler() {
    if (playing) return;
    clearButtonHandler();
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var isLive = Math.round(Math.random());
            if (isLive == 1) {
                var cell = document.getElementById(i + "_" + j);
                cell.setAttribute("class", "live");
                grid[i][j] = 1;
            }
        }
    }
}

// clear the grid
function clearButtonHandler() {
    console.log("Clear the game: stop playing, clear the grid");
    playing = false;
    var startButton = document.getElementById("start");
    startButton.innerHTML = "start";
    clearTimeout(timer);

    // kill all live sells and reset
    var cellsList = document.getElementsByClassName("live");
    var cells = [];
    for (var i = 0; i < cellsList.length; i++) {
        cells.push(cellsList[i]);
    }
    for (var i = 0; i < cells.length; i++) {
        cells[i].setAttribute("class", "dead");
    }

    resetGrids();
}

// start/pause/continue the game
function startButtonHandler() {
    if (playing) {
        console.log("Pause the game");
        playing = false;
        this.innerHTML = "continue";
        clearTimeout(timer);
    } else {
        console.log("Continue the game");
        playing = true;
        this.innerHTML = "pause";
        play();
    }
}

// run the life game
function play() {
    console.log("Play the grand game");
    computeNextGen();
    if (playing) {
        timer = setTimeout(play, reproductionTime);
    }
}

// updates next generation for each cell in array
function computeNextGen() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            applyRules(i, j);
        }
    }

    // copy nextGrid to grid, and reset nextGrid
    copyAndResetGrid();
    // copy all 1 values to "live" in the table
    updateView();
}

// RULES
// Any live cell with fewer than two live neighbours dies, as if caused by under-population.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overcrowding.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
function applyRules(row, col) {
    var numNeighbors = countNeighbors(row, col);
    if (grid[row][col] == 1) {
        // nextGrid[row][col]  // adjusting final rules live cell stays alive in the next round
        if (numNeighbors < 2) {
            nextGrid[row][col] = 0;
        } else if (numNeighbors == 2 || numNeighbors == 3) {
            nextGrid[row][col] = 1;
        } else if (numNeighbors > 3) {
            nextGrid[row][col] = 0;
        }
    } else if (grid[row][col] == 0) {
        if (numNeighbors == 3) {
            nextGrid[row][col] = 1;
        }
        /*if (numNeighbors == 2) {
            nextGrid[row][col] = 1; // again adjusting final rules
        }*/
    }
}

// increment count for all live, valid neighbors
function countNeighbors(row, col) {
    var count = 0;
    // not in the first row check cell directly above
    if (row-1 >= 0) {
        if (grid[row-1][col] == 1) count++;
    }
    // not in the first row or first column
    // check upper left cell
    if (row-1 >= 0 && col-1 >= 0) {
        if (grid[row-1][col-1] == 1) count++;
    }
    // not in first row and not in last column
    // check upper right cell
    if (row-1 >= 0 && col+1 < cols) {
        if (grid[row-1][col+1] == 1) count++;
    }
    // not in first column
    // check cell to the left
    if (col-1 >= 0) {
        if (grid[row][col-1] == 1) count++;
    }
    // not in the last column
    // check cell to the right
    if (col+1 < cols) {
        if (grid[row][col+1] == 1) count++;
    }
    // not in the bottom row
    // check cell to the bottom
    if (row+1 < rows) {
        if (grid[row+1][col] == 1) count++;
    }
    // not in bottom row and not in first column
    // check bottom left cell
    if (row+1 < rows && col-1 >= 0) {
        if (grid[row+1][col-1] == 1) count++;
    }
    // not in bottom row and not in last column
    // check bottom right
    if (row+1 < rows && col+1 < cols) {
        if (grid[row+1][col+1] == 1) count++;
    }
    return count;
}

// start everything
window.onload = initialize;