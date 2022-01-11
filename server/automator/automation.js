const uuid = require('uuid/v4'),
	moment = require('moment'),
	TAG = '[Automation]';

class Automation {
	constructor (data) {
		this.id = data.id || uuid();
		this.is_enabled = data.is_enabled || false;
		this.type = data.type;
		this.source = data.source || {unknown: true};
		this.user_editable = data.user_editable || false;
		this.name = data.name || '';
		this.account_id = data.account_id;
		this.triggers = data.triggers || [];
		this.actions = data.actions || [];
		this.conditions = data.conditions || [];
		this.scenes = data.scenes || [];
		this.notifications = data.notifications || [];
	}

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
			type: this.type,
			source: this.source,
			user_editable: this.user_editable,
			name: this.name,
			account_id: this.account_id,
			triggers: this.triggers,
			actions: this.actions,
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
