const Service = require('./service.js'),
	TAG = '[ButtonService]';

class ButtonService extends Service {
	constructor (data, onUpdate, deviceOn, deviceEmit) {
		super(data, onUpdate, deviceOn, deviceEmit);

		this._subscribeToDevice();
	}

	_subscribeToDevice () {
		this.deviceOn('pressed', () => this._emit('pressed'));
	}
}

ButtonService.type = 'button';
ButtonService.friendly_type = 'Button';
ButtonService.indefinite_article = 'A';

module.exports = ButtonService;
