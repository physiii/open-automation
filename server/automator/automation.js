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
