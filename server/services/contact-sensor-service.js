const Service = require('./service.js'),
	TAG = '[ContactSensorService]';

class ContactSensorService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('open', () => {
			if (this.is_armed) {
				this._emit('open/armed');
			} else if(!this.is_armed) {
				this._emit('open/disarmed');
			} else {
				console.log(TAG, 'Invalid arming state.');
			}

			this.deviceOn('closed', () => {
				if (this.is_armed) {
					this._emit('closed/armed');
				} else if(!this.is_armed) {
					this._emit('closed/disarmed');
				} else {
					console.log(TAG, 'Invalid arming state.');
				}
		});
	}
}

ContactSensorService.type = 'contact-sensor';
ContactSensorService.friendly_type = 'Contact Sensor';
ContactSensorService.indefinite_article = 'A';
ContactSensorService.is_armable = true;

module.exports = ContactSensorService;
