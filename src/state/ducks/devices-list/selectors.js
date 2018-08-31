const getDevices = (devicesList, toJs = true) => {
		const devices = devicesList.get('devices');

		return toJs
			? devices.map((device) => {
				return device.set('services', device.services.toList());
			}).toList().toJS()
			: devices;
	},
	getDeviceById = (devicesList, deviceId, toJs = true) => {
		const device = devicesList.getIn(['devices', deviceId]);

		if (!device) {
			return;
		}

		return toJs ? device.set('services', device.services.toList()).toJS() : device;
	},
	hasInitialFetchCompleted = (devicesList) => {
		return devicesList.get('fetched');
	};

export {
	getDevices,
	getDeviceById,
	hasInitialFetchCompleted
};
