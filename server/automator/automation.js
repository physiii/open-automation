const uuid = require('uuid/v4'),
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

	serialize () {
		return {
			id: this.id,
			is_enabled: this.is_enabled,
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
}

module.exports = Automation;
