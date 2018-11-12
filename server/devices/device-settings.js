const utils = require('../utils.js'),
	is_production = process.env.NODE_ENV === 'production',
	TAG = '[DeviceSettings]';

// TODO: If a setting is required, a default value is necessary. Either require
//       it, or set sensible defaults for each setting type.

class DeviceSettings {
	constructor (settings, definitions, base_definitions = new Map(), deviceEmit, save) {
		this.base_definitions = new Map(base_definitions);
		this.deviceEmit = deviceEmit;
		this.save = save;
		this.settings = settings;

		this.setDefinitions(definitions);
	}

	_applyDefaults (settings = {}) {
		const settings_with_defaults = {...settings};

		this.definitions.forEach((definition, property) => {
			if (!this._isSettingUnset(settings[property])) {
				return;
			}

			if (definition.hasOwnProperty('default_value')) {
				settings_with_defaults[property] = definition.default_value;
			} else {
				delete settings_with_defaults[property];
			}
		});

		return settings_with_defaults;
	}

	_isSettingUnset (value) {
		if (typeof value === 'undefined' || value === null) {
			return true;
		}
	}

	_getValidationErrors (settings = {}, definitions = this.definitions) {
		const errors = {};

		try {
			definitions.forEach((definition, property) => {
				const validations = {...definition.validation};

				// Don't validate the property if it has no value and it's not required.
				if ((typeof settings[property] === 'undefined' || settings[property] === null) && !validations.is_required) {
					return;
				}

				// Add a validation that verifies that the value is the correct data type.
				validations[definition.type] = this._getPropertyTypeValidationValue(definition);

				const rule_names = Object.keys(validations);

				// Make sure the property data type validation is performed before all others.
				rule_names.sort((a, b) => a === definition.type ? -1 : 1);

				// Run validation rules for the property.
				for (const rule of rule_names) {
					const rule_value = validations[rule],
						validator = definition.type == 'list-of'
							? (items, label) => this._getValidationErrorsForListOf(items, definition.item_properties, label)
							: typeof utils.validators[rule] === 'function' && utils.validators[rule](rule_value, definition),
						error = typeof validator === 'function' && validator(settings[property], definition.label || property);

					if (error) {
						errors[property] = error;
						break;
					}
				}
			});
		} catch (error) {
			if (!is_production) {
				console.error(TAG, 'Validation rules runtime error. This most likely occurred because of invalid settings definitions.', error);
			}

			return 'An error occurred while trying to save the device’s settings.';
		}

		return Object.keys(errors).length ? errors : false;
	}

	_getValidationErrorsForListOf (items = [], item_properties, label) {
		const errors = [];
		let has_errors = false;

		if (!Array.isArray(items)) {
			return label + ' must be an array.';
		}

		items.forEach((item, index) => {
			errors[index] = this._getValidationErrors(item, item_properties);

			if (errors[index]) {
				has_errors = true;
			}
		});

		return has_errors ? errors : false;
	}

	_getPropertyTypeValidationValue (definition) {
		switch (definition.type) {
			case 'one-of':
				if (Array.isArray(definition.value_options)) {
					return definition.value_options.map((option) => option.value);
				}

				break;
			case 'list-of':
				if (definition.item_properties instanceof Map) {
					return definition.item_properties;
				}

				break;
		}
	}

	setDefinitions (definitions = []) {
		const name_definition = new Map(definitions).get('name'),
			base_name_definition = this.base_definitions.get('name'),
			merged_name_definition = {...base_name_definition};

		// Copy default_value for name property.
		if (name_definition && name_definition.default_value) {
			merged_name_definition.default_value = name_definition.default_value;
		}

		// Hydrate serialized list-of fields to JavaScript maps.
		// TODO: Validate that the list-of item_properties matches the schema.
		const hydrated_definitions = definitions.map(([field_name, definition]) => {
			if (definition.type !== 'list-of') {
				return [field_name, definition];
			}

			let item_properties = Array.isArray(definition.item_properties) ? definition.item_properties : [];

			// Ignore nested list-of fields.
			item_properties = item_properties.filter((property) => property.type !== 'list-of');
			item_properties = new Map(item_properties);

			return [
				field_name,
				{...definition, item_properties}
			];
		});

		this.definitions = new Map([
			...this.base_definitions, // Set first so base definitions come first.
			...hydrated_definitions,
			...this.base_definitions, // Set again so base definitions aren't overwritten.
			...new Map().set('name', merged_name_definition)
		]);

		this.settings = this._applyDefaults(this.settings);
	}

	get (property) {
		return this.settings[property];
	}

	getAll () {
		return {...this.settings};
	}

	set (settings) {
		return new Promise((resolve, reject) => {
			const original_settings = {...this.settings},
				validation_errors = this._getValidationErrors(settings);

			if (validation_errors) {
				reject(validation_errors);

				return;
			}

			// Send new settings to device.
			this.deviceEmit('settings', {settings}, (error) => {
				if (error) {
					console.error(TAG, 'Error saving settings to device.', error);
					reject('There was a problem saving the device’s settings.');

					return;
				}

				// Save the new settings locally.
				this.settings = {...settings};
				this.save().then(() => {
					resolve();
				}).catch((error) => {
					// Undo settings changes locally.
					this.settings = {...original_settings};

					console.error(TAG, 'Error saving settings to database:', error);
					reject('There was a problem saving the device’s settings.');

					// Undo settings changes on device.
					this.deviceEmit('settings', {settings: original_settings}, (undo_error) => {
						if (undo_error) {
							console.error(TAG, 'Could not undo settings change on device. Settings on device and settings on relay are out of sync.', undo_error);
						}
					});
				});
			});
		});
	}

	serialize () {
		return {
			settings: {...this.settings},
			settings_definitions: [...this.definitions.entries()].map(([property, definition]) => {
				const serialized_definition = {...definition};

				if (definition.type === 'list-of') {
					serialized_definition.item_properties = [...definition.item_properties.entries()];
				}

				return [property, serialized_definition];
			})
		};
	}
}

module.exports = DeviceSettings;
