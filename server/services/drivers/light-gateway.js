const GatewayServiceDriver = require('./gateway.js');

class GatewayLightDriver extends GatewayServiceDriver {
  constructor (lightId, gatewaySocket) {
    super(lightId, 'light', gatewaySocket);
  }

  lightOn () {
    return new Promise((resolve, reject) => {
      this.gatewayEmit('lightOn/set', {}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  lightOff () {
    return new Promise((resolve, reject) => {
      this.gatewayEmit('lightOff/set', {}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

	setBrightness (brightness) {
    return new Promise((resolve, reject) => {
      this.gatewayEmit('brightness/set', {brightness: brightness}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }


  setColor (color) {
    return new Promise((resolve, reject) => {
      this.gatewayEmit('color/set', {color: color}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  setLightName (name) {
    return new Promise((resolve, reject) => {
      this.gatewayEmit('name/set', {name: name}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

module.exports = GatewayLightDriver;
