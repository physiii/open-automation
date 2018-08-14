const Service = require('./service.js'),
	TAG = '[LightService]';

class LightService extends Service {
	setPower (power) {
		return new Promise((resolve, reject) => {
			this.deviceEmit(power ? 'lightOn/set' : 'lightOff/set', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	setBrightness (brightness) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('brightness/set', {brightness}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	setColor (color) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('color/set', {color}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}
}

LightService.type = 'light';
LightService.friendly_type = 'Light';
LightService.indefinite_article = 'A';
LightService.state_definitions = {
	power: {
		type: 'boolean',
		setter: 'setPower'
	},
	brightness: {
		type: 'percentage',
		setter: 'setBrightness'
	},
	color: {
		type: 'color',
		setter: 'setColor'
	}
};

module.exports = LightService;
