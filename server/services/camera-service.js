const Service = require('./service.js'),
	TAG = '[CameraService]';

class CameraService extends Service {
	constructor (data, onUpdate, driverClass) {
		super(data, onUpdate);

		this.type = 'camera';

		this.driver = new driverClass(this.id);
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

	streamRecording (recordingId) {
		return this.driver.streamRecording(recordingId);
	}

	stopRecordingStream (recordingId) {
		return this.driver.stopRecordingStream(recordingId);
	}
}

module.exports = CameraService;
