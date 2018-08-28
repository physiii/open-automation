const uuidv4 = require('uuid/v4'),
	EventEmitter = require('events'),
	DeviceDriver = require('./device-driver.js'),
	TAG = '[GenericDeviceDriver]';

class GenericDeviceDriver extends DeviceDriver {
	constructor (data = {}, socket, device_id, relay_services = []) {
		super(socket, device_id);

		this.service_ids = new Map(data.service_ids);
		this.services = relay_services;
		this.device_events = new EventEmitter();

		if (socket) {
			this.setSocket(socket);
		}

		this._handleButtonPress = this._handleButtonPress.bind(this);
		this._handleServiceState = this._handleServiceState.bind(this);
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
		services.forEach((service) => {
			const device_service = this._getServiceByPyfiId(service.id);

			if (!device_service) {
				this._addService(service.type, service.id, service.state);
			} else {
				device_service.state = service.state;
			}
		});

		this.save();
	}

	_subscribeToSocket () {
		// Map events to corresponding relay events.
		this.socket.on('connect', () => this.device_events.emit('connect'));
		this.socket.on('disconnect', () => this.device_events.emit('disconnect'));
		this.socket.on('load', (services) => {
			this._setUpServices(services);
			this._emitLoadToRelay();
		});
		this.socket.on('service/state', this._handleServiceState);
		this.socket.on('button/pressed', this._handleButtonPress);
	}

	_handleServiceState (data) {
		const device_service = this._getServiceByPyfiId(data.id);

		if (!device_service) return;

		this._serviceEmit(device_service, 'state', {state: data.state});
	}

	_handleButtonPress (data) {
		const button_service = this._getServiceByPyfiId(data.id);

		if (!button_service) return;

		// Emit the pressed event to the service.
		this._serviceEmit(button_service, 'pressed');
	}


	_emitLoadToRelay () {
		this.device_events.emit('load', {
			device: {
				info: {manufacturer: 'Pyfi Technologies'},
				services: [...this.services]
			}
		});
	}

	_getServiceByPyfiId (pyfi_id) {
		return this.services.find((service) => service.id === this.service_ids.get(pyfi_id));
	}

	_addService (type, pyfi_id, state, name) {
		const new_service = {
			id: uuidv4(),
			type,
			state,
			settings: {name}
		};

		this.services.push(new_service);
		this.service_ids.set(pyfi_id, new_service.id);
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

module.exports = GenericDeviceDriver;
