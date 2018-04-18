const getDashboardDevices = (devices) => {
	if (!devices) {
		return null;
	}

	return devices.filter((device) => device.type !== 'gateway');
};

export {
	getDashboardDevices
};
