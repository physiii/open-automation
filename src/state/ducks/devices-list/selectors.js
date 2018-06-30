const deviceById = (deviceId, devicesList) => {
		return devicesList.devices.get(deviceId);
	},
	hasInitialFetchCompleted = (devicesList) => {
		return devicesList.fetched;
	};

export {
	deviceById,
	hasInitialFetchCompleted
};
