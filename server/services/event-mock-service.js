const moment = require('moment'),
	Service = require('./service.js'),
	EVENT_INTERVAL_DELAY = 5000;

class EventMockService extends Service {
	constructor (data, onUpdate, deviceOn, deviceEmit, save) {
		super(data, onUpdate, deviceOn, deviceEmit, save);

		this.setState({connected: true});

		setInterval(() => {
			this._emit('mock', {date: Date()});
		}, EVENT_INTERVAL_DELAY);
	}
}

EventMockService.type = 'event-mock';
EventMockService.friendly_type = 'Event Mock';
EventMockService.indefinite_article = 'An';
EventMockService.event_strings = {
	'mock': {
		getFriendlyName: () => 'Event Mocked',
		getDescription: (event_data) => 'Event mock mocked at ' + moment(event_data.date).format('h:mm a on dddd, MMMM Do.')
	}
};

module.exports = EventMockService;
