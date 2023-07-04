const moment = require('moment'),
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	AccountsManager = require('../accounts/accounts-manager.js'),
	DevicesManager = require('../devices/devices-manager.js'),
	ScenesManager = require('../scenes/scenes-manager.js'),
	Notifications = require('../notifications.js'),
	ONE_SECOND_IN_MILLISECONDS = 1000,
	services_subscribed_to = new Map(),
	TAG = '[Automator]';

class Automator {
	constructor () {
		this._startDateEmitter();
	}

	_startDateEmitter () {
		if (this.dateEmitter instanceof EventEmitter2) {
			return;
		}

		const updateCurrentDate = () => this.now = moment().utc().startOf('minute');

		this.dateEmitter = new EventEmitter2({wildcard: true, newListener: false, maxListeners: 0});
		updateCurrentDate();

		setInterval(() => {
			// Check to see if a minute has passed since last minute was announced.
			if (this.now.isSame(moment().utc(), 'minute')) {
				return;
			}

			updateCurrentDate();
			this.dateEmitter.emit([this.now.format(), '*'], {date: this.now});
		}, ONE_SECOND_IN_MILLISECONDS);
	}

	setUpAutomation (automation) {
		const services_subscribed_to_for_automation = services_subscribed_to.get(automation.id) || new Set();

		console.log(TAG, "setUpAutomation:", automation);
		// Make sure the list of services subscribed to for this automation is saved to services_subscribed_to (in case it was newly created).
		services_subscribed_to.set(automation.id, services_subscribed_to_for_automation);

		automation.triggers.forEach((trigger) => {
			const run = (event_data = {}, trigger_data = {}) => {
<<<<<<< HEAD
					// console.log(TAG, "triggers:", trigger, trigger_data);
=======
					console.log(TAG, "triggers:", trigger, trigger_data);
>>>>>>> 70ee17dbff37ffd959c7a656e7fa5a71e9deefa5
					const triggered_date = moment(event_data.date).utc();

					this.runAutomation(automation, {
						...trigger_data,
						trigger,
						event_data,
						date: triggered_date.isValid()
							? triggered_date // Use the date from the event data if it's valid.
							: moment().utc() // Otherwise, use the current date.
					});
				};

			switch (trigger.type) {
				case 'event':

					console.log(TAG, "incoming event:", trigger);
					const service = DevicesManager.getServiceById(trigger.service_id, automation.account_id);

					if (!service) {
						console.error(TAG, automation.id, 'Tried to subscribe to service events, but the service was not found.');
						return;
					}

					service.on([trigger.event, automation.id], (event_data) => run(event_data, {service}));

					services_subscribed_to_for_automation.add(service.id);
					break;
				case 'date':
					this.dateEmitter.on([moment(trigger.date).utc().startOf('minute').format(), automation.id], run);
					break;
				case 'time-of-day':
					const listenForDate = () => {
							const date_emitter_event = [automation.getNextTimeOfDayDate(trigger).startOf('minute').format(), automation.id];

							this.dateEmitter.on(date_emitter_event, (event_data) => {
								run(event_data);

								// Clean up the listener that fired this.
								this.dateEmitter.removeAllListeners(date_emitter_event);

								// Repeat the trigger the next day.
								listenForDate();
							});
						};

					listenForDate();
					break;
			}
		});
	}

	tearDownAutomation (automation) {
		const services_subscribed_to_for_automation = services_subscribed_to.get(automation.id) || new Set();

		// Remove service listeners.
		services_subscribed_to_for_automation.forEach((service_id) => {
			const service = DevicesManager.getServiceById(service_id, automation.account_id);

			if (!service) {
				console.error(TAG, automation.id, 'Tried to unsubscribe from service events, but the service was not found.');
				return;
			}

			service.off(['*', automation.id]);
		});

		services_subscribed_to_for_automation.clear();

		// Remove date listeners.
		this.dateEmitter.removeAllListeners(['*', automation.id]);
	}

