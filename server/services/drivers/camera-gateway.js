const GatewayServiceDriver = require('./gateway.js');

class GatewayCameraDriver extends GatewayServiceDriver {
	constructor (cameraId, gatewaySocket) {
		super(cameraId, 'camera', gatewaySocket);
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

	listenToGateway () {}
}

module.exports = GatewayCameraDriver;
