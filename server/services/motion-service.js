const Service = require('./service.js'),
	TAG = '[MotionService]';

class MotionService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('state', (event_data) => {
			console.log("setting motion state:",event_data);
			let trigger_data = { state: { value: null } };
			// TODO: validate this value before passing it through
			this._emit(event_data.state.value,event_data);
		});
	}
}

MotionService.type = 'motion';
MotionService.friendly_type = 'Motion';
MotionService.indefinite_article = 'A';

module.exports = MotionService;
