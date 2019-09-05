'use strict';

import Bullet from '/js/bullet.js';

//ovo je zajednička klasa sa Enemy i Player
export default class Entity {

    constructor() {
    }


    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    setBoundingBox() {
        this.leftEdge = this.positionX - (this.sizeX / 2);
        this.rightEdge = this.positionX + (this.sizeX / 2);
        this.upEdge = this.positionY - (this.sizeY / 2);
        this.downEdge = this.positionY + (this.sizeY / 2);
    }


    moveBoxX(change) {
        this.leftEdge += change;
        this.rightEdge += change;
    }


    moveBoxY(change) {
        this.upEdge += change;
        this.downEdge += change;
    }


    accelerateNumber(sign, number, ratio) {
        if (sign > 0) {
            //ako postotak ne odgovara smjeru, promjeni predznak
            if (number < 0) {
                number = Math.abs(number);
            }
            number = number + this.acceleration * ratio;
            //prisili broj na limit
            number = Math.min(number, this.maxSpeedPercentage);
        } else if (sign < 0) {
            //ako postotak ne odgovara smjeru, promjeni predznak
            if (number > 0) {
                number = -Math.abs(number);
            }
            number = number - this.acceleration * ratio;
            //prisili broj na limit
            number = Math.max(number, -this.maxSpeedPercentage);
        }

        return number;
    }


    accelerate(changeX, changeY, isDiagonal) {
        if (!isDiagonal) {
            if (changeX < 0) {
                this.speedPercentageX = this.accelerateNumber(-1, this.speedPercentageX, 1);
            } else if (changeX > 0) {
                this.speedPercentageX = this.accelerateNumber(1, this.speedPercentageX, 1);
            }

            if (changeY < 0) {
                this.speedPercentageY = this.accelerateNumber(-1, this.speedPercentageY, 1);
            } else if (changeY > 0) {
                this.speedPercentageY = this.accelerateNumber(1, this.speedPercentageY, 1);
            }
        } else {
            if (changeX < 0) {
                this.speedPercentageX = this.accelerateNumber(-1, this.speedPercentageX, 0.71);
            } else if (changeX > 0) {
                this.speedPercentageX = this.accelerateNumber(1, this.speedPercentageX, 0.71);
            }

            if (changeY < 0) {
                this.speedPercentageY = this.accelerateNumber(-1, this.speedPercentageY, 0.71);
            } else if (changeY > 0) {
                this.speedPercentageY = this.accelerateNumber(1, this.speedPercentageY, 0.71);
            }
        }

    }


    decelerate() {
        if (this.speedPercentageX > this.minSpeedPercentage) {
            this.speedPercentageX -= this.acceleration;
            Math.max(this.speedPercentage, this.minSpeedPercentage);
        }
        if (this.speedPercentageY > this.minSpeedPercentage) {
            this.speedPercentageY -= this.acceleration;
            Math.max(this.speedPercentage, this.minSpeedPercentage);
        }
        if (this.speedPercentageX < -this.minSpeedPercentage) {
            this.speedPercentageX += this.acceleration;
            Math.min(this.speedPercentage, -this.minSpeedPercentage);
        }
        if (this.speedPercentageY < -this.minSpeedPercentage) {
            this.speedPercentageY += this.acceleration;
            Math.min(this.speedPercentage, -this.minSpeedPercentage);
        }
    }


    handleInertion() {
        //vrši deceleraciju ako moje bilo pokreta
        if (!this.moved) {
            this.decelerate();
        }
    }


    moveLeft() {
        let change = this.speed * -Math.abs(this.speedPercentageX);
        this.moveBoxX(change);

        //ova provjera se vrši samo za neprijatelje, kolizija sa drugim nerprijateljima
        let enemyCheck = false;
        if(this.collisionEnemies){
            enemyCheck = this.collisionEnemies();
        }

        //ako je nova pozicija u koliziji, vrati korak
        if (!this.collisionStage() && !enemyCheck) {
            this.positionX += change;
            this.drawX += change;
            this.accelerate(change, 0, false);
            this.moved = true;
        } else {
            this.moveBoxX(-change);
            this.moved = false;
        }
    }


    moveRight() {
        let change = this.speed * Math.abs(this.speedPercentageX);
        this.moveBoxX(change);

        //ova provjera se vrši samo za neprijatelje, kolizija sa drugim nerprijateljima
        let enemyCheck = false;
        if(this.collisionEnemies){
            enemyCheck = this.collisionEnemies();
        }

        //ako je nova pozicija u koliziji, vrati korak
        if (!this.collisionStage() && !enemyCheck) {
            this.positionX += change;
            this.drawX += change;
            this.accelerate(change, 0, false);
            this.moved = true;
        } else {
            this.moveBoxX(-change);
            this.moved = false;
        }
    }


