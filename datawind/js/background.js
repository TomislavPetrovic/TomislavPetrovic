'use strict';

export default class Background {

    constructor(stage) {
        //element za click listener
        this.stage = stage;

        this.sparcity = 5000;
        this.sizeRange = 3;
        this.speedRange = 4;

        //prvo generiranje zvijezda
        this.stars = this.generateStars(this.stage.canvas.width, this.stage.canvas.height, 0);
    }


    random(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    generateStars(rangeX, rangeY, offsetY){
        let number = Math.floor((rangeX * rangeY / this.sparcity));
        let newStars = new Array();

        for (let i = 0; i < number; i++) {
            newStars.push({
                x: this.random(0, rangeX),
                y: (this.random(0, rangeY)) - offsetY,
                size: this.random(1, this.sizeRange),
                speed: this.random(1, this.speedRange)
            });
        }

        return newStars;

    }


    rebornStar(star){
        star.x = this.random(0, this.stage.canvas.width);
        star.y = 0;
        star.size = this.random(1, this.sizeRange);
        this.speed = this.random(1, this.speedRange);
    }


    moveStars(){
        for (let i = 0; i < this.stars.length; i++) {
            this.stars[i].y += this.stars[i].speed;
            //kad zvijezda izađe sa ekrana ponovno je randomiziraj na vrhu
            if(this.stars[i].y >= this.stage.canvas.height){
                this.rebornStar(this.stars[i]);
            }
        }
    }

    
    setupDraw() {
        this.stage.strokeStyle = "rgba(255,255,255,1)";
        this.stage.fillStyle = "rgba(255,255,255,1)";
    }


    draw() {
        for (let i = 0; i < this.stars.length; i++) {
            this.stage.beginPath();
            this.stage.arc(this.stars[i].x, this.stars[i].y, (this.stars[i].size / 2), 0, 2 * Math.PI);
            this.stage.closePath();
            this.stage.fill();
        }
    }


    render() {
        this.setupDraw();
        this.draw();
    }


}