const devicesWithoutGateways = (devices) => {
	if (!devices) {
		return null;
	}

	return devices.filter((device) => device.type !== 'gateway');
};

export {
	devicesWithoutGateways
};
