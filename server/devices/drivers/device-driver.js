const TAG = '[DeviceDriver]';

class DeviceDriver {
	constructor (socket) {
		this.socket = socket;
		this.device_listeners = [];
	}

	on (event) {
		this.device_listeners.push(arguments);
	}

	emit () {
		// No-op
	}
}

module.exports = DeviceDriver;
