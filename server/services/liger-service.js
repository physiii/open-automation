const Service = require('./service.js'),
	BUTTON_NAMES = {
		0: 'release',
		1: 'center',
		2: 'top-right',
		3: 'bottom-right',
		4: 'bottom-left',
		5: 'top-left',
		6: 'top',
		7: 'right',
		8: 'down',
		9: 'left',
		10: 'switch'
	},
	TAG = '[LigerServicee]';

class LigerService extends Service {
	constructor (data, onUpdate, deviceOn, deviceEmit) {
		super(data, onUpdate, deviceOn, deviceEmit);

		this.subscribeToDevice();

	}

	subscribeToDevice () {
		this.deviceOn('pressed', (data) => {
			let button_pressed = BUTTON_NAMES[data.value];

			if (!this.fadeInterval && button_pressed === 'up' || button_pressed === 'down') {
				return this.fadeInterval = setInterval(() => this._emit('pressed/' + button_pressed), 1000);
			}

			if (this.fadeInterval) {
				clearInterval(this.fadeInterval);

				if (button_pressed === 'up' || button_pressed === 'down') {
					return this.fadeInterval = setInterval(() => this._emit('pressed/' + button_pressed), 1000);
				}

				return this._emit('pressed/' + button_pressed);
			}

			return this._emit('pressed/' + button_pressed);

		});
	}

}

ButtonService.type = 'liger';
ButtonService.friendly_type = 'Liger';
ButtonService.indefinite_article = 'A';

module.exports = LigerService;
