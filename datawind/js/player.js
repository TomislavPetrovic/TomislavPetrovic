'use strict';

import Entity from '/js/entity.js';

export default class Player extends Entity {

    constructor(stage, posX, posY) {
        super();

        this.stage = stage;
        this.positionX = posX;
        this.positionY = posY;

        //fiksna veličina objekta
        this.sizeY = 30;
        this.sizeX = 30;

        //lokacija na objektu iz koje se puca
        this.gunYOffset = -10;

        //brzina igrača
        this.speed = 2;
        this.minSpeedPercentage = 0.1;
        this.maxSpeedPercentage = 1;
        this.speedPercentageX = this.minSpeedPercentage;
        this.speedPercentageY = this.minSpeedPercentage;
        this.acceleration = 0.1;

        //gameplay variable
        this.moved = false;

        //veća vrijednost za sporije pucanje
        this.shootingSpeed = 30;
        this.shootingTimer = 0;
        this.bulletType = 'player';
        this.wait = false;

        //pomiče liniju crtanja po fiksnom offsetu
        this.drawX = this.positionX - (this.sizeX / 2);
        this.drawY = this.positionY - (this.sizeY / 2);

        //bounding box za koliziju
        this.setBoundingBox();
    }


    setupDraw() {
        this.stage.lineWidth = 1;
        this.stage.lineCap = "butt";
        this.stage.lineJoin = "miter";
    }


    draw() {
        this.stage.beginPath();
        this.stage.moveTo(0 + this.drawX, 30 + this.drawY);
        this.stage.lineTo(5 + this.drawX, 20 + this.drawY);
        this.stage.lineTo(5 + this.drawX, 0 + this.drawY);
        this.stage.lineTo(10 + this.drawX, 10 + this.drawY);
        this.stage.lineTo(15 + this.drawX, 0 + this.drawY);
        this.stage.lineTo(20 + this.drawX, 10 + this.drawY);
        this.stage.lineTo(25 + this.drawX, 0 + this.drawY);
        this.stage.lineTo(25 + this.drawX, 20 + this.drawY);
        this.stage.lineTo(30 + this.drawX, 30 + this.drawY);
        this.stage.closePath();
    }


    finishDraw() {
        var gradient = this.stage.createRadialGradient(this.positionX, this.positionY + 5, 11, this.positionX, this.positionY + 5, 15);
        gradient.addColorStop(0, "blue");
        gradient.addColorStop(1, "DeepSkyBlue");
        this.stage.fillStyle = gradient;
        this.stage.fill();
    }


    render() {
        this.setupDraw();
        this.draw();
        this.finishDraw();
    }


    handleTimings() {
        //oduzima 1 ciklus sa timera kad čeka
        if (this.wait && this.shootingTimer >= 0) {
            this.shootingTimer--;
        } else {
            this.wait = false;
        }
    }

}