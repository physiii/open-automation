const Service = require('./service.js'),
	TAG = '[GlobalAlarmService]';

class GlobalAlarmService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.events.on('mode', (event_data) => {
			let trigger_data = { state: { value: null } };

			console.log(TAG, 'mode', event_data);

			if (event_data.value > 0) {
				trigger_data.state.value = 'arm';
			} else {
				trigger_data.state.value = 'disarm';
			}

			// TODO: validate this value before passing it through
			this._emit(trigger_data.state.value, trigger_data);

			console.log(TAG, event_data, trigger_data);
		});
	}
}

GlobalAlarmService.type = 'global-alarm';
GlobalAlarmService.friendly_type = 'Global Alarm';
GlobalAlarmService.indefinite_article = 'A';

module.exports = GlobalAlarmService;
