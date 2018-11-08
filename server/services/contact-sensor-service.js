const Service = require('./service.js'),
	TAG = '[ContactSensorService]';

class ContactSensorService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('open', () => {
			if (this.is_armed) this._emit('open');
		});
	}
}

ContactSensorService.type = 'contact-sensor';
ContactSensorService.friendly_type = 'Contact Sensor';
ContactSensorService.indefinite_article = 'A';
ContactSensorService.is_armable = true;

module.exports = ContactSensorService;
