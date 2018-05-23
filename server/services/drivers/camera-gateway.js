const EventEmitter = require('events');

class GatewayCameraDriver {
	constructor (cameraId, socket) {
		this.serviceId = cameraId;
		this.socket = socket;
		this.events = new EventEmitter();
	}

	streamLive () {
		this.gatewayEmit('stream/live');
	}

	stopStream () {
		this.gatewayEmit('stream/stop');
	}

	getPreview () {
		this.gatewayEmit('preview/get');
	}

	getRecordings () {
		this.gatewayEmit('recordings/get');
	}

	on () {
		return this.events.on.apply(this.events, arguments);
	}

	gatewayEmit (event, data, callback) {
		this.socket.emit('camera/' + this.serviceId + '/' + event, data, callback);
	}
}

module.exports = GatewayCameraDriver;
