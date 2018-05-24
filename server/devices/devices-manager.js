const database = require('../database.js'),
	Device = require('./device.js'),
	socketEscrow = {};
let devicesList = [];

class DevicesManager {
	constructor () {
		this.loadDevicesFromDb(); // TODO: Move this?
	}

	addDevice (data) {
		let device = this.getDeviceById(data.id);

		if (device) {
			return device;
		}

		device = new Device({
			...data,
			socket: data.socket || this.getFromSocketEscrow(data.id)
		});

		this.removeFromSocketEscrow(data.id);

		devicesList.push(device);
		database.store_device(device);

		return device;
	}

	addToSocketEscrow (deviceId, socket) {
		socketEscrow[deviceId] = socket;
	}

	getFromSocketEscrow (deviceId) {
		return socketEscrow[deviceId];
	}

	removeFromSocketEscrow (deviceId) {
		delete socketEscrow[deviceId];
	}

	getDeviceById (deviceId) {
		return devicesList.find((device) => device.id === deviceId);
	}

	getDevicesByLocation (locationId) {
		return devicesList.filter((device) => device.location === locationId);
	}

	loadDevicesFromDb () {
		return new Promise((resolve, reject) => {
			database.get_devices().then((devices) => {
				devicesList = devices.map((device) => new Device(device));
				resolve(devicesList);
			}).catch((error) => {
				reject(error);
			});
		});
	}

	getClientSerializedDevices (devices = devicesList) {
		return devices.map((device) => device.clientSerialize());
	}
}

module.exports = new DevicesManager();
