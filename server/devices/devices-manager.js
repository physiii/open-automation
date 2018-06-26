const database = require('../database.js'),
	Device = require('./device.js'),
	socketEscrow = {},
	devicesList = new Map();

class DevicesManager {
	constructor () {
		this.handleDeviceUpdate = this.handleDeviceUpdate.bind(this);
	}

	addDevice (data) {
		let device = this.getDeviceById(data.id);

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
		const client_sockets = socketServer.getClientSocketsForAccountId(device.location),
			devices = this.getClientSerializedDevices(this.getDevicesByLocation(device.location));

		client_sockets.forEach((socket) => {
			socket.emit('devices', {devices});
		});
	}

	getDeviceById (deviceId) {
		return devicesList.get(deviceId);
	}

	getDeviceByServiceId (serviceId) {
		return Array.from(devicesList.values()).find((device) => device.services.getServiceById(serviceId));
	}

	getDevicesByLocation (locationId) {
		return Array.from(devicesList.values()).filter((device) => device.location === locationId);
	}

	getServiceById (serviceId) {
		const device = this.getDeviceByServiceId(serviceId);

		if (!device) {
			return;
		}

		return device.services.getServiceById(serviceId);
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

	getClientSerializedDevices (devices = Array.from(devicesList.values())) {
		return devices.map((device) => device.clientSerialize());
	}
}

module.exports = new DevicesManager();

const socketServer = require('../socket.js');
