const GatewayServiceDriver = require('./gateway.js');

class GatewayThermostatDriver extends GatewayServiceDriver {
  constructor (thermostatId, gatewaySocket) {
    super(thermostatId, 'thermostat', gatewaySocket);
  }

  setThermostatMode (mode) {
    return new Promise((resolve, reject) => {
      this.gatewayEmit('mode/set', {mode: mode}, (error, data) => {
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
      this.gatewayEmit('temp/set', {temp: temp}, (error, data) => {
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
      this.gatewayEmit('holdMode/set', {mode: mode}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
  }

  setFanMode (mode) {
    return new Promise((resolve, reject) => {
      this.gatewayEmit('fanMode/set', {mode: mode}, (error, data) => {
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
