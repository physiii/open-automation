const database = require('../database.js'),
	moment = require('moment'),
	Automation = require('./automation.js'),
	DevicesManager = require('../devices/devices-manager.js'),
	ScenesManager = require('../scenes/scenes-manager.js'),
	Notifications = require('./notifications.js'),
	automations_list = new Map(),
	ONE_SECOND_IN_MILLISECONDS = 1000,
	TAG = '[Automator]';

class Automator {
	constructor () {
		this.init = this.init.bind(this);
	}

	init () {
		return new Promise((resolve, reject) => {
			this.loadAutomationsFromDb().then(() => {
				this.startCheckingDateTriggers();
				resolve();
			}).catch(reject);
		});
	}

	updateCurrentDate () {
		this.now = moment().utc();
	}

	startCheckingDateTriggers () {
		this.updateCurrentDate();

		setInterval(() => {
			// Check to see if the minute changed.
			if (this.now.isSame(moment().utc(), 'minute')) {
				return;
			}

			this.updateCurrentDate();
			this.runDateAutomations();
		}, ONE_SECOND_IN_MILLISECONDS);
	}

	runDateAutomations () {
		console.log(TAG, 'Check Automations', this.now.toISOString());

		automations_list.forEach((automation) => {
			automation.triggers.forEach((trigger) => {
				const trigger_checks = {
					'time-of-day': moment(this.now).utc().startOf('day').add(trigger.time, 'minutes').isSame(this.now, 'minute'),
					'date': moment(trigger.date).utc().isSame(this.now, 'minute')
				};

				if (trigger_checks[trigger.type]) {
					this.runAutomation(automation);
				}
			});
		});
	}

	setUpTriggers (automation) {
		automation.triggers.forEach((trigger) => {
			if (trigger.type === 'event') {
				const service = DevicesManager.getServiceById(trigger.service_id, automation.account_id);

				if (!service) {
					console.error(TAG, automation.id, 'Tried to subscribe to service events, but the service was not found.');
					return;
				}

				service.on(trigger.event + '.' +  automation.id, (event_data) => {
					this.runAutomation(automation, event_data);
				});
			}
		});
	}

	tearDownTriggers (automation) {
		automation.triggers.forEach((trigger) => {
			if (trigger.type === 'event') {
				const service = DevicesManager.getServiceById(trigger.service_id, automation.account_id);

				if (!service) {
					console.error(TAG, automation.id, 'Tried to unsubscribe from service events, but the service was not found.');
					return;
				}

				service.off(trigger.event + '.' + automation.id);
			}
		});
	}

	// At any point during checking conditions, if the conditions object is not
	// well-formed (unknown condition type, etc.), it should fail. It's better
	// to do nothing when there's a problem than to possibly do the wrong thing.
	checkConditions (conditions = []) {
		const any_conditions_failed = conditions.some((condition = {}) => {
			// This function should return true if the condition fails.
			switch (condition.type) {
				case 'day-of-week':
					return !(condition.days && condition.days.includes && condition.days.includes(this.now.isoWeekday()));
				default:
					// Fail by default.
					return true;
			}
		});

		return !any_conditions_failed;
	}

	runAutomation (automation, event_data = {}) {
		if (!automation.is_enabled || !this.checkConditions(automation.conditions)) {
			return;
		}

		automation.scenes.forEach((scene_id) => {
			console.log(TAG, automation.id, 'Setting scene:', scene_id);

			ScenesManager.setScene(scene_id, automation.account_id);
		});

		automation.notifications.forEach((notification) => {
			Notifications.sendNotification(event_data, notification, automation.account_id);
		});
	}

	addAutomation (data) {
		let automation = this.getAutomationById(data.id, null, true);

		if (automation) {
			return automation;
		}

		automation = new Automation(data);
		automations_list.set(automation.id, automation);

		this.setUpTriggers(automation);

		return automation;
	}

	createAutomation (data) {
		return new Promise((resolve, reject) => {
			const automation = this.addAutomation(data);

			database.saveAutomation(automation.serialize()).then(() => {
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
				this.tearDownTriggers(automation);

				automations_list.delete(automation_id);

				resolve();
			}).catch(reject);
		});
	}

	// NOTE: Use skip_account_access_check with caution. Never use for requests
	// originating from the client API.
	getAutomationById (automation_id, account_id, skip_account_access_check) {
		const automation = automations_list.get(automation_id);

		// Verify account has the access to the automations.
		if ((automation && (automation.account_id === account_id)) || skip_account_access_check) {
			return automation;
		}
	}

	loadAutomationsFromDb () {
		return new Promise((resolve, reject) => {
			database.getAutomations().then((automations) => {
				automations_list.clear();

				automations.forEach((automation) => {
					this.addAutomation(automation)
				});

				resolve(automations_list);
			}).catch((error) => {
				reject(error);
			});
		});
	}
}

module.exports = new Automator();
