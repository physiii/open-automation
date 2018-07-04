const database = require('../database.js'),
	Automation = require('./automation.js'),
	automationList = new Map(),
	TAG = '[Automator.js]';

class Automator {
	constructor () {

	}

	addAutomation (data) {}

	createAutomation (data) {}

	handleAutomationUpdate () {}

	triggerAutomation (data) {
		switch (data.type) {
			case 'time-of-day':
				break;
			case 'date':
				break;
			case 'state':
				break;
			case 'NFC':
				break;
			default:
				break;
		}
	}

	loadAutomationsFromDb () {}
}

module.exports = new Automation();
