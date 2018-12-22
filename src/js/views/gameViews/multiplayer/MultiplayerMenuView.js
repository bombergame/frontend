import BaseView from '../../BaseView.js';
import Bus from '../../../modules/Bus.js';
import NavigationController from '../../../controllers/NavigationController.js';
import { authMenuHeader, notAuthMenuHeader } from '../../dataTemplates/headerMenuData.js';
import Router from '../../../modules/Router.js';
const multiplayerMenuTmpl = require('../../templates/gameTemplates/multiplayerMenu.pug');
const showRoomLinkTmpl = require('../../templates/gameTemplates/showRoomLink.pug');

const data = {};

export default class MultiplayerMenuView extends BaseView {
	constructor () {
		super(multiplayerMenuTmpl);
		this._currentUser = null;
		this._registeredActions = false;
		this._navigationController = new NavigationController();
	}


	show () {
		Bus.on('done-create-room', { callbackName : 'MultiplayerMenuView.showLink', callback : this.showLink.bind(this)});
		Bus.on('done-get-user', { callbackName: 'MultiplayerMenuView.render', callback: this.render.bind(this) });
		Bus.emit('get-user');
		super.show();
	}

	render (user) {
		this._currentUser = user;
		if (!user.is_authenticated) {
			data.headerValues = notAuthMenuHeader();
			super.render(data);
		} else {
			data.headerValues = authMenuHeader(user.id);
			super.render(data);
		}
		this.registerActions();
	}


	showLink (roomData) {
		this._template = showRoomLinkTmpl;
		const data = {
			linkHref: `/room/${roomData.id}`,
			roomNumber: roomData.id
		};
		if (!this._currentUser.is_authenticated) {
			data.headerValues = notAuthMenuHeader();
			super.render(data);
		} else {
			data.headerValues = authMenuHeader(this._currentUser.id);
			super.render(data);
		}
	}

	hide () {
		super.hide();
		Bus.off('done-create-room', 'MultiplayerMenuView.showLink');
		Bus.off('done-get-user', 'MultiplayerMenuView.render');
	}

	registerActions () {
		if (!this._registeredActions) {
			this.viewDiv.addEventListener('click', this._navigationController.keyPressedCallback);
			
			const createRoom = document.getElementById('createRoom');
			createRoom.addEventListener('click', () => {
				Bus.emit('submit-data-createroom');
			})

			const id = document.getElementById('room-number-id');
			const roomId = document.getElementById('roomConnect');
			roomId.addEventListener('click', () => {
				if (id.value !== "") {
					Router.open(`/room/${id.value}`);

				}
			})
			this._registeredActions = true;
		}
	}
}
