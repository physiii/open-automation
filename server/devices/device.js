const uuid = require('uuid/v4'),
	utils = require('../utils.js'),
	database = require('../database.js'),
	ServicesManager = require('../services/services-manager.js'),
	noOp = () => {},
	TAG = '[Device]';

class Device {
	constructor (data, onUpdate, gateway_socket) {
		this.id = data.id || uuid();
		this.token = data.token;
		this.account = data.account;
		this.account_id = data.account_id;
		this.gateway = data.gateway;
		this.gateway_id = data.gateway_id;
		this.gateway_listeners = [];

		this.onUpdate = onUpdate;
		this.services = new ServicesManager(data.services, this._getGatewaySocketProxy(), this, () => this.onUpdate(this));

		this._setSettings(data.settings);
		this._setInfo(data.info);
		this.state = utils.onChange({connected: false}, () => this.onUpdate(this));

		if (gateway_socket) {
			this.setGatewaySocket(gateway_socket, this.token);
		}

		this.onUpdate(this);
	}

	_setSettings (settings = {}) {
		this.settings = {
			name: settings.name
		};
	}

	_setInfo (info = {}) {
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
				this._gatewayEmit('token', {token}, (error) => {
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
		if (!token || !this.verifyToken(token)) {
			console.log(TAG, this.id, 'Could not set gateway socket. Invalid device token.');
			return;
		}

		if (socket === this.gateway_socket) {
			return;
		}

		// Disconnect the current socket.
		if (this.gateway_socket) {
			this.gateway_socket.removeAllListeners();
			this.gateway_socket.disconnect();
		}

		this.gateway_socket = socket;
		this.state.connected = socket.connected;

		// Set up gateway listeners on new socket.
		this.gateway_listeners.forEach((listener) => {
			this._gatewayOn.apply(this, listener);
		});

		this._listenToGateway();
	}

	_listenToGateway () {
		// Update when the gateway sends new state.
		this._gatewayOn('load', (data, callback = noOp) => {
			if (!data.device) {
				callback('No device data provided.');

				return;
			}

			if (data.device.services) {
				this.services.updateServices(data.device.services);
			}

			if (data.device.info) {
				this._setInfo(data.info);
			}

			this.onUpdate(this);
			this.save();
		});

		this._gatewayOn('connect', (data) => this.state.connected = true);
		this._gatewayOn('disconnect', (data) => this.state.connected = false);
	}

	_gatewayOn (event) {
		if (!this.gateway_socket) {
			console.log(TAG, this.id, 'Tried to listen for gateway event "' + event + '" but the device does not have a gateway socket.');
			return;
		}

		this.gateway_socket.on.apply(this.gateway_socket, arguments);
	}

	_gatewayEmit (event, data, callback = noOp, should_queue) {
		if (!this.gateway_socket) {
			console.log(TAG, this.id, 'Tried to emit gateway event "' + event + '" but the device does not have a gateway socket.');
			callback('Device not connected');
			return;
		}

		if (!this.state.connected && !should_queue) {
			console.log(TAG, this.id, 'Tried to emit gateway event "' + event + '" but the gateway socket is not connected.');

			callback('Device not connected');
			return;
		}

		this.gateway_socket.emit(event, data, callback);
	}

	_getGatewaySocketProxy () {
		return {
			on: (function () {
				this.gateway_listeners.push(arguments);

				if (this.gateway_socket) {
					this._gatewayOn.apply(this, arguments);
				}
			}).bind(this),
			emit: this._gatewayEmit.bind(this)
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
