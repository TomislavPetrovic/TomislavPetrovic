'use strict';

export default class Input {

    constructor(stage) {
        //element za click listener
        this.stage = stage;

        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.spacebar = false;
        this.escape = false;
        this.enter = false;

        this.clicked = false;
        this.clickX = undefined;
        this.clickY = undefined;
        //arrow oblik korišten da se zadrži 'this' na metodama iz klase, inače bi bio window kod event listenera
        document.addEventListener("keydown", key => this.keyDown(key), false);
        document.addEventListener("keyup", key => this.keyUp(key), false);
        stage.canvas.addEventListener("click", key => this.onClick(event), false);
    }


    keyDown(key) {
        if (key.key == "Right" || key.key == "ArrowRight" || key.code == "KeyD") {
            this.right = true;
        }
        if (key.key == "Left" || key.key == "ArrowLeft" || key.code == "KeyA") {
            this.left = true;
        }
        if (key.key == "Up" || key.key == "ArrowUp" || key.code == "KeyW") {
            this.up = true;
        }
        if (key.key == "Down" || key.key == "ArrowDown" || key.code == "KeyS") {
            this.down = true;
        }
        if(key.code == "32" || key.code == "Space"){
            this.spacebar = true;
        }
        if (key.key == "Escape" || key.key == "Esc" || key.code == "27") {
            //ovaj input radi samo na key up zbog višestrukih detekcija inače
            //this.escape = true;
        }
        if (key.key == "Enter" || key.code == "13") {
            this.enter = true;
        }
    }


    keyUp(key) {
        if (key.key == "Right" || key.key == "ArrowRight" || key.code == "KeyD") {
            this.right = false;
        }
        if (key.key == "Left" || key.key == "ArrowLeft" || key.code == "KeyA") {
            this.left = false;
        }
        if (key.key == "Up" || key.key == "ArrowUp" || key.code == "KeyW") {
            this.up = false;
        }
        if (key.key == "Down" || key.key == "ArrowDown" || key.code == "KeyS") {
            this.down = false;
        }
        if(key.code == "32" || key.code == "Space"){
            this.spacebar = false;
        }
        if (key.key == "Escape" || key.key == "Esc" || key.code == "27") {
            this.escape = true;
        }
        if (key.key == "Enter" || key.code == "13") {
            this.enter = true;
        }
    }


    onClick(event) {
        this.clicked = true;
        this.clickX = event.offsetX;
        this.clickY = event.offsetY;
    }


    resetAction() {
        this.escape = false;
        this.enter = false;
        this.clicked = false;
        this.clickX = undefined;
        this.clickY = undefined;
    }

}