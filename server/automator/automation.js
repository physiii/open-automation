const uuid = require('uuid/v4'),
	TAG = '[Automation.js]';

class Automation {
	constructor (data) {
		this.id = data.id || uuid();
		this.is_enabled = data.is_enabled || false;
		this.account_id = data.account_id;
		this.triggers = data.triggers || [];
		this.conditions = data.conditions || [];
		this.scenes = data.scenes || [];
	}

	serialize () {
		return {
			id: this.id,
			is_enabled: this.is_enabled,
			account_id: this.account_id,
			triggers: this.triggers,
			conditions: this.conditions,
			scenes: this.scenes
		};
	}

	dbSerialize () {
		return {
			...this.serialize()
		};
	}
}

module.exports = Automation;
