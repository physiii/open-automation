const devicesWithoutGateways = (devices) => {
		if (!devices) {
			return null;
		}

		return devices.filter((device) => device.type !== 'gateway');
	},
	deviceById = (deviceId, devices) => {
		if (!devices) {
			return null; // TODO: Error
		}

		return devices.find((device) => device.id === deviceId);
	};

export {
	devicesWithoutGateways,
	deviceById
};
