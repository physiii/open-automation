const database = require('../database.js'),
	Device = require('./device.js');

class DevicesManager {
	constructor () {
		this.devices = [];
		this.loadDevicesFromDb(); // TODO: Move this?
	}

	addDevice (data) {
		let device = this.getDeviceById(data.id);

		if (device) {
			return device;
		}

		device = new Device(data);
		this.devices.push(device);
		database.store_device(device);

		return device;
	}

	getDeviceById (deviceId) {
		return this.devices.find((device) => device.id === deviceId);
	}

	getDevicesByLocation (locationId) {
		return this.devices.filter((device) => device.location === locationId);
	}

	loadDevicesFromDb () {
		return new Promise((resolve, reject) => {
			database.get_devices().then((devices) => {
				this.devices = devices.map((device) => new Device(device));
				resolve(this.devices);
			}).catch((error) => {
				reject(error);
			});
		});
	}

	getClientSerializedDevices (devices = this.devices) {
		return devices.map((device) => device.clientSerialize());
	}
}

module.exports = new DevicesManager();
