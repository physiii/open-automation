const EventEmitter = require('events'),
	DeviceDriver = require('../device-driver.js'),
	GenericServiceAdapter = require('./service-adapters/service-adapter.js'),
	service_adapter_classes = {
		'dimmer': require('./service-adapters/dimmer-adapter.js'),
		'alarm': require('./service-adapters/alarm-adapter.js'),
		'microphone': require('./service-adapters/microphone-adapter.js'),
		'motion': require('./service-adapters/motion-adapter.js'),
		'button': require('./service-adapters/button-adapter.js'),
		'global-alarm': require('./service-adapters/global-alarm-adapter.js')
	},
	TAG = '[GenericDeviceDriver]';

class GenericDeviceDriver extends DeviceDriver {
	constructor (data = {}, socket, device_id) {
		super(data, socket, device_id);

		this.service_adapters = new Map();
		this.service_relay_ids = new Map(data.service_relay_ids);
		this._events = new EventEmitter();
		this._socket_listeners = [];

		this._loadServiceAdapters(data.services);

		if (socket) {
			this.setSocket(socket);
		}

		this._socketOn('connect', () => this._events.emit('connect'));
		this._socketOn('disconnect', () => this._events.emit('disconnect'));
		this._socketOn('load', (device) => {
			this._loadServiceAdapters(device.services);
			this.save();
			this._emitLoadToRelay(device);
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

		DeviceDriver.prototype._subscribeToSocket.call(this, arguments);
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

	_loadServiceAdapters (services = []) {
		this.service_adapters.forEach((adapter) => adapter.destroy());
		this.service_adapters.clear();

		services.forEach(this._addServiceAdapter.bind(this));
	}

	_addServiceAdapter (data) {
		const adapter_class = service_adapter_classes[data.type] || GenericServiceAdapter,
			adapter = new adapter_class(
				{
					...data,
					id: this.service_relay_ids.get(data.id), // If there's already a relay service id for this generic id, use the existing id.
					generic_id: data.id,
					generic_type: data.type
				},
				{
					on: this._socketOn.bind(this),
					off: this._socketOff.bind(this),
					emit: this._socketEmit.bind(this)
				},
				this._events
			);

		this.service_adapters.set(adapter.id, adapter);
		this.service_relay_ids.set(adapter.generic_id, adapter.id);
	}

	_emitLoadToRelay (device) {
		this._events.emit('load', {
			device: {
				services: Array.from(this.service_adapters.values()).map((adapter) => adapter.relaySerialize()),
				info: {...device.info}
			}
		});
	}

	save () {
		this._events.emit('driver-data', {
			driver_data: {
				services: Array.from(this.service_adapters.values()).map((adapter) => adapter.dbSerialize()),
				service_relay_ids: [...this.service_relay_ids]
			}
		});
	}
}

module.exports = GenericDeviceDriver;
