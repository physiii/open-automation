const uuidv4 = require('uuid/v4'),
	utils = require('../utils.js'),
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	DeviceSettings = require('../devices/device-settings.js'),
	TAG = '[Service]';

class Service {
	constructor (data, onUpdate, deviceOn, deviceEmit, save) {
		this.id = data.id || uuidv4();
		this.type = this.constructor.type || data.type;
		this.device_id = data.device_id;

		const device_event_prefix = this.type + '/' + this.id + '/';

		this.events = new EventEmitter2({wildcard: true, newListener: false, maxListeners: 0});
		this.deviceOn = (event, callback) => deviceOn(device_event_prefix + event, callback);
		this.deviceEmit = (event, data, callback) => deviceEmit(device_event_prefix + event, data, callback);
		this.onUpdate = onUpdate;

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
		this.deviceOn('state', ({state}) => this.setState(state));
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
		this.events.emit(event, data);

		// Re-emit the event with a wildcard for listeners using wildcard
		// namespacing for convenient unsubscribing.
		this.events.emit([event, '*'], data);
	}

	update ({state, settings_definitions}) {
		if (state) {
			this.setState(state);
		}

		if (settings_definitions) {
			this.settings.setDefinitions(settings_definitions);
		}
	}

	setState (state) {
		if (!state) {
			return;
		}

		this.state = {...state};

		this.onUpdate();
	}

	setSettings (settings) {
		return this.settings.set(settings);
	}

	action (action) {
		const property_definition = this.constructor.state_definitions[action.property],
			setProperty = this[property_definition.setter].bind(this);

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
		}
	}

	_performBooleanAction (action, setProperty) {
		if (action.toggle) {
			return setProperty(!this.state[action.property]);
		}

		if (typeof action.value !== 'boolean') {
			return this._actionValueError(action, 'Must be either true or false.');
		}

		return setProperty(action.value);
	}

	_performPercentageAction (action, setProperty) {
		const current_value = this.state[action.property] || 0;

		if (!utils.isValidPercentage(action.value)) {
			return this._actionValueError(action, 'Must be a number between 0 and 1.');
		}

		if (action.mode === 'add') {
			return setProperty(Math.min(current_value + action.value, 1));
		} else if (action.mode === 'subtract') {
			return setProperty(Math.max(current_value - action.value, 0));
		}

		return setProperty(action.value);
	}

	_performColorAction (action, setProperty) {
		if (!utils.isValidRgbArray(action.value)) {
			return this._actionValueError(action, 'Must be an RGB array (e.g. [255, 255, 255]).');
		}

		return setProperty(action.value);
	}

	_actionValueError (action, error) {
		return new Promise((resolve, reject) => {
			const full_error = 'Action value for "' + action.property + '" is invalid. ' + error;

			console.log(TAG, this.id, full_error);
			reject(full_error);
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
			}
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
		validation: {
			is_required: true,
			max_length: 24
		}
	});

module.exports = Service;
