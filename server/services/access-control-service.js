const Service = require('./service.js'),
	moment = require('moment'),
	TAG = "[AccessControlService]";

class AccessControlService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('presence', (event_data) => {
			this._emit('presence', event_data);
			console.log(TAG, "!! --- presence", event_data);
		});
		this.deviceOn('load', (event_data) => {
			console.log(TAG, "!! --- LOAD FROM ACCESS CONTROL SERVICE --- !!", event_data.device.services[0].state.presence);
			if (event_data.device.services[0].state.presence) {
				this._emit('presence', event_data);
			}
		});
		this.deviceOn('exit', (event_data) => this._emit('exit', event_data));
		this.deviceOn('contact', (event_data) => this._emit('contact', event_data));
		this.deviceOn('keypad', (event_data) => this._emit('keypad', event_data));
	}
}

AccessControlService.type = 'access-control';
AccessControlService.friendly_type = 'AccessControl';
AccessControlService.indefinite_article = 'An';
AccessControlService.event_definitions = new Map([...Service.event_definitions])
	.set('presence', {
		label: 'Presence',
		generateNotification: function (event_data) {
			return 'Presence detected on ' + this.getNameOrType(true, false, true) + ' at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	})
	.set('exit', {
		label: 'Exit Button',
		generateNotification: function (event_data) {
			return 'Exit button used on ' + this.getNameOrType(true, false, true) + ' stopped at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	})
	.set('contact', {
		label: 'Contact',
		generateNotification: function (event_data) {
			return 'Contact opened on  ' + this.getNameOrType(true, false, true) + ' stopped at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	})
	.set('keypad', {
		label: 'Keypad',
		generateNotification: function (event_data) {
			return 'Keypad used on ' + this.getNameOrType(true, false, true) + ' stopped at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	});

AccessControlService.event_strings = {
	'presence': {
		getFriendlyName: () => 'Presence',
		getDescription: function (event_data) {
			return 'Presence detected on ' + this.getNameOrType(true, false, true) + ' at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	},
	'exit': {
		getFriendlyName: () => 'Exit Button',
		getDescription: function (event_data) {
			return 'Exit button used on ' + this.getNameOrType(true, false, true) + ' stopped at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	},
	'contact': {
		getFriendlyName: () => 'Contact',
		getDescription: function (event_data) {
			return 'Contact opened on ' + this.getNameOrType(true, false, true) + ' stopped at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	},
	'keypad': {
		getFriendlyName: () => 'Keypad',
		getDescription: function (event_data) {
			return 'Keypad used on ' + this.getNameOrType(true, false, true) + ' stopped at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.');
		}
	}
};


module.exports = AccessControlService;
