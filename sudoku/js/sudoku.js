const EMPTY = "";
const NONE_EMPTY = null;
const NO_SOLUTION = undefined;

function clone(table) {
    return JSON.parse(JSON.stringify(table));
}

function arraysEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

function valid(table, number, x, y) {
    let current = table[x - 1][y - 1];
    table[x - 1][y - 1] = EMPTY;
    let row = table[x - 1];
    let column = [];
    for (let arow of table) {
        column.push(arow[y - 1]);
    }
    if (row.includes(number) || column.includes(number)) {
        table[x - 1][y - 1] = current;
        return false;
    }
    let square = [Math.floor((x - 1) / 3), Math.floor((y - 1) / 3)];
    let values = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]];
    let rows = values[square[0]];
    let cols = values[square[1]];
    for (let i of rows) {
        for (let j of cols) {
            if (number === table[i - 1][j - 1]) {
                table[x - 1][y - 1] = current;
                return false;
            }
        }
    }
    table[x - 1][y - 1] = current;
    return true;
}

function validPossibilities(table, x, y) {
    let possibilities = [];
    for (let i = 1; i <= 9; i++) {
        if (valid(table, i.toString(), x, y)) {
            possibilities.push(i.toString());
        }
    }
    return possibilities;
}

function firstEmpty(table) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (table[i][j] === EMPTY) {
                return [i + 1, j + 1];
            }
        }
    }
    return NONE_EMPTY;
}

function doSolve(table) {
    let first = firstEmpty(table);
    if (first !== NONE_EMPTY) {
        let possibilities = validPossibilities(table, ...first);
        if (possibilities.length === 0) {
            return NO_SOLUTION;
        }
        for (let value of possibilities) {
            table[first[0] - 1][first[1] - 1] = value.toString();
            let solution = doSolve(clone(table));
            if (solution !== NO_SOLUTION) {
                return solution;
            }
        }
    } else {
        return table;
    }
}

function getSolution(table) {
    table = clone(table);
    let tableClone = [];
    while (!arraysEqual(table, tableClone)) {
        tableClone = clone(table);
        for (let i = 1; i <= 9; i++) {
            for (let j = 1; j <= 9; j++) {
                if (table[i - 1][j - 1] === EMPTY) {
                    let possibilities = validPossibilities(table, i, j);
                    if (possibilities.length === 1) {
                        table[i - 1][j - 1] = possibilities[0];
                    }
                }
            }
        }
    }
    let solution = doSolve(table);
    return solution;
}

function validTable(table) {
    for (let i = 1; i <= 9; i++) {
        for (let j = 1; j <= 9; j++) {
            if (table[i - 1][j - 1] !== EMPTY) {
                if (!valid(table, table[i - 1][j - 1], i, j)) {
                    return false;
                }
            }
        }
    }
    return true;
}

function flattenTable(table) {
    newtable = [];
    for (let i = 0; i < table.length; i++) {
        for (let j = 0; j < table[i].length; j++) {
            newtable.push(table[i][j]);
        }
    }
    return newtable;
}

function unflattenTable(table) {
    newtable = [[], [], [], [], [], [], [], [], []];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            newtable[i].push(table[i * 9 + j]);
        }
    }
    return newtable;
}

function getTable() {
    let table = [];
    let board = document.getElementById("board");
    let boardInputs = board.getElementsByTagName("input");
    for (let element of boardInputs) {
        table.push(element.value);
    }
    return unflattenTable(table);
}

function setTable(table) {
    table = flattenTable(table);
    let board = document.getElementById("board");
    let boardInputs = board.getElementsByTagName("input");
    for (let i = 0; i < boardInputs.length; i++) {
        boardInputs[i].value = table[i];
    }
}

function validChars(table) {
    let chars = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    for (let row of table) {
        for (let item of row) {
            if (!chars.includes(item)) {
                return false;
            }
        }
    }
    return true;
}

function clearError() {
    let error = document.getElementById("error");
    error.innerHTML = "";
}

function showError(message) {
    clearError();
    let error = document.getElementById("error");
    let newalert = document.createElement("div");
    newalert.setAttribute("class", "alert alert-primary");
    newalert.setAttribute("role", "alert");
    newalert.innerHTML = message;
    let newbutton = document.createElement("button");
    newbutton.setAttribute("type", "button");
    newbutton.setAttribute("class", "close");
    newbutton.setAttribute("onclick", "clearError()");
    let newspan = document.createElement("span");
    newspan.innerHTML = "&times;";
    newbutton.appendChild(newspan);
    newalert.appendChild(newbutton);
    error.appendChild(newalert);
}

function clearStatus() {
    let status = document.getElementById("status");
    status.innerHTML = "";
}

function setStatus(message) {
    clearStatus();
    let status = document.getElementById("status");
    let newalert = document.createElement("div");
    newalert.setAttribute("class", "alert alert-primary");
    newalert.setAttribute("role", "alert");
    newalert.innerHTML = message;
    status.appendChild(newalert);
}

function solve() {
    let table = getTable();
    if (!validChars(table)) {
        showError("Invalid character");
    } else {
        if (!validTable(table)) {
            showError("Invalid puzzle");
        } else {
            let start = Date.now();
            let solution = getSolution(table);
            let end = Date.now();
            let totaltime = (end - start) / 1000;
            if (solution === NO_SOLUTION) {
                showError("No solution found");
            } else {
                clearError();
                setTable(solution);
                setStatus(`Solution found in ${totaltime} seconds`);
            }
        }
    }
}

function main() {
    let board = document.getElementById("board");
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let newdiv = document.createElement("div");
            newdiv.classList.add("digit");
            if (j === 2 || j === 5) {
                newdiv.classList.add("space-right");
            } else if (j === 3 || j === 6) {
                newdiv.classList.add("space-left");
            }
            if (i === 2 || i === 5) {
                newdiv.classList.add("space-below");
            } else if (i === 3 || i === 6) {
                newdiv.classList.add("space-above");
            }
            let newinput = document.createElement("input");
            newinput.setAttribute("type", "text");
            newinput.setAttribute("class", "form-control input");
            newinput.setAttribute("maxlength", "1");
            newdiv.appendChild(newinput);
            board.appendChild(newdiv);
        }
    }

    // let puzzle = ".27.5.....1....6...9.82....8..7.....5.......4.....2..9....85.6...3....1.....7.98.";
    let puzzle = "8..........36......7..9.2...5...7.......457.....1...3...1....68..85...1..9....4..";
    puzzle = puzzle.split("");
    while (puzzle.indexOf(".") !== -1){
        let index = puzzle.indexOf(".");
        puzzle[index] = EMPTY;
    }
    puzzle = unflattenTable(puzzle);
    // setTable(puzzle);
}

window.addEventListener("load", main);
