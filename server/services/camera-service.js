const moment = require('moment'),
	config = require('../../config.json'),
	Service = require('./service.js'),
	GatewayCameraDriver = require('./drivers/camera-gateway.js'),
	TAG = '[CameraService]';

class CameraService extends Service {
	constructor (data, onUpdate, gateway_socket) {
		super(data, onUpdate);

		this.driver = new GatewayCameraDriver(this.id, gateway_socket);
		this.subscribeToDriver();
	}

	subscribeToDriver () {
		this.driver.on('state update', (state) => this.setState(state));
		this.driver.on('motion-started', (event_data) => this._emit('motion-started', event_data));
		this.driver.on('motion-stopped', (event_data) => this._emit('motion-stopped', event_data));
		this.driver.on('motion-recorded', (event_data) => this._emit('motion-recorded', event_data));
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

	getRecordingLink (recording_id, recording_date) {
		return `${config.use_ssl ? 'https' : 'http'}://${config.domain_name}:${config.use_ssl ? config.website_secure_port : config.website_port}/dashboard/recordings/${this.id}/${moment(recording_date).format('YYYY/MM/DD')}/${recording_id}`;
	}
}

CameraService.type = 'camera';
CameraService.friendly_type = 'Camera';
CameraService.indefinite_article = 'A';
CameraService.event_strings = {
	'motion-started': {
		getFriendlyName: () => 'Movement Detected',
		getDescription: function (event_data) {
			return 'Movement was detected on ' + this.getNameOrType(true, false, true) + ' at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	},
	'motion-stopped': {
		getFriendlyName: () => 'Movement Stopped',
		getDescription: function (event_data) {
			return 'Movement on ' + this.getNameOrType(true, false, true) + ' stopped at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	},
	'motion-recorded': {
		getFriendlyName: () => 'New Recording',
		getDescription: function (event_data) {
			return this.getNameOrType(true, true, true) + ' recorded movement at ' + moment(event_data.recording.date).format('h:mm a on dddd, MMMM Do.') + ' Click to play recording: ' + this.getRecordingLink(event_data.recording.id, event_data.recording.date);
		},
		getHtmlDescription: function (event_data, attachment) {
			return (
<<<<<<< HEAD
				'<p>' + this.getNameOrType(true, true, true) + ' recorded movement at ' + moment(event_data.recording.date).format('h:mm a on dddd, MMMM Do.') + '</p>'
				+ '<p>' +
=======
				'<p>' + this.getNameOrType(true, true, true) + ' recorded movement at ' + moment(event_data.recording.date).format('h:mm a on dddd, MMMM Do.') + '</p>' +
				'<p>' +
>>>>>>> e1957c31af120a407f69fc2862dfec834f84ce6a
				'<a href="' + this.getRecordingLink(event_data.recording.id, event_data.recording.date) + '">' +
				'Play Recording<br />' +
				(attachment ? '<img src="cid:' + attachment.cid + '" />' : '') +
				'</a>' +
				'</p>'
			);
		},
		getAttachment: function (event_data) {
			if (!event_data.preview_image) {
				return;
			}

			return {
				filename:  moment(event_data.recording.date).format('YYYY-MM-DD-h:mm:ssA') + '-' + this.id + '.jpg',
				content: Buffer.from(event_data.preview_image, 'base64'),
				cid: 'preview_image'
			};
		}
	}
};

module.exports = CameraService;
