const uuidV4 = require('uuid').v4,
	utils = require('../utils.js'),
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	DeviceSettings = require('../devices/device-settings.js'),
	noOp = () => {},
	TAG = '[Service]';

class Service {
	constructor (data, onUpdate, deviceOn, deviceEmit, save) {
		this.id = data.id || uuidV4();
		this.type = this.constructor.type || data.type;
		this.device_id = data.device_id;

		this.events = new EventEmitter2({wildcard: true, newListener: false, maxListeners: 0});
		this.deviceOn = (event, callback) => deviceOn(event, callback, this.id, this.type);
		this.deviceEmit = (event, data, callback) => deviceEmit(event, data, callback, this.id, this.type);
		this.onUpdate = onUpdate;

		try {
			this.state_definitions = new Map(data.state_definitions);
		} catch (error) {
			this.state_definitions = new Map(...this.constructor.state_definitions);
		}

		this.settings = new DeviceSettings(
			data.settings,
			data.settings_definitions,
			this.constructor.settings_definitions,
			this.deviceEmit,
			save
		);

		this.setState(data.state);

		this.subscribeToDevice();
	}

	subscribeToDevice () {
		// this.deviceOn('state', ({state}) => this.setState(state));
		this.deviceOn('state', ({state}) => {
			// console.log(TAG, "!! ---- STATE", state);
			this.setState(state);
			this._emit('load', state);
		});
		this.deviceOn('load', ({state}) => {
			// console.log(TAG, "!! ---- load ---- !!", state);
		});
		this.deviceOn('settings/get', (data, callback = noOp) => callback(null, {settings: this.settings.getAll()}));
		this.deviceOn('device/update', (data, callback = noOp) => {
			console.log(TAG, 'Received device/update event.');
		});
		this.deviceOn('access-control/presence', (data, callback = noOp) => {
			console.log(TAG, "!! ---- presence", data);
		});
	}

	on (event, listener) {
		this.events.on(event, listener);
	}

	off (event, listener) {
		if (listener) {
			this.events.off(event, listener);
		} else {
			this.events.removeAllListeners(event);
		}
	}

	_emit (event, data) {
		// console.log(TAG, "!! ---- emit ---- !!", event, data);
		this.events.emit(event, data);

		// Re-emit the event with a wildcard for listeners using wildcard
		// namespacing for convenient unsubscribing.
		this.events.emit([event, '*'], data);
	}

	update ({state, settings_definitions}) {
		// console.log(TAG, "!! ---- update ---- !!", state, settings_definitions);

		Object.keys(state).forEach(key => {
			if (state[key]) this._emit(key, state[key]);
			// console.log(TAG, "!! ---- emit ---- !!", key, state[key]);
		});
	
		if (state) {
			this.setState(state);
		}

		if (settings_definitions) {
			this.settings.setDefinitions(settings_definitions);
		}

		this.onUpdate();
	}

	setState (state) {
		if (!state) {
			return;
		}

		this.state = {...state};
	}

	setSettings (settings) {
		return this.settings.set(settings).then(this.onUpdate);
	}

