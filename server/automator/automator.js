const database = require('../database.js'),
	Automation = require('./automation.js'),
	automationsList = new Map(),
	TAG = '[Automator.js]';

class Automator {
	constructor () {
	}

	addAutomation (data) {
		let automation = this.getAutomationById(data.id,null,true);

		if (automation) {
			return automation;
		}

		automation = new Automation(data);

		automationsList.set(automation.id, automation);
	}

	createAutomation (data) {
		return new Promise((resolve, reject) => {
			const automation = this.addAutomation(data);

//TODO: Need Database functionality for creating automations

			database.saveAutomation(automation.dbSerialize()).then(() => {
				resolve(automation);
			}).catch(reject);
		});
	}


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

	getAutomationById (automationId, accountId, skipAccountAccessCheck) {
		const automation = automationsList.get(automationId);

		//Verify account has the access to the automations
		if ((automation && (automation.location === accountId)) || skipAccountAccessCheck) {
			return automation;
		}

	}

	loadAutomationsFromDb () {
		return new Promise((resolve, reject) => {
			database.getAutomations().then((automations) => {
				automationsList.clear();

				automations.forEach((automation) => {
					this.addAutomation(automation)
				});

				resolve(automationsList);
			}).catch((error) => {
				reject(error);
			});
		});
	}
}

module.exports = new Automation();