    moveUp() {
        let change = this.speed * -Math.abs(this.speedPercentageY);
        this.moveBoxY(change);

        //ova provjera se vrši samo za neprijatelje, kolizija sa drugim nerprijateljima
        let enemyCheck = false;
        if(this.collisionEnemies){
            enemyCheck = this.collisionEnemies();
        }

        //ako je nova pozicija u koliziji, vrati korak
        if (!this.collisionStage() && !enemyCheck) {
            this.positionY += change;
            this.drawY += change;
            this.accelerate(0, change, false);
            this.moved = true;
        } else {
            this.moveBoxY(change);
            this.moved = false;
        }
    }


    moveDown() {
        let change = this.speed * Math.abs(this.speedPercentageY);
        this.moveBoxY(change);

        //ova provjera se vrši samo za neprijatelje, kolizija sa drugim nerprijateljima
        let enemyCheck = false;
        if(this.collisionEnemies){
            enemyCheck = this.collisionEnemies();
        }

        //ako bounding box nije u koliziji, izvrši korak
        if (!this.collisionStage() && !enemyCheck) {
            this.positionY += change;
            this.drawY += change;
            this.accelerate(0, change, false);
            this.moved = true;
        } else {
            this.moveBoxY(-change);
            this.moved = false;
        }
    }


    diagonalHelper(changeX, changeY){
        let moved = false;

        //ova provjera se vrši samo za neprijatelje, kolizija sa drugim nerprijateljima
        let enemyCheck = false;

        this.moveBoxX(changeX);
        if(this.collisionEnemies){
            enemyCheck = this.collisionEnemies();
        }
        //ako je nova pozicija u koliziji, vrati korak
        if (!this.collisionStage() && !enemyCheck) {
            this.positionX += changeX;
            this.drawX += changeX;
            this.accelerate(changeX, 0, true);
            moved = true;
        } else {
            this.moveBoxX(-changeX);
        }

        this.moveBoxY(changeY);
        enemyCheck = false;
        if(this.collisionEnemies){
            enemyCheck = this.collisionEnemies();
        }
        if (!this.collisionStage() && !enemyCheck) {
            this.positionY += changeY;
            this.drawY += changeY;
            this.accelerate(0, changeY, true);
            moved = true;
        } else {
            this.moveBoxY(-changeY);
        }

        this.moved = moved;
    }


    moveLeftUp() {
        let changeX = (this.speed * -Math.abs(this.speedPercentageX)) / 1.41;
        let changeY = (this.speed * -Math.abs(this.speedPercentageY)) / 1.41;
        
        this.diagonalHelper(changeX, changeY);
    }


    moveLeftDown() {
        let changeX = (this.speed * -Math.abs(this.speedPercentageX)) / 1.41;
        let changeY = (this.speed * Math.abs(this.speedPercentageY)) / 1.41;
        
        this.diagonalHelper(changeX, changeY);

    }


    moveRightUp() {
        let changeX = (this.speed * Math.abs(this.speedPercentageX)) / 1.41;
        let changeY = (this.speed * -Math.abs(this.speedPercentageY)) / 1.41;
        
        this.diagonalHelper(changeX, changeY);

    }

    moveRightDown() {
        let changeX = (this.speed * Math.abs(this.speedPercentageX)) / 1.41;
        let changeY = (this.speed * Math.abs(this.speedPercentageY)) / 1.41;
        
        this.diagonalHelper(changeX, changeY);

    }


    shoot() {
        //ako nije nedavno pucano
        if (!this.wait) {
            //kreira metak koji će biti ispucan
            const bullet = new Bullet(this.stage, this.positionX, this.positionY + this.gunYOffset, this.bulletType);

            //pričeka ako je nedavno pucano
            this.wait = true;
            this.shootingTimer = this.shootingSpeed;

            return bullet;
        } else {
            return false;
        }
    }


    collisionStage() {
        if (
            this.leftEdge <= 0 ||
            this.rightEdge >= this.stage.canvas.width ||
            this.upEdge <= 0 ||
            this.downEdge >= this.stage.canvas.height
        ) {
            return true;
        } else {
            return false;
        }
    }


    collisionBullet(bullet) {
        //provjerava samo centar metka, ne izračunava bounding box
        if (
            (this.leftEdge <= bullet.positionX && this.rightEdge >= bullet.positionX) &&
            (this.upEdge <= bullet.positionY && this.downEdge >= bullet.positionY)
        ) {
            return true;
        } else {
            return false;
        }
    }


    collisionEntity(entity){
        if(this.upEdge < entity.downEdge &&
            this.rightEdge > entity.leftEdge &&
            this.leftEdge < entity.rightEdge &&
            this.downEdge > entity.upEdge){
                return true;
        } else {
            return false;
        }
    }


    doCycle(){
        //mijenja brzinu ako se pomaknuo zadnji ciklus
        this.handleInertion();

        //resetira moved flag
        this.moved = false;

        //ponovno namješta bounding box za idući frame
        this.setBoundingBox();

        //oduzima 1 ciklus sa timera kad čeka
        this.handleTimings();
    }


}