	getLog () {
		return new Promise((resolve, reject) => {
			this.deviceEmit('log/get', {}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(data.log);
			});
		});
	}

	action (action) {
		return new Promise((resolve, reject) => {
			const property_definition = this.state_definitions.get(action.property) || {};

			// TODO: Error if no definition is found for the property.

			let setProperty = this[property_definition.setter];

			if (typeof setProperty === 'function') {
				setProperty = setProperty.bind(this);
			} else {
				setProperty = this._deviceEmitAction.bind(this, action.property);
			}


			switch (property_definition.type) {
				case 'boolean':
					this._performBooleanAction(action, setProperty);
					break;
				case 'percentage':
					this._performPercentageAction(action, setProperty);
					break;
				case 'color':
					this._performColorAction(action, setProperty);
					break;
				default:
					// TODO: Remove default case. Only perform an action if it matches state definitions.
					this._performAction(action.property, action.value, () => false, setProperty);
					break;
			}
		});
	}

	_performBooleanAction (action, setProperty) {
		if (action.toggle) {
			return setProperty(!this.state[action.property]);
		}

		return this._performAction(action.property, action.value, utils.validators.boolean(), setProperty);
	}

	_performPercentageAction (action, setProperty) {
		const current_value = this.state[action.property] || 0,
			error = utils.validators.percentage()(action.value, action.property);

		let value = action.value;

		if (error) {
			return this._actionValueError(action.property, error);
		}

		if (action.mode === 'add') {
			value = Math.min(current_value + action.value, 1);
		} else if (action.mode === 'subtract') {
			value = Math.max(current_value - action.value, 0);
		}

		return this._performAction(action.property, value, utils.validators.percentage(), setProperty);
	}

	_performColorAction (action, setProperty) {
		return this._performAction(action.property, action.value, utils.validators.color(), setProperty);
	}

	_performAction (property, value, validator, setProperty) {
		const error = validator(value, property);

		if (error) {
			return this._actionValueError(property, error);
		}

		return setProperty(value);
	}

	_actionValueError (property, error) {
		return new Promise((resolve, reject) => {
			const full_error = 'Action value for "' + property + '" is invalid. ' + error;

			console.log(TAG, this.id, full_error);
			reject(full_error);
		});
	}

	_deviceEmitAction (property, value) {
		return new Promise((resolve, reject) => {
			this.deviceEmit('action', {property, value}, (error, data) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});
	}

	getNameOrType (include_article, capitalized = true, quotation_marks) {
		const quot = quotation_marks ? '"' : '',
			name = this.settings.get('name');

		return name
			? quot + name + quot
			: ((include_article || '') && this.getIndefiniteArticle(capitalized) + ' ') + this.getFriendlyType(!include_article);
	}

	getFriendlyType (capitalized = true) {
		const type = this.constructor.friendly_type || this.type;

		return capitalized
			? type
			: type.toLowerCase();
	}

	getIndefiniteArticle (capitalized = true) {
		return capitalized
			? this.constructor.indefinite_article
			: this.constructor.indefinite_article.toLowerCase();
	}

	getFriendlyEventName (event) {
		const event_strings = this.constructor.event_strings;

		if (event_strings && event_strings[event] && typeof event_strings[event].getFriendlyName === 'function') {
			return event_strings[event].getFriendlyName.call(this)
		} else {
			return event;
		}
	}

	getEventDescription (event, event_data) {
		const event_strings = this.constructor.event_strings;

		if (event_strings && event_strings[event] && typeof event_strings[event].getDescription === 'function') {
			return event_strings[event].getDescription.call(this, event_data);
		}
	}

	getEventHtmlDescription (event, event_data, attachment) {
		const event_strings = this.constructor.event_strings;

		if (event_strings && event_strings[event] && typeof event_strings[event].getHtmlDescription === 'function') {
			return event_strings[event].getHtmlDescription.call(this, event_data, attachment);
		} else {
			const plain_text_description = this.getEventDescription(event, event_data);

			if (!plain_text_description) {
				return;
			}

			// Fall back to plain text description wraped in <p>.
			return '<p>' + plain_text_description + '</p>';
		}
	}

	getEventAttachment (event, event_data) {
		const event_strings = this.constructor.event_strings;

		if (event_strings && event_strings[event] && typeof event_strings[event].getAttachment === 'function') {
			return event_strings[event].getAttachment.call(this, event_data);
		}
	}

	serialize () {
		return {
			id: this.id,
			type: this.type,
			...this.settings.serialize()
		};
	}

	dbSerialize () {
		return this.serialize();
	}

	clientSerialize () {
		return {
			...this.serialize(),
			device_id: this.device_id,
			state: {...this.state},
			strings: {
				friendly_type: this.getFriendlyType(),
				indefinite_article: this.getIndefiniteArticle()
			},
			event_definitions: [...this.constructor.event_definitions.entries()].map(([event, definition]) => ([
				event,
				{label: definition.label}
			])),
			action_definitions: [...this.constructor.action_definitions.entries()].map(([action, definition]) => ([
				action,
				{label: definition.label}
			])),
			automator_supported: this.constructor.event_definitions.size > 0 || this.constructor.action_definitions.size > 0
		};
	}

	destroy () {
		this.events.removeAllListeners();
	}
}

Service.indefinite_article = 'A';
Service.settings_definitions = new Map()
	.set('name', {
		type: 'string',
		label: 'Name',
		validation: {
			max_length: 24
		}
	})
	.set('show_on_dashboard', {
		type: 'boolean',
		label: 'Show on Dashboard',
		default_value: true,
		validation: {is_required: false}
	});
Service.event_definitions = new Map();
Service.action_definitions = new Map();

module.exports = Service;
