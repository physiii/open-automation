const uuid = require('uuid/v4'),
	utils = require('../utils.js'),
	database = require('../database.js'),
	ServicesManager = require('../services/services-manager.js'),
	TAG = '[Device]';

class Device {
	constructor (data, onUpdate, gatewaySocket) {
		this.id = data.id || uuid();
		this.token = data.token;
		this.account = data.account;
		this.account_id = data.account_id;
		this.gateway = data.gateway;
		this.gateway_id = data.gateway_id;

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

		this.onUpdate(this);
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

	setToken (token) {
		const current_token = this.token,
			undoTokenChange = (should_save = true) => {
				this.token = current_token;

				if (should_save) {
					this.save();
				}
			};

		return new Promise((resolve, reject) => {
			this.token = token;

			this.save().then(() => {
				this.gatewayEmit('token', {token}, (error) => {
					if (error) {
						undoTokenChange();
						reject(error);

						return;
					}

					resolve(this.token);
				}, true);
			}).catch((error) => {
				undoTokenChange(false);
				reject(error);
			});
		});
	}

	verifyToken (token) {
		return token === this.token;
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

		this.listenToGateway();
	}

	listenToGateway () {
		// Update when the gateway sends new state.
		this.gatewayOn('load', (data, callback = () => {/* no-op */}) => {
			if (!data.device) {
				callback('No device data provided.');

				return;
			}

			if (data.device.services) {
				this.services.updateServices(data.device.services);
			}

			if (data.device.info) {
				this.setInfo(data.info);
			}

			this.onUpdate(this);
			this.save();
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
			console.log(TAG, this.id, 'Tried to listen for gateway event "' + event + '" but the device does not have a gateway socket.');
			return;
		}

		this.gatewaySocket.on(event, localCallback);
	}

	gatewayEmit (event, data, callback, should_queue) {
		if (!this.gatewaySocket) {
			console.log(TAG, this.id, 'Tried to emit gateway event "' + event + '" but the device does not have a gateway socket.');

			if (typeof callback === 'function') {
				callback('connection');
			}

			return;
		}

		if (!this.state.connected && !should_queue) {
			console.log(TAG, this.id, 'Tried to emit gateway event "' + event + '" but the gateway socket is not connected.');

			if (typeof callback === 'function') {
				callback('connection');
			}

			return;
		}

		this.gatewaySocket.emit(event, data, callback);
	}

	getGatewaySocketProxy () {
		return {
			on: this.gatewayOn,
			emit: this.gatewayEmit
		};
	}

	save () {
		return new Promise((resolve, reject) => {
			database.saveDevice(this.dbSerialize()).then(resolve).catch(reject);
		});
	}

	serialize () {
		return {
			id: this.id,
			account_id: this.account_id,
			gateway_id: this.gateway_id,
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
