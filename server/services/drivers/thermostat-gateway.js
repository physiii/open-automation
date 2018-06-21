const GatewayServiceDriver = require('./gateway.js');

class GatewayThermostatDriver extends GatewayServiceDriver {
  constructor (thermostatIp, gatewaySocket) {
    super(thermostatIp, 'thermostat', gatewaySocket);
  }

  setTemp (temp) {
    return new Promise((resolve, reject) => {
      this.gatewayEmit('thermostat/temp/set', {temp: temp}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  setSysMode (mode) {return;}

	setHoldMode (mode) {return;}

  fanMode (mode) {
    return new Promise((resolve, reject) => {
      this.gatewayEmit('thermostat/fanMode', {mode: mode}, (error, data) => {
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
