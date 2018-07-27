const GatewayServiceDriver = require('./gateway.js');

class GatewayThermostatDriver extends GatewayServiceDriver {
	constructor (thermostat_id, gateway_socket) {
		super(thermostat_id, 'thermostat', gateway_socket);
	}

	setThermostatMode (mode) {
		return new Promise((resolve, reject) => {
			this.gatewayEmit('mode/set', {mode}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	setTemp (temp) {
		return new Promise((resolve, reject) => {
			this.gatewayEmit('temp/set', {temp}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	setHoldMode (mode) {
		return new Promise((resolve, reject) => {
			this.gatewayEmit('holdMode/set', {mode}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	setFanMode (mode) {
		return new Promise((resolve, reject) => {
			this.gatewayEmit('fanMode/set', {mode}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}
}

module.exports = GatewayThermostatDriver;
