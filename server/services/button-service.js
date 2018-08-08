const Service = require('./service.js'),
	GenericButtonDriver = require('./drivers/button-generic.js'),
	TAG = '[LigerServicee]';

class ButtonService extends Service {
	constructor (data, onUpdate, device_socket) {
		super(data, onUpdate);

		this.driver = new GenericButtonDriver(this.id, device_socket)
		this.subscribeToDriver();

	}

	subscribeToDriver () {}

	setSettings (settings = {}) {}

}

ButtonService.type = 'button';
ButtonService.friendly_type = 'Button';
ButtonService.indefinite_article = 'A';
ButtonService.event_strings = {};

module.exports = ButtonService;
