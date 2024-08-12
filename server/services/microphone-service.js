const Service = require('./service.js');

class MicrophoneService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('state', (event_data) => {
			// TODO: validate this value before passing it through
			this._emit(event_data.state.value, event_data);
		});
	}
}

MicrophoneService.type = 'microphone';
MicrophoneService.friendly_type = 'Microphone';
MicrophoneService.indefinite_article = 'A';

module.exports = MicrophoneService;
