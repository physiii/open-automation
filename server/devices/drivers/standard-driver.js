const DeviceDriver = require('./device-driver.js'),
	constants = require('../../constants.js'),
	noOp = () => {},
	TAG = '[StandardDeviceDriver]';

class StandardDeviceDriver extends DeviceDriver {
	constructor (data, socket, device_id) {
		super(socket, device_id);

		this._socket_listeners = [];

		if (socket) {
			this.setSocket(socket);
		}
	}

	on (event, callback, service_id, service_type) {
		const prefixed_event = this._getPrefixedEvent(event, service_id, service_type);

		this._socket_listeners.push([prefixed_event, callback]);

		if (this.socket) {
			this.socket.on(prefixed_event, callback);
		}
	}

	emit (event, data, callback = noOp, service_id, service_type) {
		const prefixed_event = this._getPrefixedEvent(event, service_id, service_type);

		if (!this.socket) {
			console.log(TAG, this.device_id, 'Tried to emit socket event "' + prefixed_event + '" but the device does not have a socket.');
			callback('Device not connected');
			return;
		}

		if (!this.socket.connected) {
			console.log(TAG, this.device_id, 'Tried to emit socket event "' + prefixed_event + '" but the socket is not connected.');
			callback('Device not connected');
			return;
		}

		this.socket.emit(prefixed_event, data, callback);
	}

	_getPrefixedEvent (event, service_id, service_type) {
		return service_id
			? service_id + constants.SERVICE_EVENT_DELIMITER + service_type + constants.SERVICE_EVENT_DELIMITER + event
			: event;
	}

	_subscribeToSocket () {
		// Set up listeners on new socket.
		this._socket_listeners.forEach((listener) => {
			this.socket.on.apply(this.socket, listener);
		});

		DeviceDriver.prototype._subscribeToSocket.call(this, arguments);
	}
}

module.exports = StandardDeviceDriver;
