const Service = require('./service.js'),
	TAG = '[SirenService]';

class SirenService extends Service {
	setSiren (trigger) {
		return new Promise((resolve, reject) => {
			if (trigger) {
				this.deviceEmit('siren', {chirp:2});
			}

			resolve();
		});
	}

	on () {
		return new Promise((resolve, reject) => {
			this.deviceEmit('sirenOn/set', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}
	off () {
		return new Promise((resolve, reject) => {
			this.deviceEmit('sirenOff/set', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}
}

SirenService.type = 'siren';
SirenService.friendly_type = 'Siren';
SirenService.indefinite_article = 'A';
SirenService.state_definitions = new Map()
	.set('trigger', {
		type: 'boolean',
		setter: 'setSiren'
	});

module.exports = SirenService;
