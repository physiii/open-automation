const uuidv4 = require('uuid/v4'),
	EventEmitter = require('events'),
	DeviceDriver = require('./device-driver.js'),
	BUTTON_HOLD_INTERVAL_DELAY = 300,
	COLORS = {
		red: [255, 0, 0],
		green: [0, 255, 0],
		blue: [0, 0, 255],
		purple: [255, 0, 255],
		yellow: [255, 255, 0],
		white: [255, 255, 255]
	},
	TAG = '[LigerDeviceDriver]';

class LigerDeviceDriver extends DeviceDriver {
	constructor (data = {}, socket, device_id, relay_services = []) {
		super(socket, device_id);

		this.service_ids = new Map(data.service_ids);
		this.services = relay_services;
		this.device_events = new EventEmitter();
		this.current_color;

		if (socket) {
			this.setSocket(socket);
		}

		this._handleButtonPress = this._handleButtonPress.bind(this);
	}

	init () {
		this._setUpServices();
		this._emitLoadToRelay();
	}

	on () {
		this.device_events.on.apply(this.device_events, arguments);
	}

	emit (event, data, callback, service_id, service_type) {
		if (!this.socket) {
			console.log(TAG, this.device_id, 'Tried to emit socket event "' + event + '" but the device does not have a socket.');
			callback('Device not connected');
			return;
		}

		if (!this.socket.connected) {
			console.log(TAG, this.device_id, 'Tried to emit socket event "' + event + '" but the socket is not connected.');
			callback('Device not connected');
			return;
		}

		// Map relay service events to corresponding messages to the liger.
		if (service_id) {
			this.socket.emit(event, {...data, id: this.service_ids.get(service_id)}, callback);
		} else {
			this.socket.emit(event, data, callback);
		}
	}

	_setUpServices () {
		if (!this._getServiceByLigerId('button-1')) {
			this._addService('button', 'button-1', 'Center Button');
		}

		if (!this._getServiceByLigerId('button-6')) {
			this._addService('button', 'button-6', 'Top Button');
		}

		if (!this._getServiceByLigerId('button-8')) {
			this._addService('button', 'button-8', 'Bottom Button');
		}

		if (!this._getServiceByLigerId('button-9')) {
			this._addService('button', 'button-9', 'Left Button');
		}

		if (!this._getServiceByLigerId('button-7')) {
			this._addService('button', 'button-7', 'Right Button');
		}

		if (!this._getServiceByLigerId('button-5')) {
			this._addService('button', 'button-5', 'Top-Left Button');
		}

		if (!this._getServiceByLigerId('button-2')) {
			this._addService('button', 'button-2', 'Top-Right Button');
		}

		if (!this._getServiceByLigerId('button-4')) {
			this._addService('button', 'button-4', 'Bottom-Left Button');
		}

		if (!this._getServiceByLigerId('button-3')) {
			this._addService('button', 'button-3', 'Bottom-Right Button');
		}

		this.save();
	}

	_subscribeToSocket () {
		// Map liger events to corresponding relay events.
		this.socket.on('connect', () => {
			this.device_events.emit('connect');
			this._emitLoadToRelay();
		});
		this.socket.on('disconnect', () => this.device_events.emit('disconnect'));
		this.socket.on('button/pressed', this._handleButtonPress);
	}

	_handleButtonPress (data) {
		const button_service = this._getServiceByLigerId('button-' + data.value);

		if (this.button_hold_interval) {
			clearInterval(this.button_hold_interval);
		}

		// Button release event.
		if (data.value === 0) {
			return;
		}

		if (!button_service) {
			return;
		}

		// Button color cycling left and right.
		if (data.value === 7) {
			this.current_color = this.setNextColor();
		} else if (data.value === 9) {
			this.current_color = this.setPrevColor();
		}

		// Emit the pressed event to the service.
		this._serviceEmit(button_service, 'pressed', {
			service_values: {
				light: {
					color: COLORS[this.current_color]
				}
			}
		});

		// Emit the pressed event repeatedly while the button is being pressed.
		if (data.value === 6 || data.value === 8) {
			this.button_hold_interval = setInterval(() => this._serviceEmit(button_service, 'pressed'), BUTTON_HOLD_INTERVAL_DELAY);
		}
	}

	setNextColor() {
		if (this.current_color === 'red') return 'green';
		if (this.current_color === 'green') return 'blue';
		if (this.current_color === 'blue') return 'purple';
		if (this.current_color === 'purple') return 'yellow';
		if (this.current_color === 'yellow') return 'white';
		if (this.current_color === 'white') return 'red';
		return 'white';
	}

	setPrevColor () {
		if (this.current_color === 'red') return 'white';
		if (this.current_color === 'green') return 'red';
		if (this.current_color === 'blue') return 'green';
		if (this.current_color === 'purple') return 'blue';
		if (this.current_color === 'yellow') return 'purple';
		if (this.current_color === 'white') return 'yellow';
		return 'white';
	}

	_emitLoadToRelay () {
		this.device_events.emit('load', {
			device: {
				info: {manufacturer: 'Pyfi Technologies'},
				services: [...this.services]
			}
		});
	}

	_getServiceByLigerId (liger_id) {
		return this.services.find((service) => service.id === this.service_ids.get(liger_id));
	}

	_addService (type, liger_id, name) {
		const new_service = {
			id: uuidv4(),
			type,
			settings: {name}
		};

		this.services.push(new_service);
		this.service_ids.set(liger_id, new_service.id);
		this.service_ids.set(new_service.id, liger_id);
	}

	_serviceEmit (service, event, data = {}) {
		this.device_events.emit(service.type + '/' + service.id + '/' + event, data);
	}

	save () {
		this.device_events.emit('driver-data', {
			driver_data: {
				service_ids: [...this.service_ids]
			}
		});
	}
}

module.exports = LigerDeviceDriver;
