const uuidv4 = require('uuid/v4'),
	EventEmitter = require('events'),
	DeviceDriver = require('../device-driver.js'),
	service_adapter_classes = {
		'dimmer': require('./service-adapters/dimmer-adapter.js')
	},
	TAG = '[GenericDeviceDriver]';

class GenericDeviceDriver extends DeviceDriver {
	constructor (data = {}, socket, device_id, relay_services = []) {
		super(socket, device_id);

		this.service_adapters = new Map();
		this.service_ids = new Map(data.service_ids);
		this._events = new EventEmitter();
		this._socket_listeners = [];

		if (socket) {
			this.setSocket(socket);
		}

		this._socketOn('connect', () => this._events.emit('connect'));
		this._socketOn('disconnect', () => this._events.emit('disconnect'));
		this._socketOn('load', (device) => {
			this._loadServiceAdapters(device.services);
			this._emitLoadToRelay();
		});
	}

	// This gets called when a relay device listens for an event from the hardware device.
	on (event, callback, service_id) {
		const service_adapter = this.service_adapters.get(service_id);

		if (service_id && service_adapter) {
			service_adapter.on(event, callback);
		} else {
			this._events.on(event, callback);
		}
	}

	// This gets called when a relay device emits an event to the hardware device.
	emit () {
		this._socketEmit(...arguments);
	}

	_subscribeToSocket () {
		// Set up listeners on new socket.
		this._socket_listeners.forEach((listener) => {
			this.socket.on(...listener);
		});
	}

	_socketOn () {
		this._socket_listeners.push(arguments);

		if (this.socket) {
			this.socket.on(...arguments);
		}
	}

	_socketOff (event, handler) {
		const listener = this._socket_listeners.find(([_event, _handler]) => _event === event && _handler === handler),
			index = this._socket_listeners.indexOf(listener);

		this._socket_listeners.splice(index, 1);

		if (this.socket) {
			this.socket.off(...arguments);
		}
	}

	_socketEmit (event, data, callback, service_id) {
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

		const service_adapter = this.service_adapters.get(service_id);

		if (service_id && service_adapter) {
			service_adapter.emit(event, data, callback);
		} else {
			this.socket.emit(event, data, callback);
		}
	}

	_loadServiceAdapters (services) {
		this.service_adapters.forEach((adapter) => adapter.destroy());
		this.service_adapters.clear();

		services.forEach(this._addServiceAdapter.bind(this));

		this.save();
	}

	_addServiceAdapter (data) {
		const adapter_class = service_adapter_classes[data.type],
			adapter = new adapter_class(
				{
					...data,
					id: this.service_ids.get(data.id), // If there's already a relay service id for this generic id, use the existing id.
					generic_id: data.id,
					generic_type: data.type
				},
				{
					on: this._socketOn.bind(this),
					off: this._socketOff.bind(this),
					emit: this._socketEmit.bind(this)
				}
			);

		this.service_adapters.set(adapter.id, adapter);
		this.service_ids.set(adapter.generic_id, adapter.id);
	}

	_emitLoadToRelay () {
		this._events.emit('load', {
			device: {
				info: {manufacturer: 'Pyfi Technologies'},
				services: Array.from(this.service_adapters.values()).map((adapter) => adapter.relaySerialize())
			}
		});
	}

	save () {
		this._events.emit('driver-data', {
			driver_data: {
				service_ids: [...this.service_ids]
			}
		});
	}
}

module.exports = GenericDeviceDriver;
