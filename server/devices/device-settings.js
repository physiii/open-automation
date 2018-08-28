const TAG = '[DeviceSettings]';

class DeviceSettings {
	constructor (settings, definitions, base_definitions, deviceEmit, save) {
		this.base_definitions = base_definitions;
		this.deviceEmit = deviceEmit;
		this.save = save;

		this.setDefinitions(definitions);
		this.settings = this._applyDefaults(settings);
	}

	_applyDefaults (settings = {}) {
		const settings_with_defaults = {...settings};

		this.definitions.forEach((definition, property) => {
			if (!this._isSettingEmpty(settings[property])) {
				return;
			}

			if (definition.default_value) {
				settings_with_defaults[property] = definition.default_value;
			} else {
				delete settings_with_defaults[property];
			}
		});

		return settings_with_defaults;
	}

	_getValidationError (settings) {
		for (const [property, definition] of this.definitions) {
			// TODO: Validate value. If invalid, return error for invalid property value.
		}

		return false;
	}

	_isSettingEmpty (value) {
			if (typeof value === 'number' || typeof value === 'boolean') {
				return false;
			}

			if (typeof value === 'undefined' || value === null) {
				return true;
			}

			// Arrays and strings.
			if (typeof value.length !== 'undefined' && value.length === 0) {
				return true;
			}
	}

	setDefinitions (definitions = new Map()) {
		this.definitions = new Map([
			...definitions,
			...this.base_definitions
		]);
	}

	get (property) {
		return this.settings[property];
	}

	set (settings) {
		return new Promise((resolve, reject) => {
			const original_settings = {...this.settings},
				validation_error = this._getValidationError(settings);

			if (validation_error) {
				reject(validation_error);

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
