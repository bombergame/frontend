import {BaseScene, canvasRatios} from '../BaseScene.js';
import Bus from '../../modules/Bus.js';
import Router from '../../modules/Router.js';
import GameBus from '../GameBus.ts';
import Field from '../components/field/field.ts';
import Player from '../components/player/player.ts';
import Creep from '../components/creep/creep.ts';
import Controls from '../controls/Controls.js';
import numberMatrixMapGenerator from '../utils/mapGenerate.ts';

import * as sprites from '../SpriteImports.js';

export default class SingleScene extends BaseScene {
	constructor () {
		super(); // нужно оставить даже если в BaseScene нет констурктора, иначе this - undefined
		this._field = null;
		this._players = [];
		this._creeps = [];
		this._registeredActions = false;
		this.numberMatrixField = null;
		this._spriteSize = null;
		this.loop = true;
		this._controls = new Controls('singleplayer'); // режим контролов влиет на тип отправки сообщения в Bus

		Bus.on('single-user', { callbackName: 'SingleScene.updateUsers', callback: this.updateUsers.bind(this) });
		Bus.on('single-setBomb', { callbackName: 'SingleScene.updateBombs', callback: this.updateBombs.bind(this) });

		GameBus.on('single-player-death', this.updateGame.bind(this));
		GameBus.on('single-creep-death', this.updateCreeps.bind(this));
	}

	resizeSprites() {
		const windowWidth = window.innerWidth * canvasRatios.WIDTH;
		const windowHeight = window.innerHeight * canvasRatios.HEIGHT;

        const matrRowsCount = this.numberMatrixField.length;
		const matrColumnsCount = this.numberMatrixField[0].length;        
        const width = windowWidth / matrColumnsCount;
        const height = windowHeight / matrRowsCount;

		this.resizeCanvas();
		this._spriteSize = Math.min(width, height);
		this._field.setSpriteSize(this._spriteSize);
		this._players.forEach((element) => {
			element.setSpriteSize(this._spriteSize);
		});
		this._creeps.forEach((element) => {
			element.setSpriteSize(this._spriteSize);
		});
	}

	generateCreeps (field) {
		for (let i = 0; i < 6; i++) {
			let y = Math.floor(Math.random() * 16 + 3);
			let x = Math.floor(Math.random() * 16 + 3);
			while (field[y][x] !== 3) {
				x = Math.floor(Math.random() * 19);
			}
			const creep = new Creep(i, x, y, sprites.creepSprites);
			this._creeps.push(creep);
		}
	}
	init () {
		this.getCanvasContext();
		this.numberMatrixField = numberMatrixMapGenerator(21, 21); // TODO пусть поле всегда будет квадратное
		
		/*
        здесь важен порядок создания объектов Player и Field, т.к. в таком
        же порядке будут подписаны методы на события и следовательно исполнятся они будут тоже
        в таком порядке. А именно: при происхождении события 'single-bomb-explode'
        сначала должен сработать метод onExplodeBomb именно объекта Player,
        потому что Player должен знать состояние поля до взрыва, чтобы исключить ситуацию,
        когда бомба может убить игрока, находящегося за FragileBrick. Такая ситуация возможна,
        если первым сработает метод onExplodeBomb объекта Field, заменив FragileBrick на GrassBrick,
        тем самым изменив состояние поля. Таким образом метод onExplodeBomb объекта Player выполнится уже с новым
        состоянием поля, и игра будет думать что игрок находится не за FragileBrick, а за GrassBrick,
        значит он попадает в область поражения
        */
		const player = new Player(1, 3, 0, sprites.playerSprites, sprites.bombSprites, sprites.flameSprites);
		this._players.push(player);

		this.generateCreeps(this.numberMatrixField);

		this._field = new Field(this.numberMatrixField, sprites.fieldSprites, this.firstLayerContext);
		// вместо передачи поля через конструктор

		this._creeps.forEach(creep => {
			creep.setField(this._field.bricksInField);
			creep.setCanvasContext(this.secondLayerContext);
			creep.creepBrain();
		});

		this.resizeSprites();

		this._players[0].setField(this._field.bricksInField);
		this._players[0].setCanvasContext(this.secondLayerContext);

		if (!this._registeredActions) {
			this._controls.init(this.controlsLayer);
			this.registerActions();
			this._registeredActions = true;
		}
	}

	updateUsers (data) {
		this._players[0].update(this._players[0].xPos + data.dx, this._players[0].yPos + data.dy);
	}

	updateBombs () {
		this._players[0].plantBomb();
	}

	updateCreeps (data) {
		this._creeps = this._creeps.filter(creep => {
			return creep._id !== data.creepId;
		});

		if (!this._creeps.length) {
			this.updateWinGame();
		}
	}

	singlePlayerLoop () {
		this.clearSecondLayer();
		this.renderBombs();
		this.renderPlayers();
		this.renderCreeps();
		this.checkCollisions();

		if (this.loop) {
			window.requestAnimationFrame(this.singlePlayerLoop.bind(this));
		}
	}

	updateGame () {

		this.loop = false; // останавливаем requestAnimationFrame
		document.getElementById('canvas2').setAttribute('hidden', 'hidden');
		Bus.totalOff('single-field');
		Bus.totalOff('single-user');
		Bus.totalOff('single-setBomb');
		Bus.totalOff('single-bomb-explosion');
		Bus.totalOff('single-scene-start');

		GameBus.totalOff('single-bomb-plant');
		GameBus.totalOff('single-player-death');
		GameBus.totalOff('single-bomb-explode');
		GameBus.totalOff('single-creep-death');

		this.showLoseInfo();
	}

	updateWinGame () {
		this.loop = false; // останавливаем requestAnimationFrame
		document.getElementById('canvas2').setAttribute('hidden', 'hidden');
		Bus.totalOff('single-field');
		Bus.totalOff('single-user');
		Bus.totalOff('single-setBomb');
		Bus.totalOff('single-bomb-explosion');
		Bus.totalOff('single-scene-start');

		GameBus.totalOff('single-bomb-plant');
		GameBus.totalOff('single-player-death');
		GameBus.totalOff('single-bomb-explode');
		GameBus.totalOff('single-creep-death');

		this.showWinInfo();
	}

	showLoseInfo () {
		document.getElementById('dropdown-game-info-lose').style.width = '100%';
	}
	showWinInfo () {
		document.getElementById('dropdown-game-info-win').style.width = '100%';
	}

	registerActions () {
		window.addEventListener('load', this.resizeSprites.bind(this));
		window.addEventListener('resize', this.resizeSprites.bind(this));
		window.addEventListener('orientationchange', this.resizeSprites.bind(this));
	}
}

// export default new SingleScene();
