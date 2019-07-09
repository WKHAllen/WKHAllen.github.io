const emptyTile = 1;
const emptyColor = "rgba(255, 255, 255, 1)";

const colors = {
    2: "rgba(175, 175, 175, {})",
    4: "rgba(175, 143, 127, {})",
    8: "rgba(255, 175, 63, {})",
    16: "rgba(255, 127, 31, {})",
    32: "rgba(255, 79, 0, {})",
    64: "rgba(255, 0, 0, {})",
    128: "rgba(255, 79, 0, {})",
    256: "rgba(255, 127, 63, {})",
    512: "rgba(255, 159, 79, {})",
    1024: "rgba(255, 159, 47, {})",
    2048: "rgba(255, 175, 0, {})",
    4096: "rgba(207, 159, 0, {})",
    8192: "rgba(207, 111, 31, {})",
    16384: "rgba(175, 111, 63, {})",
    32768: "rgba(95, 79, 63, {})",
    65536: "rgba(31, 31, 31, {})",
    131072: "rgba(7, 7, 7, {})"
};

const localHSName = "2048HS";

function Board(canvas, fps) {
    this.canvas = canvas;
    this.fps = fps;
    this.ctx = canvas.getContext("2d");
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "center";
    this.border = 4;
    this.borderColor = "black";
    this.textColor = "white";
    this.transparencySpeed = 0.1;
    this.tileWidth = (this.canvas.width - (this.border * 5)) / 4;
    this.tileHeight = (this.canvas.height - (this.border * 5)) / 4;
    this.ctx.font = Math.min(this.tileWidth, this.tileHeight) / 4 + "px Arial";
    this.score = 0;
    this.tiles = new Array(4);
    for (let i = 0; i < 4; i++)
        this.tiles[i] = new Array(4);
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++)
            this.tiles[i][j] = emptyTile;
    this.positions = new Array(4);
    for (let i = 0; i < 4; i++)
        this.positions[i] = new Array(4);
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++)
            this.positions[i][j] = [i, j];
    this.transparencies = new Array(4);
    for (let i = 0; i < 4; i++)
        this.transparencies[i] = new Array(4);
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++)
            this.transparencies[i][j] = 1;
    this.newTiles = new Array(4);
    for (let i = 0; i < 4; i++)
        this.newTiles[i] = new Array(4);
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++)
            this.newTiles[i][j] = false;

    this.getHighScore = (function() {
        let highScore = parseInt(localStorage.getItem(localHSName));
        if (!highScore)
            highScore = 0;
        return highScore;
    }).bind(this);

    this.saveHighScore = (function(highScore) {
        localStorage.setItem(localHSName, highScore);
    }).bind(this);

    this.updateHighScore = (function() {
        document.getElementById("highscore").innerHTML = `Highscore: ${this.highScore}`;
    }).bind(this);

    this.updateScore = (function() {
        document.getElementById("score").innerHTML = `Score: ${this.score}`;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore(this.highScore);
            this.updateHighScore();
        }
    }).bind(this);

    this.countSpacesRemaining = (function() {
        let spaces = 0;
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                if (this.tiles[i][j] === emptyTile)
                    spaces++;
        return spaces;
    }).bind(this);

    this.neighbors = (function(x, y) {
        let nearby = [];
        if (x > 0)
            nearby.push(this.tiles[x - 1][y]);
        if (x < 3)
            nearby.push(this.tiles[x + 1][y]);
        if (y > 0)
            nearby.push(this.tiles[x][y - 1]);
        if (y < 3)
            nearby.push(this.tiles[x][y + 1]);
        return nearby;
    }).bind(this);

    this.canMove = (function() {
        if (this.countSpacesRemaining() > 0)
            return true;
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                if (this.neighbors(i, j).includes(this.tiles[i][j]))
                    return true;
        return false;
    }).bind(this);

    this.newTile = (function() {
        if (this.countSpacesRemaining() === 0)
            throw "no space for new tile";
        let x;
        let y;
        do {
            x = Math.floor(Math.random() * 4);
            y = Math.floor(Math.random() * 4);
        } while (this.tiles[x][y] !== emptyTile);
        this.tiles[x][y] = (Math.floor(Math.random() * 2) + 1) * 2;
        this.transparencies[x][y] = 0;
        this.animateNewTile(x, y);
    }).bind(this);

    this.drawTile = (function(x, y) {
        let text = this.tiles[x][y];
        let color = colors[this.tiles[x][y]].replace("{}", this.transparencies[x][y]);
        let position = this.positions[x][y];
        this.ctx.fillStyle = color;
        this.ctx.fillRect(this.border * (x + 1) + this.tileWidth * position[0], this.border * (y + 1) + this.tileHeight * position[1], this.tileWidth, this.tileHeight);
        this.ctx.fillStyle = this.textColor;
        this.ctx.fillText(text, this.border * (x + 1) + this.tileWidth * position[0] + this.tileWidth / 2, this.border * (y + 1) + this.tileHeight * position[1] + this.tileHeight / 2);
    }).bind(this);

    this.draw = (function() {
        this.ctx.fillStyle = this.borderColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.ctx.fillStyle = emptyColor;
                this.ctx.fillRect(this.border * (i + 1) + this.tileWidth * i, this.border * (j + 1) + this.tileHeight * j, this.tileWidth, this.tileHeight);
                if (this.tiles[i][j] !== emptyTile)
                    this.drawTile(i, j);
            }
        }
    }).bind(this);

    this.animate = (function(x, y, direction) {
        switch(direction) {
            case "up":
                if (this.positions[x][y][1] > y) {
                    this.positions[x][y][1] = (this.positions[x][y][1] + y) / 2 - 0.01;
                    setTimeout(this.animate, 1000 / this.fps, x, y, direction);
                } else if (this.positions[x][y][1] < y)
                    this.positions[x][y][1] = y;
                break;
            case "down":
                if (this.positions[x][y][1] < y) {
                    this.positions[x][y][1] = (this.positions[x][y][1] + y) / 2 + 0.01;
                    setTimeout(this.animate, 1000 / this.fps, x, y, direction);
                } else if (this.positions[x][y][1] > y)
                    this.positions[x][y][1] = y;
                break;
            case "left":
                if (this.positions[x][y][0] > x) {
                    this.positions[x][y][0] = (this.positions[x][y][0] + x) / 2 - 0.01;
                    setTimeout(this.animate, 1000 / this.fps, x, y, direction);
                } else if (this.positions[x][y][0] < x)
                    this.positions[x][y][0] = x;
                break;
            case "right":
                if (this.positions[x][y][0] < x) {
                    this.positions[x][y][0] = (this.positions[x][y][0] + x) / 2 + 0.01;
                    setTimeout(this.animate, 1000 / this.fps, x, y, direction);
                } else if (this.positions[x][y][0] > x)
                    this.positions[x][y][0] = x;
                break;
        }
    }).bind(this);

    this.animateNewTile = (function(x, y) {
        if (this.transparencies[x][y] < 1) {
            this.transparencies[x][y] += this.transparencySpeed;
            setTimeout(this.animateNewTile, 1000 / this.fps, x, y);
        } else {
            this.transparencies[x][y] = 1;
        }
    }).bind(this);

    this.moveUp = (function() {
        for (let _ = 0; _ < 3; _++) {
            for (let i = 0; i < 4; i++) {
                for (let j = 1; j < 4; j++) {
                    if (this.tiles[i][j] !== emptyTile && this.tiles[i][j - 1] === emptyTile) {
                        this.tiles[i][j - 1] = this.tiles[i][j];
                        this.tiles[i][j] = emptyTile;
                        this.positions[i][j - 1][1] = this.positions[i][j][1];
                        this.animate(i, j - 1, "up");
                    } else if (this.tiles[i][j] !== emptyTile && this.tiles[i][j - 1] === this.tiles[i][j] && !this.newTiles[i][j] && !this.newTiles[i][j - 1]) {
                        this.score += this.tiles[i][j] * 2;
                        this.updateScore();
                        this.tiles[i][j - 1] = this.tiles[i][j] * 2;
                        this.tiles[i][j] = emptyTile;
                        this.positions[i][j - 1][1] = this.positions[i][j][1];
                        this.animate(i, j - 1, "up");
                        this.newTiles[i][j - 1] = true;
                    }
                }
            }
        }
    }).bind(this);

    this.moveDown = (function() {
        for (let _ = 0; _ < 3; _++) {
            for (let i = 0; i < 4; i++) {
                for (let j = 2; j >= 0; j--) {
                    if (this.tiles[i][j] !== emptyTile && this.tiles[i][j + 1] === emptyTile) {
                        this.tiles[i][j + 1] = this.tiles[i][j];
                        this.tiles[i][j] = emptyTile;
                        this.positions[i][j + 1][1] = this.positions[i][j][1];
                        this.animate(i, j + 1, "down");
                    } else if (this.tiles[i][j] !== emptyTile && this.tiles[i][j + 1] === this.tiles[i][j] && !this.newTiles[i][j] && !this.newTiles[i][j + 1]) {
                        this.score += this.tiles[i][j] * 2;
                        this.updateScore();
                        this.tiles[i][j + 1] = this.tiles[i][j] * 2;
                        this.tiles[i][j] = emptyTile;
                        this.positions[i][j + 1][1] = this.positions[i][j][1];
                        this.animate(i, j + 1, "down");
                        this.newTiles[i][j + 1] = true;
                    }
                }
            }
        }
    }).bind(this);

    this.moveLeft = (function() {
        for (let _ = 0; _ < 3; _++) {
            for (let i = 1; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    if (this.tiles[i][j] !== emptyTile && this.tiles[i - 1][j] === emptyTile) {
                        this.tiles[i - 1][j] = this.tiles[i][j];
                        this.tiles[i][j] = emptyTile;
                        this.positions[i - 1][j][0] = this.positions[i][j][0];
                        this.animate(i - 1, j, "left");
                    } else if (this.tiles[i][j] !== emptyTile && this.tiles[i - 1][j] === this.tiles[i][j] && !this.newTiles[i][j] && !this.newTiles[i - 1][j]) {
                        this.score += this.tiles[i][j] * 2;
                        this.updateScore();
                        this.tiles[i - 1][j] = this.tiles[i][j] * 2;
                        this.tiles[i][j] = emptyTile;
                        this.positions[i - 1][j][0] = this.positions[i][j][0];
                        this.animate(i - 1, j, "left");
                        this.newTiles[i - 1][j] = true;
                    }
                }
            }
        }
    }).bind(this);

    this.moveRight = (function() {
        for (let _ = 0; _ < 3; _++) {
            for (let i = 2; i >= 0; i--) {
                for (let j = 0; j < 4; j++) {
                    if (this.tiles[i][j] !== emptyTile && this.tiles[i + 1][j] === emptyTile) {
                        this.tiles[i + 1][j] = this.tiles[i][j];
                        this.tiles[i][j] = emptyTile;
                        this.positions[i + 1][j][0] = this.positions[i][j][0];
                        this.animate(i + 1, j, "right");
                    } else if (this.tiles[i][j] !== emptyTile && this.tiles[i + 1][j] === this.tiles[i][j] && !this.newTiles[i][j] && !this.newTiles[i + 1][j]) {
                        this.score += this.tiles[i][j] * 2;
                        this.updateScore();
                        this.tiles[i + 1][j] = this.tiles[i][j] * 2;
                        this.tiles[i][j] = emptyTile;
                        this.positions[i + 1][j][0] = this.positions[i][j][0];
                        this.animate(i + 1, j, "right");
                        this.newTiles[i + 1][j] = true;
                    }
                }
            }
        }
    }).bind(this);

    this.resetNewTiles = (function() {
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                this.newTiles[i][j] = false;
    }).bind(this);

    this.reset = (function() {
        this.score = 0;
        this.updateScore();
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                this.tiles[i][j] = emptyTile;
        this.newTile();
    }).bind(this);

    this.highScore = this.getHighScore();
    this.updateHighScore();
}
