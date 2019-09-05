'use strict';

import Entity from '/js/entity.js';

export default class Enemy extends Entity {

    constructor(stage, posX, posY, otherEnemies) {
        super();

        this.stage = stage;
        this.positionX = posX;
        this.positionY = posY;

        //fiksna veličina objekta
        this.sizeY = 30;
        this.sizeX = 30;

        //postavljanje koordinata za render
        this.drawX = this.positionX - (this.sizeX / 2);
        this.drawY = this.positionY - (this.sizeY / 2);

        //lokacija na objektu iz koje se puca
        this.gunYOffset = 10;

        //variable za gameplay
        this.speed = 1.3;
        this.minSpeedPercentage = 0.1;
        this.maxSpeedPercentage = 1;
        this.speedPercentageX = this.minSpeedPercentage;
        this.speedPercentageY = this.minSpeedPercentage;
        this.acceleration = this.speed / 100;
        this.moved = false;
        this.moveDirection = 0;
        this.moveDuration = 30;
        this.moveDurationMin = 10;
        this.moveDurationMax = 35;
        this.moveTimer = this.moveDuration;
        this.moveWait = true;
        this.points = 10;

        //veća vrijednost za sporije pucanje
        this.shootingSpeed = 200;
        this.shootingTimerMin = 150;
        this.shootingTimerMax = 250;
        this.shootingCurrentPeriod = this.shootingSpeed;
        this.shootingTimer = 200;
        this.bulletType = 'enemy';
        this.wait = true;

        //bounding box za koliziju
        this.setBoundingBox();

        //vjerojatnosti smjera za korištenje
        this.leftDirections = [1, 5, 6];
        this.rightDirections = [2, 7, 8];
        this.upDirections = [3, 5, 7];
        this.downDirections = [4, 6, 8];

        //lista vjerojatnosti
        this.probabilityList = new Array();

        //lista eliminiranih pokreta
        this.noMoveList = new Array();

        //referenca na druge neprijatelje u igri za koliziju, ponovno se postavlje u igri kad se promijeni
        this.otherEnemies = undefined;

    }


    moveInDirection(direction) {
        switch (direction) {
            case 1:
                this.moveLeft();
                break;

            case 2:
                this.moveRight();
                break;

            case 3:
                this.moveUp();
                break;

            case 4:
                this.moveDown();
                break;

            case 5:
                this.moveLeftUp();
                break;

            case 6:
                this.moveLeftDown();
                break;

            case 7:
                this.moveRightUp();
                break;

            case 8:
                this.moveRightDown();
                break;

            case 9:

                break;

            default:
                break;
        }
    }

    randomDirection(list) {
        return list[this.random(1, list.length)];
    }


    addDirections(list, directionList){
        for (let i = 0; i < directionList.length; i++) {
            list.push(directionList[i]);
        }
    }


    avoidPlayerBullets(playerBullets){
        for (let i = 0; i < playerBullets.length; i++) {
            //ako je ispod neprijatelja i blizu po vertikali
            if(playerBullets[i].positionY > this.positionY && (playerBullets[i].positionY - this.positionY) < 200){
                //ako je blizu po horizontali
                if(playerBullets[i].positionX > this.positionX && playerBullets[i].positionX - this.positionX < 25){
                    this.addDirections(this.probabilityList, this.leftDirections);
                    this.addDirections(this.probabilityList, this.leftDirections);
                    this.addDirections(this.probabilityList, this.leftDirections);
                }
                if(playerBullets[i].positionX < this.positionX && this.positionX - playerBullets[i].positionX < 25){
                    this.addDirections(this.probabilityList, this.rightDirections);
                    this.addDirections(this.probabilityList, this.rightDirections);
                    this.addDirections(this.probabilityList, this.rightDirections);
                }
            }
        }
    }


    collisionEnemies(){
        //potvrdi ako nađe koliziju sa neprijateljem iz lokalne liste
        for (let i = 0; i < this.otherEnemies.length; i++) {
            if(this.collisionEntity(this.otherEnemies[i])){
                return true;
            }
        }
        return false;
    }


