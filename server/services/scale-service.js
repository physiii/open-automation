const Service = require('./service.js');

class ScaleService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('tare', (event_data) => {
			console.log(TAG, 'tare', event_data);
			this._emit('tare', event_data);
		});

		this.deviceOn('state', (event_data) => {
			// TODO: validate this value before passing it through
			console.log(TAG, 'state', event_data);
			this._emit(event_data.state.value, event_data);
		});

		this.deviceOn('load', (event_data) => {
			// TODO: validate this value before passing it through
			console.log(TAG, 'load', event_data);
			this._emit(event_data.state.value, event_data);
		});

		this.deviceOn('log', (event_data) => {
			// TODO: validate this value before passing it through
			console.log(TAG, 'log', event_data);
			this._emit(event_data.state.value, event_data);
		});

		this.events.on('tare', (event_data) => {
			let trigger_data = { state: { value: null } };

			console.log(TAG, 'tare', event_data);

			if (event_data.value > 0) {
				trigger_data.state.value = 'arm';
			} else {
				trigger_data.state.value = 'disarm';
			}

			// TODO: validate this value before passing it through
			this._emit(trigger_data.state.value, trigger_data);

			console.log(TAG, event_data, trigger_data);
		});
	}
}

ScaleService.type = 'scale';
ScaleService.friendly_type = 'Scale';
ScaleService.indefinite_article = 'A';
ScaleService.event_definitions = new Map([...Service.event_definitions])
	.set('ph-oor', {
		label: 'pH - Out Of Range',
		generateNotification: function (event_data) {
			return 'Movement was detected on ' + this.getNameOrType(true, false, true) + ' at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	})
	.set('temp-oor', {
		label: 'Temp - Out Of Range',
		generateNotification: function (event_data) {
			return 'Movement on ' + this.getNameOrType(true, false, true) + ' stopped at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	})
	.set('ec-oor', {
		label: 'EC - Out Of Range',
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
ScaleService.event_strings = {
	'ph-oor': {
		getFriendlyName: () => 'pH - Out Of Range',
		getDescription: function (event_data) {
			return 'Movement was detected on ' + this.getNameOrType(true, false, true) + ' at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	},
	'temp-oor': {
		getFriendlyName: () => 'Temp - Out Of Range',
		getDescription: function (event_data) {
			return 'Movement on ' + this.getNameOrType(true, false, true) + ' stopped at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	},
	'ec-oor': {
		getFriendlyName: () => 'EC - Out Of Range',
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


module.exports = ScaleService;
