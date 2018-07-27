const Service = require('./service.js'),
	GatewayCameraDriver = require('./drivers/camera-gateway.js'),
	TAG = '[CameraService]';

class CameraService extends Service {
	constructor (data, onUpdate, gateway_socket) {
		super(data, onUpdate);

		this.type = 'camera';

		this.driver = new GatewayCameraDriver(this.id, gateway_socket);
		this.subscribeToDriver();
	}

	subscribeToDriver () {
		this.driver.on('state update', (state) => this.setState(state));
	}

	setSettings (settings = {}) {
		this.settings = {
			resolution_w: settings.resolution_w || 640,
			resolution_h: settings.resolution_h || 480,
			rotation: settings.rotation || 0
		}
	}

	streamLive () {
		return this.driver.streamLive();
	}

	stopLiveStream () {
		return this.driver.stopLiveStream();
	}

	getPreviewImage () {
		return this.driver.getPreview();
	}

	getRecordings () {
		return this.driver.getRecordings();
	}

	streamRecording (recording_id) {
		return this.driver.streamRecording(recording_id);
	}

	stopRecordingStream (recording_id) {
		return this.driver.stopRecordingStream(recording_id);
	}
}

module.exports = CameraService;