    decideMovement(playerX, playerY) {
        
        //lista mogućih pokreta
        let allList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        //lista koja će biti popunjena prživjelim smjerovima
        let goodList = new Array();

        //dodaj jednom stari smjer
        this.addDirections(this.probabilityList, [this.moveDirection]);

        //eliminiraj smjerove koji vode ispod igrača(ne može pucati efektivno)
        if (playerY < this.positionY) {
            this.addDirections(this.noMoveList, this.downDirections);
            this.addDirections(this.probabilityList, this.upDirections);
        }
        
        //ako uskoro može pucati(ostalo manje od pola vremena) kreni prema igraču
        if (this.shootingTimer < (this.shootingCurrentPeriod / 2)) {
            if (this.positionX < playerX) {
                this.addDirections(this.noMoveList, this.leftDirections);
                this.addDirections(this.probabilityList, this.rightDirections);
            } else if (this.positionX > playerX) {
                this.addDirections(this.noMoveList, this.rightDirections);
                this.addDirections(this.probabilityList, this.leftDirections);
            }
        }

        //ako je blizu igraču povećaj vjerojatnost udaljavanja
        if(playerX - this.positionX < 250 && playerX - this.positionX > 0) {
            this.addDirections(this.probabilityList, this.leftDirections);
            this.addDirections(this.probabilityList, this.leftDirections);
        }
        if(this.positionX - playerX < 250 && this.positionX - playerX > 0){
            this.addDirections(this.probabilityList, this.rightDirections);
            this.addDirections(this.probabilityList, this.rightDirections);
        }
        if(playerY - this.positionY < 100 && playerY - this.positionY > 0) {
            this.addDirections(this.probabilityList, this.upDirections);
        }
        if(this.positionY - playerY < 100 && this.positionY - playerY > 0){
            this.addDirections(this.probabilityList, this.downDirections);
        }

        //povećaj vjerojatnosti da se odmakne od rubova
        if (this.positionX < 2 * this.sizeX) {
            this.addDirections(this.probabilityList, this.rightDirections);
        }
        if (this.positionX > (this.stage.canvas.width - 2 * this.sizeX)) {
            this.addDirections(this.probabilityList, this.leftDirections);
        }
        if (this.positionY < 2 * this.sizeY) {
            this.addDirections(this.probabilityList, this.downDirections);
        }
        if (this.positionY > (this.stage.canvas.heigth - 2 * this.sizeY)) {
            this.addDirections(this.probabilityList, this.upDirections);
        }

        //dodaj bar jednu listu smjerova
        for (let i = 0; i < allList.length; i++) {
                goodList.push(allList[i]);
        }

        //pojačaj vjerojatnosti
        for (let i = 0; i < this.probabilityList.length; i++) {
            goodList.push(this.probabilityList[i]);
        }
        
        //makni nomove smjerove(zamijeni ih sa no move)
        for (let i = 0; i < goodList.length; i++) {
            if (this.noMoveList.includes(goodList[i])) {
                goodList[i] = 9;
            }
        }

        //odabire nasumično iz dobrih smjerova
        this.moveDirection = this.randomDirection(goodList);

        //novi smjer randomiziran i kreće čekanje do nove promjene smjera
        this.moveWait = true;
    }


    doMovement(playerX, playerY) {
        if (!this.moveWait) {
            this.decideMovement(playerX, playerY);
            this.moveWait = true;
        }

        //this.moveInDirection(this.moveDirection);
        this.moveInDirection(this.moveDirection);

        //resetira liste
        this.probabilityList = new Array();
        this.noMoveList = new Array();
    }


    do(playerX, playerY) {
        this.doMovement(playerX, playerY);

        let action = false;

        action = this.shoot();

        return action;
    }


    handleTimings() {
        //timer za pucanje
        if (this.wait && this.shootingTimer >= 0) {
            this.shootingTimer--;
        } else {
            //randomizira shootingTimer za iduće pucanje
            this.shootingSpeed = this.random(this.shootingTimerMin, this.shootingTimerMax);
            //sprema vrijednost u currentPeriod za odluke kasnije
            this.shootingCurrentPeriod = this.shootingSpeed;
            this.wait = false;
        }

        //timer za kretanje
        if (this.moveWait && this.moveTimer >= 0) {
            this.moveTimer--;
        } else {
            //randomizira moveDurationn za idući pokret
            this.moveDuration = this.random(this.moveDurationMin, this.moveDurationMax);
            this.moveTimer = this.moveDuration;
            this.moveWait = false;
        }
    }


    setupDraw() {
        this.stage.strokeStyle = "rgba(255,255,255,1)";
        this.stage.lineWidth = 1;
        this.stage.lineCap = "butt";
        this.stage.lineJoin = "miter";
    }


    draw() {
        this.stage.beginPath();
        this.stage.moveTo(0 + this.drawX, 0 + this.drawY);
        this.stage.lineTo(30 + this.drawX, 0 + this.drawY);
        this.stage.lineTo(25 + this.drawX, 10 + this.drawY);
        this.stage.lineTo(25 + this.drawX, 30 + this.drawY);
        this.stage.lineTo(20 + this.drawX, 20 + this.drawY);
        this.stage.lineTo(20 + this.drawX, 20 + this.drawY);
        this.stage.lineTo(15 + this.drawX, 30 + this.drawY);
        this.stage.lineTo(10 + this.drawX, 20 + this.drawY);
        this.stage.lineTo(5 + this.drawX, 30 + this.drawY);
        this.stage.lineTo(5 + this.drawX, 10 + this.drawY);
        this.stage.closePath();
    }


    finishDraw() {
        var gradient = this.stage.createRadialGradient(this.positionX, this.positionY - 5, 11, this.positionX, this.positionY - 5, 15);
        gradient.addColorStop(0, "crimson");
        gradient.addColorStop(1, "red");
        this.stage.fillStyle = gradient;
        this.stage.fill();
    }


    render() {
        this.setupDraw();
        this.draw();
        this.finishDraw();
    }

}