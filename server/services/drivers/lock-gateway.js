const GatewayServiceDriver = require('./gateway.js');

class GatewayLockDriver extends GatewayServiceDriver {
  constructor (lockId, gatewaySocket) {
    super(lockId, 'lock', gatewaySocket);
  }

  lock () {
    return new Promise((resolve, reject) => {
      this.gatewayEmit('lock/set', {}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  unlock () {
    return new Promise((resolve, reject) => {
      this.gatewayEmit('unlock/set', {}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  setRelockDelay (delay) {
    return new Promise((resolve, reject) => {
      this.gatewayEmit('relockDelay/set', {relock_delay: delay}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

module.exports = GatewayLockDriver;
