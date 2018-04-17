const getDashboardDevices = (devices) => {
	return devices ? devices.filter(device => device.type !== 'gateway') : null;
};

export {
	getDashboardDevices
};
