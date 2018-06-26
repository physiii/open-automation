const uuid = require('uuid/v4'),
	crypto = require('crypto'),
	utils = require('../utils.js'),
	database = require('../database.js'),
	ServicesManager = require('../services/services-manager.js'),
	TAG = '[Device]';

class Device {
	constructor (data, onUpdate, gatewaySocket) {
		this.id = data.id || uuid();
		this.token = data.token;
		this.location = data.location || data.location_id;

		this.onUpdate = onUpdate;
		this.gatewayOn = this.gatewayOn.bind(this);
		this.gatewayEmit = this.gatewayEmit.bind(this);

		this.services = new ServicesManager(data.services, this, () => this.onUpdate(this));

		this.setState(data.state);
		this.setSettings(data.settings);
		this.setInfo(data.info);

		if (gatewaySocket) {
			this.setGatewaySocket(gatewaySocket, this.token);
		}
	}

	setState (state = {}) {
		this.state = utils.onChange({
			connected: state.connected || false
		}, () => this.onUpdate(this));
	}

	setSettings (settings = {}) {
		this.settings = {
			name: settings.name
		};
	}

	setInfo (info = {}) {
		this.info = {
			manufacturer: info.manufacturer
		};
	}

	setGatewaySocket (socket, token) {
		if (socket === this.gatewaySocket) {
			return;
		}

		if (!token || !this.verifyToken(token)) {
			console.log(TAG, this.id, 'Could not set gateway socket. Invalid device token.');
			return;
		}

		this.gatewaySocket = socket;
		this.state.connected = socket.connected;

		// Update the service drivers with the new socket.
		this.services.setGatewaySocket(this.getGatewaySocketProxy());

		// Update when the gateway sends new state.
		this.gatewayOn('load', (data, callback) => {
			if (!data.device) {
				return;
			}

			if (data.device.services) {
				this.services.updateServices(data.device.services);
			}

			if (data.device.info) {
				this.setInfo(data.info);
			}
		});

		// Can't use gatewayOn with socket.io events.
		this.gatewaySocket.on('connect', (data) => {
			this.state.connected = true;
		});
		this.gatewaySocket.on('disconnect', (data) => {
			this.state.connected = false;
		});
	}

	gatewayOn (event, localCallback) {
		if (!this.gatewaySocket) {
			console.log(TAG, this.id, 'Tried to listen to gateway event "' + event + '" but the device does not have a gateway socket.');
			return;
		}

		this.gatewaySocket.on(event, localCallback);
	}

	gatewayEmit (event, data, callback) {
		if (!this.gatewaySocket) {
			console.log(TAG, this.id, 'Tried to emit gateway event "' + event + '" but the device does not have a gateway socket.');
			return;
		}

		if (!this.state.connected) {
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

	verifyToken (token) {
		return token === this.token;
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
			token: this.token,
			services: this.services.getDbSerializedServices()
		};
	}

	clientSerialize () {
		return {
			...this.serialize(),
			state: this.state,
			services: this.services.getClientSerializedServices()
		};
	}
}

module.exports = Device;
