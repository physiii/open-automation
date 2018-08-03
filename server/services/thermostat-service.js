const Service = require('./service.js'),
	GatewayThermostatDriver = require('./drivers/thermostat-gateway.js'),
	TAG = '[ThermostatService]';

class ThermostatService extends Service {
	constructor (data, onUpdate, gateway_socket) {
		super(data, onUpdate);

		this.driver = new GatewayThermostatDriver(this.id, gateway_socket);
		this.subscribeToDriver();
	}

	subscribeToDriver () {}

	action (data) {
		switch (data.property) {
			case 'target_temp':
				this.setTemp(data.value);
				break;
			case 'set_mode':
				this.setThermostatMode(data.value);
				break;
			case 'set_hold':
				this.setHoldMode(data.value);
				break;
			case 'set_fan':
				this.setFanMode(data.value);
				break;
		}
	}

	setTemp (temp) {
		return this.driver.setTemp(temp);
	}

	setThermostatMode (mode) {
		return this.driver.setThermostatMode(mode);
	}

	setHoldMode (mode) {
		return this.driver.setHoldMode(mode);
	}

	setFanMode (mode) {
		return this.driver.setFanMode(mode);
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

ThermostatService.type = 'thermostat';
ThermostatService.friendly_type = 'Thermostat';
ThermostatService.indefinite_article = 'A';

module.exports = ThermostatService;
