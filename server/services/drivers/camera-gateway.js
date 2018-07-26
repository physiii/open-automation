const GatewayServiceDriver = require('./gateway.js');

class GatewayCameraDriver extends GatewayServiceDriver {
	constructor (cameraId, gatewaySocket) {
		super(cameraId, 'camera', gatewaySocket);
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

	streamRecording (recordingId) {
		return new Promise((resolve, reject) => {
			this.gatewayEmit('recording/stream', {recording_id: recordingId}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data.stream_token);
			});
		});
	}

	stopRecordingStream (recordingId) {
		return new Promise((resolve, reject) => {
			this.gatewayEmit('recording/stream/stop', {recording_id: recordingId}, (error, data) => {
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

		this.gatewayOn('motion-recorded', (data) => this.events.emit('motion-recorded', data));
	}
}

module.exports = GatewayCameraDriver;
