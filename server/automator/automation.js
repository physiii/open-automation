const uuid = require('uuid/v4'),
	moment = require('moment'),
	// TRIGGER_CHECKS = {
	// 	'time-of-day': (trigger, date) => moment(date).utc().startOf('day').add(trigger.time, 'minutes').isSame(date, 'minute'), // TODO: This probably doesn't work with DST.
	// 	'date': (trigger, date) => moment(trigger.date).utc().isSame(date, 'minute') // TODO: Make sure this works with DST.
	// },
	TAG = '[Automation]';

class Automation {
	constructor (data) {
		this.id = data.id || uuid();
		this.is_enabled = data.is_enabled || false;
		this.name = data.name || '';
		this.account_id = data.account_id;
		this.triggers = data.triggers || [];
		this.conditions = data.conditions || [];
		this.scenes = data.scenes || [];
		this.notifications = data.notifications || [];
	}

	// checkIfDateShouldTrigger (date) {
	// 	return this.triggers.find((trigger) => {
	// 		const triggerChecker = TRIGGER_CHECKS[trigger.type];

	// 		if (typeof triggerChecker !== 'function') {
	// 			return false;
	// 		}

	// 		return triggerChecker(trigger, date);
	// 	});
	// }

	getNextTimeOfDayDate (trigger) {
		if (!trigger || trigger.type !== 'time-of-day' || !Number.isInteger(trigger.time)) {
			throw new Error('A valid time-of-day trigger must be provided.');
		}

		const date = moment().utc(),
			getNextDate = (_date) => _date.startOf('day').add(trigger.time, 'minutes').startOf('minute');

		let next_date = getNextDate(date);

		if (next_date.isSameOrBefore(new Date())) {
			next_date = getNextDate(date.add(1, 'day'));
		}

		return next_date;
	}

	serialize () {
		return {
			id: this.id,
			is_enabled: this.is_enabled,
			name: this.name,
			account_id: this.account_id,
			triggers: this.triggers,
			conditions: this.conditions,
			scenes: this.scenes,
			notifications: this.notifications
		};
	}

	dbSerialize () {
		return {
			...this.serialize()
		};
	}

	clientSerialize () {
		return {
			...this.serialize()
		};
	}
}

module.exports = Automation;
