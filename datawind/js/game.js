'use strict';

import Player from '/js/player.js';
import Enemy from '/js/enemy.js';
import Input from '/js/input.js';
import Bullet from '/js/bullet.js';
import Background from '/js/background.js';
import Sound from '/js/sound.js';

export default class Game {

    constructor(stageElement) {
        this.stage = stageElement.getContext("2d");

        //glavni flagovi
        this.running = false;
        this.paused = false;
        this.started = false;
        this.recovery = false;
        this.recoveryTime = 200;
        this.recoveryCurrentTime = this.recoveryTime;
        this.dead = false;
        this.levelEnd = false;

        //fiksna veličina
        this.defaultX = 600;
        this.defaultY = 600;

        //početno skaliranje
        stageElement.width = this.defaultX;
        stageElement.height = this.defaultY;

        //centar za daljnje korištenje
        this.stageCenterX = this.stage.canvas.width / 2;
        this.stageCenterY = this.stage.canvas.height / 2;

        //instanciranje handlera inputa
        this.input = new Input(this.stage);

        //kreiranje igrača
        this.player = new Player(this.stage, 300, 550);

        //postavljanje variabli igre
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.maxEnemyNumber = 60;

        //kreiranje neprijatelja po nacrtu
        this.enemies = new Array();
        this.createEnemies();

        //variable huda i menua
        this.scoreBoardX = 10;
        this.lifeBoardX = this.stage.canvas.width - 122;
        this.menuWidth = 300;
        this.menuHeight = 350;
        this.menuX = this.stageCenterX - (this.menuWidth / 2);
        this.menuY = this.stageCenterY - (this.menuHeight / 2);

        //instanciranje klasa pozadine i zvuka
        this.background = new Background(this.stage);
        this.sound = new Sound();

        //liste metaka
        this.enemyBullets = new Array();
        this.playerBullets = new Array();
    }


    clearStage() {
        this.stage.fillStyle = 'rgba(0,0,0,1)';
        this.stage.fillRect(0, 0, this.stage.canvas.width, this.stage.canvas.height);
    }


    createEnemyFormation(number) {
        let rowNumbers = Array();

        const maxRowSize = 12;

        let currentRow = 1;
        let currentRowSize = 1;
        let currentNumber = Math.min(number, this.maxEnemyNumber);

        while(currentNumber > 0){
            if(currentRowSize >= maxRowSize){
                rowNumbers.push(currentRowSize);
                currentRow++;
                currentRowSize = 1;
            } else {
                if(currentNumber == 1){
                    rowNumbers.push(currentRowSize);
                }
                currentRowSize++;
            }
            currentNumber--;
        }

        return rowNumbers;

    }


    createEnemies() {
        //poredak neprijatelja definiran ovdje
        const spacing = 10;
        const enemyHalf = 15;

        const formation = this.createEnemyFormation(this.level);

        let enemyPositions = Array();

        //kreira neprijatelje po formaciji
        for (let i = 0; i < formation.length; i++) {
            const y = (spacing * (i+1)) + enemyHalf + (enemyHalf * 2 * i);
            const rowWidth = formation[i]*enemyHalf*2 + (spacing * (formation[i] - 1));
            let x = (this.stage.canvas.width - rowWidth) / 2 + enemyHalf;
            for (let j = 1; j <= formation[i]; j++) {
                this.enemies.push(new Enemy(this.stage, x, y, this.enemies));
                x += enemyHalf * 2 + spacing;
            }
        }
    }


    enemyDo() {
        let action = false;
        for (let i = 0; i < this.enemies.length; i++) {
            //šalje poziciju igrača neprijatelju i doviva nešto za uzvrat kao akciju
            action = this.enemies[i].do(this.player.positionX, this.player.positionY);
            if (action instanceof Bullet) {
                this.enemyBullets.push(action);
                this.sound.playEnemyShoot();
            }
        }
    }


    playerHit() {
        //vodi brigu o broju života igrača ovdje
        if (this.lives > 0) {
            this.lives--;
            this.recovery = true;
        } else {
            //zaustavlja igru ako nema više života
            this.running = false;
            this.dead = true;
            this.sound.stopTrack();
            this.sound.playFailed();
        }
    }


    checkRectClick(minX, minY, width, height) {
        let scale = this.stage.canvas.width / this.stage.canvas.offsetWidth;

        if ((this.input.clickX * scale) >= minX &&
            (this.input.clickX * scale) <= (minX + width) &&
            (this.input.clickY * scale) >= minY &&
            (this.input.clickY * scale) <= (minY + height)) {
            return true;
        } else {
            return false;
        }
    }


