const utils = require('../utils.js'),
	TAG = '[DeviceSettings]';

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

	_getValidationErrors (settings) {
		const errors = {};

		this.definitions.forEach((definition, property) => {
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
			rule_names.forEach((rule) => {
				const rule_value = validations[rule],
					validator = utils.validators[rule](rule_value, definition),
					error = validator(settings[property], definition.label || property);

				if (error) {
					errors[property] = errors[property] || error; // If there's already an error for this property, keep it.
				}
			});
		});

		return Object.keys(errors).length ? errors : false;
	}

	_getPropertyTypeValidationValue (definition) {
		if (definition.type === 'one-of' && Array.isArray(definition.value_options)) {
			return definition.value_options.map((option) => option.value);
		}
	}

	setDefinitions (definitions = new Map()) {
		const name_definition = new Map(definitions).get('name'),
			base_name_definition = this.base_definitions.get('name'),
			merged_name_definition = {...base_name_definition};

		// Copy default_value for name property.
		if (name_definition && name_definition.default_value) {
			merged_name_definition.default_value = name_definition.default_value;
		}

		this.definitions = new Map([
			...this.base_definitions, // Set first so base definitions come first.
			...definitions,
			...this.base_definitions, // Set again so base definitions aren't overwritten.
			...new Map().set('name', merged_name_definition)
		]);

		this.settings = this._applyDefaults(this.settings);
	}

	get (property) {
		return this.settings[property];
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
			settings_definitions: Array.from(this.definitions.entries())
		};
	}
}

module.exports = DeviceSettings;
