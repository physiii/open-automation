const uuid = require('uuid/v4'),
	crypto = require('crypto'),
	database = require('../database.js'),
	ServicesManager = require('../services/services-manager.js'),
	TAG = '[Device]';

class Device {
	constructor (data) {
		this.id = data.id || uuid();
		this.token = crypto.createHash('sha512').update(this.id).digest('hex'); // TODO: Salt token
		this.location = data.location || data.location_id;

		this.gatewayOn = this.gatewayOn.bind(this);
		this.gatewayEmit = this.gatewayEmit.bind(this);

		this.services = new ServicesManager(data.services, this);

		this.setStatus(data.status || {});
		this.setSettings(data.settings || {});
		this.setInfo(data.info || {});

		if (data.gatewaySocket) {
			this.setGatewaySocket(data.gatewaySocket);
		}
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

	setGatewaySocket (socket) {
		if (socket === this.gatewaySocket) {
			return;
		}

		this.gatewaySocket = socket;
		this.status.connected = true;

		// Update the service drivers with the new socket.
		this.services.setGatewaySocket(this.getGatewaySocketProxy());

		// Send the gateway device the token.
		this.gatewayEmit('token', {token: this.token});

		// Update when the gateway sends new state.
		this.gatewayOn('load', (data, callback) => {
			this.services.updateServices(data.services);
			this.setInfo(data.info);
		});

		// Can't use gatewayOn with socket.io events.
		this.gatewaySocket.on('disconnect', (data) => {
			this.status.connected = false;
		});
	}

	gatewayOn (event, localCallback) {
		if (!this.gatewaySocket) {
			console.log(TAG, this.id, 'Tried to listen to gateway event "' + event + '" but the device does not have a gateway socket.');
			return;
		}

		this.gatewaySocket.on(event, (data, remoteCallback) => {
			if (data.token !== this.token) {
				console.log(TAG, this.id, 'Received event from gateway, but device token does not match.');
				return;
			}

			localCallback(data, remoteCallback);
		});
	}

	gatewayEmit (event, data, callback) {
		if (!this.gatewaySocket) {
			console.log(TAG, this.id, 'Tried to emit gateway event "' + event + '" but the device does not have a gateway socket.');
			return;
		}

		if (!this.status.connected) {
			console.log(TAG, this.id, 'Tried to emit gateway event "' + event + '" but the gateway socket is not connected.');
		}

		this.gatewaySocket.emit(event, data, callback);
	}

	getGatewaySocketProxy () {
		return {
			on: this.gatewayOn,
			emit: this.gatewayEmit
		};
	}

	serialize () {
		return {
			id: this.id,
			location_id: (this.location && this.location.id) || this.location,
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
