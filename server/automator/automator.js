const database = require('../database.js'),
	Automation = require('./automation.js'),
	automationList = new Map(),
	TAG = '[Automator.js]';

class Automator {
	constructor () {

	}

	addAutomation () {}

	createAutomation () {}

	loadAutomationsFromDb () {}

	handleAutomationUpdate () {}

	activateTrigger (data) {
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
}

module.exports = new Automation();
