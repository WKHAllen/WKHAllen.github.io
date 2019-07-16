const spaceTile       = 0;
const bombTile        = 1;
const markedSpaceTile = 2;
const markedBombTile  = 3;
const revealedTile    = 4;
const explosionTile   = 5;

class Game {
    constructor(width, height, difficulty) {
        this.startTime = Date.now() / 1000;
        this.playing = true;
        this.width = width || 40;
        this.height = height || 30;
        this.difficulty = difficulty >= 0 && difficulty <= 1 ? difficulty : 0.2;
        this.bombs = Math.floor(this.width * this.height * this.difficulty);
        this.tiles = this.createBoard(this.width, this.height, this.bombs);
        this.neighbors = this.calculateNeighbors(this.tiles);
        this.revealed = 0;
        this.marked = 0;
        this.highscore = this.loadHighscore();
    }

    createBoard(width, height, bombs) {
        var tiles = new Array(width);
        for (var i = 0; i < width; i++)
            tiles[i] = new Array(height);
        var bombsPlaced = 0;
        var x, y;
        while (bombsPlaced < bombs) {
            do {
                x = Math.floor(Math.random() * width);
                y = Math.floor(Math.random() * height);
            } while (tiles[x][y] === bombTile);
            tiles[x][y] = bombTile;
            bombsPlaced++;
        }
        for (var i = 0; i < width; i++)
            for (var j = 0; j < height; j++)
                if (tiles[i][j] !== bombTile)
                    tiles[i][j] = spaceTile;
        return tiles;
    }

    bombNeighbors(tiles, x, y) {
        var neighbors = 0;
        for (var i = x - 1; i <= x + 1; i++)
            for (var j = y - 1; j <= y + 1; j++)
                if (i !== x || j !== y)
                    if (i >= 0 && i < tiles.length && j >= 0 && j < tiles[i].length && tiles[i][j] === bombTile)
                        neighbors++;
        return neighbors;
    }

    calculateNeighbors(tiles) {
        var neighbors = new Array(tiles.length);
        for (var i = 0; i < tiles.length; i++)
            neighbors[i] = new Array(tiles[i].length);
        for (var i = 0; i < neighbors.length; i++)
            for (var j = 0; j < neighbors[i].length; j++)
                neighbors[i][j] = this.bombNeighbors(tiles, i, j);
        return neighbors;
    }

    revealAll() {
        for (var i = 0; i < this.width; i++)
            for (var j = 0; j < this.height; j++)
                if (this.tiles[i][j] === bombTile || this.tiles[i][j] === markedBombTile)
                    this.tiles[i][j] = explosionTile;
                else if (this.tiles[i][j] === spaceTile || this.tiles[i][j] === markedSpaceTile)
                    this.tiles[i][j] = revealedTile;
    }

    revealNeighbor(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height && this.neighbors[x][y] !== 0 && this.tiles[x][y] === spaceTile) {
            this.tiles[x][y] = revealedTile;
            this.revealed++;
        }
    }

    removeZeros(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height && this.neighbors[x][y] === 0 && this.tiles[x][y] === spaceTile) {
            this.tiles[x][y] = revealedTile;
            this.revealed++;
            for (var i = x - 1; i <= x + 1; i++)
                for (var j = y - 1; j <= y + 1; j++)
                    this.removeZeros(i, j);
            for (var i = x - 1; i <= x + 1; i++)
                for (var j = y - 1; j <= y + 1; j++)
                    this.revealNeighbor(i, j);
        }
    }

    check(x, y) {
        if (this.tiles[x][y] === bombTile || this.tiles[x][y] === markedBombTile) {
            this.tiles[x][y] = explosionTile;
            this.revealAll();
            this.playing = false;
        } else if (this.tiles[x][y] === spaceTile || this.tiles[x][y] === markedSpaceTile) {
            if (this.neighbors[x][y] === 0) {
                this.removeZeros(x, y);
            } else {
                this.tiles[x][y] = revealedTile;
                this.revealed++;
            }
        }
    }

    mark(x, y) {
        if (this.tiles[x][y] === spaceTile) {
            this.tiles[x][y] = markedSpaceTile;
            this.marked++;
        } else if (this.tiles[x][y] === bombTile) {
            this.tiles[x][y] = markedBombTile;
            this.marked++;
        } else if (this.tiles[x][y] === markedSpaceTile) {
            this.tiles[x][y] = spaceTile;
            this.marked--;
        } else if (this.tiles[x][y] === markedBombTile) {
            this.tiles[x][y] = bombTile;
            this.marked--;
        }
    }

    loadHighscore() {
        var highscore = parseInt(localStorage.getItem(localHSName));
        if (!highscore)
            highscore = 0;
        return highscore;
    }

    saveHighscore(highscore) {
        localStorage.setItem(localHSName, highscore);
    }

    curve(number, amount) {
        return Math.pow(number * amount, 2) / number;
    }

    calculateScore() {
        return 10000 * (this.revealed / (this.width * this.height - this.bombs)) * this.curve(this.width * this.height, 1.5) * this.difficulty / (Date.now() / 1000 - this.startTime);
    }

    won() {
        return this.marked === this.bombs && this.revealed === this.width * this.height - this.bombs;
    }
}
