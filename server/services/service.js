const uuid = require('uuid/v4');

class Service {
	constructor (data, onUpdate) {
		this.id = data.id || uuid();
		this.type = data.type;
		this.device = data.device;

		this.onUpdate = onUpdate;

		this.setSettings(data.settings);
		this.setState(data.state);
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
