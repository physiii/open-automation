const uuid = require('uuid/v4'),
	database = require('../database.js'),
	TAG = '[Automation.js]';

class Automation {
	constructor (data) {
		this.id = data.id || uuid();
		this.is_enabled = data.is_enabled || false;
		this.triggers = data.triggers || [];
		this.conditions = data.conditions || [];
		this.scenes = data.scenes || [];

	}

	serialize () {
		return {
			id: this.id,
			opStatus: this.is_enabled,
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
