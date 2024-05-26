const Service = require('./service.js'),
	TAG = "[ThermostatService]";

class ThermostatService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('presence', (event_data) => {
			this._emit('presence', event_data);
			console.log(TAG, "!! --- presence", event_data);
		});
		this.deviceOn('load', (event_data) => {
			console.log(TAG, "!! --- LOAD THERMOSTAT SERVICE --- !!", event_data.device.services[0].state);
			if (event_data.device.services[0].state.presence) {
				this._emit('presence', event_data);
			}
		});
		this.deviceOn('exit', (event_data) => this._emit('exit', event_data));
		this.deviceOn('contact', (event_data) => this._emit('contact', event_data));
		this.deviceOn('keypad', (event_data) => this._emit('keypad', event_data));
	}
	
	action (data) {
		switch (data.property) {
			case 'target_temp':
				return this.setHoldTemp(data.value);
			case 'mode':
				return this.setThermostatMode(data.value);
			case 'hold_mode':
				return this.setHoldMode(data.value);
			case 'fan_mode':
				return this.setFanMode(data.value);
		}
	}

	setThermostatMode (mode) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('mode/set', {mode}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	setHoldTemp (temp) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('hold-temp/set', {temp}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	setSchedule (temp) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('schedule/set', {temp}, (error, data) => {
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
			this.deviceEmit('holdMode/set', {mode}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	setPower (mode) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('power/set', {mode}, (error, data) => {
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
			this.deviceEmit('fanMode/set', {mode}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}
}

ThermostatService.type = 'thermostat';
ThermostatService.friendly_type = 'Thermostat';
ThermostatService.indefinite_article = 'A';

module.exports = ThermostatService;
