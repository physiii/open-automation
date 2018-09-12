const DeviceDriver = require('./device-driver.js'),
	noOp = () => {},
	TAG = '[StandardDeviceDriver]';

class StandardDeviceDriver extends DeviceDriver {
	constructor (data, socket, device_id) {
		super(socket, device_id);

		this.device_listeners = [];

		if (socket) {
			this.setSocket(socket);
		}
	}

	on () {
		this.device_listeners.push(arguments);

		if (this.socket) {
			this.socket.on.apply(this.socket, arguments);
		}
	}

	emit (event, data, callback = noOp) {
		if (!this.socket) {
			console.log(TAG, this.device_id, 'Tried to emit socket event "' + event + '" but the device does not have a socket.');
			callback('Device not connected');
			return;
		}

		if (!this.socket.connected) {
			console.log(TAG, this.device_id, 'Tried to emit socket event "' + event + '" but the socket is not connected.');
			callback('Device not connected');
			return;
		}

		if (data.service_id) {
			this.socket.emit(data.service_id + '::' + data.service_type + '::' + event, data.payload, callback);
		} else {
			this.socket.emit(event, data, callback);
		}
	}

	_subscribeToSocket () {
		// Set up listeners on new socket.
		this.device_listeners.forEach((listener) => {
			this.socket.on.apply(this.socket, listener);
		});
	}
}

module.exports = StandardDeviceDriver;
