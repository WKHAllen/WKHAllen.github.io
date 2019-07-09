var game;

function arrayClone(arr) {
    let clone = [];
    for (let i = 0; i < arr.length; i++) {
        clone.push(arr[i].slice(0));
    }
    return clone;
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length)
        return false;
    for (let i = 0; i < arr1.length; i++)
        for (let j = 0; j < arr1[i].length; j++)
            if (arr1[i][j] !== arr2[i][j])
                return false;
    return true;
}

class Game {
    constructor(fps) {
        this.playing = true;
        this.fps = fps;
        this.board = new Board(document.getElementById("game"), this.fps);
        document.addEventListener("keydown", (event) => this.keyPress(event));
        this.drawInterval = setInterval(this.board.draw, 1000 / this.fps);
    }

    move(keyCode) {
        let tiles = arrayClone(this.board.tiles);
        switch(keyCode) {
            case 37:
                this.board.moveLeft();
                break;
            case 38:
                this.board.moveUp();
                break;
            case 39:
                this.board.moveRight();
                break;
            case 40:
                this.board.moveDown();
                break;
        }
        this.board.resetNewTiles();
        return !arraysEqual(this.board.tiles, tiles);
    }

    keyPress(event) {
        if (this.playing && [37, 38, 39, 40].includes(event.keyCode)) {
            if (this.move(event.keyCode)) {
                if (this.board.countSpacesRemaining() > 0) {
                    this.board.newTile();
                }
            }
            if (!this.board.canMove()) {
                this.gameOver();
            }
        }
    }

    gameOver() {
        this.playing = false;
        setTimeout((function() {
            clearInterval(this.drawInterval);
            this.board.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            this.board.ctx.fillRect(0, 0, this.board.canvas.width, this.board.canvas.height);
            document.getElementById("play-again").classList.remove("invisible");
        }).bind(this), 1000);
    }

    playAgain() {
        document.getElementById("play-again").classList.add("invisible");
        this.board.reset();
        this.drawInterval = setInterval(this.board.draw, 1000 / this.fps);
        this.playing = true;
    }
}

window.addEventListener("load", function() {
    game = new Game(30);
    game.board.newTile();
});
