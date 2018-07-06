const uuid = require('uuid/v4'),
	database = require('../database.js'),
	TAG = '[Scene.js]';

class Scene {
	constructor (data) {
		this.id = data.id || uuid();
		this.type = data.type || ''
		this.actions = data.actions || [];
	}

	serialize () {
		return {
			id: this.id,
			type: this.type,
			actions: this.actions
		};
	}

	dbSerialize () {
		return {
			...this.serialize()
		};
	}
}

module.exports = Scene;
