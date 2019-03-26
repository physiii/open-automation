const Service = require('./service.js'),
	TAG = '[ButtonService]';

class ButtonService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('pressed', (event_data) => this._emit('pressed', event_data));
		this.deviceOn('state', (event_data) => {
			// TODO: validate this value before passing it through
			this._emit(event_data.state.value, event_data);
		});

	}
}

ButtonService.type = 'button';
ButtonService.friendly_type = 'Button';
ButtonService.indefinite_article = 'A';

module.exports = ButtonService;
