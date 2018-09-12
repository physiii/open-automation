const Service = require('./service.js'),
	TAG = '[ContactSensorService]';

class ContactSensorService extends Service {
	constructor (data, onUpdate, deviceOn, deviceEmit) {
		super(data, onUpdate, deviceOn, deviceEmit);

		this._subscribeToDevice();
	}

	_subscribeToDevice () {
		this.deviceOn('open', () => this._emit('open'));
		this.deviceOn('closed', () => this._emit('closed'));
	}
}

ContactSensorService.type = 'contact-sensor';
ContactSensorService.friendly_type = 'Contact Sensor';
ContactSensorService.indefinite_article = 'A';

module.exports = ContactSensorService;
