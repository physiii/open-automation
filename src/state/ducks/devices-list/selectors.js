const getDeviceById = (deviceId, devicesList) => {
		return devicesList.devices.get(deviceId);
	},
	hasInitialFetchCompleted = (devicesList) => {
		return devicesList.fetched;
	};

export {
	getDeviceById,
	hasInitialFetchCompleted
};
