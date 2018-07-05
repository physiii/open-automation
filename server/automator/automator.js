const database = require('../database.js'),
	moment = require('moment'),
	Automation = require('./automation.js'),
	SceneManager = require('../scenes/scene-manager.js'),
	automationsList = new Map(),
	POLLING_DELAY = 1 * 1000,
	TAG = '[Automator.js]';

class Automator {
	constructor () {
		this.currentDate = moment().format('MMMM Do YYYY');
		this.currentWeekday = moment().format('dddd');
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
				self.currentWeekday = moment().format('dddd');
			};

			self.currentTime = moment().format('h:mm a');

		}, POLLING_DELAY, this);
	}

	checkAutomations (automation) {
		let scenes = SceneManager.getSceneById(automation.scenes.id);

		if (!scenes) {
			scenes = 'none';
		};

		for (let i = 0; i < automation.triggers.length; i++) {
			let trigger = automation.triggers[i];

			if (trigger.time != this.currentTime) return;
			if (!trigger.date || trigger.date != this.currentDate) return;

			switch (trigger.type) {
				case 'time-of-day':
					this.timeTrigger(automation, scenes);
					break;
				case 'date':
					this.dateTrigger(automation, scenes);
					break;
				case 'state':
					break;
				case 'NFC-tag':
					break;
				default:
					break;
			};
		};
	}

	// checkConditions (automation, triggerType) {
	// 	return new Promise ((resolve, reject) => {
	// 		if (automation.conditions.length > 0){
	// 			for (let i = 0; i < automation.conditions.length; i++) {
	// 				let conditions = automation.conditions[i];
	//
	// 				if (conditions.type === triggerType) {
	// 					return resolve(conditions);
	// 				};
	// 				return resolve('no-match');
	// 			};
	// 		};
	// 		return resolve('no-conditions');
	// 	});
	// }

	// Trigger Functions-----------------------------
	dateTrigger (automation, conditions) {
		//TODO: Run Scene on specified date
		return;
	}

	timeTrigger (automation, conditions) {
		//TODO: If no conditions go ahead and run action at appropriate time/date
		//TODO: Else check against conditions to make sure all match.
		return;
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
