const Service = require('./service.js'),
	TAG = '[ThermostatService]';

class ThermostatService extends Service {
	constructor (data, driverClass) {
		super(data);

		this.type = 'thermostat';

		//this.setSettings(data.settings || {});

		this.driver = new driverClass(this.id);
		this.subscribeToDriver();
	}

	subscribeToDriver () {}

	setTemp(temp, mode, hold) {
		this.driver.setTemp (temp, mode, hold);
	}

	fanMode (Mode) {
		this.driver.fanMode (mode);
	}
	/*
	serialize () {
		return {
			...Service.prototype.serialize.apply(this, arguments)
		};
	}

	dbSerialize () {
		return this.serialize();
	}

	clientSerialize () {
		return {
			...this.serialize(),
			streaming_token: this.device.token
		};
	}
*/
}

module.exports = ThermostatService;
