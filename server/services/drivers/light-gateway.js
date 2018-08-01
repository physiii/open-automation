const GatewayServiceDriver = require('./gateway.js'),
	TAG = '[GatewayLightDriver]';

class GatewayLightDriver extends GatewayServiceDriver {
	constructor (light_id, gateway_socket) {
		super(light_id, 'light', gateway_socket);
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
			this.gatewayEmit('brightness/set', {brightness}, (error, data) => {
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
			this.gatewayEmit('color/set', {color}, (error, data) => {
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
			this.gatewayEmit('name/set', {name}, (error, data) => {
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
