// Wraps a WebSocket for a device to replicate Socket.IO behaviors.

const EventEmitter = require('events'),
	WebSocket = require('ws'),
	PING_INTERVAL_TIMEOUT = 10000;

class DeviceWebSocketWrapper extends EventEmitter {
	constructor (socket) {
		super();

		this.sendPing = this.sendPing.bind(this);

		this.callback_queue = new Map();
		this.callback_ids = 0;

		this.socket = socket;
		this.socket.on('message', this.handleMessage.bind(this));
		this.socket.on('open', this.handleOpen.bind(this));
		this.socket.on('error', this.handleError.bind(this));
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
		let message;

		try {
			message = JSON.parse(data);
		} catch (error) {
			return;
		}

		if (message.event_type) {
			this.handleEvent(message);
		} else if (message.callback) {
			this.handleCallback(message);
		}
	}

	handleEvent (message) {
		// console.log("!! handleEvent !!", message.event_type, message.payload);
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
		this.ping_interval = setInterval(this.sendPing, PING_INTERVAL_TIMEOUT);
		EventEmitter.prototype.emit.call(this, 'connect');
	}

	handleError (error) {
		EventEmitter.prototype.emit.call(this, 'error', error);
	}

	handleClose (code, reason) {
		this.connected = false;
		clearInterval(this.ping_interval);
		EventEmitter.prototype.emit.call(this, 'disconnect', String(reason + ' (' + code + ')'));
	}

	sendPing () {
		this.emit('ping');
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
