const Service = require('./service.js'),
	TAG = '[LightService]';

class LightService extends Service {
	action (data) {
		switch (data.property) {
			case 'power':
				if (this.state.power === 'on') {
					return this.lightOff();
				} else {
					return this.lightOn();
				}
			case 'brightness':
				if (data.mode === 'add' && this.state.brightness >= 100) return this.state.brightness = 100;
				if (data.mode === 'add') return this.setBrightness(this.state.brightness + data.value);
				if (data.mode === 'subtract' && this.state.brightness <= 0) return this.state.brightness = 0;
				if (data.mode === 'subtract') return this.setBrightness(this.state.brightness - data.value);
				if (!data.mode && !(data.value < 0) && !(data.value > 100)) return this.setBrightness(data.value);
			case 'color':
				return this.setColor(data.value);
		}
	}

	lightOn () {
		return new Promise((resolve, reject) => {
			this.deviceEmit('lightOn/set', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	lightOff () {
		return new Promise((resolve, reject) => {
			this.deviceEmit('lightOff/set', {}, (error, data) => {
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

module.exports = LightService;
