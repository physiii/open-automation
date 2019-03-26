const TAG = '[DeviceDriver]';

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

	setSocket (socket) {
		if (socket === this.socket) {
			return;
		}

		// Disconnect the current socket.
		if (this.socket) {
			console.log(TAG, 'Closing device socket to set new socket.', this.device_id);
			this.socket.removeAllListeners();
			this.socket.disconnect();
		}

		this.socket = socket;

		this._subscribeToSocket();
	}

	_subscribeToSocket () {
		this.socket.on('error', (error) => console.log(TAG, 'Socket error:', error, this.device_id));
		this.socket.on('disconnect', (reason) => console.log(TAG, 'Socket disconnected. Reason:', reason, this.device_id));
	}

	destroy () {
		if (this.socket && this.socket.connected) {
			this.socket.disconnect(true);
		}
	}
}

module.exports = DeviceDriver;
