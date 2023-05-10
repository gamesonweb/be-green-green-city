let g;
let builds;
let end_game_score = 100;
let gameRound;

var pTimeGame = document.getElementById("gameTime");
var timeGame;
var pMoneyP1 = document.getElementById("moneyPlayer1");
var pMoneyP2 = document.getElementById("moneyPlayer2");
// tableau contenant les mesh devant utilisé des particules
let needParticle = [];

class Game{

    size_board;
    player1;
    player2;

    constructor(size_board){
        this.size_board = size_board;
    }

    startGame(){
        // create and init players
        this.player1 = new Player(this.size_board, 1);
        this.player1.init();
        this.player2 = new Player(this.size_board, 2);
        this.player2.init();
        timeGame = 0;
    }
}

class Building{
	name;
	cost;
	effect;
	greenness;
    population;
    profits;
    constructor(name, cost, effect, greenness, population, profits){
		this.name = name;
        this.cost = cost;
        this.effect = effect;
        this.greenness = greenness;
        this.population = population;
        this.profits = profits;
    }
}

class Player{
    size_board;
	score;
    board;
    money;
    greenness;
    board_profits;
    board_greenness;
    board_population;
    idPlayer;
    selectedBuilding;
    purshaseMode;
    constructor(size_board, idPlayer){
        this.size_board = size_board;
        this.idPlayer = idPlayer;
    }

    init(){
        this.score = 0;
        this.money = 4;
        this.greenness = 0;
        this.board_profits = 0;
        this.board_greenness = 0;
        this.board_population = 0;
        this.selectedBuilding = 0;
        this.purshaseMode = false;

        this.board = new Array(this.size_board);
        for(var i = 0; i<this.size_board; i++){
            this.board[i] = new Array(this.size_board);
        }
        this.displayUpdateStats();
    }

	computeScore() {
        return 0;
        // revoir l'equilibrage du score
		// return this.board_population * this.greenness + this.money;
	}

	printBoard() {
		console.log("Board: ");
		for(var i = 0; i < this.size_board; ++i) {
			console.log(this.board[i] + " ");
		}
	}

    // TO DO: retourner un integer pour savoir le status de la construction
    // Par exemple:
    // 1: construction réussie
    // 0: pas assez d'argent
    // -1: pas de place
    placeBuilding(building, x, y){
        if(this.board[x][y] != null){
            console.log("already a building here");
            return false;
        }else if(building.cost > this.money){
            console.log("not enough money");
            var elem = this.idPlayer== 1 ? pMoneyP1 : pMoneyP2;
            setTimeout(function(){
                elem.classList.remove("notEnough");
                void elem.offsetWidth;
                elem.classList.add("notEnough");
            }, 100);

            return false;
        }else{
            console.log("placing building " + building.name + " at " + x + " " + y);
            this.money -= building.cost;
            this.board[x][y] = building;
            this.board_profits += building.profits;
            this.board_greenness += building.greenness;
            this.board_population += building.population;

            this.displayUpdateStats();
            return true;
        }
    }

    updateStats(){
        this.money += this.board_profits;
        this.greenness += this.board_greenness;
        this.displayUpdateStats();
    }

    displayUpdateStats(){
        document.getElementById("moneyPlayer" + this.idPlayer).innerHTML = this.money;
        document.getElementById("greenP"+this.idPlayer).innerHTML = this.greenness;
        document.getElementById("people"+this.idPlayer).innerHTML = this.board_population;
    }
}

function updateTime(){
    // add 1 second to the game time
    timeGame += 1;
    // update the displayed value of the money

    // update the time in the html
    pTimeGame.innerHTML = (10-timeGame%10) + "s";
    if(timeGame%10 == 0){
        playRound();
    }
}

function playRound(){
    // update greenness and money
    g.player1.updateStats();
    g.player2.updateStats();

    // play les particules du tableau et pop les particules qui sont démarées
    // while have next in tableau

    while(needParticle.length > 0){
        // get the first item
        let particle = needParticle[0];
        // start the particle
        particle.start();
        needParticle.pop();
    }

    // score calc
    // TODO equilibrer le calcul
    var score1 = g.player1.computeScore();
    var score2 = g.player2.computeScore();
    if(score1>=end_game_score || score2>=end_game_score){
        if(score1>score2){
            console.log("player 1 won");
        } else if(score1<score2){
            console.log("player 2 won");
        } else {
            console.log("draw")
        }
        clearInterval(gameRound);
    }
    // console.log("player 1 money " + g.player1.money);
    // console.log("player 2 money " + g.player2.money);
}

// main
document.addEventListener("DOMContentLoaded", function() {
    let number_build = 3;
    let size_game = nbSquaresSide;
    // create some buildings
    builds = new Array(number_build);
    builds[0] = new Building("House", 2, 0, 0, 4, 1);
    builds[1] = new Building("Office", 4, 1.5, -1, 0, 3);
    // TODO mettre une pollution qu'on ne peut pas enlever (les déchets nucleaires)
    builds[2] = new Building("Nuclear Plant", 10, 0.5, 0, 0, 6);

    g = new Game(size_game);
    g.startGame();

    // gameRound = setInterval(playRound, 10000);
    // update each 1 second
    gameRound = setInterval(updateTime, 1000);

});
