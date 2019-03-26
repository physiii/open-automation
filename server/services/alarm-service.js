const Service = require('./service.js');

class AlarmService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('state', (event_data) => {
			// TODO: validate this value before passing it through
			this._emit(event_data.state.value, event_data);
		});
	}
}

AlarmService.type = 'alarm';
AlarmService.friendly_type = 'Alarm';
AlarmService.indefinite_article = 'A';

module.exports = AlarmService;
