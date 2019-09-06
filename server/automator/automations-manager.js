const EventEmitter = require('events'),
	database = require('../database.js'),
	Automation = require('./automation.js'),
	automations_list = new Map(),
	TAG = '[AutomationsManager]';

let is_initialized = false,
	automator = false;

class AutomationsManager extends EventEmitter {
	constructor () {
		super();

		this.init = this.init.bind(this);
		this.handleAutomationUpdate = this.handleAutomationUpdate.bind(this);
	}

	init (_automator) {
		return new Promise((resolve, reject) => {
			if (is_initialized) {
				reject('AutomationsManager is already initalized.');
				return;
			}

			automator = _automator;

			this._loadAutomationsFromDb().then(() => {
				is_initialized = true;

				resolve(this);
			}).catch(reject);
		});
	}

	_registerAutomation (automation) {
		if (!automation instanceof Automation) {
			console.error(TAG, 'automation must be an Automation instance.');
			return false;
		}

		const existing_automation = this.getAutomationById(automation.id, null, true);

		if (existing_automation) {
			if (this.verifyAccountAccessToAutomation(automation.account_id, existing_automation)) {
				return existing_automation;
			} else {
				return false;
			}
		}

		automations_list.set(automation.id, automation);
		automator.setUpAutomation(automation);

		this.handleAutomationUpdate(automation);

		return automation;
	}

	_deregisterAutomation (automation_id, account_id) {
		const automation = this.getAutomationById(automation_id, account_id);

		if (!automation) {
			return false;
		}

		automations_list.delete(automation.id);
		automator.tearDownAutomation(automation);

		return true;
	}

	// createAutomation (data) {
	// 	return new Promise((resolve, reject) => {
	// 		const automation = this._registerAutomation(data);

	// 		database.saveAutomation(automation.dbSerialize()).then(() => {
	// 			resolve(automation);
	// 		}).catch((error) => {
	// 			this._deregisterAutomation(automation.id, automation.account_id);
	// 			reject(error);
	// 		});
	// 	});
	// }

	saveAutomation (data) {
		return new Promise((resolve, reject) => {
			const automation = new Automation(data),
				existing_automation = this.getAutomationById(data.id, null, true),
				access_to_existing_automation = this.verifyAccountAccessToAutomation(data.account_id, existing_automation);

			if (existing_automation && !access_to_existing_automation) {
				reject('No automation belonging to that account was found with that ID.');
				return;
			}

			database.saveAutomation(automation.dbSerialize()).then(() => {
				if (existing_automation && access_to_existing_automation) {
					this._deregisterAutomation(data.id, data.account_id);
				}

				this._registerAutomation(automation);

				resolve(automation);
			}).catch(reject);
		});
	}

	deleteAutomation (automation_id, account_id) {
		return new Promise ((resolve, reject) => {
			const automation = this.getAutomationById(automation_id, account_id);

			if (!automation) {
				reject('No automation belonging to that account was found with that ID.');
				return;
			}

			database.deleteAutomation(automation_id).then(() => {
				this._deregisterAutomation(automation.id, automation.account_id);
				resolve();
			}).catch(reject);
		});
	}

	handleAutomationUpdate (automation) {
		const accountAutomations = this.getClientSerializedAutomations(this.getAutomationsByAccountId(automation.account_id));

		this.emit('automations-update/account/' + automation.account_id, {automations: accountAutomations});
	}

	// NOTE: Use skip_account_access_check with caution. Never use for requests
	// originating from the client API.
	getAutomationById (automation_id, account_id, skip_account_access_check) {
		const automation = automations_list.get(automation_id);

		// Verify account has the access to the automation.
		if (this.verifyAccountAccessToAutomation(account_id, automation, skip_account_access_check)) {
			return automation;
		}
	}

	getAutomationsByAccountId (account_id) {
		return Array.from(automations_list.values()).filter((automation) => automation.account_id === account_id);
	}

	// NOTE: Use "force" with caution. Never use for requests originating from
	// the client API.
	verifyAccountAccessToAutomation (account_id, automation, force) {
		return (automation && automation.account_id === account_id) || force;
	}

	// getAutomationsTriggeredByDate (date) {
	// 	return Array.from(automations_list.values()).map((automation) => {
	// 		const matching_trigger = automation.checkIfDateShouldTrigger(date);

	// 		if (!matching_trigger) {
	// 			return false;
	// 		}

	// 		return {
	// 			automation,
	// 			trigger: matching_trigger
	// 		};
	// 	}).filter((automation) => automation); // Filter out the automations without triggers matching the date.
	// }

	_loadAutomationsFromDb () {
		return new Promise((resolve, reject) => {
			database.getAutomations().then((automations) => {
				automations_list.clear();

				automations.forEach((automation) => {
					this._registerAutomation(new Automation(automation));
				});

				resolve(automations_list);
			}).catch((error) => {
				reject(error);
			});
		});
	}

	getClientSerializedAutomations (automations = []) {
		return automations.map((automation) => automation.clientSerialize());
	}
}

module.exports = new AutomationsManager();
