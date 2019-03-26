const Service = require('./service.js');

class MotionService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('state', (event_data) => {
			// TODO: validate this value before passing it through
			this._emit(event_data.state.value, event_data);
		});
	}
}

MotionService.type = 'motion';
MotionService.friendly_type = 'Motion';
MotionService.indefinite_article = 'A';

module.exports = MotionService;
