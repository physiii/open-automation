const moment = require('moment'),
	Service = require('./service.js'),
	fs = require('fs'),
	TAG = "[camera-service.js]";

class CameraService extends Service {
	action (data) {
		switch (data.property) {
			case 'setCurrentPlayLocation':
				return this.setCurrentPlayLocation(data.value);
		}
	}

	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('motion-started', (event_data) => this._emit('motion-started', event_data));
		this.deviceOn('motion-stopped', (event_data) => this._emit('motion-stopped', event_data));
		this.deviceOn('motion-recorded', (event_data) => this._emit('motion-recorded', event_data));
	}

	setCurrentPlayLocation (time) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('location/set', {time}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	streamLive () {
		return new Promise((resolve, reject) => {
			this.deviceEmit('stream/live', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data.stream_token);
			});
		});
	}

	streamLiveAudio () {
		return new Promise((resolve, reject) => {
			this.deviceEmit('audio/stream/live', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data.stream_token);
			});
		});
	}

	stopLiveStreamAudio () {
		return new Promise((resolve, reject) => {
			this.deviceEmit('audio/stream/stop', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	stopLiveStream () {
		return new Promise((resolve, reject) => {
			this.deviceEmit('stream/stop', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	getPreviewImage () {
		return new Promise((resolve, reject) => {
			this.deviceEmit('preview/get', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data.preview);
			});
		});
	}

	getRecording (recording_id) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('recording/get', {recording_id}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve('/tmp/' + recording_id + '_' + data.video.file);
			});
		});
	}

	getRecordings () {
		console.log("!!!! camera-service getRecordings 0 !!!!");
		return new Promise((resolve, reject) => {
			console.log("!!!! camera-service getRecordings 1 !!!!");
			this.deviceEmit('recordings/get', {}, (error, data) => {
				console.log("!!!! camera-service getRecordings 2 !!!!");
				if (error) {
					reject(error);
					return;
				}

				resolve(data.recordings);
			});
		});
	}

	streamAudioRecording (recording_id) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('recording/stream/audio', {recording_id}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data.stream_token);
			});
		});
	}

	stopAudioRecordingStream (recording_id) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('recording/stream/audio/stop', {recording_id}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	streamRecording (recording_id) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('recording/stream', {recording_id}, (error, data) => {
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
			this.deviceEmit('recording/stream/stop', {recording_id}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	getRecordingLink (recording_id, recording_date) {
		return `${process.env.OA_SSL ? 'https' : 'http'}://${process.env.OA_DOMAIN_NAME}/dashboard/recordings/${this.id}/${moment(recording_date).format('YYYY/MM/DD')}/${recording_id}`;
	}
}

CameraService.type = 'camera';
CameraService.friendly_type = 'Camera';
CameraService.indefinite_article = 'A';
CameraService.event_definitions = new Map([...Service.event_definitions])
	.set('motion-started', {
		label: 'Movement Detected',
		generateNotification: function (event_data) {
			return 'Movement was detected on ' + this.getNameOrType(true, false, true) + ' at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	})
	.set('motion-stopped', {
		label: 'Movement Stopped',
		generateNotification: function (event_data) {
			return 'Movement on ' + this.getNameOrType(true, false, true) + ' stopped at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	})
	.set('motion-recorded', {
		label: 'New Motion Recording',
		generateNotification: function (event_data) {
			return this.getNameOrType(true, true, true) + ' recorded movement at ' + moment(event_data.recording.date).format('h:mm a on dddd, MMMM Do.') + ' Click to play recording: ' + this.getRecordingLink(event_data.recording.id, event_data.recording.date);
		},
		generateHtmlNotification: function (event_data, attachment) {
			return (
				'<p>' + this.getNameOrType(true, true, true) + ' recorded movement at ' + moment(event_data.recording.date).format('h:mm a on dddd, MMMM Do.') + '</p>' +
				'<p>' +
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
	});
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
				'<p>' + this.getNameOrType(true, true, true) + ' recorded movement at ' + moment(event_data.recording.date).format('h:mm a on dddd, MMMM Do.') + '</p>' +
				'<p>' +
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
