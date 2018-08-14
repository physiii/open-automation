class DeviceDriver {
	constructor (data, socket, device_id) {
		this.device_id = device_id;
	}

	init () {
		// no-op
	}

	on () {
		// no-op
	}

	emit () {
		// no-op
	}

	setSocket () {
		if (socket === this.socket) {
			return;
		}

		// Disconnect the current socket.
		if (this.socket) {
			this.socket.removeAllListeners();
			this.socket.disconnect();
		}

		this.socket = socket;

		this._subscribeToSocket();
	}

	_subscribeToSocket () {
		// no-op
	}

	destroy () {
		if (this.socket && this.socket.connected) {
			this.socket.disconnect(true);
		}
	}
}

module.exports = DeviceDriver;
