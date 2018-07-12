const database = require('../database.js'),
	moment = require('moment'),
	Automation = require('./automation.js'),
	ScenesManager = require('../scenes/scenes-manager.js'),
	automations_list = new Map(),
	ONE_SECOND_IN_MILLISECONDS = 1000,
	POLLING_DELAY = 60 * ONE_SECOND_IN_MILLISECONDS,
	TAG = '[Automator]';

class Automator {
	init () {
		this.loadAutomationsFromDb().then(() => {
			this.updateCurrentDate();

			const init_poll = setInterval(() => {
				// Check if new minute to start iterating over automation triggers.
				if (this.now.isSame(moment().utc(), 'minute')) {
					return;
				}

				clearInterval(init_poll);
				this.startCheckingDateTriggers();
			}, ONE_SECOND_IN_MILLISECONDS);
		});
	}

	updateCurrentDate () {
		this.now = moment().utc();
	}

	startCheckingDateTriggers () {
		this.updateCurrentDate();
		this.runDateAutomations();

		setInterval(() => {
			this.updateCurrentDate();
			this.runDateAutomations();
		}, POLLING_DELAY);
	}

	runDateAutomations () {
		console.log(TAG, 'Check Automations', this.now.toISOString());

		automations_list.forEach((automation) => {
			automation.triggers.forEach((trigger) => {
				const trigger_checks = {
					'time-of-day': moment(this.now).utc().startOf('day').add(trigger.time, 'minutes').isSame(this.now, 'minute'),
					'date': moment(trigger.date).utc().isSame(this.now, 'minute')
				};

				if (trigger_checks[trigger.type] && this.checkConditions(automation.conditions)) {
					this.runAutomation(automation);
				}
			});
		});
	}

	checkConditions (conditions = []) {
		const any_conditions_failed = conditions.some((condition) => {
			switch (condition.type) {
				case 'day-of-week':
					return condition.days.indexOf(this.now.isoWeekday()) < 0;
			}
		});

		return !any_conditions_failed;
	}

	runAutomation (automation) {
		automation.scenes.forEach((scene_id) => {
			console.log(TAG, 'Setting scene:', scene_id);

			ScenesManager.setScene(scene_id, automation.account_id);
		});
	}

	// Automator Configurations -------------------------
	addAutomation (data) {
		let automation = this.getAutomationById(data.id, null, true);

		if (automation) {
			return automation;
		}

		automation = new Automation(data);
		automations_list.set(automation.id, automation);
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
