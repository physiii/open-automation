const getDevices = (devicesList, toJs = true) => {
		const devices = devicesList.get('devices');

		return toJs ? devicesToJs(devices) : devices;
	},
	getDeviceById = (devicesList, deviceId, toJs = true) => {
		const device = devicesList.getIn(['devices', deviceId]);

		if (!device) {
			return;
		}

		return toJs ? device.set('services', device.services.toList()).toJS() : device;
	},
	getDevicesWithAutomatorSupport = (devicesList, toJs = true) => {
		const devices = devicesList.get('devices').filter((device) => device.automator_supported);

		return toJs ? devicesToJs(devices) : devices;
	},
	hasInitialFetchCompleted = (devicesList) => {
		return devicesList.get('fetched');
	},
	devicesToJs = (devices) => {
		return devices.map((device) => {
			return device.set('services', device.services.toList());
		}).toList().toJS();
	};

export {
	getDevices,
	getDeviceById,
	getDevicesWithAutomatorSupport,
	hasInitialFetchCompleted
};
