const uuid = require('uuid/v4'),
	database = require('../database.js'),
	ServicesManager = require('../services/services-manager.js');

class Device {
	constructor (data) {
		this.id = data.id || uuid();
		this.location = data.location;
		this.services = new ServicesManager(data.services, this);
		this.setStatus(data.status || {});
		this.setSettings(data.settings || {});
		this.setInfo(data.info || {});
	}

	setStatus (status) {
		this.status = {
			connected: status.connected || false
		};
	}

	setSettings (settings) {
		this.settings = {
			name:  settings.name
		};
	}

	setInfo (info) {
		this.info = {
			manufacturer: info.manufacturer
		};
	}

	setSocket (socket, token) {
		this.token = token;
		this.socket = socket;
		this.status.connected = true;

		this.services.setSocket(this.socket);

		this.socket.on('load', (data, callback) => {
			// Update services.
			this.services.updateServices(data.services);

			// Update device info.
			this.setInfo(data.info);
		});

		this.socket.on('disconnect', (data) => {
			delete this.socket;
			this.status.connected = false;
		});
	}

	serialize () {
		return {
			id: this.id,
			location: this.location,
			settings: this.settings,
			services: this.services.getSerializedServices(),
			info: this.info
		};
	}

	dbSerialize () {
		return {
			...this.serialize(),
			services: this.services.getDbSerializedServices()
		};
	}

	clientSerialize () {
		return {
			...this.serialize(),
			services: this.services.getClientSerializedServices()
		};
	}
}

module.exports = Device;
