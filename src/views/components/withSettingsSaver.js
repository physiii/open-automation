import React from 'react';
import PropTypes from 'prop-types';
import FormValidator from '../form-validation.js';
import {isEmpty} from '../../utilities.js';
import {debounce} from 'debounce';
import hoistNonReactStatics from 'hoist-non-react-statics';

const SAVE_DEBOUNCE_DELAY = 500,
	noOp = () => { /* no-op */ },
	withSettingsSaver = (WrappedComponent) => {
		class SettingsSaver extends React.Component {
			constructor (props) {
				super(props);

				let settings;

				if (this.props.settingProperty) { // Single setting
					settings = {
						[this.props.settingProperty]: this.props.settingValue
					};
				} else { // Group of settings
					settings = {...this.props.settings};
				}

				this.state = {
					settings,
					formState: settings,
					validationErrors: {}
				};
				this.originalSettings = {...settings};
				this.state.saved = SettingsSaver.getSavedStateOfFields(settings, this.props);

				this.validator = new FormValidator(this.state.settings);
				this.setValidationRules();

				this.handleFieldChange = this.handleFieldChange.bind(this);
				this.saveSettings = debounce(this.saveSettings.bind(this), SAVE_DEBOUNCE_DELAY);
			}

			static getSavedStateOfFields (settings, props) {
				const settingsSavedState = {},
					singleProperty = props.settingProperty;

				if (singleProperty) {
					settingsSavedState[singleProperty] = SettingsSaver.areFieldValuesTheSame(settings[singleProperty], props.settingValue);
				} else {
					Object.keys(props.settingsDefinitions).forEach((property) => {
						settingsSavedState[property] = SettingsSaver.areFieldValuesTheSame(settings[property], props.settings[property]);
					});
				}

				return settingsSavedState;
			}

			static getDerivedStateFromProps (props, state) {
				const settings = props.settingProperty
						? {[props.settingProperty]: props.settingValue}
						: {...props.settings},
					formState = {...settings},
					saved = SettingsSaver.getSavedStateOfFields(settings, props);

				Object.keys(settings).forEach((property) => {
					settings[property] = state.saved[property]
						? settings[property]
						: state.settings[property];

					formState[property] = state.saved[property]
						? formState[property]
						: state.formState[property];
				});

				return {
					settings,
					formState,
					saved
				};
			}

			static areFieldValuesTheSame (value1, value2) {
				return JSON.stringify(value1) === JSON.stringify(value2);
			}

			componentDidMount () {
				this.checkIfSaveable();
			}

			componentDidUpdate () {
				if (!this.state.shouldSave) {
					return;
				}

				const settings = {...this.state.settings};

				this.setValidationRules();

				let settingsDiffer = false;

				// Find changes and errors in current settings state.
				Object.keys(settings).forEach((property) => {
					const lastSavedValue = this.props.settingProperty
						? this.props.settingValue // Single setting
						: this.props.settings[property]; // Group of settings;

					if (this.state.validationErrors[property]) {
						settings[property] = lastSavedValue;
					}

					if (settings[property] !== lastSavedValue) {
						settingsDiffer = true;
					}
				});

				if (settingsDiffer) {
					this.saveSettings({...settings});
				}

				this.checkIfSaveable();
			}

			componentWillUnmount () {
				this.saveSettings.flush();
			}

			checkIfSaveable () {
				const errors = this.validator.getValidationErrors(this.state.settings);

				if (this.validator.hasErrors(errors)) {
					this.props.onHasErrors(errors);
				} else {
					this.props.onHasNoErrors();
				}
			}

			setValidationRules () {
				// Add settings definitions to validator.
				if (this.props.settingProperty) { // Single setting
					this.addSettingValidation(this.props.settingProperty, this.props.settingDefinition);
				} else { // Group of settings
					Object.keys(this.props.settingsDefinitions).forEach((property) => {
						this.addSettingValidation(property, this.props.settingsDefinitions[property]);
					});
				}
			}

			addSettingValidation (property, definition) {
				const _definition = {...definition};

				// Add validation for the field type.
				_definition.validation = {
					[definition.type]: true,
					...definition.validation
				};

				// Delete is_required validation. Required fields are handled by SettingsSaver internally without showing errors.
				delete _definition.validation.is_required;

				this.validator.field(property, _definition.label, _definition.validation);
			}

			handleFieldChange (event) {
				let value = this.getValueFromEvent(event);

				const property = event.target.name,
					definition = this.props.settingProperty
						? this.props.settingDefinition // Single setting
						: this.props.settingsDefinitions[property]; // Group of settings

				let shouldSave = event.type === 'change';

				// If required field is unset, reset to the original value.
				if (isEmpty(value) && definition.validation && definition.validation.is_required) {
					value = this.originalSettings[property];

					// Don't save the original value until field is blurred.
					shouldSave = event.type === 'blur';
				}

				const settings = {
					...this.state.settings,
					[property]: value
				};

				this.setState({
					settings,
					shouldSave,
					saved: SettingsSaver.getSavedStateOfFields(settings, this.props),
					validationErrors: this.validateField(property, value),
					formState: {
						...this.state.formState,
						[property]: event.type === 'change'
							? this.getValueFromEvent(event, false) // Keep the exact value from the input until the user stops editing.
							: value
					}
				});
			}

			validateField (property, value) {
				this.validator.setState({
					...this.state.settings,
					[property]: value
				});

				return this.validator.validateField(property);
			}

			getValueFromEvent (event, normalize = true) {
				const definition = this.props.settingProperty
					? this.props.settingDefinition
					: this.props.settingsDefinitions[event.target.name];

				switch (definition && definition.type) {
					case 'integer':
					case 'number':
						if (!normalize) {
							return event.target.value;
						}

						if (event.target.value) {
							return !isEmpty(Number(event.target.value))
								? Number(event.target.value)
								: event.target.value;
						}

						return null;
					case 'boolean':
						return event.target.checked;
					case 'one-of':
						return definition.value_options.find((option) => option.value.toString() === event.target.value).value;
					case 'string':
						return normalize
							? event.target.value.trim()
							: event.target.value;
					default:
						return event.target.value;
				}
			}

			saveSettings (settings) {
				if (!settings) {
					// Workaround for a bug where debouncing saveSettings
					// sometimes causes erroneous saveSettings calls with
					// settings undefined.
					return;
				}

				if (this.props.settingProperty) {
					this.props.saveSettings(this.props.settingProperty, settings[this.props.settingProperty]);
					this.props.onSaveableChange(this.props.settingProperty, settings[this.props.settingProperty]);
				} else {
					this.props.saveSettings(settings);
					this.props.onSaveableChange(settings);
				}
			}

			render () {
				return (
					<WrappedComponent
						{...this.props}
						settings={this.state.formState}
						settingsErrors={this.state.validationErrors}
						originalValue={this.originalSettings[this.props.settingProperty]}
						originalSettings={this.originalSettings}
						onSettingChange={this.handleFieldChange} />
				);
			}
		}

		SettingsSaver.propTypes = {
			saveSettings: PropTypes.func,
			onSaveableChange: PropTypes.func,
			onHasNoErrors: PropTypes.func,
			onHasErrors: PropTypes.func,
			// Single setting
			settingProperty: PropTypes.string,
			settingValue: PropTypes.any,
			settingDefinition: PropTypes.object,
			// Group of settings
			settings: PropTypes.object,
			settingsDefinitions: PropTypes.object
		};

		SettingsSaver.defaultProps = {
			settings: {},
			settingsDefinitions: {},
			saveSettings: noOp,
			onSaveableChange: noOp,
			onHasNoErrors: noOp,
			onHasErrors: noOp
		};

		return hoistNonReactStatics(SettingsSaver, WrappedComponent);
	};

export default withSettingsSaver;
