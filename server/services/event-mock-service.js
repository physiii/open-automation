const Service = require('./service.js'),
	EVENT_INTERVAL_DELAY = 5000;

class EventMockService extends Service {
	constructor (data, onUpdate) {
		super (data, onUpdate);

		this.type = 'event-mock';

		this.setState({connected: true});

		setInterval(() => {
			this.events.emit('mock.*', {date: Date()});
		}, EVENT_INTERVAL_DELAY);
	}
}

module.exports = EventMockService;
