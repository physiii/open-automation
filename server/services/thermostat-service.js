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

	setTemp(temp) {
		return this.driver.setTemp (temp);
	}

	setThermostatMode (mode) {
		return this.driver.setThermostatMode(mode);
	}

	setHoldMode (mode) {
		return this.driver.setHoldMode(mode);
	}

	setFanMode (Mode) {
		return this.driver.setFanMode (mode);
	}

	serialize () {
		return {
			...Service.prototype.serialize.apply(this, arguments),
			ip: this.ip
		};
	}

	dbSerialize () {
		return this.serialize();
	}
}

module.exports = ThermostatService;
