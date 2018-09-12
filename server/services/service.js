const uuidv4 = require('uuid/v4'),
	utils = require('../utils.js'),
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	TAG = '[Service]';

class Service {
	constructor (data, onUpdate, deviceOn, deviceEmit) {
		this.id = data.id || uuidv4();
		this.type = this.constructor.type || data.type;
		this.device = data.device;
		this.events = new EventEmitter2({wildcard: true, newListener: false, maxListeners: 0});
		this.onUpdate = onUpdate;
		this.originalDeviceOn = deviceOn;
		this.originalDeviceEmit = deviceEmit;
		this.device_event_prefix = this.type + '/' + this.id + '/';

		this.setSettings(data.settings);
		this.setState(data.state);

		this.deviceOn('state', (data) => this.setState(data.state));
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

	deviceOn (event, callback) {
		this.originalDeviceOn(this.device_event_prefix + event, callback);
	}

	deviceEmit (event, payload, callback) {
		this.originalDeviceEmit(event, {payload, service_id: this.id, service_type: this.type}, callback);
	}

	setSettings (settings = {}) {
		this.settings = {...settings};
	}

	setState (state = {}) {
		this.state = {...state};

		this.onUpdate();
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
		const quot = quotation_marks ? '"' : '';

		return this.settings.name
			? quot + this.settings.name + quot
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
		return (this.constructor.event_strings && this.constructor.event_strings[event].getFriendlyName.call(this)) || event;
	}

	getEventDescription (event, event_data) {
		const event_strings = this.constructor.event_strings;

		if (event_strings && event_strings[event] && event_strings[event].getDescription) {
			return event_strings[event].getDescription.call(this, event_data);
		}
	}

	getEventHtmlDescription (event, event_data, attachment) {
		const event_strings = this.constructor.event_strings;

		if (event_strings && event_strings[event] && event_strings[event].getHtmlDescription) {
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

		if (event_strings && event_strings[event] && event_strings[event].getAttachment) {
			return event_strings[event].getAttachment.call(this, event_data);
		}
	}

	serialize () {
		return {
			id: this.id,
			type: this.type,
			settings: this.settings
		};
	}

	dbSerialize () {
		return this.serialize();
	}

	clientSerialize () {
		return {
			...this.serialize(),
			device_id: this.device.id,
			state: this.state
		};
	}
}

Service.indefinite_article = 'A';

module.exports = Service;
