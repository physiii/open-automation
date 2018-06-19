const GatewayServiceDriver = require('./gateway.js');

class GatewayThermostatDriver extends GatewayServiceDriver {
  constructor (thermostatIp, gatewaySocket) {
    super(thermostatIp, 'thermostat', gatewaySocket);
  }

  setTemp (temp, mode, hold) {
    return new Promise((resolve, reject) => {
      this.gatewayEmit('thermostat/setTemp', {temp: temp, mode: mode, hold: hold}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

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

module.exports = GatewayThermostatDriver;
