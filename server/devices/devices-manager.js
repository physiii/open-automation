const database = require('../database.js'),
	Device = require('./device.js'),
	socketEscrow = {};

let devicesList = [];

class DevicesManager {
	addDevice (data) {
		let device = this.getDeviceById(data.id);

		if (device) {
			return device;
		}

		device = new Device({
			...data,
			socket: data.socket || this.getFromSocketEscrow(data.id, data.token)
		});

		this.removeFromSocketEscrow(data.id, data.token);

		devicesList.push(device);
		database.saveDevice(device.dbSerialize());

		return device;
	}

	getDeviceById (deviceId) {
		return devicesList.find((device) => device.id === deviceId);
	}

	getDeviceByServiceId (serviceId) {
		return devicesList.find((device) => device.services.getServiceById(serviceId));
	}

	getDevicesByLocation (locationId) {
		return devicesList.filter((device) => device.location === locationId);
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
