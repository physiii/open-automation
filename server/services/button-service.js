const Service = require('./service.js'),
	TAG = '[ButtonService]';

class ButtonService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('pressed', (event_data) => this._emit('pressed', event_data));
	}
}

ButtonService.type = 'button';
ButtonService.friendly_type = 'Button';
ButtonService.indefinite_article = 'A';

module.exports = ButtonService;
