import BaseScene from '../BaseScene.js';
import Bus from '../../modules/Bus.js';
import Router from '../../modules/Router.js';
import GameBus from '../GameBus.ts';
import Field from '../components/field/field.ts';
import Player from '../components/player/player.ts'
import { matr } from '../GameConfig.js';

export default class SingleScene extends BaseScene {
    constructor () {
        super();
        this._field = null;
        this._player = null;
    }

    init(canvas, ctx) {
        super.init(canvas, ctx);
        console.log(Bus._listeners);
        this._field = new Field(matr, this._ctx);
		this._player = new Player(1, 1, 1, this._ctx); 
		Bus.on('single-field', this.updateGameField.bind(this));
        Bus.on('single-user', this.updateUsers.bind(this));
        Bus.on('single-setBomb', this.updateBombs.bind(this));
        Bus.on('single-bomb-explosion', this.updateBombs.bind(this))
        Bus.on('single-scene-start', this.startLoop.bind(this));
        GameBus.on('single-player-death', this.updateGame.bind(this));
    }

    updateUsers (data) {
        console.log('update');
        this._player.update(this._player.xPos + data.dx, this._player.yPos + data.dy, this._field.bricksInField);
    }

    updateBombs () {
        this._player.plantBomb();
        console.log('in scene', this._player.isAlive);
    }

    updateGame () {
        Bus.off('single-field', this.updateGameField.bind(this));
        Bus.off('single-user', this.updateUsers.bind(this));
        Bus.off('single-setBomb', this.updateBombs.bind(this));
        Bus.off('single-bomb-explosion', this.updateBombs.bind(this))
        Bus.off('single-scene-start', this.startLoop.bind(this));
        Router.open('/');
    }
}