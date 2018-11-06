const constants = require('../../../../constants.js'),
	uuidv4 = require('uuid/v4'),
	TAG = '[GenericServiceAdapter]';

class GenericServiceAdapter {
	constructor (data, socket_facade, events) {
		this._handleState = this._handleState.bind(this);

		this.id = data.id || uuidv4();
		this.type = this.constructor.relay_type || data.type;
		this.generic_id = data.generic_id;
		this.generic_type = this.constructor.generic_type || data.generic_type;
		this.state = {...data.state};
		this.socket = socket_facade;
		this._events = events;

		this._subscribeToSocket();
	}

	_subscribeToSocket () {
		this.socket.on('service/state', this._handleState);
	}

	_handleState (data) {
		if (data.service_id !== this.generic_id) {
			return;
		}

		this.state = {...this._adaptState(data.state)};
		this._events.emit(this._getPrefixedEvent('state'), {state: {...this.state}});
	}

	_adaptState (state) {
		// Just pass through by default.
		return state;
	}

	// This gets called when a relay service listens for an event from the device.
	on (event, callback) {
		this._events.on(this._getPrefixedEvent(event), callback);
	}

	// This gets called when a relay service emits an event to the device.
	emit () {
		this.socket.emit(...this._adaptSocketEmit(...arguments));
	}

	_adaptSocketEmit (event, data, callback) {
		if (event === 'action') {
			return [
				event,
				{
					service_id: this.generic_id,
					property: data.property,
					value: data.value
				},
				callback
			];
		}

		return [event, data, callback];
	}

	_getPrefixedEvent (event) {
		return this.id + constants.SERVICE_EVENT_DELIMITER + this.type + constants.SERVICE_EVENT_DELIMITER + event;
	}

	dbSerialize () {
		return {
			id: this.generic_id,
			type: this.generic_type
		};
	}

	relaySerialize () {
		return {
			id: this.id,
			type: this.type,
			state: {...this.state}
		};
	}

	destroy () {
		this.socket.off('service/state', this._handleState);
	}
}

module.exports = GenericServiceAdapter;
