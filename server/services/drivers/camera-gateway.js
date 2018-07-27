const GatewayServiceDriver = require('./gateway.js');

class GatewayCameraDriver extends GatewayServiceDriver {
	constructor (camera_id, gateway_socket) {
		super(camera_id, 'camera', gateway_socket);
	}

	streamLive () {
		return new Promise((resolve, reject) => {
			this.gatewayEmit('stream/live', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data.stream_token);
			});
		});
	}

	stopLiveStream () {
		return new Promise((resolve, reject) => {
			this.gatewayEmit('stream/stop', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	getPreview () {
		return new Promise((resolve, reject) => {
			this.gatewayEmit('preview/get', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data.preview);
			});
		});
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

	streamRecording (recording_id) {
		return new Promise((resolve, reject) => {
			this.gatewayEmit('recording/stream', {recording_id}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data.stream_token);
			});
		});
	}

	stopRecordingStream (recording_id) {
		return new Promise((resolve, reject) => {
			this.gatewayEmit('recording/stream/stop', {recording_id}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	listenToGateway () {
		GatewayServiceDriver.prototype.listenToGateway.apply(this, arguments);
	}
}

module.exports = GatewayCameraDriver;
