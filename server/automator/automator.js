const database = require('../database.js'),
	Automation = require('./automation.js'),
	automationsList = new Map(),
	POLLING_DELAY_MINUTE = 60 * 1000,
	TAG = '[Automator.js]';

class Automator {
	constructor () {
		this.startPollingAutomations();
	}

	startPollingAutomations () {
		setInterval((self) => {
			return;
		}, POLLING_DELAY_MINUTE, this);
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

			database.saveAutomation(automation.dbSerialize()).then(() => {
				resolve(automation);
			}).catch(reject);
		});
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
