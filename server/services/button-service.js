const Service = require('./service.js'),
	GenericButtonDriver = require('./drivers/button-generic.js'),
	TAG = '[LigerServicee]';

class ButtonService extends Service {
	constructor (data, onUpdate, device_socket) {
		super(data, onUpdate);

		this.driver = new GenericButtonDriver(this.id, device_socket)
		this.subscribeToDriver();

	}

	subscribeToDriver () {
		this.driver.on('pressed/center', () => this._emit('pressed/center'));
		this.driver.on('pressed/top-right', () => this._emit('pressed/top-right'));
		this.driver.on('pressed/bottom-right', () => this._emit('pressed/bottom-right'));
		this.driver.on('pressed/bottom-left', () => this._emit('pressed/bottom-left'));
		this.driver.on('pressed/top-left', () => this._emit('pressed/top-left'));
		this.driver.on('pressed/top', () => this._emit('pressed/top'));
		this.driver.on('pressed/right', () => this._emit('pressed/right'));
		this.driver.on('pressed/down', () => this._emit('pressed/down'));
		this.driver.on('pressed/left', () => this._emit('pressed/left'));
	}

}

ButtonService.type = 'button';
ButtonService.friendly_type = 'Button';
ButtonService.indefinite_article = 'A';
ButtonService.event_strings = {};

module.exports = ButtonService;
