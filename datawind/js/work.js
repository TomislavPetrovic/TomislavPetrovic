'use strict';

//uvodi modul aplikacije
import Game from '/js/game.js';

function startGame(){
    //pronalazi canvas prostor
    var stageElement = document.getElementById("stage");
    
    //kreira instancu igre
    var game = new Game(stageElement);

    //game.test2();
    game.mainLoop();

}

//pripremi okidač za pokretanje
document.addEventListener("load", startGame());