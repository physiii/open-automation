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
			let button_pressed = BUTTON_NAMES[data.value]

			if (data.event_type === 'dpad') {
				this._emit('pressed/dpad/' + button_pressed);
			};

			if (data.event_type === 'switch') {
				if (button_pressed === 'left' || button_pressed === 'right') {
					return this.fadeInterval = setInterval(() => this._emit('pressed/switch/' + button_pressed), 1000);
				}

				if (button_pressed === 'release') {
					return clearInterval(this.fadeInterval);
				}

				this._emit('pressed/switch/' + button_pressed)

			}

		});
	}

}

ButtonService.type = 'button';
ButtonService.friendly_type = 'Button';
ButtonService.indefinite_article = 'A';

module.exports = LigerService;
