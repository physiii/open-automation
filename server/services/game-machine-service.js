const Service = require('./service.js');

class GameMachineService extends Service {
	addCredit (dollar_value) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('credit/add', {dollar_value}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}
}

GameMachineService.type = 'game-machine';
GameMachineService.friendly_type = 'Game Machine';
GameMachineService.indefinite_article = 'A';

module.exports = GameMachineService;