    handleInput() {

        //kretanje igrača
        let horizontal = (this.input.left || this.input.right) && (this.input.left !== this.input.right);
        let vertical = (this.input.up || this.input.down) && (this.input.up !== this.input.down);
        let diagonal = horizontal && vertical;
        if (diagonal && this.input.left) {
            if (this.input.up) {
                this.player.moveLeftUp();
            } else {
                this.player.moveLeftDown();
            }
        } else if (diagonal && this.input.right) {
            if (this.input.up) {
                this.player.moveRightUp();
            } else {
                this.player.moveRightDown();
            }
        } else if (horizontal) {
            if (this.input.left) {
                this.player.moveLeft();
            } else {
                this.player.moveRight();
            }
        } else if (vertical) {
            if (this.input.up) {
                this.player.moveUp();
            } else {
                this.player.moveDown();
            }
        }

        //pucanje(player stvori i vrati metak)
        if (this.input.spacebar) {
            let bullet = this.player.shoot();
            if (bullet != false) {
                this.playerBullets.push(bullet);
                this.sound.playPlayerShoot();
            }
        }

        //zaustavlja igru i otvara menu
        if (this.input.escape) {
            if (this.paused) {
                this.running = true;
                this.paused = false;
                this.input.resetAction();
                this.sound.playMenuAction();
                this.sound.resumeTrack();
            } else if (this.running) {
                this.running = false;
                this.paused = true;
                this.input.resetAction();
                this.sound.playMenuAction();
                this.sound.pauseTrack();
            }
        }

        //provjerava click na menuu(vrijednosti pozicija su hardcoded)
        if (this.input.clicked) {
            //opcija 1
            if (this.checkRectClick(this.menuX + 25, this.menuY + 75, this.menuWidth - 50, 50)) {
                if (this.paused) {
                    //samo prebaci flag
                    this.running = true;
                    this.paused = false;
                    this.sound.playMenuAction();
                } else if (!this.started) {
                    //pokreni audio api, moraš to ovdje na prvi input
                    this.sound.startAudio();
                    this.sound.playTrack(0);
                    //ako još igra nije pokrenuta, ovo je samo na početku
                    this.startGame();
                } else if (this.dead) {
                    this.sound.playMenuAction();
                    this.restartGame();
                } else if (this.levelEnd) {
                    this.sound.playMenuAction();
                    this.nextLevel();
                }
            }

            //opcija 2
            if (this.checkRectClick(this.menuX + 25, this.menuY + 260, this.menuWidth - 50, 50) && !this.running) {
                //povratak na stranicu sa projektima
                window.location.href = "http://www.tomislavpetrovic.github.io/";
                this.sound.playMenuAction();
            }

            this.input.resetAction();
        }

        //enter tipka u menuu
        if (this.input.enter) {
            if (this.paused) {
                this.running = true;
                this.paused = false;
                this.sound.playMenuAction();
            } else if (!this.started) {
                //ovo je druga točka gdje počinje igra
                this.sound.startAudio();
                this.sound.playTrack(0);
                this.startGame();
            } else if (this.dead) {
                this.restartGame();
            } else if (this.levelEnd) {
                this.nextLevel();
            }

            this.input.resetAction();
        }

    }


