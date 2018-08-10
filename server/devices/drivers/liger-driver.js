const EventEmitter = require('events'),
	DeviceDriver = require('./device-driver.js'),
	TAG = '[LigerDeviceDriver]';

class LigerDeviceDriver extends DeviceDriver {
	constructor (socket, device_id, relay_services) {
		super(socket, device_id);

		this.device_events = new EventEmitter();

		if (socket) {
			this.setSocket(socket);
		}

		this._emitLoadToRelay();
	}

	on () {
		this.device_events.on.apply(this.device_events, arguments);
	}

	emit () {
		// Map relay service events to corresponding messages to the liger.
	}

	_subscribeToSocket () {
		// Map liger events to corresponding relay events.
		this.socket.on('connect', () => this.device_events.emit('connect'));
		this.socket.on('disconnect', () => this.device_events.emit('disconnect'));
	}

	_emitLoadToRelay () {
		this.device_events.emit('load', {
			device: {
				info: {manufacturer: 'Pyfi Technologies'},
				services: []
			}
		});
	}
}

module.exports = LigerDeviceDriver;
