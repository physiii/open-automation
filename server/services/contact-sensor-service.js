const Service = require('./service.js'),
	TAG = '[ContactSensorService]';

class ContactSensorService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('open', () => this._emit('open'));
		this.deviceOn('closed', () => this._emit('closed'));

	}
}

ContactSensorService.type = 'contact-sensor';
ContactSensorService.friendly_type = 'Contact Sensor';
ContactSensorService.indefinite_article = 'A';
ContactSensorService.is_armable = true;

module.exports = ContactSensorService;
