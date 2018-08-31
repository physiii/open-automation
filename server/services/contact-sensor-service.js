const Service = require('./service.js'),
	TAG = '[ContactSensorService]';

class ContactSensorService extends Service {
	constructor (data, onUpdate, deviceOn, deviceEmit) {
		super(data, onUpdate, deviceOn, deviceEmit);

		this._subscribeToDevice();
	}

	_subscribeToDevice () {
		this.deviceOn('state', () => {
			if (this.state.contact === 1) this._emit('open', {});
		});

	}
}

ContactSensorService.type = 'contact_sensor';
ContactSensorService.friendly_type = 'Contact Sensor';
ContactSensorService.indefinite_article = 'A';

module.exports = ContactSensorService;
