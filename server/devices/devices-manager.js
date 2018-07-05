const EventEmitter = require('events'),
	database = require('../database.js'),
	Device = require('./device.js'),
	socketEscrow = {},
	devicesList = new Map(),
	TAG = 'DeviceManager';

class DevicesManager {
	constructor () {
		this.events = new EventEmitter();

		this.handleDeviceUpdate = this.handleDeviceUpdate.bind(this);
	}

	on () {
		return this.events.on.apply(this.events, arguments);
	}

	addDevice (data) {
		let device = this.getDeviceById(data.id, null, true);

		if (device) {
			return device;
		}

		device = new Device(data, this.handleDeviceUpdate, data.gatewaySocket || this.getFromSocketEscrow(data.id, data.token));

		this.removeFromSocketEscrow(data.id, data.token);

		devicesList.set(device.id, device);

		return device;
	}

	createDevice (data) {
		return new Promise((resolve, reject) => {
			const device = this.addDevice(data);

			database.saveDevice(device.dbSerialize()).then(() => {
				resolve(device);
			}).catch(reject);
		});
	}

	handleDeviceUpdate (device) {
		this.events.emit('device/update', {device});
	}

	// NOTE: Use skipAccountAccessCheck with caution. Never use for requests
	// originating from the client API.
	getDeviceById (deviceId, accountId, skipAccountAccessCheck) {
		const device = devicesList.get(deviceId);

		// Verify that this account has access to this device.
		if ((device && (device.location === accountId)) || skipAccountAccessCheck) {
			return device;
		}
	}

	// NOTE: Use skipAccountAccessCheck with caution. Never use for requests
	// originating from the client API.
	getDeviceByServiceId (serviceId, accountId, skipAccountAccessCheck) {
		const device = Array.from(devicesList.values()).find((device) => device.services.getServiceById(serviceId));

		// Verify that this account has access to this device.
		if ((device && (device.location === accountId)) || skipAccountAccessCheck) {
			return device;
		}
	}

	// NOTE: Use skipAccountAccessCheck with caution. Never use for requests
	// originating from the client API.
	getDevicesByLocation (locationId, accountId, skipAccountAccessCheck) {
		// Verify that this account has access to this location.
		if ((locationId === accountId) || skipAccountAccessCheck) {
			return Array.from(devicesList.values()).filter((device) => device.location === locationId);
		}
	}

	// NOTE: Use skipAccountAccessCheck with caution. Never use for requests
	// originating from the client API.
	getServiceById (serviceId, accountId, skipAccountAccessCheck) {
		const device = this.getDeviceByServiceId(serviceId, accountId, skipAccountAccessCheck);

		// Verify that this account has access to this device.
		if ((device && (device.location === accountId)) || skipAccountAccessCheck) {
			return device.services.getServiceById(serviceId);
		}
	}

	addToSocketEscrow (deviceId, deviceToken, socket) {
		socketEscrow[deviceId + deviceToken] = socket;
	}

	getFromSocketEscrow (deviceId, deviceToken) {
		return socketEscrow[deviceId + deviceToken];
	}

	removeFromSocketEscrow (deviceId, deviceToken) {
		delete socketEscrow[deviceId + deviceToken];
	}

	loadDevicesFromDb () {
		return new Promise((resolve, reject) => {
			database.getDevices().then((devices) => {
				devicesList.clear();

				devices.forEach((device) => {
					this.addDevice(device);
				});

				resolve(devicesList);
			}).catch((error) => {
				reject(error);
			});
		});
	}

	getClientSerializedDevices (devices = []) {
		return devices.map((device) => device.clientSerialize());
	}
}

module.exports = new DevicesManager();
