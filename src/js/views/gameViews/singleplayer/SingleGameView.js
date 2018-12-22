import BaseView from '../../BaseView.js';
import Bus from '../../../modules/Bus.js';
import NavigationController from '../../../controllers/NavigationController.js';
import { authMenuHeader, notAuthMenuHeader } from '../../dataTemplates/headerMenuData.js';
import SingleScene from '../../../game/singleplayer/SingleScene.js';

const canvasTmpl = require('../../templates/gameTemplates/canvas.pug');
const preloadTmpl = require('../../templates/preload.pug');
const data = {};

data.helpValues = [
	{
		label: 'Попробовать снова',
		href: '/single'
	},
	{
		label: 'В главное меню',
		href: '/'
	}
];

data.resultLose = 'Вы проиграли';
data.resultWin = 'Вы победили';

export default class SingleGameView extends BaseView {
	constructor () {
		super(canvasTmpl);
		this._navigationController = new NavigationController();
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
		Bus.on('done-get-user', { callbackName: 'SingleGameView.render', callback: this.render.bind(this) });
		Bus.emit('get-user');
		super.show();
		this.registerActions();
		this._scene = new SingleScene();
	}

	render (user) {
		if (!user.is_authenticated) {
			data.headerValues = notAuthMenuHeader();
			super.render(data);
		} else {
			data.headerValues = authMenuHeader(user.id);
			super.render(data);
		}
		this._scene.init();
		this._scene.singlePlayerLoop();
	}

	hide () {
		this.hideLoseInfo();
		this.hideWinInfo();
		super.hide();
		this._scene.loop = false; // останавливаем requestAnimationFrame
		this._scene = null;
		Bus.off('done-get-user', 'SingleGameView.render');
	}

	hideLoseInfo () {
		document.getElementById('dropdown-game-info-lose').style.width = '0%';
	};

	hideWinInfo () {
		document.getElementById('dropdown-game-info-win').style.width = '0%';
	};

	registerActions () {
		this.viewDiv.addEventListener('click', this._navigationController.keyPressedCallback);
	}
}
