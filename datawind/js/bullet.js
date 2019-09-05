'use strict';

export default class Bullet {

    constructor(stage, posX, posY, type) {
        this.stage = stage;
        this.positionX = posX;
        this.positionY = posY;
        //fiksna veličina objekta
        this.radius = 3;
        this.sizeY = this.radius * 2;
        this.sizeX = this.radius * 2;

        //variable igre
        this.speed = 2;

        if(type == 'player'){
            this.bulletColor1 = 'yellow';
            this.bulletColor2 = 'deepskyblue';
            this.bulletYoffset = 2;
        }else if(type == 'enemy'){
            this.bulletColor1 = 'yellow';
            this.bulletColor2 = 'tomato';
            this.bulletYoffset = -2;
        }
    }


    moveUp(){
        this.positionY -= this.speed;
    }


    moveDown(){
        this.positionY += this.speed;
    }


    isOutside(){
        if(this.positionY < 0 || this.positionY > this.stage.canvas.height){
            return true;
        } else {
            return false;
        }
    }


    setupDraw() {
        this.stage.lineWidth = 1;
        this.stage.lineCap = "butt";
        this.stage.lineJoin = "miter";
    }


    draw() {
        this.stage.beginPath();
        this.stage.arc(this.positionX, this.positionY, this.radius, 0, 2 * Math.PI);
        this.stage.closePath();
    }


    finishDraw() {
        var gradient = this.stage.createRadialGradient(this.positionX, this.positionY+this.bulletYoffset, 0.1, this.positionX, this.positionY, 3);
        gradient.addColorStop(0, this.bulletColor1);
        gradient.addColorStop(1, this.bulletColor2);
        this.stage.fillStyle = gradient;
        //this.stage.fillStyle = this.color;
        this.stage.fill();
    }


    render() {
        this.setupDraw();
        this.draw();
        this.finishDraw();
    }

}