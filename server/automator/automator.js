const database = require('../database.js'),
	moment = require('moment'),
	Automation = require('./automation.js'),
	SceneManager = require('../scenes/scenes-manager.js'),
	automationsList = new Map(),
	POLLING_DELAY = 60 * 1000,
	DAY_OF_THE_WEEK = {
		Monday: 1,
		Tuesday: 2,
		Wednesday: 3,
		Thursday: 4,
		Friday: 5,
		Saturday: 6,
		Sunday: 7
	},
	TAG = '[Automator]';

class Automator {
	constructor () {
		this.currentDate = moment().format('MMMM Do YYYY');
		this.currentWeekday = DAY_OF_THE_WEEK[moment().format('dddd')];
		this.currentTime = moment().format('h:mm a');

		this.initPollingAutomations();
	}

	initPollingAutomations () {
		this.checkAutomations();
		let init_poll = setInterval((self) => {
			//Check if new minute to iterate over automation triggers.
			if (self.currentTime == moment().format('h:mm a')) {
				return;
			};

			this.pollingAutomation();
			clearInterval(init_poll);

		}, 1000, this);
	}

	pollingAutomation () {
		self.currentTime = moment().format('h:mm a');
		this.checkAutomations();
		const automationPolling = setInterval((self) => {
			if (self.currentDate != moment().format('MMMM Do YYYY')) {
				self.currentDate = moment().format('MMMM Do YYYY');
				self.currentWeekday = DAY_OF_THE_WEEK[moment().format('dddd')];
			};

			self.currentTime = moment().format('h:mm a');

			this.checkAutomations();

		}, POLLING_DELAY, this);
	}

	checkAutomations () {
		console.log(TAG,"Check Automations", this.currentTime);
		automationsList.forEach((automation) => {
			for (let i = 0; i < automation.triggers.length; i++) {
				let trigger = automation.triggers[i];


				if (trigger.type === 'time-of-day') {
					if (trigger.time != this.currentTime) return;
					return this.timeTrigger(automation);
				};
				if (trigger.type === 'date') {
					if (trigger.date != this.currentDate) return;
					if (trigger.time != this.currentTime) return;
					return this.dateTrigger(automation);
				};
				if (trigger.type === 'state') return;
				if (trigger.type === 'NFC-tag') return;

			};
		});

	}

	// Trigger Functions-----------------------------
	dateTrigger (automation) {
		for (let i = 0; i < automation.scenes.length; i++) {
			let scene_id = automation.scenes[i];
			SceneManager.runAutomation(scene_id);
		};
		return;
	}

	timeTrigger (automation) {
		if (automation.conditions) {
			let checkConditions = this.checkConditions(automation.conditions);
			if (!checkConditions) return;
		};

		for (let i = 0; i < automation.scenes.length; i++) {
			console.log(TAG,'Running Automations for Scene:', automation.scenes[i]);
			SceneManager.runAutomation(automation.scenes[i]);
		};
	}

	stateTrigger () {
		return;
	}

	NFCTrigger () {
		return;
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

	checkConditions (conditions) {
		let conditionsCheck;

		for (let i = 0; i < conditions.length; i++) {
			if (conditions[i].type === 'day-of-week') {
				if (conditions[i].days.indexOf(this.currentWeekday) < 0) {
					return conditionsCheck = false;
				};
			};

			if (conditions[i].type === 'state') return;
		};

		return conditionsCheck = true;
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
