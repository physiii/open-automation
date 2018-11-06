const uuid = require('uuid/v4'),
	utils = require('../utils.js'),
	database = require('../database.js'),
	debounce = require('debounce'),
	StandardDeviceDriver = require('./drivers/standard-driver.js'),
	LigerDeviceDriver = require('./drivers/liger-driver.js'),
	GenericDeviceDriver = require('./drivers/generic/generic-driver.js'),
	DeviceSettings = require('./device-settings.js'),
	ServicesManager = require('../services/services-manager.js'),
	noOp = () => {},
	TAG = '[Device]';

class Device {
	constructor (data, onUpdate, socket) {
		const driver_class = Device.drivers[data.type] || StandardDeviceDriver;

		this.save = this.save.bind(this);

		this.id = data.id || uuid();
		this.token = data.token;
		this.account = data.account;
		this.account_id = data.account_id;
		this.gateway = data.gateway;
		this.gateway_id = data.gateway_id;
		this.is_saveable = data.is_saveable || false;

		this.onUpdate = debounce(() => onUpdate(this), 100);

		this.driver_data = {...data.driver_data};
		this.driver = new driver_class(this.driver_data, socket, this.id, [...data.services]);

		const driverOn = this.driver.on.bind(this.driver),
			driverEmit = this.driver.emit.bind(this.driver);

		this.services = new ServicesManager(
			this,
			data.services,
			driverOn,
			driverEmit,
			this.onUpdate,
			this.save
		);
		this.settings = new DeviceSettings(
			data.settings,
			data.settings_definitions,
			this.constructor.settings_definitions,
			driverEmit,
			this.save
		);
		this.state = utils.onChange({connected: false}, this.onUpdate);
		this.setInfo(data.info);

		if (socket) {
			this.setSocket(socket, this.token);
		}

		this.subscribeToDriver();
		this.driver.init();
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

			if (data.device.settings_definitions) {
				this.settings.setDefinitions(data.device.settings_definitions);
			}

			if (data.device.info) {
				this.setInfo(data.device.info);
			}

			this.onUpdate();
			this.save();
		});
		this.driver.on('driver-data', (data) => {
			this.driver_data = data.driver_data;
			this.save();
		});
	}

	setInfo ({manufacturer, model, firmware_version, hardware_version, serial} = {}) {
		this.info = {
			manufacturer,
			model,
			firmware_version,
			hardware_version,
			serial
		};
	}

	setSettings (settings) {
		return this.settings.set(settings).then(this.onUpdate);
	}

	setToken (token) {
		return new Promise((resolve, reject) => {
			const original_token = this.token,
				original_is_saveable = this.is_saveable;

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
					this.driver.emit('reconnect-to-relay');

					resolve(this.token);
				}).catch((error) => {
					// Undo token change locally.
					this.token = original_token;
					this.is_saveable = original_is_saveable;

					console.error(TAG, this.id, 'Error saving device token to database.', error);

					// Undo token change on device.
					this.driver.emit('token', {token: original_token}, (undo_error) => {
						if (undo_error) {
							console.error(TAG, this.id, 'Could not undo token change on device. Token on device and token on relay are out of sync.', undo_error);
						}
					});

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
			services: this.services.getSerializedServices(),
			info: this.info,
			...this.settings.serialize()
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
		this.services.destroy();
	}
}

Device.settings_definitions = new Map()
	.set('name', {
		type: 'string',
		label: 'Name',
		validation: {
			is_required: true,
			max_length: 24
		}
	});

Device.drivers = {
	'gateway': StandardDeviceDriver,
	'liger': LigerDeviceDriver,
	'generic': GenericDeviceDriver
};

module.exports = Device;
