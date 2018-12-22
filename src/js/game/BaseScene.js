import GameBus from './GameBus.ts';

export const canvasRatios = {
	WIDTH: 0.8,
	HEIGHT: 1,
}

export class BaseScene {
	resizeCanvas() {
		const width = window.innerWidth * canvasRatios.WIDTH;
		const height = window.innerHeight * canvasRatios.HEIGHT;

		this.firstLayer.width = width;
		this.firstLayer.height = height;

		this.secondLayer.width = width;
		this.secondLayer.height = height;

		this.controlsLayer.width = window.innerWidth;  // тут 100 % чтобы контролы были на весь экран
		this.controlsLayer.height = window.innerHeight;
	}

	getCanvasContext () {
		this.controlsLayer = document.getElementById('canvasControls');

		this.firstLayer = document.getElementById('canvas1');
		this.firstLayerContext = this.firstLayer.getContext('2d');

		this.secondLayer = document.getElementById('canvas2');
		this.secondLayerContext = this.secondLayer.getContext('2d');

		this.resizeCanvas()
	}

	clearFirstLayer () {
		this.firstLayerContext.clearRect(0, 0, this.firstLayer.width, this.firstLayer.height);
	}

	clearSecondLayer () {
		this.secondLayerContext.clearRect(0, 0, this.secondLayer.width, this.secondLayer.height);
	}

	checkCollisions () {
		this._creeps.forEach(creep => {
			if (creep.xPos === this._players[0].xPos && creep.yPos === this._players[0].yPos) {
				GameBus.emit('single-player-death');
			}
		});
	}

	renderPlayers () {
		this._players.forEach(player => {
			player.drawPlayer();
		});
	}

	// TODO при взрыве бомбы игрок остается в массиве
	renderBombs () {
		this._players.forEach(player => {
			player.plantedBombs.forEach(bomb => {
				bomb.drawBomb();
			});
		});
	}

	renderCreeps () {
		this._creeps.forEach(creep => {
			creep.drawCreep();
		});
	}
}
