const moment = require('moment'),
	Service = require('./service.js');

class ContactSensorService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('open', () => this._emit('open'));
		this.deviceOn('closed', () => this._emit('closed'));
	}
}

ContactSensorService.type = 'contact-sensor';
ContactSensorService.friendly_type = 'Contact Sensor';
ContactSensorService.indefinite_article = 'A';

ContactSensorService.event_definitions = new Map([...Service.event_definitions])
	.set('open', {
		label: 'Machine Opened',
		generateNotification: function (event_data) {
			return 'Movement was detected on ' + this.getNameOrType(true, false, true) + ' opened at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	})
	.set('closed', {
		label: 'Machine Closed',
		generateNotification: function (event_data) {
			return 'Movement on ' + this.getNameOrType(true, false, true) + ' closed at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	});

ContactSensorService.event_strings = {
	'open': {
		getFriendlyName: () => 'Opened',
		getDescription: function (event_data) {
			return 'Movement was detected on ' + this.getNameOrType(true, false, true) + ' at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	},
	'closed': {
		getFriendlyName: () => 'Closed',
		getDescription: function (event_data) {
			return 'Movement on ' + this.getNameOrType(true, false, true) + ' stopped at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	}
};

module.exports = ContactSensorService;
