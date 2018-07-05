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
				console.log(TAG,'Time unchanged');
				return;
			};
			//Iterate over Asutomations for trigger activations.
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
		//let scenes = SceneManager.getSceneById(automation.scenes.id);
		for (let i = 0; i < automation.triggers.length; i++) {
			let trigger = automation.triggers[i];
			switch (trigger.type) {
				case 'time-of-day':
					if (trigger.time == this.currentTime) {
						this.checkConditions(automation, trigger.type).then((conditions) => {
							this.runTrigger(automation, conditions, scenes);
						});
					};
					break;
				case 'date':
					if (trigger.date ==this.currentDate && trigger.time == this.currentTime) {
						this.checkConditions(automation, trigger.type).then((conditions) => {
							this.runTrigger(automation, conditions, scenes);
						});
					};
					break;
				case 'state':
					break;
				default:
					break;
			};
		};
	}

	checkConditions (automation, triggerType) {
		return new Promise ((resolve, reject) => {
			for (let i = 0; i < automation.conditions.length; i++) {
				let conditions = automation.conditions[i];
				if (conditions.type === triggerType) {
					return resolve(conditions);
				}
				resolve();
			};
		});
	}

	runTrigger (automation, conditions) {
		//TODO: If no conditions go ahead and run action at appropriate time/date
		//TODO: Else check against conditions to make sure all match.
		return;
	}


	addAutomation (data) {
		let automation = this.getAutomationById(data.id,null,true);

		if (automation) {
			return automation;
		};
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

module.exports = new Automator();
