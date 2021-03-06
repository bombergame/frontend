import BaseView from '../../BaseView.js';
import Bus from '../../../modules/Bus.js';
import Socket from '../../../modules/Socket.js';
import NavigationController from '../../../controllers/NavigationController.js';
import MultiPlayerScene from '../../../game/multiplayer/MultiPlayerScene.js';
import { makeNumberMatrix } from '../../../game/GameUtils.ts';
import { authMenuHeader, notAuthMenuHeader } from '../../dataTemplates/headerMenuData.js';
import Router from '../../../modules/Router.js';

const roomTmpl = require('../../templates/gameTemplates/room.pug');
const canvasTmpl = require('../../templates/gameTemplates/canvas.pug');
const preloadTmpl = require('../../templates/preload.pug');


const inGameRenderData = {};

inGameRenderData.helpValues = [
	{
		label: 'В главное меню',
		href: '/'
	}
];

inGameRenderData.resultLose = 'Вы проиграли';
inGameRenderData.resultWin = 'Вы победили';

export default class RoomView extends BaseView {
	constructor () {
		super(roomTmpl);
		this._currentUser = {is_authenticated : false};
		this._me = null;
		this._meLocked = false;
		this._currentRoomId = null;
		this._connection = new Socket();
		this._navigationController = new NavigationController();

		Bus.on('done-get-target-room', { callbackName: 'RoomView._setCurrentRoomId', callback: this._setCurrentRoomId.bind(this) });

		Bus.on('multiplayer-room-pending', { callbackName: 'RoomView.render', callback: this.render.bind(this) });
		Bus.on('multiplayer-room-pending', { callbackName: 'RoomView._setInitialFieldMatrix', callback: this._setInitialFieldMatrix.bind(this) });
		Bus.on('multiplayer-room-pending', { callbackName: 'RoomView._setPlayersId', callback: this._setPlayersId.bind(this) });
		Bus.on('multiplayer-room-pending', { callbackName: 'RoomView._setMyId', callback: this._setMyId.bind(this) });
		Bus.on('multiplayer-room-on', { callbackName: 'RoomView.renderGame', callback: this.renderGame.bind(this) });
		Bus.on('multiplayer-room-off', { callbackName: 'RoomView.openMenu', callback: this.openMenu.bind(this) });
	}

	_setCurrentUser (user) {
		this._currentUser = user;
	}

	_setCurrentRoomId (id) {
		this._currentRoomId = id;
	}

	// инициализируем матрицу заданного размера кубиками grassBrick до начала игры
	_setInitialFieldMatrix (data) {
		const matrix = makeNumberMatrix(data.field_size.height, data.field_size.width);
		MultiPlayerScene.initNumberMatrix(matrix);
	}

	_setMyId (data) {
		MultiPlayerScene.setMyId(data.players[data.players.length - 1]);
	}

	// каждый раз когда в комнату заходит игрок, обновляем массив игроков для будущей сцены
	// массив игроков да начала игры является массивом id каждого игрока
	_setPlayersId (data) {
		MultiPlayerScene.setPlayersId(data.players);
	}

	preload () {
		const data = {
			headerValues: notAuthMenuHeader(),
		};
		this.viewDiv.innerHTML = '';
		this.viewDiv.innerHTML = preloadTmpl(data);
	}

	show () {
		this.preload();
		Bus.on('done-get-user', { callbackName: 'RoomView._setCurrentUser', callback: this._setCurrentUser.bind(this) });
		Bus.emit('get-user');
		Bus.emit('get-target-room');
		this._connection.setRoomId(this._currentRoomId);
		this._connection.connectionOpen();

		super.show();
	}

	render (data) {
		this._template = roomTmpl;
		// нужно, чтобы выделить текущего пользователя
		if (!this._meLocked) {
			this._me = data.players[data.players.length - 1];
			this._meLocked = true;
		}

		const renderData = {
			players: data.players,
			me: this._me
		};

		if (!this._currentUser.is_authenticated) {
			renderData.headerValues = notAuthMenuHeader();
			renderData.headerValues.push({
				label: 'Завершить игру',
				href: 'javascript:void(0)',
				id: 'stop-game'
			});
			super.render(renderData);
		} else {
			renderData.headerValues = authMenuHeader(this._currentUser.id);
			renderData.headerValues.push({
				label: 'Завершить игру',
				href: 'javascript:void(0)',
				id: 'stop-game'
			});
			super.render(renderData);
		}
		this.registerActions();
	}

	renderGame () {
		this._template = canvasTmpl;
		if (!this._currentUser.is_authenticated) {
			inGameRenderData.headerValues = notAuthMenuHeader();
			inGameRenderData.headerValues.push({
				label: 'Завершить игру',
				href: 'javascript:void(0)',
				id: 'stop-game'
			});
			super.render(inGameRenderData);
		} else {
			inGameRenderData.headerValues = authMenuHeader(this._currentUser.id);
			inGameRenderData.headerValues.push({
				label: 'Завершить игру',
				href: 'javascript:void(0)',
				id: 'stop-game'
			});
			super.render(inGameRenderData);
		}

		MultiPlayerScene.init();
		MultiPlayerScene.multiPlayerLoop();
	}

	openMenu () {
		Router.open('/');
	}

	hide () {
		super.hide();
		Bus.off('done-get-user', 'RoomView._setCurrentUser');
		MultiPlayerScene.stopLoop();
		this._connection.connectionClosed();
		console.log('connection closed');
	}

	hideLoseInfo () {
		document.getElementById('dropdown-game-info-lose').style.width = '0%';
	};

	hideWinInfo () {
		document.getElementById('dropdown-game-info-win').style.width = '0%';
	};

	registerActions () {
		const startButton = document.getElementById('start-game');
		startButton.addEventListener('click', () => {
			this._connection.startGame();
		});

		const stopButton = document.getElementById('stop-game');
		stopButton.addEventListener('click', () => {
			this._connection.stopGame();
		});
	}
}
