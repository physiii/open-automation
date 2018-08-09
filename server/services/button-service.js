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
		9: 'left'
	},
	TAG = '[LigerServicee]';

class ButtonService extends Service {
	constructor (data, onUpdate, deviceOn, deviceEmit) {
		super(data, onUpdate, deviceOn, deviceEmit);

		this.subscribeToDevice();

	}

	subscribeToDevice () {
		this.deviceOn('pressed', (data) => this._emit('pressed/' + BUTTON_NAMES[data.value]));
	}

}

ButtonService.type = 'button';
ButtonService.friendly_type = 'Button';
ButtonService.indefinite_article = 'A';

module.exports = ButtonService;
