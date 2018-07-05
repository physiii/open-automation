const uuid = require('uuid/v4'),
	database = require('../database.js'),
	TAG = '[Automation.js]';

class Automation {
	constructor (data) {
		this.id = data.id;
		this.is_enabled = data.is_enabled || false;
		this.triggers = data.triggers || [];
		this.conditions = data.conditions || [];
		this.scenes = data.scenes || [];

	}
}

module.exports = Automation;
