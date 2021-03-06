import NavigationController from '../controllers/NavigationController.js';
import LeaderboardController from '../controllers/LeaderboardController.js';
import BaseView from './BaseView.js';
import Bus from '../modules/Bus.js';
import LeaderboardModel from '../models/LeaderboardModel.js';
import { authMenuHeader, notAuthMenuHeader } from '../views/dataTemplates/headerMenuData.js';

const leaderboardTmpl = require('./templates/leaderboard.pug');
const preloadTmpl = require('./templates/preload.pug');

/**
 * View of the "Leaderboard" page
 * @class LeaderboardView
 * @extends BaseView
 */
export default class LeaderboardView extends BaseView {
	/**
     * Creates view and registres view events
     */
	constructor () {
		super(leaderboardTmpl);
		this._leaderboardModel = new LeaderboardModel(); // handle events
		this._leaderboardController = new LeaderboardController();
		this._navigationController = new NavigationController();
		this._currentUser = null;

		this.preload();
	}

	_setCurrentUser (user) {
		this._currentUser = user;
	}

	/**
		 * Emits load event and shows view
		 *
		 */
	show () {
		Bus.on('done-get-user', { callbackName: 'LeaderboardView._setCurrentUser', callback: this._setCurrentUser.bind(this) });
		Bus.on('done-leaderboard-fetch', { callbackName: 'LeaderboardView.render', callback: this.render.bind(this) });

		Bus.emit('get-user');
		super.show();
		Bus.emit('leaderboard-load');
	}

	/**
     * Resets page number to 1
     *
     */
	hide () {
		Bus.emit('leaderboard-set-page', 1);
		super.hide();
		Bus.off('done-get-user', 'LeaderboardView._setCurrentUser');
		Bus.off('done-leaderboard-fetch', 'LeaderboardView.render');
	}

	/**
     * Render loading page
     *
     */
	preload () {
		const data = {
			headerValues: notAuthMenuHeader(),
			title: 'Таблица лидеров'
		};
		this.viewDiv.innerHTML = '';
		this.viewDiv.innerHTML = preloadTmpl(data);
	}

	/**
     * Render list of users
     * @param {Array} users List of users on this page
     */
	render (users) {
		if (this._currentUser.is_authenticated) {
			const data = {
				headerValues: authMenuHeader(this._currentUser.id),
				title: 'Таблица лидеров',
				usrs: users
			};
			super.render(data);
		} else {
			const data = {
				headerValues: notAuthMenuHeader(),
				title: 'Таблица лидеров',
				usrs: users
			};
			super.render(data);
		}
		this.registerActions();
	}

	/**
     * Register events for NavigationController and LeaderboardController to handle
     *
     */
	registerActions () {
		document.getElementById('prev_page_link')
			.addEventListener('click', this._leaderboardController.paginationPrevCallback.bind(this._leaderboardController));
		document.getElementById('next_page_link')
			.addEventListener('click', this._leaderboardController.paginationNextCallback.bind(this._leaderboardController));

		this.viewDiv.addEventListener('click', this._navigationController.keyPressedCallback.bind(this._navigationController));
	}
}
