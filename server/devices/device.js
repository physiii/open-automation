const uuid = require('uuid/v4'),
	utils = require('../utils.js'),
	database = require('../database.js'),
	ServicesManager = require('../services/services-manager.js'),
	noOp = () => {},
	TAG = '[Device]';

class Device {
	constructor (data, onUpdate, socket) {
		this.id = data.id || uuid();
		this.token = data.token;
		this.account = data.account;
		this.account_id = data.account_id;
		this.gateway = data.gateway;
		this.gateway_id = data.gateway_id;
		this.socket_listeners = [];

		this.onUpdate = onUpdate;
		this.services = new ServicesManager(this, data.services, this._getSocketProxy(), () => this.onUpdate(this));

		this._setSettings(data.settings);
		this._setInfo(data.info);
		this.state = utils.onChange({connected: false}, () => this.onUpdate(this));

		if (socket) {
			this.setSocket(socket, this.token);
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
		return new Promise((resolve, reject) => {
			const current_token = this.token;

			if (!this.socket || !this.socket.connected) {
				console.log(TAG, this.id, 'Cannot set device token without a connected socket.');
				reject('Socket not connected.');

				return;
			}

			// Send new token to device.
			this._socketEmit('token', {token}, (error) => {
				if (error) {
					reject(error);
					return;
				}

				// Save the new token locally.
				this.token = token;
				this.save().then(() => {
					resolve(this.token);
				}).catch((error) => {
					// Undo token change locally.
					this.token = current_token;

					// Undo token change on device.
					this._socketEmit('token', {token: current_token}, (undo_error) => {
						console.error(TAG, this.id, 'Could not undo token change on device. Token on device and token on relay are out of sync.', undo_error);
					});

					console.error(TAG, this.id, 'Error saving device token to database.', error);

					reject(error);
				});
			}, true);
		});
	}

	verifyToken (token) {
		return token === this.token;
	}

	setSocket (socket, token) {
		if (!token || !this.verifyToken(token)) {
			console.log(TAG, this.id, 'Could not set socket. Invalid device token.');
			return;
		}

		if (socket === this.socket) {
			return;
		}

		// Disconnect the current socket.
		if (this.socket) {
			this.socket.removeAllListeners();
			this.socket.disconnect();
		}

		this.socket = socket;
		this.state.connected = socket.connected;

		// Set up listeners on new socket.
		this.socket_listeners.forEach((listener) => {
			this._socketOn.apply(this, listener);
		});

		this._listenToSocket();
	}

	_listenToSocket () {
		// Update when the device sends new state.
		this._socketOn('load', (data, callback = noOp) => {
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

		this._socketOn('connect', (data) => this.state.connected = true);
		this._socketOn('disconnect', (data) => this.state.connected = false);
	}

	_socketOn (event) {
		if (!this.socket) {
			console.log(TAG, this.id, 'Tried to listen for socket event "' + event + '" but the device does not have a socket.');
			return;
		}

		this.socket.on.apply(this.socket, arguments);
	}

	_socketEmit (event, data, callback = noOp, should_queue) {
		if (!this.socket) {
			console.log(TAG, this.id, 'Tried to emit socket event "' + event + '" but the device does not have a socket.');
			callback('Device not connected');
			return;
		}

		if (!this.state.connected && !should_queue) {
			console.log(TAG, this.id, 'Tried to emit socket event "' + event + '" but the socket is not connected.');

			callback('Device not connected');
			return;
		}

		this.socket.emit(event, data, callback);
	}

	_getSocketProxy () {
		return {
			on: (function () {
				this.socket_listeners.push(arguments);

				if (this.socket) {
					this._socketOn.apply(this, arguments);
				}
			}).bind(this),
			emit: this._socketEmit.bind(this)
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

	destroy () {
		if (this.socket && this.socket.connected) {
			this.socket.disconnect(true);
		}
	}
}

module.exports = Device;
