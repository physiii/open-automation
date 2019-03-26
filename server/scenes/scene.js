const uuid = require('uuid/v4'),
	TAG = '[Scene]';

class Scene {
	constructor (data) {
		this.id = data.id || uuid();
		this.account_id = data.account_id;
		this.type = data.type || '';
		this.actions = data.actions || [];
	}

	serialize () {
		return {
			id: this.id,
			account_id: this.account_id,
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
