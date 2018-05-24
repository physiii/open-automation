const uuid = require('uuid/v4');

class Service {
	constructor (data) {
		this.id = data.id || uuid();
		this.type = data.type;
		this.device = data.device;
		this.settings = {};
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
			device_id: this.device.id
		};
	}
}

module.exports = Service;
