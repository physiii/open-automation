const Service = require('./service.js');

class GrowPodService extends Service {}

GrowPodService.type = 'grow-pod';
GrowPodService.friendly_type = 'GrowPod';
GrowPodService.indefinite_article = 'A';
GrowPodService.event_definitions = new Map([...Service.event_definitions])
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
GrowPodService.event_strings = {
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


module.exports = GrowPodService;
