const devicesWithoutGateways = (devicesList) => {
		return devicesList.devices.filter((device) => {
			return !device.services.find((service) => service.type === 'gateway');
		});
	},
	deviceById = (deviceId, devicesList) => {
		return devicesList.devices.find((device) => device.id === deviceId);
	},
	hasInitialFetchCompleted = (devicesList) => {
		return Boolean(devicesList.devices);
	};

export {
	devicesWithoutGateways,
	deviceById,
	hasInitialFetchCompleted
};
