const uuid = require('uuid/v4'),
	utils = require('../utils.js'),
	database = require('../database.js'),
	GatewayDeviceDriver = require('./drivers/gateway-driver.js'),
	LigerDeviceDriver = require('./drivers/liger-driver.js'),
	PyfiDeviceDriver = require('./drivers/pyfi-driver.js'),
	ServicesManager = require('../services/services-manager.js'),
	noOp = () => {},
	TAG = '[Device]';

class Device {
	constructor (data, onUpdate, socket) {
		const driver_class = Device.drivers[data.type] || GatewayDeviceDriver;

		this.id = data.id || uuid();
		this.token = data.token;
		this.account = data.account;
		this.account_id = data.account_id;
		this.gateway = data.gateway;
		this.gateway_id = data.gateway_id;
		this.is_saveable = data.is_saveable || false;

		this.onUpdate = () => onUpdate(this);

		this.driver_data = data.driver_data;
		this.driver = new driver_class(this.driver_data, socket, this.id, data.services);
		this.services = new ServicesManager(this, data.services, this.driver.on.bind(this.driver), this.driver.emit.bind(this.driver), this.onUpdate);

		this._setSettings(data.settings);
		this._setInfo(data.info);
		this.state = utils.onChange({connected: false}, this.onUpdate);

		if (socket) {
			this.setSocket(socket, this.token);
		}

		this.subscribeToDriver();
		this.driver.init();
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

	subscribeToDriver () {
		this.driver.on('connect', () => this.state.connected = true);
		this.driver.on('disconnect', () => this.state.connected = false);
		this.driver.on('load', (data, callback = noOp) => {
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

			this.onUpdate();
			this.save();
		});
		this.driver.on('driver-data', (data) => {
			this.driver_data = data.driver_data;
			this.save();
		});
	}

	setToken (token) {
		return new Promise((resolve, reject) => {
			const current_token = this.token;

			if (!this.state.connected) {
				console.log(TAG, this.id, 'Cannot set device token when the device is not connected.');
				reject('Device not connected.');

				return;
			}

			// Send new token to device.
			this.driver.emit('token', {token}, (error) => {
				if (error) {
					reject(error);
					return;
				}

				// Save the new token locally.
				this.token = token;
				this.is_saveable = true;
				this.save().then(() => {
					resolve(this.token);
				}).catch((error) => {
					// Undo token change locally.
					this.token = current_token;
					this.is_saveable = false;

					// Undo token change on device.
					this.driver.emit('token', {token: current_token}, (undo_error) => {
						console.error(TAG, this.id, 'Could not undo token change on device. Token on device and token on relay are out of sync.', undo_error);
					});

					console.error(TAG, this.id, 'Error saving device token to database.', error);

					reject(error);
				});
			});
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

		this.driver.setSocket(socket);
		this.state.connected = socket.connected;
	}

	save () {
		return new Promise((resolve, reject) => {
			if (!this.is_saveable) {
				reject();
				return;
			}

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
			services: this.services.getDbSerializedServices(),
			driver_data: this.driver_data
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
		this.driver.destroy();
	}
}

Device.drivers = {
	'gateway': GatewayDeviceDriver,
	'liger': LigerDeviceDriver,
	'generic': PyfiDeviceDriver
};

module.exports = Device;
