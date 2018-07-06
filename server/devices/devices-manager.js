const EventEmitter = require('events'),
	crypto = require('crypto'),
	database = require('../database.js'),
	Device = require('./device.js'),
	AccountsManager = require('../accounts/accounts-manager.js'),
	socketEscrow = {},
	devicesList = new Map(),
	DEVICE_TOKEN_SIZE = 256;

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

		device = new Device(
			{
				...data,
				account: AccountsManager.getAccountById(data.account_id)
			},
			this.handleDeviceUpdate,
			data.gatewaySocket || this.getFromSocketEscrow(data.id, data.token)
		);

		this.removeFromSocketEscrow(data.id, data.token);

		devicesList.set(device.id, device);

		return device;
	}

	createDevice (data) {
		return new Promise((resolve, reject) => {
			if (this.doesDeviceExist(data.id)) {
				reject('A device already exists with that ID.');
				return;
			}

			const device = this.addDevice(data);

			this.generateDeviceToken().then((token) => {
				device.setToken(token).then(() => {
					resolve(device);
				}).catch((error) => {
					// Since the token wasn't successfully set, delete the
					// device so the user can try again.
					this.deleteDevice(device.id);
					reject(error);
				});
			}).catch(reject);
		});
	}

	deleteDevice (deviceId) {
		return new Promise((resolve, reject) => {
			database.deleteDevice(deviceId).then(() => {
				devicesList.delete(deviceId);
				resolve();
			}).catch(reject);
		});
	}

	handleDeviceUpdate (device) {
		this.events.emit('device/update', {device});
	}

	doesDeviceExist (deviceId) {
		return Boolean(devicesList.get(deviceId));
	}

	// NOTE: Use skipAccountAccessCheck with caution. Never use for requests
	// originating from the client API.
	getDeviceById (deviceId, accountId, skipAccountAccessCheck) {
		const device = devicesList.get(deviceId);

		// Verify that this account has access to this device.
		if (this.verifyAccountAccessToDevice(accountId, device, skipAccountAccessCheck)) {
			return device;
		}
	}

	// NOTE: Use skipAccountAccessCheck with caution. Never use for requests
	// originating from the client API.
	getDeviceByServiceId (serviceId, accountId, skipAccountAccessCheck) {
		const device = Array.from(devicesList.values()).find((device) => device.services.getServiceById(serviceId));

		// Verify that this account has access to this device.
		if (this.verifyAccountAccessToDevice(accountId, device, skipAccountAccessCheck)) {
			return device;
		}
	}

	getDevicesByAccountId (accountId) {
		return Array.from(devicesList.values()).filter((device) => (device.account && device.account.id) === accountId);
	}

	// NOTE: Use skipAccountAccessCheck with caution. Never use for requests
	// originating from the client API.
	getServiceById (serviceId, accountId, skipAccountAccessCheck) {
		const device = this.getDeviceByServiceId(serviceId, accountId, skipAccountAccessCheck);

		// Verify that this account has access to this device.
		if (this.verifyAccountAccessToDevice(accountId, device, skipAccountAccessCheck)) {
			return device.services.getServiceById(serviceId);
		}
	}

	// NOTE: Use "force" with caution. Never use for requests originating from
	// the client API.
	verifyAccountAccessToDevice (accountId, device, force) {
		return (device && ((device.account && device.account.id) === accountId)) || force;
	}

	generateDeviceToken () {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(DEVICE_TOKEN_SIZE, (error, tokenBuffer) => {
				if (error) {
					reject(error);

					return;
				}

				resolve(tokenBuffer.toString('hex'));
			});
		});
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
			}).catch(reject);
		});
	}

	loadDeviceFromDb (deviceId) {
		return new Promise((resolve, reject) => {
			database.getDevice(deviceId).then((devices) => {
				const device = devices[0];

				if (!device) {
					reject('Device not found.');
					return;
				}

				this.addDevice(device);

				resolve();
			}).catch(reject);
		});
	}

	getClientSerializedDevices (devices = []) {
		return devices.map((device) => device.clientSerialize());
	}
}

module.exports = new DevicesManager();
