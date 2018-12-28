import '../../../styles/css/main/main.css';
import '../../../styles/css/header/header.css';
import '../../../styles/css/header/game-menu/game-menu.css';
import '../../../styles/css/dropdown/dropdown.css';
import '../../../styles/css/grid/grid.css';
import '../../../styles/css/menu/menu.css';
import '../../../styles/css/fonts/Rubik/rubik.css';
import '../../../styles/css/input/input.css';
import '../../../styles/css/input/slider.css';
import '../../../styles/css/game/canvas/canvas.css';
import '../../../styles/css/game/menu/menu.css';

export default class BaseView {
	constructor (template) {
		this._template = template;

		this.viewDiv = document.createElement('div');
		BaseView.rootToRender.appendChild(this.viewDiv);
		this._isHidden = true;
	}

	static get rootToRender () {
		return document.getElementById('root');
	}

	show () {
		this._isHidden = false;
		BaseView.rootToRender.appendChild(this.viewDiv);
	}

	hide () {
		this._isHidden = true;
		document.getElementById('root').innerHTML = '';
	}

	render (context) {
		this.viewDiv.innerHTML = '';
		const main = document.createElement('main');
		main.innerHTML = this._template(context);
		this.viewDiv.appendChild(main);
	}
}