    checkPlayerBullets() {
        //postavnljanje pogođenih na undefined
        for (let i = 0; i < this.playerBullets.length; i++) {
            //briše metak odmah ako je izašao van prostora
            if (this.playerBullets[i].isOutside()) {
                this.playerBullets[i] = undefined;
                continue;
            }
            for (let j = 0; j < this.enemies.length; j++) {
                //ako je pogodak, briše upise sa sadašnjih lista
                if (this.enemies[j]) {
                    if (this.enemies[j].collisionBullet(this.playerBullets[i])) {
                        //dodaje bodove za pogođenog neprijatelja
                        this.score += this.enemies[j].points;

                        //briše pogođene aktere
                        this.enemies[j] = undefined;
                        this.playerBullets[i] = undefined;

                        //pušta zvuk eksplozije neprijatelja
                        this.sound.playEnemyExplosion();
                        break;
                    }
                }
            }
        }

        //čišćenje uništenih objekata
        this.enemies = this.enemies.filter(enemy => enemy !== undefined);
        this.playerBullets = this.playerBullets.filter(bullet => bullet !== undefined);

        //šalje novu listu neprijatelja neprijateljima za izbjegavanje
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].otherEnemies = this.enemies.filter(enemy => enemy !== this.enemies[i]);
        }

        //šalje listu neprijateljima za izbjegavanje
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].avoidPlayerBullets(this.playerBullets);
        }

    }


    checkEnemyBullets() {
        for (let i = 0; i < this.enemyBullets.length; i++) {
            //briše metak odmah ako je izašao van prostora
            if (this.enemyBullets[i].isOutside()) {
                this.enemyBullets[i] = undefined;
                continue;
            }
            if (this.player.collisionBullet(this.enemyBullets[i])) {
                this.playerHit();
                this.enemyBullets[i] = undefined;
            }
        }

        //čišćenje uništenih objekata
        this.enemyBullets = this.enemyBullets.filter(bullet => bullet !== undefined);
    }


    checkEnemyBodies() {
        if (!this.recovery) {
            for (let i = 0; i < this.enemies.length; i++) {
                if (this.player.collisionEntity(this.enemies[i])) {
                    this.playerHit();
                    this.sound.playPlayerCollision();
                }
            }
        }
    }


    checkBullets() {
        this.checkPlayerBullets();
        if (!this.recovery) {
            this.checkEnemyBullets();
        }
    }


    timerRecovery() {
        if (this.recoveryCurrentTime <= 0) {
            this.recovery = false;
            this.recoveryCurrentTime = this.recoveryTime;
        } else if (this.recovery) {
            this.recoveryCurrentTime--;
        }
    }


    checkEnemiesDead() {
        //ako su svi neprijatelji mrtvi, okreni stanje na menu na kraju nivoa
        if (this.enemies.length == 0) {
            this.running = false;
            this.levelEnd = true;
            //puštaj zvuk za uspješan kraj nivoa
            this.sound.stopTrack();
            this.sound.playLevelComplete();
        }
    }


    renderEnemies() {
        for (let i = 0; i < this.enemies.length; i++) {
            //ako neprijatelj nije već "uništen"
            if (this.enemies[i]) {
                this.enemies[i].render();
            }
        }
    }


    renderPlayer() {
        //ne crta igrača svaki frame ako je u recovery
        if (!(this.recovery && (this.recoveryCurrentTime % 5) == 0)) {
            this.player.render();
        }
    }


    //i pomiče metke
    renderEnemyBullets() {
        for (let i = 0; i < this.enemyBullets.length; i++) {
            this.enemyBullets[i].moveDown();
            this.enemyBullets[i].render();
        }
    }


    //i pomiče metke
    renderPlayerBullets() {
        for (let i = 0; i < this.playerBullets.length; i++) {
            this.playerBullets[i].moveUp();
            this.playerBullets[i].render();
        }
    }


    cycleEntities() {
        this.player.doCycle();

        for (let i = 0; i < this.enemies.length; i++) {
            //ako neprijatelj nije već "uništen"
            if (this.enemies[i]) {
                this.enemies[i].doCycle();
            }
        }
    }


    renderHud() {
        this.stage.lineWidth = 1;
        this.stage.lineCap = "butt";
        this.stage.lineJoin = "miter";
        
        this.stage.beginPath();
        this.stage.rect(this.scoreBoardX, 10, 110, 20);
        this.stage.rect(this.lifeBoardX, 10, 110, 20);
        this.stage.rect(this.stageCenterX - 55, 10, 110, 20);
        this.stage.closePath();
        this.stage.stroke();
        this.stage.globalAlpha = 0.7;
        this.stage.fillStyle = "rgba(200,200,255,1)";
        this.stage.fill();
        this.stage.globalAlpha = 1;

        //dodaje nule ispred rezultata
        let score = this.score.toString().padStart(5, '0');

        this.stage.textAlign = "center";
        this.stage.font = "bold 16px Arial";
        this.stage.fillStyle = "rgba(0,0,0,1)";
        this.stage.fillText(('Score: ' + score), 65, 26);
        this.stage.fillText(('Lives: ' + this.lives), this.lifeBoardX + 55, 26);
        this.stage.fillText(('Level ' + this.level), this.stageCenterX, 26);
    }

    getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    renderBackground() {
        this.background.moveStars();
        this.background.render();
    }


    showMenu() {
        this.stage.textAlign = "center";

        //vanjski element
        this.stage.beginPath();
        this.stage.rect(this.menuX, this.menuY, this.menuWidth, this.menuHeight);
        this.stage.strokeStyle = "black";
        this.stage.lineWidth = 3;
        this.stage.closePath();
        this.stage.stroke();
        this.stage.fillStyle = "rgba(200,200,240,1)";
        this.stage.fill();

        //naslov
        this.stage.strokeStyle = "black";
        this.stage.lineWidth = 2;
        this.stage.font = "bold 50px Arial";
        this.stage.fillStyle = "rgba(255,0,200,1)";
        this.stage.strokeText('Datawind', this.stageCenterX, this.menuY + 50);
        this.stage.fillText('Datawind', this.stageCenterX, this.menuY + 50);

        this.stage.strokeStyle = "black";
        this.stage.lineWidth = 3;

        //opcija 1
        this.stage.beginPath();
        this.stage.rect(this.menuX + 25, this.menuY + 75, this.menuWidth - 50, 50);
        this.stage.closePath();
        this.stage.stroke();
        this.stage.fillStyle = "rgba(50,50,50,1)";
        this.stage.fill();

        //opcija 1 tekst
        this.stage.font = "bold 35px Arial";
        this.stage.fillStyle = "rgba(255,0,0,1)";
        let text1 = 'Resume game';
        if (this.paused) {
            let text1 = 'Resume game';
        } else if (!this.started) {
            text1 = 'Start game';
        } else if (this.dead) {
            this.stage.fillText('You were destroyed!', this.stageCenterX, this.menuY - 40);

            text1 = 'Restart?'
        } else if (this.levelEnd) {
            this.stage.fillStyle = "rgba(0,255,0,1)";
            this.stage.fillText('Congratulations!', this.stageCenterX, this.menuY - 40);

            text1 = 'Next Level'
        }
        this.stage.fillText(text1, this.stageCenterX, this.menuY + 112);

        //kontrole tekst
        this.stage.font = "bold 16px Arial";
        this.stage.fillStyle = "rgba(0,0,0,1)";
        this.stage.fillText('Controls:', this.stageCenterX, this.menuY + 150);
        this.stage.font = "16px Arial";
        this.stage.fillText('Movement:    WASD or arrow keys', this.stageCenterX, this.menuY + 170);
        this.stage.fillText('Shoot:    Spacebar key', this.stageCenterX - 8, this.menuY + 190);
        this.stage.fillText('Pause/Menu:    Esc key', this.stageCenterX - 53, this.menuY + 210);
        this.stage.fillText('Menu option:    Enter key', this.stageCenterX - 46, this.menuY + 230);
        if (!this.started) {
            this.stage.fillText("Click 'Start game' to continue!", this.stageCenterX, this.menuY + 250);
        }

        //opcija 2
        this.stage.beginPath();
        this.stage.rect(this.menuX + 25, this.menuY + 260, this.menuWidth - 50, 50);
        this.stage.closePath();
        this.stage.stroke();
        this.stage.fillStyle = "rgba(50,50,50,1)";
        this.stage.fill();

        //opcija 2 tekst
        this.stage.font = "bold 35px Arial";
        this.stage.fillStyle = "rgba(255,0,0,1)";
        this.stage.fillText('Return to site', this.stageCenterX, this.menuY + 297);

        //footer tekst
        this.stage.font = "20px Arial";
        this.stage.fillStyle = "rgba(0,0,0,1)";
        this.stage.fillText('© Tomislav Petrović 2019.', this.stageCenterX, this.menuY + 340);
    }


    mainLoop() {

        //glavna petlja igre
        //čeka ako zvuk nije učitan
        if (this.running) {
            this.clearStage();

            this.checkBullets();
            this.checkEnemyBodies();

            this.renderBackground();

            this.renderPlayer();
            this.renderEnemies();

            this.renderEnemyBullets();
            this.renderPlayerBullets();

            this.timerRecovery();

            this.renderHud();


            this.handleInput();

            this.enemyDo();

            this.checkEnemiesDead();
            this.cycleEntities();
            
        } else {
            //crta pozadinu ako je prije početka igre
            if(!this.started){
                this.clearStage();
                this.renderBackground();
            }

            //pokazuje menu ako igra stoji, i crta objekte
            this.showMenu();

            this.handleInput();
        }

        requestAnimationFrame(() => this.mainLoop());

    }


    restartGame() {

        this.paused = false;
        this.running = true;
        this.dead = false;

        //instanciranje handlera inputa
        this.input = new Input(this.stage);

        //kreiranje igrača
        this.player = new Player(this.stage, 300, 550);

        //postavljanje variabli igre
        this.score = 0;
        this.lives = 3;
        this.level = 1;

        //kreiranje neprijatelja po nacrtu
        this.enemies = new Array();
        this.createEnemies();

        //instanciranje pozadine
        this.background = new Background(this.stage);

        //pokreće glavnu temu
        this.sound.playTrack(0);

        //liste metaka
        this.enemyBullets = new Array();
        this.playerBullets = new Array();

    }


    nextLevel() {

        //instanciranje handlera inputa
        this.input = new Input(this.stage);

        //kreiranje igrača
        this.player = new Player(this.stage, 300, 550);

        //postavljanje variabli igre
        this.level++;

        //kreiranje neprijatelja po nacrtu
        this.enemies = new Array();
        this.createEnemies();

        //instanciranje pozadine
        this.background = new Background(this.stage);

        //liste metaka
        this.enemyBullets = new Array();
        this.playerBullets = new Array();

        //pokreće glavnu temu
        this.sound.playTrack(0);

        this.paused = false;
        this.running = true;
        this.levelEnd = false;
    }


    startGame() {
        this.started = true;
        this.running = true;

        this.mainLoop();
    }

}