const uuid = require('uuid/v4'),
	EventEmitter2 = require('eventemitter2').EventEmitter2;

class Service {
	constructor (data, onUpdate) {
		this.id = data.id || uuid();
		this.type = data.type;
		this.device = data.device;
		this.events = new EventEmitter2({wildcard: true, newListener: false, maxListeners: 0});
		this.onUpdate = onUpdate;

		this.setSettings(data.settings);
		this.setState(data.state);
	}

	on (event, listener) {
		this.events.on(event, listener);
	}

	off (event, listener) {
		if (listener) {
			this.events.off(event, listener);
		} else {
			this.events.removeAllListeners(event);
		}
	}

	setSettings (settings = {}) {
		this.settings = {...settings};
	}

	setState (state = {}) {
		this.state = {...state};

		this.onUpdate();
	}

	serialize () {
		return {
			id: this.id,
			type: this.type,
			settings: this.settings
		};
	}

	dbSerialize () {
		return this.serialize();
	}

	clientSerialize () {
		return {
			...this.serialize(),
			device_id: this.device.id,
			state: this.state
		};
	}
}

module.exports = Service;
