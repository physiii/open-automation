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
		if (data.service_id) {
			this.socket.emit(event, {...data.payload, id: this.service_ids.get(data.service_id)}, callback);
		} else {
			this.socket.emit(event, data, callback);
		}
	}

	_setUpServices (services) {
		services.forEach((service) => {
			const device_service = this._getServiceByGenericId(service.id);

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
		this.socket.on('connect', () => {
			console.log(TAG, 'Driver in use');
			this.device_events.emit('connect');
		});
		this.socket.on('disconnect', () => this.device_events.emit('disconnect'));
		this.socket.on('load', (device) => {
			this._setUpServices(device.services);
			this._emitLoadToRelay();
		});
		this.socket.on('service/state', this._handleServiceState);
		//this.socket.on('button/pressed', this._handleButtonPress);
	}

	_handleServiceState (data) {
		const device_service = this._getServiceByGenericId(data.id),
			new_state = {...data.state};

		if (!device_service) {
			return console.log(TAG, "State Event. No Service Found");
		} else if (device_service.state != data.state) {

			if (device_service.type === 'contact-sensor') {
				let event_name;

				if (data.state.contact === 0) { // Closed
					new_state.contact = true;
					event_name = 'closed';
				} else if (data.state.contact === 1) { // Open
					new_state.contact = false;
					event_name = 'open';
				} else { // Unknown
					new_state.contact = null;
				}

				if (event_name && device_service.state.contact !== data.state.contact) {
					this._serviceEmit(device_service, event_name);
				}
			}

			device_service.state = data.state;

			this._serviceEmit(device_service, 'state', {state: new_state});
		}
	}

	_handleButtonPress (data) {
		//const button_service = this._getServiceByGenericId(data.id);

		//if (!button_service) return;

		// Emit the pressed event to the service.
		console.log(TAG, "Button Pressed. Chirping Siren 3 times. . .")
		this.socket.emit('siren', {chirp:3});

	}


	_emitLoadToRelay () {
		this.device_events.emit('load', {
			device: {
				info: {manufacturer: 'Pyfi Technologies'},
				services: [...this.services]
			}
		});
	}

	_getServiceByGenericId (generic_id) {
		return this.services.find((service) => service.id === this.service_ids.get(generic_id));
	}

	_addService (type, generic_id, state, name) {
		const new_service = {
			id: uuidv4(),
			type,
			state,
			settings: {name}
		};

		if (new_service.type === 'contact_sensor') {
			new_service.type = 'contact-sensor';
		}

		this.services.push(new_service);
		this.service_ids.set(generic_id, new_service.id);
		this.service_ids.set(new_service.id, generic_id);
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
