"use strict";

const startScreen = document.getElementById('startScreen');
const gameArea = document.getElementById('gameArea');
const gameStatus = document.getElementById("status");

const player = {
	speed: 5,
	score: 0
};

const checkClear = (myCar, enemyCar) => {
	const myCarRear = myCar.offsetTop + myCar.clientHeight;
	const enemyCarRear = enemyCar.offsetTop;

	if (game.enemies.indexOf(enemyCar.id) > -1) {
		if (enemyCarRear < myCarRear) {
			game.enemies.splice(game.enemies.indexOf(enemyCar.id), 1);
		}
	} else {
		if (enemyCarRear > myCarRear) {
			game.enemies.push(enemyCar.id);
			return true;
		}
	}

	return false;
}

function isCollide(a, b) {
	let aRect = a.getBoundingClientRect();
	let bRect = b.getBoundingClientRect();

	return !((aRect.bottom < bRect.top) ||
		(aRect.top > bRect.bottom) ||
		(aRect.right < bRect.left) ||
		(aRect.left > bRect.right))
}

function endGame() {
	player.start = false;
	gameStatus.innerHTML = "restart";
	startScreen.classList.remove('d-none');
	startScreen.innerHTML = "Game over <br> Your final socre is " + player.score
		+ " <br> Press here to restart the game.";
}

const game = {
	init: () => {
		startScreen.classList.add('d-none');
		gameArea.innerHTML = "";

		player.start = true;
		player.score = 0;
		player.speed = 5;
		game.pause = false;
		game.time = 0;
		game.keys = [];
		game.enemies = [];
		game.startTime = undefined;
		game.lastSpeedUpdateTime = 0;
		
		for (let x = 0; x < 5; x++) {
			game.add.background(x);
		}

		game.update.score();
		game.update.speed();
		game.add.player();

		for (let x = 0; x < 3; x++) {
			game.add.enemy(x);
		}

		gameStatus.innerHTML = "pause";

		window.requestAnimationFrame(game.update.game);
	},
	add: {
		background: (x) => {
			const roadLine = document.createElement('div');
			roadLine.classList.add("lines");
			roadLine.style.top = `${x * 150}px`;
			gameArea?.appendChild(roadLine);
		},
		player: () => {
			const car = document.createElement('div');
			car.classList.add('myCar');
			car.innerHTML = `<hr class="position-absolute d-none" style="top: 90px; width: 400px;">`;
			gameArea?.appendChild(car);
		
			player.x = car.offsetLeft;
			player.y = car.offsetTop;
		},
		enemy: (x) => {
			const enemyCar = document.createElement('div');
			enemyCar.id = `enemy_${x}`;
			enemyCar.classList.add('enemyCar');
			const carX = Math.floor(Math.random() * 350);
			const carY = ((x + 1) * 350) * -1;
			enemyCar.style.top = `${carY}px`;
			enemyCar.style.left = `${carX}px`;
			enemyCar.innerHTML = `<hr class="position-absolute d-none" style="left: -${carX}px; width: 400px;">`;
			gameArea?.appendChild(enemyCar);
		}
	},
	update : {
		game: (timeStamp) => {
			if (!game.pause) {
				const car = document.querySelector('.myCar');
				const carRear = car?.querySelector("hr");

				if (game.debug) {
					car.style.backgroundColor = "#00FF00";
					carRear?.classList.remove("d-none");
				} else {
					car.style.backgroundColor = '';
					carRear?.classList.add("d-none");
				}

				if (game.startTime === undefined) {
					game.startTime = timeStamp;
				}

				const deltaTime = timeStamp - game.startTime;
				game.startTime = timeStamp;

				game.update.background();
				game.update.enemy(car);
				game.update.player();

				car.style.top = `${player.y}px`;
				car.style.left = `${player.x}px`;
				carRear.style.left = `-${player.x}px`;

				game.update.time(deltaTime);
			}

			if (player.start) {
				window.requestAnimationFrame(game.update.game);
			}
		},
		background: () => {
			document.querySelectorAll('.lines').forEach((line) => {
				let lineY = line.offsetTop;
		
				if (lineY >= 700) {
					lineY -= 750;
				}
		
				line.style.top = `${lineY + player.speed}px`;
			});
		},
		player: () => {
			const road = gameArea.getBoundingClientRect();

			game.keys.forEach((key) => {
				if (key == "ArrowUp") {
					if (player.y > (road.top + 150)) {
						player.y -= player.speed;
					}
				}
	
				if (key == "ArrowDown") {
					if (player.y < (road.bottom - 85)) {
						player.y += player.speed;
					}
				}
	
				if (key == "ArrowLeft") {
					if (player.x > 0) {
						player.x -= player.speed;
					}
				}
	
				if (key == "ArrowRight") {
					if (player.x < (road.width - 50)) {
						player.x += player.speed;
					}
				}
			});
		},
		enemy: (myCar) => {
			document.querySelectorAll('.enemyCar').forEach(function (enemyCar) {
				const enemyCarRear = enemyCar.querySelector("hr");

				if (checkClear(myCar, enemyCar)) {
					player.score += 10;
					game.update.score();

					if (game.debug) {
						debugger;
					}
				}

				if (isCollide(myCar, enemyCar)) {
					endGame();
					return false;
				}

				if (game.debug) {
					enemyCar.style.backgroundColor = "#FF0000";
					enemyCarRear?.classList.remove("d-none");
				} else {
					enemyCar.style.backgroundColor = '';
					enemyCarRear?.classList.add("d-none");
				}
		
				let enemyCarY = enemyCar.offsetTop;
		
				if (enemyCarY >= 750) {
					enemyCarY = -300;
					enemyCar.style.left =  + `${Math.floor(Math.random() * 350)}px`;
					enemyCarRear.style.left = `-${enemyCar.offsetLeft}px`;
				}
		
				enemyCar.style.top = `${enemyCarY + player.speed}px`;
			});
		},
		score: () => {
			const score = document.getElementById('score');
			score.innerText = player.score;
		},
		speed: () => {
			const speed = document.getElementById('speed');
			speed.innerHTML = player.speed;
		},
		time: (deltaTime) => {
			game.time += deltaTime;
			const game_time = game.time * 0.001;
			const time = document.getElementById('time');
			time.innerHTML = `${(game_time).toFixed(1)}s`;
			
			const speedUpdateTime = parseInt(game_time);

			if (speedUpdateTime % 5 == 0 && speedUpdateTime > game.lastSpeedUpdateTime) {
				game.lastSpeedUpdateTime = speedUpdateTime;
				player.speed++;
				game.update.speed();
			}
		}
	},
	debug: false
};

window.addEventListener("DOMContentLoaded", () => {
	if (startScreen) {
		startScreen.addEventListener('click', game.init);
	}
});

window.addEventListener("keydown", (event) => {
	if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(event.key) > -1 && game.keys.indexOf(event.key) === -1) {
		game.keys.push(event.key);
	} else if (event.key.toLocaleLowerCase() === ' ') {
		if (!player.start) {
			game.init();
		} else {
			game.pause = !game.pause;
			gameStatus.innerHTML = game.pause ? "play" : "pause";
		}
	} else if (event.key.toLocaleLowerCase() === 'd') {
		game.debug = !game.debug;
	}
});

window.addEventListener("keyup", (event) => {
	if (game.keys.indexOf(event.key) > -1) {
		game.keys.splice(game.keys.indexOf(event.key), 1);
	}
});