const database = require('../database.js'),
	moment = require('moment'),
	Automation = require('./automation.js'),
	SceneManager = require('../scenes/scenes-manager.js'),
	automationsList = new Map(),
	POLLING_DELAY = 1 * 1000,
	DAY_OF_THE_WEEK = {
		Monday: 1,
		Tuesday: 2,
		Wednesday: 3,
		Thursday: 4,
		Friday: 5,
		Saturday: 6,
		Sunday: 7
	}
	TAG = '[Automator]';

class Automator {
	constructor () {
		this.currentDate = moment().format('MMMM Do YYYY');
		this.currentWeekday = DAY_OF_THE_WEEK[moment().format('dddd')];
		this.currentTime = moment().format('h:mm a');

		this.startPollingAutomations();
	}

	startPollingAutomations () {
		setInterval((self) => {
			//Check if new minute to iterate over automation triggers.
			if (self.currentTime == moment().format('h:mm a')) {
				return;
			};
			//Iterate over Automations for trigger activations.return
			automationsList.forEach((automation) => {
				checkAutomations(automation);
			});

			//Update Time and Date if needed.
			if (self.currentDate != moment().format('MMMM Do YYYY')) {
				self.currentDate = moment().format('MMMM Do YYYY');
				self.currentWeekday = DAY_OF_THE_WEEK[moment().format('dddd')];
			};

			self.currentTime = moment().format('h:mm a');

		}, POLLING_DELAY, this);
	}

	checkAutomations (automation) {
		for (let i = 0; i < automation.triggers.length; i++) {
			let trigger = automation.triggers[i];

			if (trigger.type === 'time-of-day') {
				return this.timeTrigger(automation, trigger);
			};
			if (trigger.type === 'date') {
				return this.dateTrigger(automation, trigger);
			};
			if (trigger.type === 'state') return;
			if (trigger.type === 'NFC-tag') return;

		};
	}

	// Trigger Functions-----------------------------
	dateTrigger (automation, trigger) {
		if (trigger.date != this.currentDate) return;
		if (trigger.time != this.currentTime) return;
		for (let i = 0; i < automation.scenes.length; i++) {
			let scene_id = automation.scenes[i];
			SceneManager.runAutomation(scene_id);
		};
		return;
	}

	timeTrigger (automation, trigger) {
		if (trigger.time != this.currentTime) return;

		if (automation.conditions) {
			let conditionsCheck = true;
			for (let i = 0; i < automation.conditions.length; i++) {
				conditionsCheck = this.checkConditions(automation.conditions[i]);
			};
			if (!conditionsCheck) return;
		};

		for (let i = 0; i < automation.scenes.length; i++) {
			let scene_id = automation.scenes[i];
			SceneManager.runAutomation(scene_id);
		};
	}

	stateTrigger () {
		return;
	}

	NFCTrigger () {
		return;
	}

	checkConditions (condition) {
		if (condition.type === 'day-of-week') {
			if (days.indexOf(this.currentWeekday) < 0) {
				return false;
			};
			return true;
		};
		if (condition.type === 'state') {
			return true;
		};
	}

	// Automator Configurations -------------------------
	addAutomation (data) {
		let automation = this.getAutomationById(data.id,null,true);

		if (automation) {
			return automation;
		};
		automation = new Automation(data);
		automationsList.set(automation.id, automation);
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

module.exports = new Automator();
