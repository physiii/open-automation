const uuid = require('uuid/v4'),
	EventEmitter2 = require('eventemitter2').EventEmitter2;

class Service {
	constructor (data, onUpdate) {
		this.id = data.id || uuid();
		this.type = this.constructor.type || data.type;
		this.device = data.device;
		this.events = new EventEmitter2({wildcard: true, newListener: false, maxListeners: 0});
		this.onUpdate = onUpdate;

		this.setSettings(data.settings);
		this.setState(data.state);
	}

	on (event, listener) {
		this.events.on(event, listener);
	}

	_emit (event, data) {
		this.events.emit(event, data);

		// Re-emit the event with a wildcard for listeners using wildcard
		// namespacing for convenient unsubscribing.
		this.events.emit([event, '*'], data);
	}

	off (event, listener) {
		if (listener) {
			this.events.off(event, listener);
		} else {
			this.events.removeAllListeners(event);
		}
	}

	setSettings (settings = {}) {
		this.settings = {...settings};
	}

	setState (state = {}) {
		this.state = {...state};

		this.onUpdate();
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
			// console.log('camera', this);
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