	// At any point during checking conditions, if the conditions object is not
	// well-formed (unknown condition type, etc.), it should fail. It's better
	// to do nothing when there's a problem than to possibly do the wrong thing.
	checkConditions (conditions = [], trigger_data, account) {
		const any_conditions_failed = conditions.some((condition = {}) => {
				// This function should return true if the condition fails.
				switch (condition.type) {
					case 'day-of-week':
						return !(condition.days && condition.days.includes && condition.days.includes(trigger_data.date.isoWeekday()));
					case 'armed':
						return account.armed !== condition.mode;
					default:
						// Fail by default.
						return true;
				}
			});

		return !any_conditions_failed;
	}

	runAutomation (automation, trigger_data) {
<<<<<<< HEAD
		// console.log(TAG, "runAutomation:", automation, trigger_data);
=======
		console.log(TAG, "runAutomation:", automation, trigger_data);
>>>>>>> 70ee17dbff37ffd959c7a656e7fa5a71e9deefa5
		const account = AccountsManager.getAccountById(automation.account_id);

		if (!automation.is_enabled || !this.checkConditions(automation.conditions, trigger_data, account)) {
			return;
		}

		automation.scenes.forEach((scene_id) => {
			console.log(TAG, automation.id, 'Setting scene:', scene_id);

			ScenesManager.setScene(scene_id, automation.account_id, trigger_data.event_data.service_values);
		});

		automation.notifications.forEach((notification) => {
			const content = this.generateNotificationContent(trigger_data, notification, automation);

			Notifications.sendNotification(
				notification.type,
				{
					account_id: notification.account_id,
					email: notification.email,
					phone_number: notification.phone_number,
					phone_provider: notification.phone_provider
				},
				content.subject,
				content.body,
				content.attachments
			);
		});

		automation.actions.forEach((action) => {
			// console.log("!!!! ---- runAutomation ---- !!!!", action);
			const service = DevicesManager.getServiceById(action.service_id, automation.account_id);
			service._deviceEmitAction('action', {property: action.action, value:true});
				// this.deviceEmit('action', {property, value}, (error, data) => {
		});
	}

	generateNotificationContent (trigger_data, notification, automation) {
		const {trigger, service, date, event_data} = trigger_data;
		let subject, body, attachment;

		switch (trigger.type) {
			case 'time-of-day':
			case 'date':
				subject = 'Triggered at ' + date.clone().local().format('h:mm a');
				body = this.getAutomationNameOrGeneric(automation) + ' was triggered at ' + date.clone().local().format('h:mm a on dddd, MMMM Do') + '.';
				break;
			case 'event':
				const default_event_description = 'The "' + service.getFriendlyEventName(trigger.event) + '" event on ' + service.getNameOrType(true, false, true) + ' triggered ' + this.getAutomationNameOrGeneric(automation, false) + '.';

				attachment = service.getEventAttachment(trigger.event, event_data);
				subject = service.getFriendlyEventName(trigger.event) + ' (' + service.getNameOrType() + ')';

				body = {
					text: service.getEventDescription(trigger.event, event_data) || default_event_description,
					html: service.getEventHtmlDescription(trigger.event, event_data, attachment) || default_event_description
				};

				break;
		}

		// Sanitize attachment for text messages.
		if (attachment && notification.type === 'sms') {
			delete attachment.cid;
		}

		if (notification.message && typeof notification.message === 'string') {
			body = notification.message;
		}

		return {
			subject: (process.env.OA_APP_NAME ? process.env.OA_APP_NAME + ' - ' : '') + subject + ' - ' + (automation.name ? automation.name : 'Automation'),
			body,
			attachments: attachment && [attachment]
		};
	}

	getAutomationNameOrGeneric (automation, capitalized = true) {
		const the = capitalized ? 'The' : 'the',
			an = capitalized ? 'An' : 'an';

		return automation.name
			? the + ' "' + automation.name + '" automation'
			: an + ' automation';
	}
}

module.exports = Automator;
