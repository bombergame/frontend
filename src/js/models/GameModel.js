import { fetchModule } from '../modules/ajax.js';
import { setCookie, getCookie, deleteCookie } from '../utils.js';
import Bus from '../modules/Bus.js';

export default class GameModel {
	static CreateRoom () {
		const data = {
			allow_anonymous: true,
			field_size : {
				height: 21,
				width: 21
			},
			max_num_players: 4,
			time_limit: 5,
			title: "bbb"
		}
		const authToken = 'qwerqwer';
		const gameHeaders = {
			'Authorization': 'Bearer ' + authToken
		};
		return fetchModule.doPost({ path: '/multiplayer/rooms', body: data, headers: gameHeaders })
			.then(response => {
				if (response.status === 200) {
					return response.json();
				}
				return Promise.reject(new Error('unsuccess room create'));
			})

			.then((data) => {
				Bus.emit('done-create-room', data);
			})
			.catch((err) => {
				console.log('игра не получилась(', err);
			});
	}
}
