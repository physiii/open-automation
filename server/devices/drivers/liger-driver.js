const uuidv4 = require('uuid/v4'),
	EventEmitter = require('events'),
	DeviceDriver = require('./device-driver.js'),
	BUTTON_HOLD_INTERVAL_DELAY = 300,
	TAG = '[LigerDeviceDriver]';

class LigerDeviceDriver extends DeviceDriver {
	constructor (data = {}, socket, device_id, relay_services = []) {
		super(socket, device_id);

		this.service_ids = new Map(data.service_ids);
		this.services = relay_services;
		this.device_events = new EventEmitter();

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

	emit (event, data, callback) {
		// Map relay service events to corresponding messages to the liger.
		switch (event) {
			default:
				this.socket.emit(event, data, callback);
		}
	}

	_setUpServices (services) {
		if (!this._getServiceByLigerId('button-1')) {
			this._addService('button', 'button-1', 'Center Button');
		}

		if (!this._getServiceByLigerId('button-2')) {
			this._addService('button', 'button-2', 'Up-Right Button');
		}

		if (!this._getServiceByLigerId('button-3')) {
			this._addService('button', 'button-3', 'Down-Right Button');
		}

		if (!this._getServiceByLigerId('button-4')) {
			this._addService('button', 'button-4', 'Down-Left Button');
		}

		if (!this._getServiceByLigerId('button-5')) {
			this._addService('button', 'button-5', 'Up-Left Button');
		}

		if (!this._getServiceByLigerId('button-6')) {
			this._addService('button', 'button-6', 'Up Button');
		}

		if (!this._getServiceByLigerId('button-7')) {
			this._addService('button', 'button-7', 'Right Button');
		}

		if (!this._getServiceByLigerId('button-8')) {
			this._addService('button', 'button-8', 'Down Button');
		}

		if (!this._getServiceByLigerId('button-9')) {
			this._addService('button', 'button-9', 'Left Button');
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

		// Emit the pressed event to the service.
		this._serviceEmit(button_service, 'pressed');

		// Emit the pressed event repeatedly while the button is being pressed.
		this.button_hold_interval = setInterval(() => this._serviceEmit(button_service, 'pressed'), BUTTON_HOLD_INTERVAL_DELAY);
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
