var game;

const tileSize = 20;

const borderColor   = [ 64,  64,  64];
const unknownColor  = [192, 192, 192];
const markedColor   = [  0, 192,   0];
const revealedColor = [ 64,  64, 255];
const bombColor     = [255,  64,  64];

const textColor = [0, 0, 0];

const localHSName = "MinesweeperHS";
const localWidth = "MinesweeperWidth";
const localHeight = "MinesweeperHeight";
const localDifficulty = "MinesweeperDifficulty";

function newGame() {
    var width = document.getElementById("width-slider").value;
    var height = document.getElementById("height-slider").value;
    var difficulty = document.getElementById("difficulty-slider").value / 100;
    game = new Game(width, height, difficulty);
    createCanvas(game.width * tileSize, game.height * tileSize);
    textFont("Inconsolata");
    textSize(tileSize - 2);
    textAlign(CENTER, CENTER);
}

function setup() {
    var width = localStorage.getItem(localWidth);
    var height = localStorage.getItem(localHeight);
    var difficulty = localStorage.getItem(localDifficulty);
    document.getElementById("width-slider").value = width !== null ? width : 40;
    document.getElementById("height-slider").value = height !== null ? height : 30;
    document.getElementById("difficulty-slider").value = difficulty !== null ? difficulty : 20;
    updateWidth();
    updateHeight();
    updateDifficulty();
    newGame();
    document.getElementsByTagName("canvas")[0].addEventListener("contextmenu", (event) => event.preventDefault());
    document.getElementById("highscore").innerHTML = game.highscore;
}

function drawCellText(x, y, fillColor, cellText) {
    fill(...fillColor);
    text(cellText, tileSize * x + tileSize / 2, tileSize * y + tileSize / 2);
}

function drawCell(x, y, fillColor) {
    fill(...fillColor);
    square(tileSize * x + 1, tileSize * y + 1, tileSize - 2);
}

function zeroPad(number, padding) {
    if (number.toString().length >= padding)
        return number;
    return ("0".repeat(padding) + number).slice(-padding);
}

function updateStatus() {
    document.getElementById("score").innerHTML = Math.floor(game.calculateScore());
    document.getElementById("highscore").innerHTML = Math.floor(game.highscore);
    var currentTime = Date.now() / 1000;
    var minutes = Math.floor((currentTime - game.startTime) / 60);
    var seconds = Math.floor((currentTime - game.startTime) % 60);
    document.getElementById("time").innerHTML = `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`;
}

function draw() {
    background(borderColor);
    for (var i = 0; i < game.width; i++) {
        for (var j = 0; j < game.height; j++) {
            if (game.tiles[i][j] === spaceTile || game.tiles[i][j] === bombTile) {
                drawCell(i, j, unknownColor);
            } else if (game.tiles[i][j] === markedSpaceTile || game.tiles[i][j] === markedBombTile) {
                drawCell(i, j, markedColor);
            } else if (game.tiles[i][j] === revealedTile) {
                drawCell(i, j, revealedColor);
                if (game.neighbors[i][j] > 0)
                    drawCellText(i, j, textColor, game.neighbors[i][j]);
            } else if (game.tiles[i][j] === explosionTile) {
                drawCell(i, j, bombColor);
            }
        }
    }
    if (game.playing)
        updateStatus();
    if (game.won()) {
        var score = game.calculateScore();
        if (score > game.highscore) {
            game.highscore = score;
            game.saveHighscore(score);
            document.getElementById("highscore").innerHTML = Math.floor(score);
            document.getElementById("score").innerHTML = Math.floor(score);
        }
        game.playing = false;
    }
}

function mousePressed() {
    var x = Math.floor(mouseX / tileSize);
    var y = Math.floor(mouseY / tileSize);
    if (x >= 0 && x < game.width && y >= 0 && y < game.height)
        if (mouseButton === LEFT)
            game.check(x, y);
        else if (mouseButton === RIGHT)
            game.mark(x, y);
}

function updateWidth() {
    var value = document.getElementById("width-slider").value;
    document.getElementById("width-label").innerHTML = value;
    localStorage.setItem(localWidth, value);
}

function updateHeight() {
    var value = document.getElementById("height-slider").value;
    document.getElementById("height-label").innerHTML = value;
    localStorage.setItem(localHeight, value);
}

function updateDifficulty() {
    var value = document.getElementById("difficulty-slider").value;
    document.getElementById("difficulty-label").innerHTML = value + "%";
    localStorage.setItem(localDifficulty, value);
}
