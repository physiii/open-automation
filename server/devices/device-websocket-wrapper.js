// Wraps a WebSocket for a device to replicate Socket.IO behaviors.

const EventEmitter = require('events'),
	WebSocket = require('ws');

class DeviceWebSocketWrapper extends EventEmitter {
	constructor (socket) {
		super();

		this.callback_queue = new Map();
		this.callback_ids = 0;

		this.socket = socket;
		this.socket.on('message', this.handleMessage.bind(this));
		this.socket.on('open', this.handleOpen.bind(this));
		this.socket.on('close', this.handleClose.bind(this));

		this.connected = this.socket.readyState === WebSocket.OPEN;
	}

	emit (event, payload, callback) {
		// Store the callback to call when a callback event is received from device.
		if (typeof callback === 'function') {
			this.callback_queue.set(this.callback_ids, callback);
		}

		this.socket.send(JSON.stringify({
			id: this.callback_ids,
			event_type: event,
			payload
		}));

		this.callback_ids += 1;
	}

	handleMessage (data) {
		const message = JSON.parse(data);

		if (message.event_type) {
			this.handleEvent(message);
		} else if (message.callback) {
			this.handleCallback(message);
			return;
		}
	}

	handleEvent (message) {
		EventEmitter.prototype.emit.call(this, message.event_type, message.payload);
	}

	handleCallback (message) {
		const callback = this.callback_queue.get(message.id);

		this.callback_queue.delete(message.id);

		if (typeof callback === 'function') {
			callback.apply(this, [].concat(message.payload));
		}
	}

	handleOpen () {
		this.connected = true;
	}

	handleClose () {
		this.connected = false;
		EventEmitter.prototype.emit.call(this, 'disconnect');
	}

	disconnect (force) {
		if (force) {
			this.socket.terminate();
		} else {
			this.socket.close();
		}
	}
}

module.exports = DeviceWebSocketWrapper;
