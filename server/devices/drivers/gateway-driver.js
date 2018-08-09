const noOp = () => {},
	TAG = '[GatewayDeviceDriver]';

class GatewayDeviceDriver {
	constructor (socket) {
		this.device_listeners = [];

		if (socket) {
			this.setSocket(socket);
		}
	}

	on (event) {
		this.device_listeners.push(arguments);

		if (this.socket) {
			this.socket.on.apply(this.socket, arguments);
		}
	}

	emit (event, data, callback = noOp) {
		if (!this.socket) {
			console.log(TAG, this.id, 'Tried to emit socket event "' + event + '" but the device does not have a socket.');
			callback('Device not connected');
			return;
		}

		if (!this.socket.connected) {
			console.log(TAG, this.id, 'Tried to emit socket event "' + event + '" but the socket is not connected.');

			callback('Device not connected');
			return;
		}

		this.socket.emit(event, data, callback);
	}

	setSocket (socket) {
		if (socket === this.socket) {
			return;
		}

		// Disconnect the current socket.
		if (this.socket) {
			this.socket.removeAllListeners();
			this.socket.disconnect();
		}

		this.socket = socket;

		// Set up listeners on new socket.
		this.device_listeners.forEach((listener) => {
			this.socket.on.apply(this.socket, listener);
		});
	}

	destroy () {
		if (this.socket && this.socket.connected) {
			this.socket.disconnect(true);
		}
	}
}

module.exports = GatewayDeviceDriver;
