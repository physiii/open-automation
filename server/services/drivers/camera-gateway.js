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
		return new Promise((resolve, reject) => {
			this.gatewayEmit('recordings/get', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data.recordings);
			});
		});
	}

	listenToGateway () {}
}

module.exports = GatewayCameraDriver;
